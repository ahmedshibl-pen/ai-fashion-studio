import type { Metadata } from "next";

import { ProjectExperience } from "@/features/projects/project-experience";
import { getPublicGenerationStatus } from "@/server/ai/env";

export const metadata: Metadata = {
  title: "Campaign Project — AI Fashion Studio",
  description: "Follow mock generation, review the campaign and prepare local delivery files.",
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function ProjectPage({ params, searchParams }: { params: Promise<{ projectId: string }>; searchParams: SearchParams }) {
  const { projectId } = await params;
  const query = await searchParams;
  return <ProjectExperience projectId={projectId} autoGenerate={query.generate === "1"} generationStatus={getPublicGenerationStatus()} />;
}
