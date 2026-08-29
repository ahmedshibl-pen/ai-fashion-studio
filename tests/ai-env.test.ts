import assert from "node:assert/strict";
import test from "node:test";

import {
  DEFAULT_AI_IMAGE_MODEL,
  DEFAULT_REPLICATE_IMAGE_MODEL,
  assertGeminiReady,
  assertReplicateReady,
  readGenerationEnvironment,
} from "../src/server/ai/env";
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

test("replicate mode selects only its server token and official Nano Banana 2 model", () => {
  const configuration = readGenerationEnvironment({
    AI_GENERATION_MODE: "replicate",
    REPLICATE_IMAGE_MODEL: DEFAULT_REPLICATE_IMAGE_MODEL,
    REPLICATE_API_TOKEN: "r8_test-token",
  });
  const ready = assertReplicateReady(configuration);
  assert.equal(ready.mode, "replicate");
  assert.equal(ready.model, DEFAULT_REPLICATE_IMAGE_MODEL);
  assert.equal(ready.apiKeyConfigured, true);
});

test("replicate mode rejects a missing token or unexpected model", () => {
  const missingToken = readGenerationEnvironment({
    AI_GENERATION_MODE: "replicate",
    REPLICATE_API_TOKEN: "",
  });
  assert.throws(() => assertReplicateReady(missingToken), GenerationProviderError);
  assert.throws(() => readGenerationEnvironment({
    AI_GENERATION_MODE: "replicate",
    REPLICATE_IMAGE_MODEL: "another/model",
  }), GenerationProviderError);
});

test("unknown generation mode and model are rejected", () => {
  assert.throws(() => readGenerationEnvironment({ AI_GENERATION_MODE: "live" }));
  assert.throws(() => readGenerationEnvironment({ AI_IMAGE_MODEL: "unsupported-model" }));
});
