"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { AppHeader } from "@/components/shell/app-header";
import { Button, Dialog, EmptyState, Progress, StatusBadge, StatusMessage } from "@/components/ui";
import { CAMERA_PRESET_BY_ID } from "@/features/basic-studio/camera-presets";
import { LIGHTING_PRESET_BY_ID } from "@/features/basic-studio/lighting-presets";
import { STUDIO_MODEL_BY_ID } from "@/features/basic-studio/model-catalog";
import { POSE_PRESET_BY_ID } from "@/features/basic-studio/pose-presets";
import {
  WORKFLOW_STORAGE_KEY,
  createDefaultModelSetups,
  writeSessionStorage,
} from "@/features/basic-studio/studio-session";
import {
  MockServiceError,
  mockDeliveryService,
  mockGenerationService,
  mockProjectService,
} from "@/lib/mock-platform";
import type { GenerationRuntimeStatus, MockProject } from "@/types/mock-platform";

import styles from "./project-experience.module.css";

const GENERATION_STAGES = [
  "Preparing product",
  "Applying creative direction",
  "Generating campaign",
  "Refining result",
  "Preparing preview",
] as const;

const STATUS_LABELS = {
  draft: "Draft",
  "awaiting-payment": "Awaiting payment",
  queued: "Queued",
  processing: "Processing",
  completed: "Ready for review",
  failed: "Failed",
  approved: "Approved",
  delivered: "Files ready",
} as const;

function statusTone(status: MockProject["status"]): "neutral" | "success" | "warning" | "error" | "information" {
  if (status === "failed") return "error";
  if (status === "completed" || status === "approved" || status === "delivered") return "success";
  if (status === "awaiting-payment") return "warning";
  if (status === "queued" || status === "processing") return "information";
  return "neutral";
}

