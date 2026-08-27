import { NextResponse } from "next/server";

import { reserveLiveGenerationAttempt } from "@/server/ai/attempt-guard";
import { getPublicGenerationStatus, readGenerationEnvironment } from "@/server/ai/env";
import { GenerationProviderError, normalizeGenerationError } from "@/server/ai/errors";
import { createGenerationProvider } from "@/server/ai/provider-factory";
import { buildFashionGenerationPrompt, FASHION_PROMPT_VERSION } from "@/server/ai/prompt";
import { resolveGenerationReferences } from "@/server/ai/references";
import { parseGenerationFormData } from "@/server/ai/request";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 180;

const NO_STORE_HEADERS = { "Cache-Control": "no-store, max-age=0" } as const;

function errorStatus(error: GenerationProviderError) {
  if (error.code === "invalid-request") return 400;
  if (error.code === "rate-limited") return 429;
  if (error.code === "safety-blocked") return 422;
  if (error.code === "timeout") return 504;
  if (error.code === "configuration") return 503;
  return 502;
}

export function GET() {
  try {
    return NextResponse.json(
      { ok: true, generation: getPublicGenerationStatus() },
      { headers: NO_STORE_HEADERS },
    );
  } catch (error) {
    const normalized = normalizeGenerationError(error);
    return NextResponse.json(
      { ok: false, error: { code: normalized.code, message: normalized.safeMessage, retryable: normalized.retryable } },
      { status: errorStatus(normalized), headers: NO_STORE_HEADERS },
    );
  }
}

export async function POST(request: Request) {
  let requestId: string | undefined;
  try {
    const contentType = request.headers.get("content-type") ?? "";
    if (!contentType.toLowerCase().startsWith("multipart/form-data")) {
      throw new GenerationProviderError("invalid-request", { safeMessage: "Use multipart form data for image generation." });
    }
    const contentLength = Number(request.headers.get("content-length") ?? 0);
    if (Number.isFinite(contentLength) && contentLength > 20 * 1024 * 1024) {
      throw new GenerationProviderError("invalid-request", { safeMessage: "The generation request is too large." });
    }

    const parsed = await parseGenerationFormData(await request.formData());
    requestId = parsed.requestId;
    const configuration = readGenerationEnvironment();
    if (configuration.mode === "gemini") {
      reserveLiveGenerationAttempt(parsed.projectId, parsed.requestId);
    }

    const references = await resolveGenerationReferences(parsed.product, parsed.selection);
    const prompt = buildFashionGenerationPrompt(parsed.selection, parsed.productSpecification);
    const provider = createGenerationProvider();
    const result = await provider.generate({
      requestId: parsed.requestId,
      prompt,
      promptVersion: FASHION_PROMPT_VERSION,
      aspectRatio: parsed.selection.aspectRatio,
      references,
    });

    return NextResponse.json(
      {
        ok: true,
        result: {
          provider: result.provider,
          model: result.model,
          imageDataUrl: `data:${result.image.mimeType};base64,${result.image.base64}`,
          metadata: result.metadata,
        },
      },
      { headers: NO_STORE_HEADERS },
    );
  } catch (error) {
    const normalized = normalizeGenerationError(error);
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: normalized.code,
          message: normalized.safeMessage,
          retryable: normalized.retryable,
          requestId,
        },
      },
      { status: errorStatus(normalized), headers: NO_STORE_HEADERS },
    );
  }
}
