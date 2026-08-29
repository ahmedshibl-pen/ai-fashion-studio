import assert from "node:assert/strict";
import test from "node:test";

import { GenerationProviderError, normalizeGenerationError } from "../src/server/ai/errors";
import { GeminiGenerationProvider } from "../src/server/ai/providers/gemini";
import { MockGenerationProvider } from "../src/server/ai/providers/mock";
import type { GenerationProviderRequest } from "../src/server/ai/types";

const request: GenerationProviderRequest = {
  requestId: "request-test-01",
  prompt: "Create a fashion campaign image.",
  promptVersion: "fashion-generation-v1",
  aspectRatio: "3:4",
  references: [
    {
      role: "pose",
      label: "Neutral front pose",
      mimeType: "image/webp",
      data: Buffer.from("validated-image"),
    },
  ],
};

test("mock provider returns a deterministic validated reference", async () => {
  const result = await new MockGenerationProvider().generate(request);
  assert.equal(result.provider, "mock");
  assert.equal(result.image.base64, Buffer.from("validated-image").toString("base64"));
  assert.equal(result.metadata.imageSize, "1K");
});

test("Gemini provider sends one request with retries disabled", async () => {
  let receivedOptions: unknown;
  let receivedRequest: Record<string, unknown> | undefined;
  const provider = new GeminiGenerationProvider("test-key", "gemini-3.1-flash-image", {
    async create(payload, options) {
      receivedRequest = payload;
      receivedOptions = options;
      return {
        id: "provider-request-01",
        output_image: { data: Buffer.from("image").toString("base64"), mime_type: "image/png" },
        usage: { total_tokens: 1200 },
      };
    },
  });

  const result = await provider.generate(request);
  assert.deepEqual(receivedOptions, { timeout_ms: 120_000, retries: { strategy: "none" } });
  assert.deepEqual(receivedRequest?.response_format, {
    type: "image",
    mime_type: "image/png",
    aspect_ratio: "3:4",
    image_size: "1K",
  });
  assert.equal(result.metadata.providerRequestId, "provider-request-01");
  assert.equal(result.metadata.usage?.totalTokens, 1200);
});

test("provider errors are normalized without exposing their raw message", () => {
  const error = normalizeGenerationError(Object.assign(new Error("secret provider detail"), { status: 429 }));
  assert.equal(error.code, "rate-limited");
  assert.equal(error.retryable, true);
  assert.doesNotMatch(error.safeMessage, /secret provider detail/);
  assert.ok(error instanceof GenerationProviderError);
});
