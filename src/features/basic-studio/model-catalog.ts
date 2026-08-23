export type StudioModelId = "male-model-01" | "female-model-01";

export type ModelPreviewFraming = {
  readonly previewScale: number;
  readonly previewTranslateX: number;
  readonly previewTranslateY: number;
  readonly mobilePreviewScale?: number;
  readonly mobilePreviewTranslateX?: number;
  readonly mobilePreviewTranslateY?: number;
};

export type StudioModel = {
  readonly id: StudioModelId;
  readonly name: string;
  readonly displayName: string;
  readonly description: string;
  readonly imagePath: string;
  readonly accessibilityLabel: string;
  readonly framing: ModelPreviewFraming;
};

export const STUDIO_MODELS = [
  {
    id: "male-model-01",
    name: "Male 01",
    displayName: "Male Model 01",
    description: "A relaxed full-length stance for clean editorial styling.",
    imagePath: "/images/models/model-man.webp",
    accessibilityLabel:
      "Full-length male fashion model in a black T-shirt and dark relaxed jeans.",
    framing: {
      previewScale: 1.14,
      previewTranslateX: 0,
      previewTranslateY: -4,
      mobilePreviewScale: 1.12,
      mobilePreviewTranslateY: -3.8,
    },
  },
  {
    id: "female-model-01",
    name: "Female 01",
    displayName: "Female Model 01",
    description: "A composed full-length pose with a quiet editorial presence.",
    imagePath: "/images/models/model-woman.webp",
    accessibilityLabel:
      "Full-length female fashion model in a charcoal T-shirt and wide-leg dark jeans.",
    framing: {
      previewScale: 1.13,
      previewTranslateX: 0,
      previewTranslateY: -4,
      mobilePreviewScale: 1.11,
      mobilePreviewTranslateY: -3.8,
    },
  },
] as const satisfies readonly StudioModel[];

export const STUDIO_MODEL_BY_ID = Object.fromEntries(
  STUDIO_MODELS.map((model) => [model.id, model]),
) as Record<StudioModelId, StudioModel>;

export function isStudioModelId(value: string | null): value is StudioModelId {
  return value !== null && Object.hasOwn(STUDIO_MODEL_BY_ID, value);
}
