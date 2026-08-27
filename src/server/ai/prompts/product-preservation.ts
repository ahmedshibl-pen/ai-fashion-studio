import "server-only";

export const PRODUCT_PRESERVATION_DIRECTION = [
  "PRODUCT PRESERVATION — reproduce the uploaded garment as faithfully as the reference permits.",
  "Preserve product identity, shape, proportions, original color, graphics, logos, typography, pattern placement, material texture, stitching, seams, hardware, neckline, sleeves, hems, garment length, and visible construction.",
  "Keep the product commercially visible with believable fabric interaction, gravity, tension, folds, occlusion, and contact shadows.",
  "Do not redesign, simplify, recolor, mirror, duplicate, add, remove, or invent garment details.",
  "Do not alter visible logos or text and do not claim inferred physical measurements are exact.",
].join(" ");

export const CROSS_REFERENCE_EXCLUSION_DIRECTION = [
  "Do not copy clothing, products, logos, background objects, or unrelated styling from the model, pose, or lighting references.",
  "Replace reference clothing with the uploaded product while preserving the selected model identity, requested pose, and requested lighting behaviour.",
].join(" ");
