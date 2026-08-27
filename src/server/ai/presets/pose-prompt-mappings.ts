import "server-only";

import type { PosePresetId } from "@/features/basic-studio/pose-presets";

import type { ReferencePromptMapping } from "./prompt-mapping-types";

const POSE_COPY_RULES = {
  role: "pose",
  mustCopy: "body position, gesture, crop intent, and weight distribution",
  mustNotCopy: "the pose reference identity, clothing, product details, lighting, or background objects",
} as const;

export const POSE_PROMPT_BY_ID = {
  "male-relaxed-front": { ...POSE_COPY_RULES, promptFragment: "Use a relaxed full-length front pose with both hands in the pockets." },
  "male-asymmetric-arm-hold": { ...POSE_COPY_RULES, promptFragment: "Use a standing crossed-leg pose with one arm naturally holding the other." },
  "male-hands-clasped-close-up": { ...POSE_COPY_RULES, promptFragment: "Use a waist-up pose with a lowered gaze and naturally clasped hands." },
  "male-hands-clasped-full-length": { ...POSE_COPY_RULES, promptFragment: "Use a full-length pose with lowered gaze and hands held together." },
  "male-folded-arms": { ...POSE_COPY_RULES, promptFragment: "Use a relaxed full-length standing pose with folded arms." },
  "male-back-turn": { ...POSE_COPY_RULES, promptFragment: "Use a full-length rear pose that clearly displays the garment back." },
  "female-neutral-front": { ...POSE_COPY_RULES, promptFragment: "Use a clean full-length front pose with both arms relaxed naturally." },
  "female-crouched-editorial": { ...POSE_COPY_RULES, promptFragment: "Use a low crouched editorial pose with direct gaze and relaxed arms." },
  "female-portrait-hand-detail": { ...POSE_COPY_RULES, promptFragment: "Use a waist-up portrait pose with one hand near the face and the other in a pocket." },
  "female-back-view": { ...POSE_COPY_RULES, promptFragment: "Use a full-length rear pose designed to display the garment back." },
  "female-relaxed-hands": { ...POSE_COPY_RULES, promptFragment: "Use a relaxed front stance with lowered gaze and hands resting together." },
  "female-crossed-leg-neck-touch": { ...POSE_COPY_RULES, promptFragment: "Use a full-length crossed-leg stance with one hand touching the neck." },
  "female-hair-touch-three-quarter": { ...POSE_COPY_RULES, promptFragment: "Use a three-quarter standing pose with one arm raised toward the hair." },
  "female-dynamic-hair-turn": { ...POSE_COPY_RULES, promptFragment: "Use a dynamic editorial turn with flowing hair and one hand at the hip." },
  "female-seated-floor": { ...POSE_COPY_RULES, promptFragment: "Use a composed seated-on-floor editorial pose with believable limb placement." },
} as const satisfies Record<PosePresetId, ReferencePromptMapping<"pose">>;
