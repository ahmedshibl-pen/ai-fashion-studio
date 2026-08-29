import "server-only";

import { assertGeminiReady, assertReplicateReady, readGenerationEnvironment } from "./env";
import { GeminiGenerationProvider } from "./providers/gemini";
import { MockGenerationProvider } from "./providers/mock";
import { ReplicateGenerationProvider } from "./providers/replicate";
import type { GenerationProvider } from "./types";

export function createGenerationProvider(
  environment: Readonly<Record<string, string | undefined>> = process.env,
): GenerationProvider {
  const configuration = readGenerationEnvironment(environment);
  if (configuration.mode === "mock") return new MockGenerationProvider();

  if (configuration.mode === "replicate") {
    const ready = assertReplicateReady(configuration);
    return new ReplicateGenerationProvider(ready.apiKey, ready.model);
  }

  const ready = assertGeminiReady(configuration);
  return new GeminiGenerationProvider(ready.apiKey, ready.model);
}
