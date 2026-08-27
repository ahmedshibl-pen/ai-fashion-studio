import "server-only";

import { CAMERA_PRESET_BY_ID, isCameraPresetId, type CameraPresetId } from "@/features/basic-studio/camera-presets";
import { LIGHTING_PRESET_BY_ID, isLightingPresetId, type LightingPresetId } from "@/features/basic-studio/lighting-presets";
import { STUDIO_MODEL_BY_ID, isStudioModelId, type StudioModelId } from "@/features/basic-studio/model-catalog";
import { POSE_PRESET_BY_ID, isPosePresetId, type PosePresetId } from "@/features/basic-studio/pose-presets";

import { GenerationProviderError } from "./errors";
import type { GenerationAspectRatio } from "./types";

export const MODEL_PROMPT_BY_ID = {
  "male-model-01": "Preserve the exact facial identity, body proportions, skin tone, and hair of Male Model 01.",
  "female-model-01": "Preserve the exact facial identity, body proportions, skin tone, and hair of Female Model 01.",
} as const satisfies Record<StudioModelId, string>;

export const POSE_PROMPT_BY_ID = {
  "male-relaxed-front": "Use a relaxed full-length front pose with both hands in the pockets.",
  "male-asymmetric-arm-hold": "Use a standing crossed-leg pose with one arm naturally holding the other.",
  "male-hands-clasped-close-up": "Use a waist-up pose with a lowered gaze and naturally clasped hands.",
  "male-hands-clasped-full-length": "Use a full-length pose with lowered gaze and hands held together.",
  "male-folded-arms": "Use a relaxed full-length standing pose with folded arms.",
  "male-back-turn": "Use a full-length rear pose that clearly displays the garment back.",
  "female-neutral-front": "Use a clean full-length front pose with both arms relaxed naturally.",
  "female-crouched-editorial": "Use a low crouched editorial pose with direct gaze and relaxed arms.",
  "female-portrait-hand-detail": "Use a waist-up portrait pose with one hand near the face and the other in a pocket.",
  "female-back-view": "Use a full-length rear pose designed to display the garment back.",
  "female-relaxed-hands": "Use a relaxed front stance with lowered gaze and hands resting together.",
  "female-crossed-leg-neck-touch": "Use a full-length crossed-leg stance with one hand touching the neck.",
  "female-hair-touch-three-quarter": "Use a three-quarter standing pose with one arm raised toward the hair.",
  "female-dynamic-hair-turn": "Use a dynamic editorial turn with flowing hair and one hand at the hip.",
  "female-seated-floor": "Use a composed seated-on-floor editorial pose with believable limb placement.",
} as const satisfies Record<PosePresetId, string>;

export const LIGHTING_PROMPT_BY_ID = {
  "clean-softbox": "Use clean, evenly diffused commercial softbox lighting.",
  "top-spotlight": "Use a focused overhead spotlight with strong cinematic contrast.",
  "golden-diagonal-beam": "Use a warm theatrical beam cutting diagonally through the studio.",
  "cinematic-softbox": "Use moody cinematic softbox lighting with warm and cool separation.",
  "window-sunlight": "Use soft natural sunlight with graphic window shadows.",
  "warm-side-beam": "Use dramatic warm side lighting against a deep cinematic background.",
  "digicam-flash": "Use direct early-2000s digicam flash with a raw editorial finish.",
  "hard-fashion-flash": "Use crisp hard fashion flash with sharp luxury-fashion shadows.",
  "female-clean-softbox": "Use clean, evenly diffused commercial softbox lighting.",
  "female-top-spotlight": "Use a focused overhead spotlight with strong cinematic contrast.",
  "female-golden-diagonal-beam": "Use a warm theatrical beam cutting diagonally through the studio.",
  "female-cinematic-softbox": "Use moody cinematic softbox lighting with warm and cool separation.",
  "female-window-sunlight": "Use soft natural sunlight with graphic window shadows.",
  "female-warm-side-beam": "Use dramatic warm side lighting against a deep cinematic background.",
  "female-digicam-flash": "Use direct early-2000s digicam flash with a raw editorial finish.",
  "female-hard-fashion-flash": "Use crisp hard fashion flash with sharp luxury-fashion shadows.",
} as const satisfies Record<LightingPresetId, string>;

const CAMERA_ASPECT_RATIO_BY_ID = {
  "male-upper-body-close-up": "4:5",
  "male-high-angle": "3:4",
  "male-fabric-detail": "1:1",
  "male-low-angle": "3:4",
  "male-aerial-wide": "16:9",
  "female-high-angle-portrait": "4:5",
  "female-wide-high-angle": "16:9",
  "female-low-angle": "3:4",
  "female-fabric-detail": "1:1",
  "female-upper-body-close-up": "4:5",
} as const satisfies Record<CameraPresetId, GenerationAspectRatio>;

export type GenerationSelection = {
  modelId: StudioModelId;
  lightingPresetId: LightingPresetId;
  posePresetId: PosePresetId;
  cameraPresetId: CameraPresetId;
};

export function resolveGenerationSelection(value: Record<string, unknown>) {
  const { modelId, lightingPresetId, posePresetId, cameraPresetId } = value;
  if (typeof modelId !== "string" || !isStudioModelId(modelId)) {
    throw new GenerationProviderError("invalid-request", { safeMessage: "Choose a valid studio model." });
  }
  if (!isLightingPresetId(lightingPresetId) || !LIGHTING_PRESET_BY_ID[lightingPresetId].supportedModelIds.includes(modelId)) {
    throw new GenerationProviderError("invalid-request", { safeMessage: "Choose lighting available for the selected model." });
  }
  if (!isPosePresetId(posePresetId) || !POSE_PRESET_BY_ID[posePresetId].supportedModelIds.includes(modelId)) {
    throw new GenerationProviderError("invalid-request", { safeMessage: "Choose a pose available for the selected model." });
  }
  if (!isCameraPresetId(cameraPresetId) || !CAMERA_PRESET_BY_ID[cameraPresetId].supportedModelIds.includes(modelId)) {
    throw new GenerationProviderError("invalid-request", { safeMessage: "Choose a camera option available for the selected model." });
  }

  return {
    ids: { modelId, lightingPresetId, posePresetId, cameraPresetId },
    model: STUDIO_MODEL_BY_ID[modelId],
    lighting: LIGHTING_PRESET_BY_ID[lightingPresetId],
    pose: POSE_PRESET_BY_ID[posePresetId],
    camera: CAMERA_PRESET_BY_ID[cameraPresetId],
    aspectRatio: CAMERA_ASPECT_RATIO_BY_ID[cameraPresetId],
  } as const;
}
