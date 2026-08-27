import assert from "node:assert/strict";
import test from "node:test";

import {
  GENERATION_PROGRESS_STEPS,
  getGenerationClientState,
} from "../src/features/projects/generation-client-state";

test("generation client state exposes explicit upload, validation, and generation phases", () => {
  assert.deepEqual(getGenerationClientState("queued", 0), {
    phase: "uploading",
    label: "Uploading product",
    percent: 6,
    stepIndex: 0,
  });
  assert.equal(getGenerationClientState("processing", 1).phase, "validating");
  assert.equal(getGenerationClientState("processing", 2).label, "Resolving selected references");
  assert.equal(getGenerationClientState("processing", 3).phase, "generating");
  assert.equal(GENERATION_PROGRESS_STEPS.length, 5);
});

test("generation client state exposes explicit success and failure phases", () => {
  assert.equal(getGenerationClientState("completed", 4).phase, "completed");
  assert.equal(getGenerationClientState("completed", 4).percent, 100);
  assert.equal(getGenerationClientState("failed", 2).phase, "failed");
  assert.equal(getGenerationClientState("failed", 2).label, "Generation failed");
});

test("generation client state clamps an invalid processing stage", () => {
  assert.equal(getGenerationClientState("processing", 999).stepIndex, 4);
  assert.equal(getGenerationClientState("processing", -10).stepIndex, 0);
});
