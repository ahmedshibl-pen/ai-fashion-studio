import {
  getCameraPresetsForModel,
  getDefaultCameraPresetForModel,
  isCameraPresetId,
  type CameraPresetId,
} from "./camera-presets";
import {
  getDefaultLightingPresetForModel,
  getLightingPresetsForModel,
  isLightingPresetId,
  type LightingPresetId,
} from "./lighting-presets";
import {
  STUDIO_MODELS,
  isStudioModelId,
  type StudioModelId,
} from "./model-catalog";
import {
  getDefaultPosePresetForModel,
  getPosePresetsForModel,
  isPosePresetId,
  type PosePresetId,
} from "./pose-presets";

export type ModelSetupSelection = {
  lightingPresetId: LightingPresetId | null;
  posePresetId: PosePresetId | null;
  cameraPresetId: CameraPresetId | null;
};

export type ModelSetupSelections = Record<
  StudioModelId,
  ModelSetupSelection
>;

export const MODEL_STORAGE_KEY = "ai-fashion-studio:selected-model";
export const MODEL_SETUP_STORAGE_KEY = "ai-fashion-studio:model-setups";
export const WORKFLOW_STORAGE_KEY = "ai-fashion-studio:basic-workflow";

export const STUDIO_STEPS = [
  "product",
  "lighting",
  "pose",
  "camera",
  "review",
] as const;

export type StudioStep = (typeof STUDIO_STEPS)[number];

export type StudioWorkflowSession = {
  modelId: StudioModelId;
  activeStep: StudioStep;
  setups: ModelSetupSelections;
};

export function readSessionStorage(key: string): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    return window.sessionStorage.getItem(key);
  } catch {
    return null;
  }
}

export function writeSessionStorage(key: string, value: string): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  try {
    window.sessionStorage.setItem(key, value);
    return true;
  } catch {
    return false;
  }
}

export function removeSessionStorage(key: string): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  try {
    window.sessionStorage.removeItem(key);
    return true;
  } catch {
    return false;
  }
}

export function getDefaultSetupForModel(
  modelId: StudioModelId,
): ModelSetupSelection {
  if (modelId === "female-model-01") {
    return {
      lightingPresetId: null,
      posePresetId: null,
      cameraPresetId: null,
    };
  }

  return {
    lightingPresetId: getDefaultLightingPresetForModel(modelId)?.id ?? null,
    posePresetId: getDefaultPosePresetForModel(modelId)?.id ?? null,
    cameraPresetId: getDefaultCameraPresetForModel(modelId)?.id ?? null,
  };
}

export function createDefaultModelSetups(): ModelSetupSelections {
  return Object.fromEntries(
    STUDIO_MODELS.map((model) => [
      model.id,
      getDefaultSetupForModel(model.id),
    ]),
  ) as ModelSetupSelections;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function validateStoredModelSetup(
  modelId: StudioModelId,
  value: unknown,
): ModelSetupSelection {
  const fallback = getDefaultSetupForModel(modelId);

  if (modelId === "female-model-01") {
    return fallback;
  }

  if (!isRecord(value)) {
    return fallback;
  }

  const lightingPresetId = isLightingPresetId(value.lightingPresetId)
    ? getLightingPresetsForModel(modelId).some(
        (preset) => preset.id === value.lightingPresetId,
      )
      ? value.lightingPresetId
      : fallback.lightingPresetId
    : fallback.lightingPresetId;
  const posePresetId = isPosePresetId(value.posePresetId)
    ? getPosePresetsForModel(modelId).some(
        (preset) => preset.id === value.posePresetId,
      )
      ? value.posePresetId
      : fallback.posePresetId
    : fallback.posePresetId;
  const cameraPresetId = isCameraPresetId(value.cameraPresetId)
    ? getCameraPresetsForModel(modelId).some(
        (preset) => preset.id === value.cameraPresetId,
      )
      ? value.cameraPresetId
      : fallback.cameraPresetId
    : fallback.cameraPresetId;

  return { lightingPresetId, posePresetId, cameraPresetId };
}

export function parseStoredModelSetups(
  value: string | null,
): ModelSetupSelections {
  let parsed: unknown = null;

  if (value !== null) {
    try {
      parsed = JSON.parse(value);
    } catch {
      parsed = null;
    }
  }

  const storedSetups = isRecord(parsed) ? parsed : {};

  return Object.fromEntries(
    STUDIO_MODELS.map((model) => [
      model.id,
      validateStoredModelSetup(model.id, storedSetups[model.id]),
    ]),
  ) as ModelSetupSelections;
}

export function isStudioStep(value: unknown): value is StudioStep {
  return typeof value === "string" && STUDIO_STEPS.includes(value as StudioStep);
}

export function createDefaultWorkflowSession(
  modelId: StudioModelId = "male-model-01",
): StudioWorkflowSession {
  return {
    modelId,
    activeStep: "product",
    setups: createDefaultModelSetups(),
  };
}

export function parseStoredWorkflowSession(
  value: string | null,
  fallbackModelId: StudioModelId = "male-model-01",
): StudioWorkflowSession {
  let parsed: unknown = null;

  if (value !== null) {
    try {
      parsed = JSON.parse(value);
    } catch {
      parsed = null;
    }
  }

  if (!isRecord(parsed)) {
    return createDefaultWorkflowSession(fallbackModelId);
  }

  const modelId = typeof parsed.modelId === "string" && isStudioModelId(parsed.modelId)
    ? parsed.modelId
    : fallbackModelId;
  const activeStep = isStudioStep(parsed.activeStep) ? parsed.activeStep : "product";
  const setups = parseStoredModelSetups(
    typeof parsed.setups === "object" ? JSON.stringify(parsed.setups) : null,
  );

  return { modelId, activeStep, setups };
}
