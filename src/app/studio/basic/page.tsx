import type { Metadata } from "next";

import { isStudioModelId } from "@/features/basic-studio/model-catalog";
import { WorkspacePreview } from "@/features/basic-studio/workspace-preview";

export const metadata: Metadata = {
  title: "Basic Studio — AI Fashion Studio",
  description: "Choose a model, then direct product, lighting, pose and camera in one workspace.",
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function BasicStudio({ searchParams }: { searchParams: SearchParams }) {
  const query = await searchParams;
  const requestedModel = typeof query.model === "string" ? query.model : null;
  const modelId = isStudioModelId(requestedModel) ? requestedModel : "male-model-01";

  return <WorkspacePreview modelId={modelId} selectorOpen={query.stage !== "workspace"} />;
}
