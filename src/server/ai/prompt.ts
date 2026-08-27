import "server-only";

import type { ProductSpecification } from "@/types/generation";

import { describeGarmentFit } from "./product-specification";
import {
  LIGHTING_PROMPT_BY_ID,
  MODEL_PROMPT_BY_ID,
  POSE_PROMPT_BY_ID,
  type resolveGenerationSelection,
} from "./presets";

export const FASHION_PROMPT_VERSION = "fashion-generation-v1" as const;

type ResolvedSelection = ReturnType<typeof resolveGenerationSelection>;

export function buildFashionGenerationPrompt(
  selection: ResolvedSelection,
  product: ProductSpecification,
) {
  return [
    `Prompt version: ${FASHION_PROMPT_VERSION}.`,
    "Create one photorealistic, premium fashion campaign photograph from the four labelled reference images.",
    "Reference priority: the product image is the only source of truth for the garment; the model image is the only source of truth for identity; the pose image directs body position only; the lighting image directs illumination and studio mood only.",
    "PRODUCT PRESERVATION — reproduce the uploaded garment exactly. Preserve its category, color, print, logo, typography, pattern placement, material texture, stitching, seams, hardware, neckline, sleeves, hem, proportions, and construction. Do not redesign, simplify, recolor, add, remove, mirror, or hallucinate any product detail.",
    "Do not copy clothing from the model, pose, or lighting references. Replace reference clothing with the uploaded product while preserving the chosen model identity.",
    MODEL_PROMPT_BY_ID[selection.ids.modelId],
    POSE_PROMPT_BY_ID[selection.ids.posePresetId],
    LIGHTING_PROMPT_BY_ID[selection.ids.lightingPresetId],
    `Camera composition: ${selection.camera.description} Keep anatomy, garment visibility, crop, and perspective physically believable.`,
    describeGarmentFit(product),
    "The garment must sit naturally on the body with accurate gravity, fabric tension, occlusion, folds, and contact shadows. Keep hands, fingers, limbs, face, and product edges anatomically clean.",
    "Return only one finished image. Do not add captions, borders, watermarks, UI, extra products, or unrequested text.",
  ].join("\n\n");
}
