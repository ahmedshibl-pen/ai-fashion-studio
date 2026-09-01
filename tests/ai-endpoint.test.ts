import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";

import { GET, POST } from "../src/app/api/generation/route";
import { reserveLiveGenerationAttempt, resetLiveAttemptGuardForTests } from "../src/server/ai/attempt-guard";

function validMetadata(overrides: Record<string, unknown> = {}) {
  return {
    requestId: "request-endpoint-01",
    projectId: "project-endpoint-01",
    explicitUserAction: true,
    selection: {
      modelId: "male-model-01",
      lightingPresetId: "clean-softbox",
      posePresetId: "male-relaxed-front",
      cameraPresetId: "male-upper-body-close-up",
    },
    productSpecification: {
      garmentCategory: "top",
      sampleSize: "M",
      intendedFit: "regular",
      fabricBehavior: "structured",
    },
    ...overrides,
  };
}

async function createRequest(metadata = validMetadata()) {
  const product = await readFile(path.join(process.cwd(), "public/images/models/model-man.webp"));
  const body = new FormData();
  body.set("metadata", JSON.stringify(metadata));
  body.set("productImage", new File([product], "product.webp", { type: "image/webp" }));
  return new Request("http://localhost/api/generation", { method: "POST", body });
}

async function createRequestWithProductName(fileName: string) {
  const product = await readFile(path.join(process.cwd(), "public/images/models/model-man.webp"));
  const body = new FormData();
  body.set("metadata", JSON.stringify(validMetadata()));
  body.set("productImage", new File([product], fileName, { type: "image/webp" }));
  return new Request("http://localhost/api/generation", { method: "POST", body });
}

test("generation status exposes readiness but never the API key", async () => {
  const response = GET();
  const text = await response.text();
  assert.equal(response.status, 200);
  assert.doesNotMatch(text, /REPLICATE_API_TOKEN/);
  assert.doesNotMatch(text, /apiKey\"/);
});

test("generation endpoint rejects non-multipart and non-explicit requests", async () => {
  const wrongType = await POST(new Request("http://localhost/api/generation", { method: "POST", body: "{}" }));
  assert.equal(wrongType.status, 400);
  const notExplicit = await POST(await createRequest(validMetadata({ explicitUserAction: false })));
  assert.equal(notExplicit.status, 400);
});

test("generation endpoint rejects a misleading product filename extension", async () => {
  const response = await POST(await createRequestWithProductName("product.txt"));
  const body = await response.json() as { ok: boolean; error?: { message: string } };
  assert.equal(response.status, 400);
  assert.equal(body.ok, false);
  assert.match(body.error?.message ?? "", /filename does not match/i);
});

test("generation endpoint completes the full validated mock provider path", async () => {
  const response = await POST(await createRequest());
  const body = await response.json() as { ok: boolean; result?: { provider: string; imageDataUrl: string; metadata: { promptVersion: string } } };
  assert.equal(response.status, 200);
  assert.equal(body.ok, true);
  assert.equal(body.result?.provider, "mock");
  assert.match(body.result?.imageDataUrl ?? "", /^data:image\/webp;base64,/);
  assert.equal(body.result?.metadata.promptVersion, "fashion-generation-v2");
});

test("live attempt guard permits at most three explicit request IDs per project", () => {
  resetLiveAttemptGuardForTests();
  assert.equal(reserveLiveGenerationAttempt("project-limit", "request-01").attempt, 1);
  assert.equal(reserveLiveGenerationAttempt("project-limit", "request-02").attempt, 2);
  assert.equal(reserveLiveGenerationAttempt("project-limit", "request-03").attempt, 3);
  assert.throws(() => reserveLiveGenerationAttempt("project-limit", "request-04"));
  assert.throws(() => reserveLiveGenerationAttempt("another-project", "request-01") && reserveLiveGenerationAttempt("another-project", "request-01"));
});
