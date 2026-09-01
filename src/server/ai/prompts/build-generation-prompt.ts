import "server-only";

import { buildGarmentFitFragment } from "./garment-fit";
import {
  EQUAL_INPUT_AUTHORITY_DIRECTION,
  MASTER_CAMPAIGN_DIRECTION,
  OUTPUT_DIRECTION,
} from "./master-prompt";
import {
  CROSS_REFERENCE_EXCLUSION_DIRECTION,
  PRODUCT_PRESERVATION_DIRECTION,
} from "./product-preservation";
import type { FashionGenerationPromptInput } from "./prompt-types";
import { FASHION_PROMPT_VERSION } from "./prompt-version";

function referenceDirection(
  label: string,
  fragment: string,
  mustCopy: string,
  mustNotCopy: string,
) {
  return `${label}: ${fragment} Use only ${mustCopy}. Do not copy ${mustNotCopy}.`;
}

export function buildFashionGenerationPrompt({
  selection,
  product,
}: FashionGenerationPromptInput) {
  return [
    `Prompt version: ${FASHION_PROMPT_VERSION}.`,
    MASTER_CAMPAIGN_DIRECTION,
    EQUAL_INPUT_AUTHORITY_DIRECTION,
    PRODUCT_PRESERVATION_DIRECTION,
    CROSS_REFERENCE_EXCLUSION_DIRECTION,
    referenceDirection(
      "Model reference",
      selection.modelPrompt.promptFragment,
      selection.modelPrompt.mustCopy,
      selection.modelPrompt.mustNotCopy,
    ),
    referenceDirection(
      "Pose reference",
      selection.posePrompt.promptFragment,
      selection.posePrompt.mustCopy,
      selection.posePrompt.mustNotCopy,
    ),
    referenceDirection(
      "Lighting reference",
      selection.lightingPrompt.promptFragment,
      selection.lightingPrompt.mustCopy,
      selection.lightingPrompt.mustNotCopy,
    ),
    `Camera composition: ${selection.cameraComposition.promptFragment} Keep crop and perspective physically believable.`,
    buildGarmentFitFragment(product),
    OUTPUT_DIRECTION,
  ].join("\n\n");
}
