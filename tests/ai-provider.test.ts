import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";

import { GenerationProviderError, normalizeGenerationError } from "../src/server/ai/errors";
import { createGenerationProvider } from "../src/server/ai/provider-factory";
import { GeminiGenerationProvider } from "../src/server/ai/providers/gemini";
import { MockGenerationProvider } from "../src/server/ai/providers/mock";
import { ReplicateGenerationProvider } from "../src/server/ai/providers/replicate";
import type { GenerationProviderRequest } from "../src/server/ai/types";

const request: GenerationProviderRequest = {
  requestId: "request-test-01",
  prompt: "Create a fashion campaign image.",
  promptVersion: "fashion-generation-v1",
  aspectRatio: "3:4",
  references: [
    {
      role: "pose",
      label: "Neutral front pose",
      mimeType: "image/webp",
      data: Buffer.from("validated-image"),
    },
  ],
};

test("mock provider returns a deterministic validated reference", async () => {
  const result = await new MockGenerationProvider().generate(request);
  assert.equal(result.provider, "mock");
  assert.equal(result.image.base64, Buffer.from("validated-image").toString("base64"));
  assert.equal(result.metadata.imageSize, "1K");
});

test("Gemini provider sends one request with retries disabled", async () => {
  let receivedOptions: unknown;
  let receivedRequest: Record<string, unknown> | undefined;
  const provider = new GeminiGenerationProvider("test-key", "gemini-3.1-flash-image", {
    async create(payload, options) {
      receivedRequest = payload;
      receivedOptions = options;
      return {
        id: "provider-request-01",
        output_image: { data: Buffer.from("image").toString("base64"), mime_type: "image/png" },
        usage: { total_tokens: 1200 },
      };
    },
  });

  const result = await provider.generate(request);
  assert.deepEqual(receivedOptions, { timeout_ms: 120_000, retries: { strategy: "none" } });
  assert.deepEqual(receivedRequest?.response_format, {
    type: "image",
    mime_type: "image/jpeg",
    aspect_ratio: "3:4",
    image_size: "1K",
  });
  assert.equal(result.metadata.providerRequestId, "provider-request-01");
  assert.equal(result.metadata.usage?.totalTokens, 1200);
});

test("Replicate creates one prediction with exactly the four selected references", async () => {
  const output = await readFile(path.join(process.cwd(), "public/images/models/model-man.webp"));
  const fullRequest: GenerationProviderRequest = {
    ...request,
    references: (["product", "model", "pose", "lighting"] as const).map((role, index) => ({
      role,
      label: `${role} selected ${index + 1}`,
      mimeType: "image/webp" as const,
      data: Buffer.from(`validated-${role}`),
    })),
  };
  const calls: { url: string; init?: RequestInit }[] = [];
  const provider = new ReplicateGenerationProvider(
    "r8_test-token",
    "google/nano-banana-2",
    async (input, init) => {
      const url = String(input);
      calls.push({ url, init });
      if (url.startsWith("https://api.replicate.com/v1/models/")) {
        return new Response(JSON.stringify({
          id: "prediction-test-01",
          status: "processing",
        }), { status: 201, headers: { "Content-Type": "application/json" } });
      }
      if (url === "https://api.replicate.com/v1/predictions/prediction-test-01") {
        return new Response(JSON.stringify({
          id: "prediction-test-01",
          status: "succeeded",
          output: "https://replicate.delivery/test/output.webp",
          metrics: { predict_time: 4.2, total_time: 5.1 },
        }), { status: 200, headers: { "Content-Type": "application/json" } });
      }
      return new Response(output, { status: 200, headers: { "Content-Type": "image/webp" } });
    },
    async () => {},
  );

  const result = await provider.generate(fullRequest);
  const predictionCreates = calls.filter((call) => call.init?.method === "POST");
  assert.equal(predictionCreates.length, 1);
  assert.equal(calls.length, 3);
  assert.equal(predictionCreates[0].url, "https://api.replicate.com/v1/models/google/nano-banana-2/predictions");
  assert.equal((predictionCreates[0].init?.headers as Record<string, string>).Prefer, "wait=60");

  const payload = JSON.parse(String(predictionCreates[0].init?.body)) as {
    input: Record<string, unknown> & { image_input: string[] };
  };
  assert.deepEqual(Object.keys(payload.input).sort(), [
    "aspect_ratio",
    "google_search",
    "image_input",
    "image_search",
    "output_format",
    "prompt",
    "resolution",
  ]);
  assert.equal(payload.input.image_input.length, 4);
  assert.deepEqual(
    payload.input.image_input.map((value) => Buffer.from(value.split(",")[1], "base64").toString()),
    ["validated-product", "validated-model", "validated-pose", "validated-lighting"],
  );
  assert.equal(payload.input.resolution, "1K");
  assert.equal(payload.input.aspect_ratio, "3:4");
  assert.equal(payload.input.output_format, "jpg");
  assert.equal(payload.input.image_search, false);
  assert.equal(payload.input.google_search, false);
  assert.equal(result.provider, "replicate");
  assert.equal(result.metadata.providerRequestId, "prediction-test-01");
  assert.equal(result.metadata.providerMetrics?.predictTimeSeconds, 4.2);
  assert.equal(result.image.mimeType, "image/webp");
});

test("Replicate never creates an automatic retry after a provider failure", async () => {
  let calls = 0;
  const provider = new ReplicateGenerationProvider(
    "r8_test-token",
    "google/nano-banana-2",
    async () => {
      calls += 1;
      return new Response("provider detail that must stay private", { status: 503 });
    },
  );
  await assert.rejects(() => provider.generate(request), (error: unknown) => {
    assert.ok(error instanceof GenerationProviderError);
    assert.equal(error.code, "unavailable");
    assert.doesNotMatch(error.safeMessage, /provider detail/i);
    return true;
  });
  assert.equal(calls, 1);
});

test("provider factory selects Replicate only when its server configuration is ready", () => {
  const provider = createGenerationProvider({
    AI_GENERATION_MODE: "replicate",
    REPLICATE_IMAGE_MODEL: "google/nano-banana-2",
    REPLICATE_API_TOKEN: "r8_test-token",
  });
  assert.ok(provider instanceof ReplicateGenerationProvider);
  assert.equal(provider.name, "replicate");
});

test("provider errors are normalized without exposing their raw message", () => {
  const error = normalizeGenerationError(Object.assign(new Error("secret provider detail"), { status: 429 }));
  assert.equal(error.code, "rate-limited");
  assert.equal(error.retryable, true);
  assert.doesNotMatch(error.safeMessage, /secret provider detail/);
  assert.ok(error instanceof GenerationProviderError);
});