export function ProjectExperience({ projectId }: { projectId: string }) {
  const router = useRouter();
  const [project, setProject] = useState<MockProject | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [approvalOpen, setApprovalOpen] = useState(false);
  const [approving, setApproving] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [downloads, setDownloads] = useState<readonly { label: string; fileName: string; href: string }[]>([]);

  useEffect(() => {
    let active = true;
    void mockProjectService.getProject(projectId).then((nextProject) => {
      if (!active) return;
      setProject(nextProject);
      setLoading(false);
    });
    return () => { active = false; };
  }, [projectId]);

  useEffect(() => {
    if (!project || (project.status !== "queued" && project.status !== "processing")) return;
    const timer = window.setTimeout(() => {
      const nextStatus: GenerationRuntimeStatus = project.status === "queued"
        ? "processing"
        : project.generationStage >= GENERATION_STAGES.length - 1
          ? "completed"
          : "processing";
      const nextStage = project.status === "queued" ? 0 : project.generationStage + 1;
      void mockGenerationService.setStatus(project.id, nextStatus, nextStage).then(setProject);
    }, project.status === "queued" ? 900 : 1200);
    return () => window.clearTimeout(timer);
  }, [project]);

  useEffect(() => {
    if (!project || project.status !== "delivered") return;
    let active = true;
    void mockDeliveryService.getDownloads(project.id).then((items) => {
      if (active) setDownloads(items);
    });
    return () => { active = false; };
  }, [project]);

  const setMockStatus = async (status: GenerationRuntimeStatus) => {
    if (!project) return;
    const updated = await mockGenerationService.setStatus(project.id, status, status === "processing" ? 2 : 0);
    setProject(updated);
  };

  const retryGeneration = async () => {
    if (!project) return;
    setError(null);
    try {
      setProject(await mockGenerationService.regenerate(project.id, project.adjustmentNote));
    } catch (caught) {
      setError(caught instanceof MockServiceError ? caught.message : "The generation could not be restarted.");
    }
  };

  const adjustSetup = () => {
    if (!project) return;
    const setups = createDefaultModelSetups();
    setups[project.setup.modelId] = {
      lightingPresetId: project.setup.lightingPresetId,
      posePresetId: project.setup.posePresetId,
      cameraPresetId: project.setup.cameraPresetId,
    };
    writeSessionStorage(WORKFLOW_STORAGE_KEY, JSON.stringify({ modelId: project.setup.modelId, activeStep: "review", setups, product: project.product }));
    router.push(`/studio/basic?stage=workspace&model=${project.setup.modelId}&step=review&project=${encodeURIComponent(project.id)}`);
  };

  const approveAndPrepare = async () => {
    if (!project) return;
    setApproving(true);
    setError(null);
    try {
      await mockDeliveryService.approve(project.id);
      const delivered = await mockDeliveryService.prepareDelivery(project.id);
      setProject(delivered);
      setDownloads(await mockDeliveryService.getDownloads(project.id));
      setApprovalOpen(false);
    } catch (caught) {
      setError(caught instanceof MockServiceError ? caught.message : "The files could not be prepared.");
    } finally {
      setApproving(false);
    }
  };

  const duplicateProject = async () => {
    if (!project) return;
    const duplicate = await mockProjectService.duplicateProject(project.id);
    const readyDuplicate = await mockProjectService.updateProject(duplicate.id, { status: "completed" });
    router.push(`/projects/${encodeURIComponent(readyDuplicate.id)}`);
  };

  if (!loading && !project) {
    return (
      <div className={styles.page}>
        <AppHeader />
        <main className={styles.centered}>
          <EmptyState title="Project not found" description="This local project may have been removed or belongs to another browser session." action={<Link className={styles.linkButton} href="/studio/basic">Start a Campaign</Link>} />
        </main>
      </div>
    );
  }

  if (!project) {
    return <div className={styles.page}><AppHeader /><main className={styles.centered}>Loading project…</main></div>;
  }

  const isGenerating = project.status === "queued" || project.status === "processing";
  const generationPercent = project.status === "queued" ? 6 : Math.min(96, 18 + project.generationStage * 19);
  const model = STUDIO_MODEL_BY_ID[project.setup.modelId];
  const lighting = LIGHTING_PRESET_BY_ID[project.setup.lightingPresetId];
  const pose = POSE_PRESET_BY_ID[project.setup.posePresetId];
  const camera = CAMERA_PRESET_BY_ID[project.setup.cameraPresetId];

  return (
    <div className={styles.page}>
      <AppHeader active="projects" />
      <main className={styles.main}>
        <header className={styles.projectHeader}>
          <div><p className={styles.eyebrow}>Basic Studio / {project.id}</p><h1>{project.name}</h1></div>
          <div className={styles.projectMeta}><StatusBadge tone={statusTone(project.status)}>{STATUS_LABELS[project.status]}</StatusBadge><span>Version {String(project.version).padStart(2, "0")}</span></div>
        </header>

        {process.env.NODE_ENV === "development" ? (
          <section className={styles.devControls} aria-label="Development status controls">
            <span>Development status</span>
            {(["queued", "processing", "completed", "failed"] as const).map((status) => <button type="button" onClick={() => void setMockStatus(status)} key={status}>{status}</button>)}
          </section>
        ) : null}

        {isGenerating ? (
          <div className={styles.generationLayout}>
            <section className={styles.generationPreview} aria-label="Generation preview">
              <Image src={project.resultImagePath} fill sizes="(max-width: 900px) 100vw, 62vw" alt="Campaign preview being generated" priority />
              <div className={styles.processingVeil}><span className={styles.processingMark} aria-hidden="true">A</span><p>{project.status === "queued" ? "Campaign queued" : GENERATION_STAGES[project.generationStage]}</p></div>
            </section>
            <section className={styles.progressPanel} aria-live="polite">
              <p className={styles.eyebrow}>Generation in progress</p>
              <h2>Directing the campaign.</h2>
              <p>You can keep this page open while the local prototype advances through each production stage.</p>
              <Progress value={generationPercent} label={project.status === "queued" ? "Waiting for studio" : GENERATION_STAGES[project.generationStage]} />
              <ol className={styles.stageList}>
                {GENERATION_STAGES.map((stage, index) => <li data-active={project.status === "processing" && index === project.generationStage} data-complete={project.status === "processing" && index < project.generationStage} key={stage}><span>{index < project.generationStage ? "✓" : String(index + 1).padStart(2, "0")}</span>{stage}</li>)}
              </ol>
            </section>
          </div>
        ) : null}

        {project.status === "failed" ? (
          <section className={styles.failurePanel}>
            <p className={styles.eyebrow}>Generation interrupted</p><h2>The campaign preview could not be completed.</h2><p>Your product, credits and complete setup are still preserved in this local project.</p>
            {error ? <StatusMessage tone="error">{error}</StatusMessage> : null}
            <div><Button type="button" onClick={() => void retryGeneration()}>Retry generation</Button><Button type="button" variant="secondary" onClick={adjustSetup}>Adjust setup</Button></div>
          </section>
        ) : null}

        {(project.status === "draft" || project.status === "awaiting-payment") ? (
          <section className={styles.failurePanel}><p className={styles.eyebrow}>Draft campaign</p><h2>Credit confirmation is still required.</h2><Button type="button" onClick={() => router.push(`/checkout?project=${encodeURIComponent(project.id)}`)}>Continue to checkout</Button></section>
        ) : null}

        {project.status === "completed" || project.status === "approved" ? (
          <div className={styles.resultLayout}>
            <section className={styles.resultPreview}>
              <Image src={project.resultImagePath} fill sizes="(max-width: 900px) 100vw, 64vw" alt={`Generated campaign result, version ${project.version}`} priority />
              <span>Version {String(project.version).padStart(2, "0")}</span>
            </section>
            <aside className={styles.reviewPanel}>
              <p className={styles.eyebrow}>Campaign result</p><h2>Review the direction.</h2><p>The result is a local preset preview representing the completed mocked generation.</p>
              <div className={styles.originalProduct}><Image src={project.product.previewDataUrl} width={72} height={72} unoptimized alt={`Original product: ${project.product.fileName}`} /><div><span>Original product</span><strong>{project.product.fileName}</strong></div></div>
              <dl className={styles.setupList}>
                <div><dt>Model</dt><dd>{model.displayName}</dd></div><div><dt>Lighting</dt><dd>{lighting.label}</dd></div><div><dt>Pose</dt><dd>{pose.label}</dd></div><div><dt>Camera</dt><dd>{camera.label}</dd></div>
              </dl>
              {notice ? <StatusMessage tone="information">{notice}</StatusMessage> : null}
              {error ? <StatusMessage tone="error">{error}</StatusMessage> : null}
              <div className={styles.primaryActions}><Button type="button" onClick={() => setApprovalOpen(true)}>Approve & Prepare Files</Button><Button type="button" variant="secondary" onClick={() => void retryGeneration()}>Regenerate</Button></div>
              <div className={styles.secondaryActions}><button type="button" onClick={adjustSetup}>Adjust Setup</button><button type="button" onClick={() => setNotice("Issue recorded locally for this prototype. No data was sent.")}>Report Issue</button></div>
            </aside>
          </div>
        ) : null}

        {project.status === "delivered" ? (
          <div className={styles.deliveryLayout}>
            <section className={styles.deliveryPreview}><Image src={project.resultImagePath} fill sizes="(max-width: 900px) 100vw, 62vw" alt="Approved campaign image ready for download" priority /><span>Approved</span></section>
            <aside className={styles.deliveryPanel}><StatusBadge tone="success">Files ready</StatusBadge><h2>Campaign delivery is ready.</h2><p>The local test assets are prepared in web-compatible formats. Downloads stay in this tab.</p>
              <div className={styles.downloads}>{downloads.map((download) => <a href={download.href} download={download.fileName} key={download.label}>{download.label}<span aria-hidden="true">↓</span></a>)}</div>
              <dl className={styles.deliveryDetails}><div><dt>Project</dt><dd>{project.id}</dd></div><div><dt>Version</dt><dd>{project.version}</dd></div><div><dt>Approved</dt><dd>{project.approvedAt ? new Date(project.approvedAt).toLocaleDateString() : "Today"}</dd></div></dl>
              <div className={styles.deliveryActions}><Button type="button" onClick={() => void retryGeneration()}>Create Variation</Button><Button type="button" variant="secondary" onClick={() => void duplicateProject()}>Duplicate Project</Button><Link href="/studio/basic">Start New Campaign</Link></div>
            </aside>
          </div>
        ) : null}
      </main>

      <Dialog open={approvalOpen} onClose={() => setApprovalOpen(false)} title="Approve this campaign?" description="Approval locks this mocked version and prepares local download files." footer={<><Button type="button" variant="secondary" onClick={() => setApprovalOpen(false)}>Keep reviewing</Button><Button type="button" onClick={() => void approveAndPrepare()} disabled={approving}>{approving ? "Preparing files…" : "Approve & Prepare"}</Button></>}>
        <div className={styles.approvalSummary}><span>Version {String(project.version).padStart(2, "0")}</span><strong>{project.name}</strong><p>This action is reversible in the prototype by creating a new variation.</p></div>
      </Dialog>
    </div>
  );
}
