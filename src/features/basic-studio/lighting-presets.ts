import type { StudioModelId } from "./model-catalog";

export type LightingPresetId =
  | "clean-softbox"
  | "top-spotlight"
  | "golden-diagonal-beam"
  | "cinematic-softbox"
  | "window-sunlight"
  | "warm-side-beam"
  | "digicam-flash"
  | "hard-fashion-flash"
  | "female-clean-softbox"
  | "female-top-spotlight"
  | "female-golden-diagonal-beam"
  | "female-cinematic-softbox"
  | "female-window-sunlight"
  | "female-warm-side-beam"
  | "female-digicam-flash"
  | "female-hard-fashion-flash";

export type LightingPreset = {
  id: LightingPresetId;
  label: string;
  description: string;
  imagePath: string;
  thumbnailPath: string;
  focalPosition: string;
  imageScale?: number;
  imageTranslation: {
    x: number;
    y: number;
  };
  accessibilityLabel: string;
  supportedModelIds: readonly StudioModelId[];
};

export const LIGHTING_PRESETS: readonly LightingPreset[] = [
  {
    id: "clean-softbox",
    label: "Clean Softbox",
    description: "Clean, evenly diffused commercial studio lighting.",
    imagePath:
      "/images/basic-studio/models/male-model-01/lighting/clean-softbox.webp",
    thumbnailPath:
      "/images/basic-studio/models/male-model-01/lighting/clean-softbox.webp",
    focalPosition: "50% 65%",
    imageScale: 1,
    imageTranslation: { x: 0, y: 0 },
    accessibilityLabel:
      "Seated male model in a bright gray studio beneath a large clean softbox.",
    supportedModelIds: ["male-model-01"],
  },
  {
    id: "top-spotlight",
    label: "Top Spotlight",
    description:
      "A focused overhead spotlight with strong cinematic contrast.",
    imagePath:
      "/images/basic-studio/models/male-model-01/lighting/top-spotlight.webp",
    thumbnailPath:
      "/images/basic-studio/models/male-model-01/lighting/top-spotlight.webp",
    focalPosition: "50% 66%",
    imageScale: 1,
    imageTranslation: { x: 0, y: 0 },
    accessibilityLabel:
      "Seated male model beneath a focused overhead spotlight in a dark studio.",
    supportedModelIds: ["male-model-01"],
  },
  {
    id: "golden-diagonal-beam",
    label: "Golden Diagonal Beam",
    description:
      "A warm theatrical beam cutting diagonally through the studio.",
    imagePath:
      "/images/basic-studio/models/male-model-01/lighting/golden-diagonal-beam.webp",
    thumbnailPath:
      "/images/basic-studio/models/male-model-01/lighting/golden-diagonal-beam.webp",
    focalPosition: "51% 68%",
    imageScale: 1,
    imageTranslation: { x: 0, y: 0 },
    accessibilityLabel:
      "Seated male model crossed by a warm diagonal beam in a deep blue studio.",
    supportedModelIds: ["male-model-01"],
  },
  {
    id: "cinematic-softbox",
    label: "Cinematic Softbox",
    description:
      "Moody cinematic softbox lighting with warm and cool separation.",
    imagePath:
      "/images/basic-studio/models/male-model-01/lighting/cinematic-softbox.webp",
    thumbnailPath:
      "/images/basic-studio/models/male-model-01/lighting/cinematic-softbox.webp",
    focalPosition: "50% 66%",
    imageScale: 1,
    imageTranslation: { x: 0, y: 0 },
    accessibilityLabel:
      "Seated male model under a cinematic softbox with warm and cool light.",
    supportedModelIds: ["male-model-01"],
  },
  {
    id: "window-sunlight",
    label: "Window Sunlight",
    description: "Soft natural sunlight with graphic window shadows.",
    imagePath:
      "/images/basic-studio/models/male-model-01/lighting/window-sunlight.webp",
    thumbnailPath:
      "/images/basic-studio/models/male-model-01/lighting/window-sunlight.webp",
    focalPosition: "49% 68%",
    imageScale: 1,
    imageTranslation: { x: 0, y: 0 },
    accessibilityLabel:
      "Seated male model in soft sunlight surrounded by graphic window shadows.",
    supportedModelIds: ["male-model-01"],
  },
  {
    id: "warm-side-beam",
    label: "Warm Side Beam",
    description:
      "Dramatic warm side lighting with a deep cinematic background.",
    imagePath:
      "/images/basic-studio/models/male-model-01/lighting/warm-side-beam.webp",
    thumbnailPath:
      "/images/basic-studio/models/male-model-01/lighting/warm-side-beam.webp",
    focalPosition: "50% 68%",
    imageScale: 1,
    imageTranslation: { x: 0, y: 0 },
    accessibilityLabel:
      "Seated male model lit from the side by a warm beam in a dark blue studio.",
    supportedModelIds: ["male-model-01"],
  },
  {
    id: "digicam-flash",
    label: "Digicam Flash",
    description:
      "Direct early-2000s digicam flash with a raw editorial finish.",
    imagePath:
      "/images/basic-studio/models/male-model-01/lighting/digicam-flash.webp",
    thumbnailPath:
      "/images/basic-studio/models/male-model-01/lighting/digicam-flash.webp",
    focalPosition: "50% 66%",
    imageScale: 1,
    imageTranslation: { x: 0, y: 0 },
    accessibilityLabel:
      "Seated male model photographed with direct digicam flash beneath a softbox.",
    supportedModelIds: ["male-model-01"],
  },
  {
    id: "hard-fashion-flash",
    label: "Hard Fashion Flash",
    description: "Crisp hard flash with sharp luxury-fashion shadows.",
    imagePath:
      "/images/basic-studio/models/male-model-01/lighting/hard-fashion-flash.webp",
    thumbnailPath:
      "/images/basic-studio/models/male-model-01/lighting/hard-fashion-flash.webp",
    focalPosition: "50% 68%",
    imageScale: 1,
    imageTranslation: { x: 0, y: 0 },
    accessibilityLabel:
      "Seated male model under crisp hard fashion flash with a sharp floor shadow.",
    supportedModelIds: ["male-model-01"],
  },
  {
    id: "female-clean-softbox",
    label: "Clean Softbox",
    description: "Clean, evenly diffused commercial studio lighting.",
    imagePath:
      "/images/basic-studio/models/female-model-01/lighting/clean-softbox.webp",
    thumbnailPath:
      "/images/basic-studio/models/female-model-01/lighting/clean-softbox.webp",
    focalPosition: "52% 58%",
    imageScale: 1,
    imageTranslation: { x: 0, y: 0 },
    accessibilityLabel:
      "Female model standing full length beneath a large clean studio softbox.",
    supportedModelIds: ["female-model-01"],
  },
  {
    id: "female-top-spotlight",
    label: "Top Spotlight",
    description:
      "A focused overhead spotlight with strong cinematic contrast.",
    imagePath:
      "/images/basic-studio/models/female-model-01/lighting/top-spotlight.webp",
    thumbnailPath:
      "/images/basic-studio/models/female-model-01/lighting/top-spotlight.webp",
    focalPosition: "50% 62%",
    imageScale: 1,
    imageTranslation: { x: 0, y: 0 },
    accessibilityLabel:
      "Female model standing beneath a focused overhead spotlight in a dark studio.",
    supportedModelIds: ["female-model-01"],
  },
  {
    id: "female-golden-diagonal-beam",
    label: "Golden Diagonal Beam",
    description:
      "A warm theatrical beam cutting diagonally through the studio.",
    imagePath:
      "/images/basic-studio/models/female-model-01/lighting/golden-diagonal-beam.webp",
    thumbnailPath:
      "/images/basic-studio/models/female-model-01/lighting/golden-diagonal-beam.webp",
    focalPosition: "49% 64%",
    imageScale: 1,
    imageTranslation: { x: 0, y: 0 },
    accessibilityLabel:
      "Female model standing beneath a warm diagonal beam in a deep blue studio.",
    supportedModelIds: ["female-model-01"],
  },
  {
    id: "female-cinematic-softbox",
    label: "Cinematic Softbox",
    description:
      "Moody cinematic softbox lighting with warm and cool separation.",
    imagePath:
      "/images/basic-studio/models/female-model-01/lighting/cinematic-softbox.webp",
    thumbnailPath:
      "/images/basic-studio/models/female-model-01/lighting/cinematic-softbox.webp",
    focalPosition: "50% 62%",
    imageScale: 1,
    imageTranslation: { x: 0, y: 0 },
    accessibilityLabel:
      "Female model standing under a cinematic softbox with warm and cool light separation.",
    supportedModelIds: ["female-model-01"],
  },
  {
    id: "female-window-sunlight",
    label: "Window Sunlight",
    description: "Soft natural sunlight with graphic window shadows.",
    imagePath:
      "/images/basic-studio/models/female-model-01/lighting/window-sunlight.webp",
    thumbnailPath:
      "/images/basic-studio/models/female-model-01/lighting/window-sunlight.webp",
    focalPosition: "49% 63%",
    imageScale: 1,
    imageTranslation: { x: 0, y: 0 },
    accessibilityLabel:
      "Female model standing in warm natural sunlight surrounded by graphic window shadows.",
    supportedModelIds: ["female-model-01"],
  },
  {
    id: "female-warm-side-beam",
    label: "Warm Side Beam",
    description:
      "Dramatic warm side lighting with a deep cinematic background.",
    imagePath:
      "/images/basic-studio/models/female-model-01/lighting/warm-side-beam.webp",
    thumbnailPath:
      "/images/basic-studio/models/female-model-01/lighting/warm-side-beam.webp",
    focalPosition: "50% 63%",
    imageScale: 1,
    imageTranslation: { x: 0, y: 0 },
    accessibilityLabel:
      "Female model standing under dramatic warm side lighting in a blue cinematic studio.",
    supportedModelIds: ["female-model-01"],
  },
  {
    id: "female-digicam-flash",
    label: "Digicam Flash",
    description:
      "Direct early-2000s digicam flash with a raw editorial finish.",
    imagePath:
      "/images/basic-studio/models/female-model-01/lighting/digicam-flash.webp",
    thumbnailPath:
      "/images/basic-studio/models/female-model-01/lighting/digicam-flash.webp",
    focalPosition: "50% 62%",
    imageScale: 1,
    imageTranslation: { x: 0, y: 0 },
    accessibilityLabel:
      "Female model photographed with direct digicam-style flash beneath a visible softbox.",
    supportedModelIds: ["female-model-01"],
  },
  {
    id: "female-hard-fashion-flash",
    label: "Hard Fashion Flash",
    description: "Crisp hard flash with sharp luxury-fashion shadows.",
    imagePath:
      "/images/basic-studio/models/female-model-01/lighting/hard-fashion-flash.webp",
    thumbnailPath:
      "/images/basic-studio/models/female-model-01/lighting/hard-fashion-flash.webp",
    focalPosition: "50% 64%",
    imageScale: 1,
    imageTranslation: { x: 0, y: 0 },
    accessibilityLabel:
      "Female model under crisp hard fashion lighting with a pronounced studio shadow.",
    supportedModelIds: ["female-model-01"],
  },
] as const;

export const LIGHTING_PRESET_BY_ID = Object.fromEntries(
  LIGHTING_PRESETS.map((preset) => [preset.id, preset]),
) as Record<LightingPresetId, LightingPreset>;

const DEFAULT_LIGHTING_PRESET_IDS = {
  "male-model-01": "clean-softbox",
  "female-model-01": "female-clean-softbox",
} as const satisfies Record<StudioModelId, LightingPresetId>;

export function getDefaultLightingPresetForModel(modelId: StudioModelId) {
  return LIGHTING_PRESET_BY_ID[DEFAULT_LIGHTING_PRESET_IDS[modelId]];
}

export function isLightingPresetId(
  value: unknown,
): value is LightingPresetId {
  return typeof value === "string" && Object.hasOwn(LIGHTING_PRESET_BY_ID, value);
}

export function getLightingPresetsForModel(modelId: StudioModelId) {
  return LIGHTING_PRESETS.filter((preset) =>
    preset.supportedModelIds.includes(modelId),
  );
}
