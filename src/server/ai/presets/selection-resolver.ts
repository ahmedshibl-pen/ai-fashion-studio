import "server-only";

import { CAMERA_PRESET_BY_ID, isCameraPresetId, type CameraPresetId } from "@/features/basic-studio/camera-presets";
import { LIGHTING_PRESET_BY_ID, isLightingPresetId, type LightingPresetId } from "@/features/basic-studio/lighting-presets";
import { STUDIO_MODEL_BY_ID, isStudioModelId, type StudioModelId } from "@/features/basic-studio/model-catalog";
import { POSE_PRESET_BY_ID, isPosePresetId, type PosePresetId } from "@/features/basic-studio/pose-presets";

import { GenerationProviderError } from "../errors";
import { CAMERA_COMPOSITION_BY_ID } from "./camera-composition-mappings";
import { LIGHTING_PROMPT_BY_ID } from "./lighting-prompt-mappings";
import { MODEL_PROMPT_BY_ID } from "./model-prompt-mappings";
import { POSE_PROMPT_BY_ID } from "./pose-prompt-mappings";

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

  const cameraComposition = CAMERA_COMPOSITION_BY_ID[cameraPresetId];
  return {
    ids: { modelId, lightingPresetId, posePresetId, cameraPresetId },
    model: STUDIO_MODEL_BY_ID[modelId],
    lighting: LIGHTING_PRESET_BY_ID[lightingPresetId],
    pose: POSE_PRESET_BY_ID[posePresetId],
    camera: CAMERA_PRESET_BY_ID[cameraPresetId],
    modelPrompt: MODEL_PROMPT_BY_ID[modelId],
    posePrompt: POSE_PROMPT_BY_ID[posePresetId],
    lightingPrompt: LIGHTING_PROMPT_BY_ID[lightingPresetId],
    cameraComposition,
    aspectRatio: cameraComposition.aspectRatio,
  } as const;
}

export type ResolvedGenerationSelection = ReturnType<typeof resolveGenerationSelection>;
