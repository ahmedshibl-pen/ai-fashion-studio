import "server-only";

import { assertReplicateReady, readGenerationEnvironment } from "./env";
import { MockGenerationProvider } from "./providers/mock";
import { ReplicateGenerationProvider } from "./providers/replicate";
import type { GenerationProvider } from "./types";

export function createGenerationProvider(
  environment: Readonly<Record<string, string | undefined>> = process.env,
): GenerationProvider {
  const configuration = readGenerationEnvironment(environment);
  if (configuration.mode === "mock") return new MockGenerationProvider();

  const ready = assertReplicateReady(configuration);
  return new ReplicateGenerationProvider(ready.apiKey, ready.model);
}
