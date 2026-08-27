import type { GenerationProgressStage } from "@/types/generation";
import type { MockProjectStatus } from "@/types/mock-platform";

export const GENERATION_PROGRESS_STEPS = [
  { label: "Uploading product", phase: "uploading" },
  { label: "Validating request", phase: "validating" },
  { label: "Resolving selected references", phase: "validating" },
  { label: "Generating campaign", phase: "generating" },
  { label: "Preparing preview", phase: "generating" },
] as const satisfies readonly {
  label: string;
  phase: Exclude<GenerationProgressStage, "idle" | "completed" | "failed">;
}[];

export type GenerationClientState = {
  phase: GenerationProgressStage;
  label: string;
  percent: number;
  stepIndex: number;
};

export function getGenerationClientState(
  status: MockProjectStatus,
  generationStage: number,
): GenerationClientState {
  if (status === "failed") {
    return { phase: "failed", label: "Generation failed", percent: 0, stepIndex: 0 };
  }
  if (status === "completed" || status === "approved" || status === "delivered") {
    return {
      phase: "completed",
      label: "Generation complete",
      percent: 100,
      stepIndex: GENERATION_PROGRESS_STEPS.length - 1,
    };
  }
  if (status === "queued") {
    return { phase: "uploading", label: GENERATION_PROGRESS_STEPS[0].label, percent: 6, stepIndex: 0 };
  }
  if (status === "processing") {
    const stepIndex = Math.max(0, Math.min(GENERATION_PROGRESS_STEPS.length - 1, Math.trunc(generationStage)));
    const step = GENERATION_PROGRESS_STEPS[stepIndex];
    return {
      phase: step.phase,
      label: step.label,
      percent: Math.min(96, 18 + stepIndex * 19),
      stepIndex,
    };
  }
  return { phase: "idle", label: "Ready to generate", percent: 0, stepIndex: 0 };
}
