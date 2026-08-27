import "server-only";

import { GenerationProviderError } from "../errors";
import {
  GENERATION_IMAGE_SIZE,
  type GenerationProvider,
  type GenerationProviderRequest,
  type GenerationProviderResult,
} from "../types";

export class MockGenerationProvider implements GenerationProvider {
  readonly name = "mock" as const;
  readonly model = "mock-fashion-generator-v1";

  async generate(request: GenerationProviderRequest): Promise<GenerationProviderResult> {
    const startedAt = performance.now();
    const fallback =
      request.references.find((reference) => reference.role === "pose") ??
      request.references.find((reference) => reference.role === "model") ??
      request.references[0];

    if (!fallback) {
      throw new GenerationProviderError("invalid-request", {
        safeMessage: "At least one validated image reference is required.",
      });
    }

    await new Promise<void>((resolve) => setTimeout(resolve, 180));

    return {
      provider: this.name,
      model: this.model,
      image: {
        mimeType: fallback.mimeType,
        base64: fallback.data.toString("base64"),
      },
      metadata: {
        requestId: request.requestId,
        promptVersion: request.promptVersion,
        durationMs: Math.max(1, Math.round(performance.now() - startedAt)),
        imageSize: GENERATION_IMAGE_SIZE,
        aspectRatio: request.aspectRatio,
      },
    };
  }
}
