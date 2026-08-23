import type { StudioModelId } from "./model-catalog";

export type PosePresetId =
  | "male-relaxed-front"
  | "male-asymmetric-arm-hold"
  | "male-hands-clasped-close-up"
  | "male-hands-clasped-full-length"
  | "male-folded-arms"
  | "male-back-turn"
  | "female-neutral-front"
  | "female-crouched-editorial"
  | "female-portrait-hand-detail"
  | "female-back-view"
  | "female-relaxed-hands"
  | "female-crossed-leg-neck-touch"
  | "female-hair-touch-three-quarter"
  | "female-dynamic-hair-turn"
  | "female-seated-floor";

export type PosePreviewFraming = {
  readonly focalPosition: string;
  readonly previewScale: number;
  readonly previewTranslateX: number;
  readonly previewTranslateY: number;
  readonly mobileFocalPosition?: string;
  readonly mobilePreviewScale?: number;
  readonly mobilePreviewTranslateX?: number;
  readonly mobilePreviewTranslateY?: number;
};

export type PosePreset = {
  readonly id: PosePresetId;
  readonly label: string;
  readonly description: string;
  readonly imagePath: string;
  readonly thumbnailPath: string;
  readonly accessibilityLabel: string;
  readonly framing: PosePreviewFraming;
  readonly supportedModelIds: readonly StudioModelId[];
};

