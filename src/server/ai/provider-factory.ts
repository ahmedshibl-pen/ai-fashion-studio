import "server-only";

import { assertGeminiReady, readGenerationEnvironment } from "./env";
import { GeminiGenerationProvider } from "./providers/gemini";
import { MockGenerationProvider } from "./providers/mock";
import type { GenerationProvider } from "./types";

export function createGenerationProvider(
  environment: Readonly<Record<string, string | undefined>> = process.env,
): GenerationProvider {
  const configuration = readGenerationEnvironment(environment);
  if (configuration.mode === "mock") return new MockGenerationProvider();

  const ready = assertGeminiReady(configuration);
  return new GeminiGenerationProvider(ready.apiKey, ready.model);
}
