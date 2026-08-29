import "server-only";

import { GenerationProviderError, normalizeGenerationError } from "../errors";
import {
  MAX_IMAGE_DIMENSION,
  MIN_IMAGE_DIMENSION,
  inspectImageBuffer,
} from "../image-validation";
import {
  GENERATION_IMAGE_SIZE,
  type GenerationProvider,
  type GenerationProviderRequest,
  type GenerationProviderResult,
} from "../types";

const REPLICATE_API_ORIGIN = "https://api.replicate.com";
const REPLICATE_TIMEOUT_MS = 150_000;
const REPLICATE_SYNC_WAIT_SECONDS = 60;
const REPLICATE_POLL_INTERVAL_MS = 1_000;
const MAX_OUTPUT_IMAGE_BYTES = 16 * 1024 * 1024;

type ReplicateFetch = (
  input: string | URL | Request,
  init?: RequestInit,
) => Promise<Response>;

type ReplicateSleep = (milliseconds: number, signal: AbortSignal) => Promise<void>;

type ReplicatePrediction = {
  id: string;
  status: "starting" | "processing" | "succeeded" | "failed" | "canceled" | "aborted";
  output?: unknown;
  metrics?: {
    predict_time?: number;
    total_time?: number;
  };
};

function sleep(milliseconds: number, signal: AbortSignal) {
  return new Promise<void>((resolve, reject) => {
    const onAbort = () => {
      clearTimeout(timeout);
      reject(new DOMException("The operation timed out.", "TimeoutError"));
    };
    const timeout = setTimeout(() => {
      signal.removeEventListener("abort", onAbort);
      resolve();
    }, milliseconds);
    if (signal.aborted) return onAbort();
    signal.addEventListener("abort", onAbort, { once: true });
  });
}

function isPrediction(value: unknown): value is ReplicatePrediction {
  if (typeof value !== "object" || value === null) return false;
  const record = value as Record<string, unknown>;
  return typeof record.id === "string" &&
    ["starting", "processing", "succeeded", "failed", "canceled", "aborted"].includes(String(record.status));
}

async function readPrediction(response: Response) {
  if (!response.ok) {
    throw Object.assign(new Error("Replicate request failed."), { status: response.status });
  }
  const value: unknown = await response.json();
  if (!isPrediction(value)) throw new GenerationProviderError("provider-error");
  return value;
}

function modelEndpoint(model: string) {
  const [owner, name, extra] = model.split("/");
  if (!owner || !name || extra) throw new GenerationProviderError("configuration");
  return `${REPLICATE_API_ORIGIN}/v1/models/${encodeURIComponent(owner)}/${encodeURIComponent(name)}/predictions`;
}

function validateOutputImage(buffer: Buffer) {
  if (buffer.length === 0 || buffer.length > MAX_OUTPUT_IMAGE_BYTES) {
    throw new GenerationProviderError("no-image");
  }
  try {
    const metadata = inspectImageBuffer(buffer);
    if (
      metadata.width < MIN_IMAGE_DIMENSION ||
      metadata.height < MIN_IMAGE_DIMENSION ||
      metadata.width > MAX_IMAGE_DIMENSION ||
      metadata.height > MAX_IMAGE_DIMENSION
    ) {
      throw new GenerationProviderError("no-image");
    }
    return metadata;
  } catch (error) {
    if (error instanceof GenerationProviderError && error.code === "no-image") throw error;
    throw new GenerationProviderError("no-image", { cause: error });
  }
}

function decodeDataUrl(value: string) {
  const match = /^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/=]+)$/i.exec(value);
  if (!match) return null;
  const buffer = Buffer.from(match[2], "base64");
  const metadata = validateOutputImage(buffer);
  if (metadata.mimeType !== match[1].toLowerCase()) throw new GenerationProviderError("no-image");
  return { buffer, mimeType: metadata.mimeType };
}

function isReplicateDeliveryUrl(url: URL) {
  return url.protocol === "https:" &&
    (url.hostname === "replicate.delivery" || url.hostname.endsWith(".replicate.delivery"));
}

export class ReplicateGenerationProvider implements GenerationProvider {
  readonly name = "replicate" as const;

