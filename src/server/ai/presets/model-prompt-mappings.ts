import "server-only";

import type { StudioModelId } from "@/features/basic-studio/model-catalog";

import type { ReferencePromptMapping } from "./prompt-mapping-types";

export const MODEL_PROMPT_BY_ID = {
  "male-model-01": {
    role: "model",
    promptFragment: "Preserve the facial identity, body proportions, skin tone, and hair of Male Model 01.",
    mustCopy: "the selected person’s identity, appearance, and believable body proportions",
    mustNotCopy: "the model reference clothing, accessories, background, lighting, or pose",
  },
  "female-model-01": {
    role: "model",
    promptFragment: "Preserve the facial identity, body proportions, skin tone, and hair of Female Model 01.",
    mustCopy: "the selected person’s identity, appearance, and believable body proportions",
    mustNotCopy: "the model reference clothing, accessories, background, lighting, or pose",
  },
} as const satisfies Record<StudioModelId, ReferencePromptMapping<"model">>;
