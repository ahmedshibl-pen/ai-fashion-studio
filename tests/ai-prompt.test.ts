import assert from "node:assert/strict";
import test from "node:test";

import { buildFashionGenerationPrompt, FASHION_PROMPT_VERSION } from "../src/server/ai/prompt";
import { FIT_PROMPT_BY_ID, validateProductSpecification } from "../src/server/ai/product-specification";
import { resolveGenerationSelection } from "../src/server/ai/presets";

const maleSelection = {
  modelId: "male-model-01",
  lightingPresetId: "clean-softbox",
  posePresetId: "male-relaxed-front",
  cameraPresetId: "male-upper-body-close-up",
};

test("prompt is versioned and includes only the selected preset directions", () => {
  const selection = resolveGenerationSelection(maleSelection);
  const product = validateProductSpecification({
    garmentCategory: "top",
    sampleSize: "M",
    intendedFit: "relaxed",
    fabricBehavior: "fluid",
  });
  const prompt = buildFashionGenerationPrompt(selection, product);
  assert.equal(FASHION_PROMPT_VERSION, "fashion-generation-v1");
  assert.match(prompt, /Male Model 01/);
  assert.match(prompt, /relaxed full-length front pose/i);
  assert.match(prompt, /evenly diffused commercial softbox/i);
  assert.match(prompt, new RegExp(FIT_PROMPT_BY_ID.relaxed.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  assert.doesNotMatch(prompt, /golden theatrical beam/i);
  assert.match(prompt, /only source of truth for the garment/i);
});

test("preset resolution rejects cross-model combinations", () => {
  assert.throws(() => resolveGenerationSelection({ ...maleSelection, posePresetId: "female-neutral-front" }));
});

test("product fit fields and optional dimensions are validated", () => {
  const product = validateProductSpecification({
    garmentCategory: "jacket",
    sampleSize: "L",
    intendedFit: "oversized",
    fabricBehavior: "heavyweight",
    dimensions: { chestCm: 118.5, lengthCm: 72 },
  });
  assert.equal(product.dimensions?.chestCm, 118.5);
  assert.throws(() => validateProductSpecification({ ...product, intendedFit: "custom" }));
  assert.throws(() => validateProductSpecification({ ...product, dimensions: { chestCm: 500 } }));
});
