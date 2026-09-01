import "server-only";

import { GenerationProviderError } from "./errors";
import type { GenerationMode } from "./types";

export const DEFAULT_REPLICATE_IMAGE_MODEL = "google/nano-banana-2" as const;

export type GenerationModel = typeof DEFAULT_REPLICATE_IMAGE_MODEL;

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
  if (rawMode !== "mock" && rawMode !== "replicate") {
    throw new GenerationProviderError("configuration", {
      safeMessage: "AI_GENERATION_MODE must be mock or replicate.",
    });
  }

  const replicateModel = environment.REPLICATE_IMAGE_MODEL?.trim() || DEFAULT_REPLICATE_IMAGE_MODEL;
  if (replicateModel !== DEFAULT_REPLICATE_IMAGE_MODEL) {
    throw new GenerationProviderError("configuration", {
      safeMessage: `REPLICATE_IMAGE_MODEL must be ${DEFAULT_REPLICATE_IMAGE_MODEL}.`,
    });
  }

  const apiKey = rawMode === "replicate"
    ? environment.REPLICATE_API_TOKEN?.trim() || null
    : null;
  return {
    mode: rawMode,
    model: replicateModel,
    apiKey,
    apiKeyConfigured: apiKey !== null,
  };
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
