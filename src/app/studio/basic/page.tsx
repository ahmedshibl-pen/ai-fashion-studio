import type { Metadata } from "next";

import { isStudioModelId } from "@/features/basic-studio/model-catalog";
import { isStudioStep } from "@/features/basic-studio/studio-session";
import { WorkspacePreview } from "@/features/basic-studio/workspace-preview";

export const metadata: Metadata = {
  title: "Basic Studio — AI Fashion Studio",
  description: "Choose a model, then direct product, lighting, pose and camera in one workspace.",
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function BasicStudio({ searchParams }: { searchParams: SearchParams }) {
  const query = await searchParams;
  const requestedModel = typeof query.model === "string" ? query.model : null;
  const requestedStep = typeof query.step === "string" ? query.step : null;
  const modelId = isStudioModelId(requestedModel) ? requestedModel : "male-model-01";
  const initialStep = isStudioStep(requestedStep) ? requestedStep : "product";

  return <WorkspacePreview modelId={modelId} selectorOpen={query.stage !== "workspace"} initialStep={initialStep} />;
}