  constructor(
    private readonly apiToken: string,
    readonly model: string,
    private readonly fetcher: ReplicateFetch = fetch,
    private readonly wait: ReplicateSleep = sleep,
  ) {
    if (!apiToken.trim()) throw new GenerationProviderError("configuration");
  }

  private async waitForPrediction(
    prediction: ReplicatePrediction,
    signal: AbortSignal,
  ) {
    let current = prediction;
    while (current.status === "starting" || current.status === "processing") {
      await this.wait(REPLICATE_POLL_INTERVAL_MS, signal);
      current = await readPrediction(await this.fetcher(
        `${REPLICATE_API_ORIGIN}/v1/predictions/${encodeURIComponent(current.id)}`,
        {
          method: "GET",
          headers: { Authorization: `Bearer ${this.apiToken}` },
          cache: "no-store",
          signal,
        },
      ));
    }
    return current;
  }

  private async readOutput(output: unknown, signal: AbortSignal) {
    if (typeof output !== "string") throw new GenerationProviderError("no-image");
    const inline = decodeDataUrl(output);
    if (inline) return inline;

    let outputUrl: URL;
    try {
      outputUrl = new URL(output);
    } catch (error) {
      throw new GenerationProviderError("no-image", { cause: error });
    }
    if (!isReplicateDeliveryUrl(outputUrl)) throw new GenerationProviderError("no-image");

    const response = await this.fetcher(outputUrl, {
      method: "GET",
      redirect: "error",
      cache: "no-store",
      signal,
    });
    if (!response.ok) throw Object.assign(new Error("Replicate output download failed."), { status: response.status });
    const contentLength = Number(response.headers.get("content-length") ?? 0);
    if (Number.isFinite(contentLength) && contentLength > MAX_OUTPUT_IMAGE_BYTES) {
      throw new GenerationProviderError("no-image");
    }
    const buffer = Buffer.from(await response.arrayBuffer());
    const metadata = validateOutputImage(buffer);
    return { buffer, mimeType: metadata.mimeType };
  }

  async generate(request: GenerationProviderRequest): Promise<GenerationProviderResult> {
    const startedAt = performance.now();
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), REPLICATE_TIMEOUT_MS);

    const input = {
      prompt: request.prompt,
      image_input: request.references.map(
        (reference) => `data:${reference.mimeType};base64,${reference.data.toString("base64")}`,
      ),
      resolution: GENERATION_IMAGE_SIZE,
      aspect_ratio: request.aspectRatio,
      output_format: "jpg",
      image_search: false,
      google_search: false,
    } as const;

    try {
      const created = await readPrediction(await this.fetcher(modelEndpoint(this.model), {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiToken}`,
          "Content-Type": "application/json",
          Prefer: `wait=${REPLICATE_SYNC_WAIT_SECONDS}`,
          "Cancel-After": `${Math.round(REPLICATE_TIMEOUT_MS / 1_000)}s`,
        },
        body: JSON.stringify({ input }),
        cache: "no-store",
        signal: controller.signal,
      }));

      const prediction = await this.waitForPrediction(created, controller.signal);
      if (prediction.status !== "succeeded") {
        throw new GenerationProviderError(
          prediction.status === "canceled" || prediction.status === "aborted" ? "timeout" : "provider-error",
          { retryable: false },
        );
      }

      const image = await this.readOutput(prediction.output, controller.signal);
      return {
        provider: this.name,
        model: this.model,
        image: {
          mimeType: image.mimeType,
          base64: image.buffer.toString("base64"),
        },
        metadata: {
          requestId: request.requestId,
          providerRequestId: prediction.id,
          promptVersion: request.promptVersion,
          durationMs: Math.max(1, Math.round(performance.now() - startedAt)),
          imageSize: GENERATION_IMAGE_SIZE,
          aspectRatio: request.aspectRatio,
          providerMetrics: prediction.metrics
            ? {
                predictTimeSeconds: prediction.metrics.predict_time,
                totalTimeSeconds: prediction.metrics.total_time,
              }
            : undefined,
        },
      };
    } catch (error) {
      if (controller.signal.aborted) {
        throw new GenerationProviderError("timeout", { cause: error, retryable: false });
      }
      throw normalizeGenerationError(error);
    } finally {
      clearTimeout(timeout);
    }
  }
}
