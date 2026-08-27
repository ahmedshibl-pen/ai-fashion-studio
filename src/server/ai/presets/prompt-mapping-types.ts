import type { GenerationReferenceRole } from "../types";

export type ReferencePromptMapping<Role extends Exclude<GenerationReferenceRole, "product">> = {
  role: Role;
  promptFragment: string;
  mustCopy: string;
  mustNotCopy: string;
};
