import type { ProductSpecification } from "@/types/generation";

import type { ResolvedGenerationSelection } from "../presets/selection-resolver";

export type FashionGenerationPromptInput = {
  selection: ResolvedGenerationSelection;
  product: ProductSpecification;
};
