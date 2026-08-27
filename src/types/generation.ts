export const GARMENT_CATEGORIES = [
  "top",
  "shirt",
  "jacket",
  "dress",
  "trousers",
  "skirt",
  "matching-set",
  "accessory",
] as const;

export const GARMENT_SAMPLE_SIZES = ["XS", "S", "M", "L", "XL", "XXL"] as const;
export const GARMENT_FITS = ["slim", "regular", "relaxed", "oversized"] as const;
export const FABRIC_BEHAVIORS = [
  "structured",
  "fluid",
  "stretch",
  "lightweight",
  "heavyweight",
] as const;

export type GarmentCategory = (typeof GARMENT_CATEGORIES)[number];
export type GarmentSampleSize = (typeof GARMENT_SAMPLE_SIZES)[number];
export type GarmentFit = (typeof GARMENT_FITS)[number];
export type FabricBehavior = (typeof FABRIC_BEHAVIORS)[number];

export type GarmentDimensions = {
  chestOrBustWidthCm?: number;
  garmentLengthCm?: number;
  shoulderWidthCm?: number;
  sleeveLengthCm?: number;
  waistWidthCm?: number;
  hipWidthCm?: number;
};

export const GARMENT_DIMENSION_FIELDS = [
  { key: "chestOrBustWidthCm", label: "Chest or bust width" },
  { key: "garmentLengthCm", label: "Garment length" },
  { key: "shoulderWidthCm", label: "Shoulder width" },
  { key: "sleeveLengthCm", label: "Sleeve length" },
  { key: "waistWidthCm", label: "Waist width" },
  { key: "hipWidthCm", label: "Hip width" },
] as const satisfies readonly {
  key: keyof GarmentDimensions;
  label: string;
}[];

export type ProductSpecification = {
  garmentCategory: GarmentCategory;
  sampleSize: GarmentSampleSize;
  intendedFit: GarmentFit;
  fabricBehavior: FabricBehavior;
  dimensions?: GarmentDimensions;
};

export const DEFAULT_PRODUCT_SPECIFICATION: ProductSpecification = {
  garmentCategory: "top",
  sampleSize: "M",
  intendedFit: "regular",
  fabricBehavior: "structured",
};

export type GenerationProgressStage =
  | "idle"
  | "uploading"
  | "validating"
  | "generating"
  | "completed"
  | "failed";

export type PublicGenerationStatus = {
  mode: "mock" | "gemini";
  model: "gemini-3.1-flash-image";
  ready: boolean;
  apiKeyConfigured: boolean;
};

export type GenerationApiSuccess = {
  ok: true;
  result: {
    provider: "mock" | "gemini";
    model: string;
    imageDataUrl: string;
    metadata: {
      requestId: string;
      providerRequestId?: string;
      promptVersion: string;
      durationMs: number;
      imageSize: "1K";
      aspectRatio: string;
      usage?: {
        inputTokens?: number;
        outputTokens?: number;
        thoughtTokens?: number;
        totalTokens?: number;
      };
    };
  };
};

export type GenerationApiFailure = {
  ok: false;
  error: {
    code: string;
    message: string;
    retryable: boolean;
    requestId?: string;
  };
};

export type GenerationApiResponse = GenerationApiSuccess | GenerationApiFailure;
