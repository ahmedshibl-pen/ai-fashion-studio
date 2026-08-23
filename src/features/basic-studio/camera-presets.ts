import type { StudioModelId } from "./model-catalog";

export type CameraPresetId =
  | "female-high-angle-portrait"
  | "female-wide-high-angle"
  | "female-low-angle"
  | "female-fabric-detail"
  | "female-upper-body-close-up"
  | "male-upper-body-close-up"
  | "male-high-angle"
  | "male-fabric-detail"
  | "male-low-angle"
  | "male-aerial-wide";

export type CameraPreviewFraming = {
  readonly focalPosition: string;
  readonly previewScale: number;
  readonly previewTranslateX: number;
  readonly previewTranslateY: number;
  readonly mobileFocalPosition?: string;
  readonly mobilePreviewScale?: number;
  readonly mobilePreviewTranslateX?: number;
  readonly mobilePreviewTranslateY?: number;
};

export type CameraPreset = {
  readonly id: CameraPresetId;
  readonly label: string;
  readonly description: string;
  readonly imagePath: string;
  readonly thumbnailPath: string;
  readonly accessibilityLabel: string;
  readonly framing: CameraPreviewFraming;
  readonly supportedModelIds: readonly StudioModelId[];
};

export const CAMERA_PRESETS: readonly CameraPreset[] = [
  {
    id: "male-upper-body-close-up",
    label: "Upper Body Close-Up",
    description: "A close portrait crop focused on the face and upper garment.",
    imagePath:
      "/images/basic-studio/models/male-model-01/camera/upper-body-close-up.webp",
    thumbnailPath:
      "/images/basic-studio/models/male-model-01/camera/upper-body-close-up.webp",
    accessibilityLabel:
      "Close upper-body portrait of the male model wearing a black shirt.",
    framing: {
      focalPosition: "50% 43%",
      previewScale: 1,
      previewTranslateX: 0,
      previewTranslateY: 0,
      mobileFocalPosition: "50% 43%",
      mobilePreviewScale: 1,
    },
    supportedModelIds: ["male-model-01"],
  },
  {
    id: "male-high-angle",
    label: "High Angle",
    description:
      "An elevated diagonal view looking down toward the seated model.",
    imagePath:
      "/images/basic-studio/models/male-model-01/camera/high-angle.webp",
    thumbnailPath:
      "/images/basic-studio/models/male-model-01/camera/high-angle.webp",
    accessibilityLabel:
      "Elevated diagonal view looking down at the seated male model.",
    framing: {
      focalPosition: "50% 59%",
      previewScale: 1,
      previewTranslateX: 0,
      previewTranslateY: 0,
      mobileFocalPosition: "50% 59%",
      mobilePreviewScale: 1,
    },
    supportedModelIds: ["male-model-01"],
  },
  {
    id: "male-fabric-detail",
    label: "Fabric Detail",
    description:
      "An extreme close-up focused on collar, stitching, and fabric texture.",
    imagePath:
      "/images/basic-studio/models/male-model-01/camera/fabric-detail.webp",
    thumbnailPath:
      "/images/basic-studio/models/male-model-01/camera/fabric-detail.webp",
    accessibilityLabel:
      "Extreme close-up of the male model's black shirt collar, stitching, and fabric texture.",
    framing: {
      focalPosition: "58% 48%",
      previewScale: 1,
      previewTranslateX: 0,
      previewTranslateY: 0,
      mobileFocalPosition: "58% 48%",
      mobilePreviewScale: 1,
    },
    supportedModelIds: ["male-model-01"],
  },
  {
    id: "male-low-angle",
    label: "Low Angle",
    description:
      "A dramatic ground-level composition looking upward toward the model.",
    imagePath:
      "/images/basic-studio/models/male-model-01/camera/low-angle.webp",
    thumbnailPath:
      "/images/basic-studio/models/male-model-01/camera/low-angle.webp",
    accessibilityLabel:
      "Ground-level composition looking upward toward the seated male model.",
    framing: {
      focalPosition: "50% 64%",
      previewScale: 1,
      previewTranslateX: 0,
      previewTranslateY: 0,
      mobileFocalPosition: "50% 64%",
      mobilePreviewScale: 1,
    },
    supportedModelIds: ["male-model-01"],
  },
  {
    id: "male-aerial-wide",
    label: "Aerial Wide",
    description:
      "A wide overhead composition showing the model and surrounding studio space.",
    imagePath:
      "/images/basic-studio/models/male-model-01/camera/aerial-wide.webp",
    thumbnailPath:
      "/images/basic-studio/models/male-model-01/camera/aerial-wide.webp",
    accessibilityLabel:
      "Wide overhead composition of the seated male model with open studio space around him.",
    framing: {
      focalPosition: "50% 57%",
      previewScale: 1,
      previewTranslateX: 0,
      previewTranslateY: 0,
      mobileFocalPosition: "50% 57%",
      mobilePreviewScale: 1,
    },
    supportedModelIds: ["male-model-01"],
  },
  {
    id: "female-high-angle-portrait",
    label: "High Angle Portrait",
    description:
      "A close high-angle composition looking down toward the model.",
    imagePath:
      "/images/basic-studio/models/female-model-01/camera/high-angle-portrait.webp",
    thumbnailPath:
      "/images/basic-studio/models/female-model-01/camera/high-angle-portrait.webp",
    accessibilityLabel:
      "Close high-angle portrait looking down toward the female model.",
    framing: {
      focalPosition: "50% 49%",
      previewScale: 1,
      previewTranslateX: 0,
      previewTranslateY: 0,
      mobileFocalPosition: "50% 49%",
      mobilePreviewScale: 1,
    },
    supportedModelIds: ["female-model-01"],
  },
  {
    id: "female-wide-high-angle",
    label: "Wide High Angle",
    description: "A wider elevated camera view with generous studio space.",
    imagePath:
      "/images/basic-studio/models/female-model-01/camera/wide-high-angle.webp",
    thumbnailPath:
      "/images/basic-studio/models/female-model-01/camera/wide-high-angle.webp",
    accessibilityLabel:
      "Wide elevated view of the female model with generous white studio space.",
    framing: {
      focalPosition: "50% 57%",
      previewScale: 1,
      previewTranslateX: 0,
      previewTranslateY: 0,
      mobileFocalPosition: "50% 57%",
      mobilePreviewScale: 1,
    },
    supportedModelIds: ["female-model-01"],
  },
  {
    id: "female-low-angle",
    label: "Low Angle",
    description:
      "A dramatic low camera position emphasizing height and silhouette.",
    imagePath:
      "/images/basic-studio/models/female-model-01/camera/low-angle.webp",
    thumbnailPath:
      "/images/basic-studio/models/female-model-01/camera/low-angle.webp",
    accessibilityLabel:
      "Dramatic low-angle view emphasizing the female model's height and silhouette.",
    framing: {
      focalPosition: "50% 61%",
      previewScale: 1,
      previewTranslateX: 0,
      previewTranslateY: 0,
      mobileFocalPosition: "50% 61%",
      mobilePreviewScale: 1,
    },
    supportedModelIds: ["female-model-01"],
  },
  {
    id: "female-fabric-detail",
    label: "Fabric Detail",
    description:
      "An extreme close-up focused on fabric texture, collar, and stitching.",
    imagePath:
      "/images/basic-studio/models/female-model-01/camera/fabric-detail.webp",
    thumbnailPath:
      "/images/basic-studio/models/female-model-01/camera/fabric-detail.webp",
    accessibilityLabel:
      "Extreme close-up of the female model's gray shirt fabric, collar, and stitching.",
    framing: {
      focalPosition: "48% 48%",
      previewScale: 1,
      previewTranslateX: 0,
      previewTranslateY: 0,
      mobileFocalPosition: "48% 48%",
      mobilePreviewScale: 1,
    },
    supportedModelIds: ["female-model-01"],
  },
  {
    id: "female-upper-body-close-up",
    label: "Upper Body Close-Up",
    description:
      "A clean front-facing crop focused on the face and upper garment.",
    imagePath:
      "/images/basic-studio/models/female-model-01/camera/upper-body-close-up.webp",
    thumbnailPath:
      "/images/basic-studio/models/female-model-01/camera/upper-body-close-up.webp",
    accessibilityLabel:
      "Clean front-facing upper-body portrait of the female model wearing a gray shirt.",
    framing: {
      focalPosition: "50% 44%",
      previewScale: 1,
      previewTranslateX: 0,
      previewTranslateY: 0,
      mobileFocalPosition: "50% 44%",
      mobilePreviewScale: 1,
    },
    supportedModelIds: ["female-model-01"],
  },
] as const;

export const CAMERA_PRESET_BY_ID = Object.fromEntries(
  CAMERA_PRESETS.map((preset) => [preset.id, preset]),
) as Record<CameraPresetId, CameraPreset>;

const DEFAULT_CAMERA_PRESET_IDS = {
  "male-model-01": "male-upper-body-close-up",
  "female-model-01": "female-high-angle-portrait",
} as const satisfies Record<StudioModelId, CameraPresetId>;

export function getDefaultCameraPresetForModel(modelId: StudioModelId) {
  return CAMERA_PRESET_BY_ID[DEFAULT_CAMERA_PRESET_IDS[modelId]];
}

export function isCameraPresetId(value: unknown): value is CameraPresetId {
  return typeof value === "string" && Object.hasOwn(CAMERA_PRESET_BY_ID, value);
}

export function getCameraPresetsForModel(modelId: StudioModelId) {
  return CAMERA_PRESETS.filter((preset) =>
    preset.supportedModelIds.includes(modelId),
  );
}
