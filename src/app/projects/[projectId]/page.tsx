import type { Metadata } from "next";

import { ProjectExperience } from "@/features/projects/project-experience";

export const metadata: Metadata = {
  title: "Campaign Project — AI Fashion Studio",
  description: "Follow mock generation, review the campaign and prepare local delivery files.",
};

export default async function ProjectPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;
  return <ProjectExperience projectId={projectId} />;
}