export const POSE_PRESETS: readonly PosePreset[] = [
  {
    id: "male-relaxed-front",
    label: "Relaxed Front",
    description:
      "Relaxed full-length front pose with both hands in the pockets.",
    imagePath:
      "/images/basic-studio/models/male-model-01/poses/relaxed-front.webp",
    thumbnailPath:
      "/images/basic-studio/models/male-model-01/poses/relaxed-front.webp",
    accessibilityLabel:
      "Male model standing full length facing forward with both hands in his pockets.",
    framing: {
      focalPosition: "50% 54%",
      previewScale: 1,
      previewTranslateX: 0,
      previewTranslateY: 0,
      mobileFocalPosition: "50% 53%",
      mobilePreviewScale: 1,
    },
    supportedModelIds: ["male-model-01"],
  },
  {
    id: "male-asymmetric-arm-hold",
    label: "Asymmetric Arm Hold",
    description:
      "Editorial standing pose with crossed legs and one arm holding the other.",
    imagePath:
      "/images/basic-studio/models/male-model-01/poses/asymmetric-arm-hold.webp",
    thumbnailPath:
      "/images/basic-studio/models/male-model-01/poses/asymmetric-arm-hold.webp",
    accessibilityLabel:
      "Male model standing full length with crossed legs and one arm holding the other.",
    framing: {
      focalPosition: "50% 55%",
      previewScale: 1,
      previewTranslateX: 0,
      previewTranslateY: 0,
      mobileFocalPosition: "50% 54%",
      mobilePreviewScale: 1,
    },
    supportedModelIds: ["male-model-01"],
  },
  {
    id: "male-hands-clasped-close-up",
    label: "Hands Clasped Close-Up",
    description:
      "Waist-up editorial portrait with lowered gaze and naturally clasped hands.",
    imagePath:
      "/images/basic-studio/models/male-model-01/poses/hands-clasped-close-up.webp",
    thumbnailPath:
      "/images/basic-studio/models/male-model-01/poses/hands-clasped-close-up.webp",
    accessibilityLabel:
      "Waist-up portrait of a male model looking down with his hands naturally clasped.",
    framing: {
      focalPosition: "50% 45%",
      previewScale: 1,
      previewTranslateX: 0,
      previewTranslateY: 0,
      mobileFocalPosition: "50% 44%",
      mobilePreviewScale: 1,
    },
    supportedModelIds: ["male-model-01"],
  },
  {
    id: "male-hands-clasped-full-length",
    label: "Hands Clasped Full-Length",
    description: "Full-length pose with lowered gaze and hands held together.",
    imagePath:
      "/images/basic-studio/models/male-model-01/poses/hands-clasped-full-length.webp",
    thumbnailPath:
      "/images/basic-studio/models/male-model-01/poses/hands-clasped-full-length.webp",
    accessibilityLabel:
      "Male model standing full length with a lowered gaze and his hands held together.",
    framing: {
      focalPosition: "50% 55%",
      previewScale: 1,
      previewTranslateX: 0,
      previewTranslateY: 0,
      mobileFocalPosition: "50% 54%",
      mobilePreviewScale: 1,
    },
    supportedModelIds: ["male-model-01"],
  },
  {
    id: "male-folded-arms",
    label: "Folded Arms",
    description: "Relaxed editorial standing pose with folded arms.",
    imagePath:
      "/images/basic-studio/models/male-model-01/poses/folded-arms.webp",
    thumbnailPath:
      "/images/basic-studio/models/male-model-01/poses/folded-arms.webp",
    accessibilityLabel:
      "Male model standing full length in a relaxed pose with folded arms.",
    framing: {
      focalPosition: "50% 55%",
      previewScale: 1,
      previewTranslateX: 0,
      previewTranslateY: 0,
      mobileFocalPosition: "50% 54%",
      mobilePreviewScale: 1,
    },
    supportedModelIds: ["male-model-01"],
  },
  {
    id: "male-back-turn",
    label: "Back Turn",
    description: "Full-length rear pose displaying the back of the garment.",
    imagePath:
      "/images/basic-studio/models/male-model-01/poses/back-turn.webp",
    thumbnailPath:
      "/images/basic-studio/models/male-model-01/poses/back-turn.webp",
    accessibilityLabel:
      "Male model standing full length with his back turned to display the rear of the garment.",
    framing: {
      focalPosition: "50% 54%",
      previewScale: 1,
      previewTranslateX: 0,
      previewTranslateY: 0,
      mobileFocalPosition: "50% 53%",
      mobilePreviewScale: 1,
    },
    supportedModelIds: ["male-model-01"],
  },
  {
    id: "female-neutral-front",
    label: "Neutral Front",
    description:
      "Clean full-length front pose with both arms relaxed naturally.",
    imagePath:
      "/images/basic-studio/models/female-model-01/poses/neutral-front-v2.webp",
    thumbnailPath:
      "/images/basic-studio/models/female-model-01/poses/neutral-front-v2.webp",
    accessibilityLabel:
      "Female model standing full length facing forward with both arms relaxed.",
    framing: {
      focalPosition: "50% 54%",
      previewScale: 1,
      previewTranslateX: 0,
      previewTranslateY: 0,
      mobileFocalPosition: "50% 53%",
      mobilePreviewScale: 1,
    },
    supportedModelIds: ["female-model-01"],
  },
  {
    id: "female-crouched-editorial",
    label: "Crouched Editorial",
    description:
      "Low crouched editorial pose with a direct gaze and relaxed arms.",
    imagePath:
      "/images/basic-studio/models/female-model-01/poses/crouched-editorial-v2.webp",
    thumbnailPath:
      "/images/basic-studio/models/female-model-01/poses/crouched-editorial-v2.webp",
    accessibilityLabel:
      "Female model crouching low with her arms resting loosely and looking toward the camera.",
    framing: {
      focalPosition: "50% 58%",
      previewScale: 1.08,
      previewTranslateX: 0,
      previewTranslateY: -1,
      mobileFocalPosition: "50% 58%",
      mobilePreviewScale: 1.06,
      mobilePreviewTranslateY: -1,
    },
    supportedModelIds: ["female-model-01"],
  },
  {
    id: "female-portrait-hand-detail",
    label: "Portrait Hand Detail",
    description:
      "Waist-up portrait with one hand near the face and the other in a pocket.",
    imagePath:
      "/images/basic-studio/models/female-model-01/poses/portrait-hand-detail.webp",
    thumbnailPath:
      "/images/basic-studio/models/female-model-01/poses/portrait-hand-detail.webp",
    accessibilityLabel:
      "Waist-up female model portrait with one hand near her neck.",
    framing: {
      focalPosition: "50% 46%",
      previewScale: 1.04,
      previewTranslateX: 0,
      previewTranslateY: 0,
      mobileFocalPosition: "50% 45%",
      mobilePreviewScale: 1.03,
    },
    supportedModelIds: ["female-model-01"],
  },
  {
    id: "female-back-view",
    label: "Back View",
    description:
      "Full-length rear pose designed to display the back of the garment.",
    imagePath:
      "/images/basic-studio/models/female-model-01/poses/back-view.webp",
    thumbnailPath:
      "/images/basic-studio/models/female-model-01/poses/back-view.webp",
    accessibilityLabel:
      "Female model standing full length with her back facing the camera.",
    framing: {
      focalPosition: "50% 54%",
      previewScale: 1,
      previewTranslateX: 0,
      previewTranslateY: 0,
      mobileFocalPosition: "50% 53%",
      mobilePreviewScale: 1,
    },
    supportedModelIds: ["female-model-01"],
  },
  {
    id: "female-relaxed-hands",
    label: "Relaxed Hands",
    description:
      "Relaxed front stance with a lowered gaze and hands resting together.",
    imagePath:
      "/images/basic-studio/models/female-model-01/poses/relaxed-hands.webp",
    thumbnailPath:
      "/images/basic-studio/models/female-model-01/poses/relaxed-hands.webp",
    accessibilityLabel:
      "Female model standing with a lowered gaze and both hands relaxed in front.",
    framing: {
      focalPosition: "50% 54%",
      previewScale: 1,
      previewTranslateX: 0,
      previewTranslateY: 0,
      mobileFocalPosition: "50% 53%",
      mobilePreviewScale: 1,
    },
    supportedModelIds: ["female-model-01"],
  },
  {
    id: "female-crossed-leg-neck-touch",
    label: "Crossed-Leg Neck Touch",
    description:
      "Full-length crossed-leg stance with one hand touching the neck.",
    imagePath:
      "/images/basic-studio/models/female-model-01/poses/crossed-leg-neck-touch.webp",
    thumbnailPath:
      "/images/basic-studio/models/female-model-01/poses/crossed-leg-neck-touch.webp",
    accessibilityLabel:
      "Female model standing with crossed legs and one hand touching her neck.",
    framing: {
      focalPosition: "50% 54%",
      previewScale: 1,
      previewTranslateX: 0,
      previewTranslateY: 0,
      mobileFocalPosition: "50% 53%",
      mobilePreviewScale: 1,
    },
    supportedModelIds: ["female-model-01"],
  },
  {
    id: "female-hair-touch-three-quarter",
    label: "Hair Touch Three-Quarter",
    description:
      "Three-quarter standing pose with one arm raised toward the hair.",
    imagePath:
      "/images/basic-studio/models/female-model-01/poses/hair-touch-three-quarter.webp",
    thumbnailPath:
      "/images/basic-studio/models/female-model-01/poses/hair-touch-three-quarter.webp",
    accessibilityLabel:
      "Female model in a three-quarter stance with one hand raised above her hair.",
    framing: {
      focalPosition: "50% 53%",
      previewScale: 1,
      previewTranslateX: 0,
      previewTranslateY: 0,
      mobileFocalPosition: "50% 52%",
      mobilePreviewScale: 1,
    },
    supportedModelIds: ["female-model-01"],
  },
  {
    id: "female-dynamic-hair-turn",
    label: "Dynamic Hair Turn",
    description:
      "Dynamic editorial stance with flowing hair and one hand at the hip.",
    imagePath:
      "/images/basic-studio/models/female-model-01/poses/dynamic-hair-turn.webp",
    thumbnailPath:
      "/images/basic-studio/models/female-model-01/poses/dynamic-hair-turn.webp",
    accessibilityLabel:
      "Female model turning dynamically with her hair moving behind her.",
    framing: {
      focalPosition: "50% 54%",
      previewScale: 1,
      previewTranslateX: 0,
      previewTranslateY: 0,
      mobileFocalPosition: "50% 53%",
      mobilePreviewScale: 1,
    },
    supportedModelIds: ["female-model-01"],
  },
  {
    id: "female-seated-floor",
    label: "Seated Floor",
    description:
      "Relaxed seated floor pose with one arm supporting the body.",
    imagePath:
      "/images/basic-studio/models/female-model-01/poses/seated-floor.webp",
    thumbnailPath:
      "/images/basic-studio/models/female-model-01/poses/seated-floor.webp",
    accessibilityLabel:
      "Female model seated on the floor with one hand behind her and the other above her head.",
    framing: {
      focalPosition: "50% 60%",
      previewScale: 1.08,
      previewTranslateX: 0,
      previewTranslateY: -1,
      mobileFocalPosition: "50% 60%",
      mobilePreviewScale: 1.06,
      mobilePreviewTranslateY: -1,
    },
    supportedModelIds: ["female-model-01"],
  },
] as const;

export const POSE_PRESET_BY_ID = Object.fromEntries(
  POSE_PRESETS.map((preset) => [preset.id, preset]),
) as Record<PosePresetId, PosePreset>;

export function isPosePresetId(value: unknown): value is PosePresetId {
  return typeof value === "string" && Object.hasOwn(POSE_PRESET_BY_ID, value);
}

export function getPosePresetsForModel(modelId: StudioModelId) {
  return POSE_PRESETS.filter((preset) =>
    preset.supportedModelIds.includes(modelId),
  );
}

const DEFAULT_POSE_PRESET_IDS = {
  "male-model-01": "male-relaxed-front",
  "female-model-01": "female-neutral-front",
} as const satisfies Record<StudioModelId, PosePresetId>;

export function getDefaultPosePresetForModel(modelId: StudioModelId) {
  return POSE_PRESET_BY_ID[DEFAULT_POSE_PRESET_IDS[modelId]];
}
