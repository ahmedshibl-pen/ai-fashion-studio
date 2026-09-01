import assert from "node:assert/strict";
import test from "node:test";

import { CAMERA_PRESETS } from "../src/features/basic-studio/camera-presets";
import { LIGHTING_PRESETS } from "../src/features/basic-studio/lighting-presets";
import { STUDIO_MODELS } from "../src/features/basic-studio/model-catalog";
import { POSE_PRESETS } from "../src/features/basic-studio/pose-presets";
import { buildFashionGenerationPrompt } from "../src/server/ai/prompts/build-generation-prompt";
import { FIT_PROMPT_BY_ID } from "../src/server/ai/prompts/garment-fit";
import { FASHION_PROMPT_VERSION } from "../src/server/ai/prompts/prompt-version";
import { CAMERA_COMPOSITION_BY_ID } from "../src/server/ai/presets/camera-composition-mappings";
import { LIGHTING_PROMPT_BY_ID } from "../src/server/ai/presets/lighting-prompt-mappings";
import { MODEL_PROMPT_BY_ID } from "../src/server/ai/presets/model-prompt-mappings";
import { POSE_PROMPT_BY_ID } from "../src/server/ai/presets/pose-prompt-mappings";
import { resolveGenerationSelection } from "../src/server/ai/presets/selection-resolver";
import { validateProductSpecification } from "../src/server/ai/product-specification";

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
  const prompt = buildFashionGenerationPrompt({ selection, product });
  assert.equal(FASHION_PROMPT_VERSION, "fashion-generation-v2");
  assert.match(prompt, /Omar/);
  assert.match(prompt, /relaxed full-length front pose/i);
  assert.match(prompt, /evenly diffused commercial softbox/i);
  assert.match(prompt, new RegExp(FIT_PROMPT_BY_ID.relaxed.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  assert.doesNotMatch(prompt, /golden theatrical beam/i);
  assert.match(prompt, /product reference governs garment identity and construction within its own domain/i);
  assert.match(prompt, /every selected input as equally binding/i);
  assert.doesNotMatch(prompt, /highest to lowest|priority order/i);
  assert.match(prompt, /Do not copy the pose reference identity, clothing, product details/i);
  assert.match(prompt, /not guaranteed physical measurements/i);
});

test("every existing studio choice has an explicit prompt or composition mapping", () => {
  assert.deepEqual(Object.keys(MODEL_PROMPT_BY_ID).sort(), STUDIO_MODELS.map(({ id }) => id).sort());
  assert.deepEqual(Object.keys(POSE_PROMPT_BY_ID).sort(), POSE_PRESETS.map(({ id }) => id).sort());
  assert.deepEqual(Object.keys(LIGHTING_PROMPT_BY_ID).sort(), LIGHTING_PRESETS.map(({ id }) => id).sort());
  assert.deepEqual(Object.keys(CAMERA_COMPOSITION_BY_ID).sort(), CAMERA_PRESETS.map(({ id }) => id).sort());
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
    dimensions: { chestOrBustWidthCm: 59.5, garmentLengthCm: 72 },
  });
  assert.equal(product.dimensions?.chestOrBustWidthCm, 59.5);
  assert.throws(() => validateProductSpecification({ ...product, intendedFit: "custom" }));
  assert.throws(() => validateProductSpecification({ ...product, dimensions: { chestOrBustWidthCm: 500 } }));
});
