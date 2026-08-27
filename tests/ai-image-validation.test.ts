import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";

import { validateImageBuffer, validateReferenceSet } from "../src/server/ai/image-validation";
import { GenerationProviderError } from "../src/server/ai/errors";
import { resolveGenerationSelection } from "../src/server/ai/presets/selection-resolver";
import { resolveGenerationReferences } from "../src/server/ai/references";
import type { GenerationImageReference } from "../src/server/ai/types";

const png = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=",
  "base64",
);

test("image validation checks content signature, MIME, and dimensions", () => {
  const metadata = validateImageBuffer(png, "image/png", { minDimension: 1 });
  assert.deepEqual(metadata, { mimeType: "image/png", width: 1, height: 1 });
  assert.throws(() => validateImageBuffer(png, "image/jpeg", { minDimension: 1 }));
  assert.throws(() => validateImageBuffer(Buffer.from("not-an-image"), "image/png", { minDimension: 1 }));
  assert.throws(() => validateImageBuffer(png, "image/png"));
});

test("reference validation requires exactly one of every supported role", () => {
  const roles = ["product", "model", "pose", "lighting"] as const;
  const references = roles.map((role) => ({ role, label: role, mimeType: "image/png" as const, data: png })) satisfies GenerationImageReference[];
  assert.doesNotThrow(() => validateReferenceSet(references));
  assert.throws(() => validateReferenceSet(references.slice(0, 3)));
});

test("reference resolver loads only canonical model, pose, and lighting assets", async () => {
  const productData = await readFile(path.join(process.cwd(), "public/images/models/model-man.webp"));
  const selection = resolveGenerationSelection({
    modelId: "male-model-01",
    lightingPresetId: "clean-softbox",
    posePresetId: "male-relaxed-front",
    cameraPresetId: "male-upper-body-close-up",
  });
  const references = await resolveGenerationReferences(
    {
      id: "product-test",
      fileName: "product.webp",
      mimeType: "image/webp",
      size: productData.length,
      previewDataUrl: `data:image/webp;base64,${productData.toString("base64")}`,
    },
    selection,
  );
  assert.deepEqual(references.map((reference) => reference.role), ["product", "model", "pose", "lighting"]);
  assert.ok(references.every((reference) => reference.data.length > 0));
});

test("reference resolver reports a safe configuration error for a missing trusted asset", async () => {
  const productData = await readFile(path.join(process.cwd(), "public/images/models/model-man.webp"));
  const selection = resolveGenerationSelection({
    modelId: "male-model-01",
    lightingPresetId: "clean-softbox",
    posePresetId: "male-relaxed-front",
    cameraPresetId: "male-upper-body-close-up",
  });
  const missingSelection = {
    ...selection,
    model: { ...selection.model, imagePath: "/images/does-not-exist.webp" },
  };
  await assert.rejects(
    () => resolveGenerationReferences(
      {
        id: "product-test",
        fileName: "product.webp",
        mimeType: "image/webp",
        size: productData.length,
        previewDataUrl: `data:image/webp;base64,${productData.toString("base64")}`,
      },
      missingSelection,
    ),
    (error: unknown) => error instanceof GenerationProviderError
      && error.code === "configuration"
      && error.safeMessage === "A selected studio reference asset is unavailable.",
  );
});
