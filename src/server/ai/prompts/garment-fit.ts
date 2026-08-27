import "server-only";

import type {
  FabricBehavior,
  GarmentDimensions,
  GarmentFit,
  ProductSpecification,
} from "@/types/generation";

export const FIT_PROMPT_BY_ID = {
  slim: "a close, body-skimming fit without strain, distortion, or artificial compression",
  regular: "a balanced true-to-size fit with natural ease through the body",
  relaxed: "a relaxed fit with deliberate ease and natural fabric drape",
  oversized: "an intentionally oversized silhouette with controlled volume and believable proportions",
} as const satisfies Record<GarmentFit, string>;

export const FABRIC_PROMPT_BY_ID = {
  structured: "structured fabric that holds a clean shape with restrained folds",
  fluid: "fluid fabric with soft gravity-led drape and continuous folds",
  stretch: "stretch fabric that follows the body naturally without painted-on distortion",
  lightweight: "lightweight fabric with subtle movement, fine folds, and minimal bulk",
  heavyweight: "heavyweight fabric with substantial volume, slower drape, and defined creases",
} as const satisfies Record<FabricBehavior, string>;

const DIMENSION_LABEL_BY_KEY = {
  chestOrBustWidthCm: "chest or bust width",
  garmentLengthCm: "garment length",
  shoulderWidthCm: "shoulder width",
  sleeveLengthCm: "sleeve length",
  waistWidthCm: "waist width",
  hipWidthCm: "hip width",
} as const satisfies Record<keyof GarmentDimensions, string>;

export function buildGarmentFitFragment(specification: ProductSpecification) {
  const measurements = specification.dimensions
    ? Object.entries(specification.dimensions)
        .filter((entry): entry is [keyof GarmentDimensions, number] => typeof entry[1] === "number")
        .map(([key, value]) => `${DIMENSION_LABEL_BY_KEY[key]} ${value} cm`)
        .join(", ")
    : "not provided";

  return [
    `Garment category: ${specification.garmentCategory}.`,
    `Sample size label: ${specification.sampleSize}.`,
    `Fit direction: ${FIT_PROMPT_BY_ID[specification.intendedFit]}.`,
    `Fabric behaviour: ${FABRIC_PROMPT_BY_ID[specification.fabricBehavior]}.`,
    `Optional sample measurements: ${measurements}. Treat these as visual fit guidance only, not guaranteed physical measurements.`,
  ].join(" ");
}
