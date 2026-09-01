"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

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
import type { GenerationApiResponse, PublicGenerationStatus } from "@/types/generation";

import { GENERATION_PROGRESS_STEPS, getGenerationClientState } from "./generation-client-state";

import styles from "./project-experience.module.css";

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

async function productDataUrlToFile(project: MockProject) {
  const response = await fetch(project.product.previewDataUrl);
  const blob = await response.blob();
  const extensionByMimeType: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
  };
  const extension = extensionByMimeType[blob.type] ?? "img";
  const baseName = project.product.fileName.replace(/\.[^.]+$/, "") || "product-image";
  return new File([blob], `${baseName}.${extension}`, { type: blob.type });
}

export function ProjectExperience({
  projectId,
  autoGenerate,
  generationStatus,
}: {
  projectId: string;
  autoGenerate: boolean;
  generationStatus: PublicGenerationStatus;
}) {
  const router = useRouter();
  const [project, setProject] = useState<MockProject | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [approvalOpen, setApprovalOpen] = useState(false);
  const [approving, setApproving] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [downloads, setDownloads] = useState<readonly { label: string; fileName: string; href: string }[]>([]);
  const generationInFlight = useRef(false);
  const autoGenerationStarted = useRef(false);
  const liveProviderName = "Replicate Nano Banana 2";

  const executeGeneration = useCallback(async (sourceProject: MockProject) => {
    if (generationInFlight.current) return;
    generationInFlight.current = true;
    setError(null);
    setNotice(null);
    window.history.replaceState(null, "", window.location.pathname);

    let stageTimer: number | undefined;
    try {
      const processing = await mockProjectService.updateProject(sourceProject.id, {
        status: "processing",
        generationStage: 0,
        generationAttempted: true,
        generationError: undefined,
      });
      setProject(processing);
      stageTimer = window.setInterval(() => {
        setProject((current) => current && current.id === sourceProject.id
          ? { ...current, generationStage: Math.min(3, current.generationStage + 1) }
          : current);
      }, 1600);

      const requestId = typeof crypto !== "undefined" && "randomUUID" in crypto
        ? `request-${crypto.randomUUID()}`
        : `request-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
      const body = new FormData();
      body.set("metadata", JSON.stringify({
        requestId,
        projectId: sourceProject.id,
        explicitUserAction: true,
        selection: sourceProject.setup,
        productSpecification: sourceProject.productSpecification,
      }));
      body.set("productImage", await productDataUrlToFile(sourceProject));

      const response = await fetch("/api/generation", { method: "POST", body });
      const payload = await response.json() as GenerationApiResponse;
      if (!payload.ok) {
        const failure = Object.assign(new Error(payload.error.message), { generationError: payload.error });
        throw failure;
      }

      const completed = await mockProjectService.updateProject(sourceProject.id, {
        status: "completed",
        generationStage: 4,
        resultImagePath: payload.result.imageDataUrl,
        generationResult: {
          provider: payload.result.provider,
          model: payload.result.model,
          ...payload.result.metadata,
        },
        generationError: undefined,
      });
      setProject(completed);
    } catch (caught) {
      const failure = caught as Error & { generationError?: { code: string; message: string; retryable: boolean } };
      const generationError = failure.generationError ?? {
        code: "client-error",
        message: "The generation request could not be completed.",
        retryable: true,
      };
      setError(generationError.message);
      try {
        setProject(await mockProjectService.updateProject(sourceProject.id, {
          status: "failed",
          generationAttempted: true,
          generationError,
        }));
      } catch {
        setProject((current) => current ? { ...current, status: "failed", generationError } : current);
      }
    } finally {
      if (stageTimer !== undefined) window.clearInterval(stageTimer);
      generationInFlight.current = false;
    }
  }, []);

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
    if (!autoGenerate || autoGenerationStarted.current || !project || project.status !== "queued") return;
    autoGenerationStarted.current = true;
    void executeGeneration(project);
  }, [autoGenerate, executeGeneration, project]);

  useEffect(() => {
    if (!project || project.generationAttempted || autoGenerate || (project.status !== "queued" && project.status !== "processing")) return;
    const timer = window.setTimeout(() => {
      const nextStatus: GenerationRuntimeStatus = project.status === "queued"
        ? "processing"
        : project.generationStage >= GENERATION_PROGRESS_STEPS.length - 1
          ? "completed"
          : "processing";
      const nextStage = project.status === "queued" ? 0 : project.generationStage + 1;
      void mockGenerationService.setStatus(project.id, nextStatus, nextStage).then(setProject);
    }, project.status === "queued" ? 900 : 1200);
    return () => window.clearTimeout(timer);
  }, [autoGenerate, project]);

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
      const restarted = await mockGenerationService.regenerate(project.id, project.adjustmentNote);
      setProject(restarted);
      if (project.generationAttempted) await executeGeneration(restarted);
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
    writeSessionStorage(WORKFLOW_STORAGE_KEY, JSON.stringify({ modelId: project.setup.modelId, activeStep: "review", setups, product: project.product, productSpecification: project.productSpecification }));
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
  const generationState = getGenerationClientState(project.status, project.generationStage);
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
              <Image src={project.resultImagePath} fill unoptimized={project.resultImagePath.startsWith("data:")} sizes="(max-width: 900px) 100vw, 62vw" alt="Campaign preview being generated" loading="eager" />
              <div className={styles.processingVeil} data-phase={generationState.phase}><span className={styles.processingMark} aria-hidden="true">A</span><p>{generationState.label}</p></div>
            </section>
            <section className={styles.progressPanel} aria-live="polite">
              <p className={styles.eyebrow}>Generation in progress</p>
              <h2>Directing the campaign.</h2>
              <p>{generationStatus.mode !== "mock" ? `One server-only ${liveProviderName} request is running with automatic retries disabled.` : "The complete validated server flow is running against the mock provider with no external charge."}</p>
              <Progress value={generationState.percent} label={generationState.label} />
              <ol className={styles.stageList}>
                {GENERATION_PROGRESS_STEPS.map((step, index) => <li data-active={index === generationState.stepIndex} data-complete={index < generationState.stepIndex} key={step.label}><span>{index < generationState.stepIndex ? "✓" : String(index + 1).padStart(2, "0")}</span>{step.label}</li>)}
              </ol>
            </section>
          </div>
        ) : null}

        {project.status === "failed" ? (
          <section className={styles.failurePanel}>
            <p className={styles.eyebrow}>Generation interrupted</p><h2>The campaign preview could not be completed.</h2><p>Your product, credits and complete setup are still preserved in this local project.</p>
            {error || project.generationError ? <StatusMessage tone="error">{error ?? project.generationError?.message}</StatusMessage> : null}
            <div><Button type="button" onClick={() => void retryGeneration()}>Retry generation</Button><Button type="button" variant="secondary" onClick={adjustSetup}>Adjust setup</Button></div>
          </section>
        ) : null}

        {(project.status === "draft" || project.status === "awaiting-payment") ? (
          <section className={styles.failurePanel}><p className={styles.eyebrow}>Draft campaign</p><h2>Credit confirmation is still required.</h2><Button type="button" onClick={() => router.push(`/checkout?project=${encodeURIComponent(project.id)}`)}>Continue to checkout</Button></section>
        ) : null}

        {project.status === "completed" || project.status === "approved" ? (
          <div className={styles.resultLayout}>
            <section className={styles.resultPreview}>
              <Image src={project.resultImagePath} fill unoptimized={project.resultImagePath.startsWith("data:")} sizes="(max-width: 900px) 100vw, 64vw" alt={`Generated campaign result, version ${project.version}`} loading="eager" />
              <span>Version {String(project.version).padStart(2, "0")}</span>
            </section>
            <aside className={styles.reviewPanel}>
              <p className={styles.eyebrow}>Campaign result</p><h2>Review the direction.</h2><p>{project.generationResult?.provider === "replicate" ? "This image was generated by Nano Banana 2 through the server-only Replicate provider route." : "This image completed the same validated server flow using the no-charge mock provider."}</p>
              <div className={styles.originalProduct}><Image src={project.product.previewDataUrl} width={72} height={72} unoptimized alt={`Original product: ${project.product.fileName}`} /><div><span>Original product</span><strong>{project.product.fileName}</strong></div></div>
              <dl className={styles.setupList}>
                <div><dt>Model</dt><dd>{model.displayName}</dd></div><div><dt>Lighting</dt><dd>{lighting.label}</dd></div><div><dt>Pose</dt><dd>{pose.label}</dd></div><div><dt>Camera</dt><dd>{camera.label}</dd></div><div><dt>Fit</dt><dd>{project.productSpecification.intendedFit}</dd></div>
                {project.generationResult ? <><div><dt>Provider</dt><dd>{project.generationResult.provider}</dd></div><div><dt>Latency</dt><dd>{(project.generationResult.durationMs / 1000).toFixed(1)} sec</dd></div>{project.generationResult.providerMetrics?.predictTimeSeconds ? <div><dt>Provider time</dt><dd>{project.generationResult.providerMetrics.predictTimeSeconds.toFixed(1)} sec</dd></div> : null}</> : null}
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
            <section className={styles.deliveryPreview}><Image src={project.resultImagePath} fill unoptimized={project.resultImagePath.startsWith("data:")} sizes="(max-width: 900px) 100vw, 62vw" alt="Approved campaign image ready for download" loading="eager" /><span>Approved</span></section>
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
