import "server-only";

import { GenerationProviderError } from "./errors";
import type { GenerationMode } from "./types";

export const DEFAULT_AI_IMAGE_MODEL = "gemini-3.1-flash-image" as const;
export const DEFAULT_REPLICATE_IMAGE_MODEL = "google/nano-banana-2" as const;

export type GenerationModel =
  | typeof DEFAULT_AI_IMAGE_MODEL
  | typeof DEFAULT_REPLICATE_IMAGE_MODEL;

export type GenerationEnvironment = {
  mode: GenerationMode;
  model: GenerationModel;
  apiKey: string | null;
  apiKeyConfigured: boolean;
};

type EnvironmentSource = Readonly<Record<string, string | undefined>>;

export function readGenerationEnvironment(
  environment: EnvironmentSource = process.env,
): GenerationEnvironment {
  const rawMode = environment.AI_GENERATION_MODE?.trim() || "mock";
  if (rawMode !== "mock" && rawMode !== "gemini" && rawMode !== "replicate") {
    throw new GenerationProviderError("configuration", {
      safeMessage: "AI_GENERATION_MODE must be mock, gemini, or replicate.",
    });
  }

  const geminiModel = environment.AI_IMAGE_MODEL?.trim() || DEFAULT_AI_IMAGE_MODEL;
  if (geminiModel !== DEFAULT_AI_IMAGE_MODEL) {
    throw new GenerationProviderError("configuration", {
      safeMessage: `AI_IMAGE_MODEL must be ${DEFAULT_AI_IMAGE_MODEL}.`,
    });
  }

  const replicateModel = environment.REPLICATE_IMAGE_MODEL?.trim() || DEFAULT_REPLICATE_IMAGE_MODEL;
  if (replicateModel !== DEFAULT_REPLICATE_IMAGE_MODEL) {
    throw new GenerationProviderError("configuration", {
      safeMessage: `REPLICATE_IMAGE_MODEL must be ${DEFAULT_REPLICATE_IMAGE_MODEL}.`,
    });
  }

  const model = rawMode === "replicate" ? replicateModel : geminiModel;
  const apiKey = rawMode === "replicate"
    ? environment.REPLICATE_API_TOKEN?.trim() || null
    : environment.GEMINI_API_KEY?.trim() || null;
  return {
    mode: rawMode,
    model,
    apiKey,
    apiKeyConfigured: apiKey !== null,
  };
}

export function assertGeminiReady(configuration: GenerationEnvironment) {
  if (configuration.mode !== "gemini" || !configuration.apiKey) {
    throw new GenerationProviderError("configuration");
  }
  return configuration as GenerationEnvironment & { mode: "gemini"; apiKey: string };
}

export function assertReplicateReady(configuration: GenerationEnvironment) {
  if (configuration.mode !== "replicate" || !configuration.apiKey) {
    throw new GenerationProviderError("configuration");
  }
  return configuration as GenerationEnvironment & {
    mode: "replicate";
    model: typeof DEFAULT_REPLICATE_IMAGE_MODEL;
    apiKey: string;
  };
}

export function getPublicGenerationStatus(
  environment: EnvironmentSource = process.env,
) {
  const configuration = readGenerationEnvironment(environment);
  return {
    mode: configuration.mode,
    model: configuration.model,
    ready: configuration.mode === "mock" || configuration.apiKeyConfigured,
    apiKeyConfigured: configuration.apiKeyConfigured,
  } as const;
}
