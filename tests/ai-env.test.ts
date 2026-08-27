import assert from "node:assert/strict";
import test from "node:test";

import { DEFAULT_AI_IMAGE_MODEL, assertGeminiReady, readGenerationEnvironment } from "../src/server/ai/env";
import { GenerationProviderError } from "../src/server/ai/errors";

test("generation environment defaults to mock without a key", () => {
  const configuration = readGenerationEnvironment({});
  assert.equal(configuration.mode, "mock");
  assert.equal(configuration.model, DEFAULT_AI_IMAGE_MODEL);
  assert.equal(configuration.apiKeyConfigured, false);
});

test("gemini mode requires a non-empty server key", () => {
  const configuration = readGenerationEnvironment({
    AI_GENERATION_MODE: "gemini",
    AI_IMAGE_MODEL: DEFAULT_AI_IMAGE_MODEL,
    GEMINI_API_KEY: "",
  });
  assert.throws(() => assertGeminiReady(configuration), GenerationProviderError);
});

test("unknown generation mode and model are rejected", () => {
  assert.throws(() => readGenerationEnvironment({ AI_GENERATION_MODE: "live" }));
  assert.throws(() => readGenerationEnvironment({ AI_IMAGE_MODEL: "unsupported-model" }));
});
