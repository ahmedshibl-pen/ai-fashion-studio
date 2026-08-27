import "server-only";

import type { LightingPresetId } from "@/features/basic-studio/lighting-presets";

import type { ReferencePromptMapping } from "./prompt-mapping-types";

const LIGHTING_COPY_RULES = {
  role: "lighting",
  mustCopy: "light direction, softness, contrast, color relationship, falloff, and studio mood",
  mustNotCopy: "the lighting reference identity, clothing, pose, product details, props, or background objects",
} as const;

export const LIGHTING_PROMPT_BY_ID = {
  "clean-softbox": { ...LIGHTING_COPY_RULES, promptFragment: "Use clean, evenly diffused commercial softbox lighting." },
  "top-spotlight": { ...LIGHTING_COPY_RULES, promptFragment: "Use a focused overhead spotlight with strong cinematic contrast." },
  "golden-diagonal-beam": { ...LIGHTING_COPY_RULES, promptFragment: "Use a warm theatrical beam cutting diagonally through the studio." },
  "cinematic-softbox": { ...LIGHTING_COPY_RULES, promptFragment: "Use moody cinematic softbox lighting with warm and cool separation." },
  "window-sunlight": { ...LIGHTING_COPY_RULES, promptFragment: "Use soft natural sunlight with graphic window shadows." },
  "warm-side-beam": { ...LIGHTING_COPY_RULES, promptFragment: "Use dramatic warm side lighting against a deep cinematic background." },
  "digicam-flash": { ...LIGHTING_COPY_RULES, promptFragment: "Use direct early-2000s digicam flash with a raw editorial finish." },
  "hard-fashion-flash": { ...LIGHTING_COPY_RULES, promptFragment: "Use crisp hard fashion flash with sharp luxury-fashion shadows." },
  "female-clean-softbox": { ...LIGHTING_COPY_RULES, promptFragment: "Use clean, evenly diffused commercial softbox lighting." },
  "female-top-spotlight": { ...LIGHTING_COPY_RULES, promptFragment: "Use a focused overhead spotlight with strong cinematic contrast." },
  "female-golden-diagonal-beam": { ...LIGHTING_COPY_RULES, promptFragment: "Use a warm theatrical beam cutting diagonally through the studio." },
  "female-cinematic-softbox": { ...LIGHTING_COPY_RULES, promptFragment: "Use moody cinematic softbox lighting with warm and cool separation." },
  "female-window-sunlight": { ...LIGHTING_COPY_RULES, promptFragment: "Use soft natural sunlight with graphic window shadows." },
  "female-warm-side-beam": { ...LIGHTING_COPY_RULES, promptFragment: "Use dramatic warm side lighting against a deep cinematic background." },
  "female-digicam-flash": { ...LIGHTING_COPY_RULES, promptFragment: "Use direct early-2000s digicam flash with a raw editorial finish." },
  "female-hard-fashion-flash": { ...LIGHTING_COPY_RULES, promptFragment: "Use crisp hard fashion flash with sharp luxury-fashion shadows." },
} as const satisfies Record<LightingPresetId, ReferencePromptMapping<"lighting">>;
