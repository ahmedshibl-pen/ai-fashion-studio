import "server-only";

import { GenerationProviderError } from "./errors";
import type { GenerationMode } from "./types";

export const DEFAULT_AI_IMAGE_MODEL = "gemini-3.1-flash-image" as const;

export type GenerationEnvironment = {
  mode: GenerationMode;
  model: typeof DEFAULT_AI_IMAGE_MODEL;
  apiKey: string | null;
  apiKeyConfigured: boolean;
};

type EnvironmentSource = Readonly<Record<string, string | undefined>>;

export function readGenerationEnvironment(
  environment: EnvironmentSource = process.env,
): GenerationEnvironment {
  const rawMode = environment.AI_GENERATION_MODE?.trim() || "mock";
  if (rawMode !== "mock" && rawMode !== "gemini") {
    throw new GenerationProviderError("configuration", {
      safeMessage: "AI_GENERATION_MODE must be either mock or gemini.",
    });
  }

  const rawModel = environment.AI_IMAGE_MODEL?.trim() || DEFAULT_AI_IMAGE_MODEL;
  if (rawModel !== DEFAULT_AI_IMAGE_MODEL) {
    throw new GenerationProviderError("configuration", {
      safeMessage: `AI_IMAGE_MODEL must be ${DEFAULT_AI_IMAGE_MODEL}.`,
    });
  }

  const apiKey = environment.GEMINI_API_KEY?.trim() || null;
  return {
    mode: rawMode,
    model: DEFAULT_AI_IMAGE_MODEL,
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
