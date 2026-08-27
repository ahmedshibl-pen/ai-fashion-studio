import "server-only";

import {
  FABRIC_BEHAVIORS,
  GARMENT_CATEGORIES,
  GARMENT_FITS,
  GARMENT_SAMPLE_SIZES,
  type ProductSpecification,
} from "@/types/generation";

import { GenerationProviderError } from "./errors";

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
    chestOrBustWidthCm: validateDimension(rawDimensions.chestOrBustWidthCm, "Chest or bust width"),
    garmentLengthCm: validateDimension(rawDimensions.garmentLengthCm, "Garment length"),
    shoulderWidthCm: validateDimension(rawDimensions.shoulderWidthCm, "Shoulder width"),
    sleeveLengthCm: validateDimension(rawDimensions.sleeveLengthCm, "Sleeve length"),
    waistWidthCm: validateDimension(rawDimensions.waistWidthCm, "Waist width"),
    hipWidthCm: validateDimension(rawDimensions.hipWidthCm, "Hip width"),
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
