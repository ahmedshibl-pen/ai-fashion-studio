import "server-only";

import {
  FABRIC_BEHAVIORS,
  GARMENT_CATEGORIES,
  GARMENT_FITS,
  GARMENT_SAMPLE_SIZES,
  type FabricBehavior,
  type GarmentFit,
  type ProductSpecification,
} from "@/types/generation";

import { GenerationProviderError } from "./errors";

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

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function includes<T extends string>(values: readonly T[], value: unknown): value is T {
  return typeof value === "string" && values.includes(value as T);
}

function validateDimension(value: unknown, label: string) {
  if (value === undefined || value === null || value === "") return undefined;
  if (typeof value !== "number" || !Number.isFinite(value) || value < 10 || value > 300) {
    throw new GenerationProviderError("invalid-request", {
      safeMessage: `${label} must be between 10 and 300 cm.`,
    });
  }
  return Math.round(value * 10) / 10;
}

export function validateProductSpecification(value: unknown): ProductSpecification {
  if (!isRecord(value)) {
    throw new GenerationProviderError("invalid-request", {
      safeMessage: "Complete the garment category, size, fit, and fabric behavior.",
    });
  }

  if (!includes(GARMENT_CATEGORIES, value.garmentCategory)) {
    throw new GenerationProviderError("invalid-request", { safeMessage: "Choose a valid garment category." });
  }
  if (!includes(GARMENT_SAMPLE_SIZES, value.sampleSize)) {
    throw new GenerationProviderError("invalid-request", { safeMessage: "Choose a valid sample size." });
  }
  if (!includes(GARMENT_FITS, value.intendedFit)) {
    throw new GenerationProviderError("invalid-request", { safeMessage: "Choose a valid intended fit." });
  }
  if (!includes(FABRIC_BEHAVIORS, value.fabricBehavior)) {
    throw new GenerationProviderError("invalid-request", { safeMessage: "Choose a valid fabric behavior." });
  }

  const rawDimensions = isRecord(value.dimensions) ? value.dimensions : {};
  const dimensions = {
    chestCm: validateDimension(rawDimensions.chestCm, "Chest"),
    waistCm: validateDimension(rawDimensions.waistCm, "Waist"),
    hipCm: validateDimension(rawDimensions.hipCm, "Hip"),
    lengthCm: validateDimension(rawDimensions.lengthCm, "Length"),
  };
  const hasDimensions = Object.values(dimensions).some((dimension) => dimension !== undefined);

  return {
    garmentCategory: value.garmentCategory,
    sampleSize: value.sampleSize,
    intendedFit: value.intendedFit,
    fabricBehavior: value.fabricBehavior,
    dimensions: hasDimensions ? dimensions : undefined,
  };
}

export function describeGarmentFit(specification: ProductSpecification) {
  const measurements = specification.dimensions
    ? Object.entries(specification.dimensions)
        .filter((entry): entry is [string, number] => typeof entry[1] === "number")
        .map(([key, value]) => `${key.replace("Cm", "")} ${value} cm`)
        .join(", ")
    : "not provided";

  return [
    `Garment category: ${specification.garmentCategory}.`,
    `Sample size: ${specification.sampleSize}.`,
    `Fit direction: ${FIT_PROMPT_BY_ID[specification.intendedFit]}.`,
    `Fabric behavior: ${FABRIC_PROMPT_BY_ID[specification.fabricBehavior]}.`,
    `Optional sample measurements: ${measurements}.`,
  ].join(" ");
}
