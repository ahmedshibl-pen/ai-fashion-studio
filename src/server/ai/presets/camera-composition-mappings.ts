import "server-only";

import type { CameraPresetId } from "@/features/basic-studio/camera-presets";

import type { GenerationAspectRatio } from "../types";

type CameraCompositionMapping = {
  aspectRatio: GenerationAspectRatio;
  promptFragment: string;
};

export const CAMERA_COMPOSITION_BY_ID = {
  "male-upper-body-close-up": { aspectRatio: "4:5", promptFragment: "A close portrait crop focused on the face and upper garment." },
  "male-high-angle": { aspectRatio: "3:4", promptFragment: "An elevated diagonal view looking down toward the model." },
  "male-fabric-detail": { aspectRatio: "1:1", promptFragment: "An extreme close-up focused on collar, stitching, and fabric texture." },
  "male-low-angle": { aspectRatio: "3:4", promptFragment: "A dramatic ground-level composition looking upward toward the model." },
  "male-aerial-wide": { aspectRatio: "16:9", promptFragment: "A wide overhead composition showing the model and surrounding studio space." },
  "female-high-angle-portrait": { aspectRatio: "4:5", promptFragment: "A close high-angle composition looking down toward the model." },
  "female-wide-high-angle": { aspectRatio: "16:9", promptFragment: "A wider elevated view with generous studio space." },
  "female-low-angle": { aspectRatio: "3:4", promptFragment: "A dramatic low camera position emphasizing height and silhouette." },
  "female-fabric-detail": { aspectRatio: "1:1", promptFragment: "An extreme close-up focused on fabric texture, collar, and stitching." },
  "female-upper-body-close-up": { aspectRatio: "4:5", promptFragment: "A clean front-facing crop focused on the face and upper garment." },
} as const satisfies Record<CameraPresetId, CameraCompositionMapping>;
