"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";

import { AppHeader } from "@/components/shell/app-header";
import { EmptyState, Skeleton, StatusBadge, Tabs } from "@/components/ui";
import { STUDIO_MODEL_BY_ID } from "@/features/basic-studio/model-catalog";
import { MOCK_PLATFORM_UPDATED_EVENT, mockProjectService } from "@/lib/mock-platform";
import type { MockProject, MockProjectStatus } from "@/types/mock-platform";

import { PROJECT_STATUS_LABELS, projectStatusTone } from "./project-status";
import styles from "./projects-experience.module.css";

type ProjectFilter = "all" | "drafts" | "active" | "review" | "approved" | "failed";

const FILTERS: readonly { id: ProjectFilter; label: string }[] = [
  { id: "all", label: "All projects" },
  { id: "drafts", label: "Drafts" },
  { id: "active", label: "In production" },
  { id: "review", label: "For review" },
  { id: "approved", label: "Approved" },
  { id: "failed", label: "Needs attention" },
] as const;

const STATUS_ORDER: readonly MockProjectStatus[] = ["draft", "awaiting-payment", "queued", "processing", "completed", "approved", "failed"];

function matchesFilter(project: MockProject, filter: ProjectFilter) {
  if (filter === "all") return true;
  if (filter === "drafts") return project.status === "draft" || project.status === "awaiting-payment";
  if (filter === "active") return project.status === "queued" || project.status === "processing";
  if (filter === "review") return project.status === "completed";
  if (filter === "approved") return project.status === "approved" || project.status === "delivered";
  return project.status === "failed";
}

function projectHref(project: MockProject) {
  if (project.status === "draft" || project.status === "awaiting-payment") {
    return `/checkout?project=${encodeURIComponent(project.id)}`;
  }
  return `/projects/${encodeURIComponent(project.id)}`;
}

function actionLabel(status: MockProjectStatus) {
  if (status === "draft" || status === "awaiting-payment") return "Continue project";
  if (status === "queued" || status === "processing") return "View progress";
  if (status === "completed") return "Review result";
  if (status === "failed") return "Resolve generation";
  return "Open project";
}

function formatProjectDate(value: string) {
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(new Date(value));
}

export function ProjectsExperience() {
  const [projects, setProjects] = useState<MockProject[]>([]);
  const [filter, setFilter] = useState<ProjectFilter>("all");
  const [loading, setLoading] = useState(true);

  const refreshProjects = useCallback(() => {
    void mockProjectService.listProjects().then((items) => {
      setProjects([...items].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)));
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    refreshProjects();
    window.addEventListener(MOCK_PLATFORM_UPDATED_EVENT, refreshProjects);
    return () => window.removeEventListener(MOCK_PLATFORM_UPDATED_EVENT, refreshProjects);
  }, [refreshProjects]);

  const filteredProjects = useMemo(() => projects.filter((project) => matchesFilter(project, filter)), [filter, projects]);
  const statusCounts = useMemo(() => Object.fromEntries(STATUS_ORDER.map((status) => [status, projects.filter((project) => project.status === status).length])) as Record<MockProjectStatus, number>, [projects]);

  return (
    <div className={styles.page}>
      <AppHeader active="projects" />
      <main className={styles.main}>
        <header className={styles.pageHeader}>
          <div><p className={styles.eyebrow}>Campaign archive / Browser local</p><h1>My Projects</h1><p>Drafts, active generations and approved campaign work stay together in this local prototype.</p></div>
          <Link className={styles.primaryLink} href="/studio/basic">Start New Campaign <span aria-hidden="true">→</span></Link>
        </header>

        <section className={styles.statusOverview} aria-label="Project status overview">
          {STATUS_ORDER.map((status) => <div key={status}><StatusBadge tone={projectStatusTone(status)}>{PROJECT_STATUS_LABELS[status]}</StatusBadge><strong>{loading ? "—" : statusCounts[status]}</strong></div>)}
        </section>

        <section className={styles.projectSection} aria-labelledby="project-list-title">
          <div className={styles.toolbar}><div><p className={styles.eyebrow}>Local campaign projects</p><h2 id="project-list-title">Production desk</h2></div><span>{loading ? "Loading…" : `${filteredProjects.length} ${filteredProjects.length === 1 ? "project" : "projects"}`}</span></div>
          <div className={styles.tabsScroll}><Tabs items={FILTERS} activeId={filter} onSelect={(id) => setFilter(id as ProjectFilter)} label="Filter projects" /></div>

          <div role="tabpanel" aria-live="polite">
          {loading ? (
            <div className={styles.projectGrid} aria-label="Loading projects">{Array.from({ length: 6 }, (_, index) => <Skeleton className={styles.projectSkeleton} key={index} />)}</div>
          ) : filteredProjects.length ? (
            <div className={styles.projectGrid}>
              {filteredProjects.map((project, index) => {
                const model = STUDIO_MODEL_BY_ID[project.setup.modelId];
                return (
                  <article className={styles.projectCard} key={project.id}>
                    <Link className={styles.projectImage} href={projectHref(project)} aria-label={`Open ${project.name}`}>
                      <Image src={project.resultImagePath} fill loading={index === 0 ? "eager" : "lazy"} sizes="(max-width: 700px) 100vw, (max-width: 1100px) 50vw, 33vw" alt="" />
                      <span>Version {String(project.version).padStart(2, "0")}</span>
                    </Link>
                    <div className={styles.projectCopy}>
                      <div className={styles.cardTopline}><StatusBadge tone={projectStatusTone(project.status)}>{PROJECT_STATUS_LABELS[project.status]}</StatusBadge><span>{formatProjectDate(project.updatedAt)}</span></div>
                      <div><p>Basic Studio · {model.displayName}</p><h3><Link href={projectHref(project)}>{project.name}</Link></h3></div>
                      <div className={styles.cardFooter}><span>{project.creditsCost} credits</span><Link href={projectHref(project)}>{actionLabel(project.status)} <span aria-hidden="true">→</span></Link></div>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <EmptyState title="No projects in this view" description="Choose another status or start a new campaign in Basic Studio." action={<Link className={styles.inlineLink} href="/studio/basic">Start New Campaign</Link>} />
          )}
          </div>
        </section>
      </main>
    </div>
  );
}
