import type { Metadata } from "next";

import { ProjectsExperience } from "@/features/projects/projects-experience";

export const metadata: Metadata = {
  title: "My Projects — AI Fashion Studio",
  description: "Review browser-local AI Fashion Studio campaign drafts, generations and approved work.",
};

export default function ProjectsPage() {
  return <ProjectsExperience />;
}
