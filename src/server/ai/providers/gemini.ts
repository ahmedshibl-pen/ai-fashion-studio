import "server-only";

import { GoogleGenAI } from "@google/genai";

import { GenerationProviderError, normalizeGenerationError } from "../errors";
import {
  GENERATION_IMAGE_MIME_TYPE,
  GENERATION_IMAGE_SIZE,
  type GenerationProvider,
  type GenerationProviderRequest,
  type GenerationProviderResult,
} from "../types";

type GeminiInteraction = {
  id: string;
  output_image?: {
    data?: string;
    mime_type?: string;
  };
  usage?: {
    total_input_tokens?: number;
    total_output_tokens?: number;
    total_thought_tokens?: number;
    total_tokens?: number;
  };
};

type GeminiInteractionsClient = {
  create(
    request: Record<string, unknown>,
    options: { timeout_ms: number; retries: { strategy: "none" } },
  ): Promise<GeminiInteraction>;
};

export class GeminiGenerationProvider implements GenerationProvider {
  readonly name = "gemini" as const;
  private readonly interactions: GeminiInteractionsClient;

  constructor(
    apiKey: string,
    readonly model: string,
    interactions?: GeminiInteractionsClient,
  ) {
    if (!apiKey.trim()) throw new GenerationProviderError("configuration");
    this.interactions =
      interactions ??
      (new GoogleGenAI({ apiKey, vertexai: false }).interactions as unknown as GeminiInteractionsClient);
  }

  async generate(request: GenerationProviderRequest): Promise<GenerationProviderResult> {
    const startedAt = performance.now();
    const input: Array<Record<string, unknown>> = [
      { type: "text", text: request.prompt },
    ];

    for (const reference of request.references) {
      input.push({
        type: "text",
        text: `Reference image — ${reference.role}: ${reference.label}.`,
      });
      input.push({
        type: "image",
        data: reference.data.toString("base64"),
        mime_type: reference.mimeType,
      });
    }

    try {
      const interaction = await this.interactions.create(
        {
          model: this.model,
          input,
          response_format: {
            type: "image",
            mime_type: GENERATION_IMAGE_MIME_TYPE,
            aspect_ratio: request.aspectRatio,
            image_size: GENERATION_IMAGE_SIZE,
            delivery: "inline",
          },
          store: false,
        },
        {
          timeout_ms: 120_000,
          retries: { strategy: "none" },
        },
      );

      const base64 = interaction.output_image?.data;
      const mimeType = interaction.output_image?.mime_type;
      if (!base64 || (mimeType !== "image/png" && mimeType !== "image/jpeg" && mimeType !== "image/webp")) {
        throw new GenerationProviderError("no-image");
      }

      return {
        provider: this.name,
        model: this.model,
        image: { base64, mimeType },
        metadata: {
          requestId: request.requestId,
          providerRequestId: interaction.id,
          promptVersion: request.promptVersion,
          durationMs: Math.max(1, Math.round(performance.now() - startedAt)),
          imageSize: GENERATION_IMAGE_SIZE,
          aspectRatio: request.aspectRatio,
          usage: interaction.usage
            ? {
                inputTokens: interaction.usage.total_input_tokens,
                outputTokens: interaction.usage.total_output_tokens,
                thoughtTokens: interaction.usage.total_thought_tokens,
                totalTokens: interaction.usage.total_tokens,
              }
            : undefined,
        },
      };
    } catch (error) {
      throw normalizeGenerationError(error);
    }
  }
}
