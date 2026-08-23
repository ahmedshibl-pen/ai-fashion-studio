"use client";

import Image from "next/image";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
} from "react";

import { AppHeader } from "@/components/shell/app-header";
import { Button, StatusBadge, StatusMessage } from "@/components/ui";

import {
  CAMERA_PRESET_BY_ID,
  getCameraPresetsForModel,
  type CameraPresetId,
} from "./camera-presets";
import {
  LIGHTING_PRESET_BY_ID,
  getLightingPresetsForModel,
  type LightingPresetId,
} from "./lighting-presets";
import { ModelSelectorOverlay } from "./model-selector-overlay";
import { STUDIO_MODEL_BY_ID, type StudioModelId } from "./model-catalog";
import {
  POSE_PRESET_BY_ID,
  getPosePresetsForModel,
  type PosePresetId,
} from "./pose-presets";
import {
  STUDIO_STEPS,
  WORKFLOW_STORAGE_KEY,
  createDefaultWorkflowSession,
  parseStoredWorkflowSession,
  readSessionStorage,
  writeSessionStorage,
  type ModelSetupSelection,
  type StudioStep,
  type StudioWorkflowSession,
} from "./studio-session";
import styles from "./workspace-preview.module.css";

const STEP_LABELS: Record<StudioStep, string> = {
  product: "Product",
  lighting: "Lighting",
  pose: "Pose",
  camera: "Camera",
  review: "Review",
};

const STEP_COPY: Record<StudioStep, { eyebrow: string; title: string; description: string }> = {
  product: {
    eyebrow: "01 / Product",
    title: "Bring in the product",
    description: "Use a clean product image. Nothing leaves your browser in this prototype.",
  },
  lighting: {
    eyebrow: "02 / Lighting",
    title: "Shape the light",
    description: "Choose a lighting direction crafted for the selected model.",
  },
  pose: {
    eyebrow: "03 / Pose",
    title: "Direct the body",
    description: "Choose the posture that shows the silhouette and garment most clearly.",
  },
  camera: {
    eyebrow: "04 / Camera",
    title: "Frame the campaign",
    description: "Move from product detail to wide editorial composition.",
  },
  review: {
    eyebrow: "05 / Review",
    title: "Review the creative setup",
    description: "Confirm every direction before the mocked campaign generation begins.",
  },
};

const ACCEPTED_TYPES = new Set(["image/png", "image/jpeg", "image/webp"]);
const MAX_PRODUCT_BYTES = 10 * 1024 * 1024;

type ProductFile = { fileName: string; sizeLabel: string; previewUrl: string };
type Preset = { id: string; label: string; description: string; thumbnailPath: string };

function formatBytes(bytes: number) {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function PresetGrid({
  name,
  presets,
  selectedId,
  onSelect,
}: {
  name: string;
  presets: readonly Preset[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  return (
    <div className={styles.presetGrid} role="radiogroup" aria-label={`Choose ${name}`}>
      {presets.map((preset) => {
        const selected = selectedId === preset.id;
        return (
          <button
            className={styles.presetCard}
            type="button"
            role="radio"
            aria-checked={selected}
            data-selected={selected}
            onClick={() => onSelect(preset.id)}
            key={preset.id}
          >
            <span className={styles.presetImage}>
              <Image src={preset.thumbnailPath} fill sizes="(max-width: 700px) 46vw, (max-width: 1180px) 22vw, 12vw" alt="" />
            </span>
            <span className={styles.presetCopy}>
              <strong>{preset.label}</strong>
              <small>{preset.description}</small>
            </span>
            <span className={styles.check} aria-hidden="true">{selected ? "✓" : ""}</span>
          </button>
        );
      })}
    </div>
  );
}

export function WorkspacePreview({
  modelId: initialModelId,
  selectorOpen: initiallySelectorOpen,
}: {
  modelId: StudioModelId;
  selectorOpen: boolean;
}) {
  const [workflow, setWorkflow] = useState<StudioWorkflowSession>(() => createDefaultWorkflowSession(initialModelId));
  const [selectorOpen, setSelectorOpen] = useState(initiallySelectorOpen);
  const [selectorReason, setSelectorReason] = useState<"entry" | "change">(initiallySelectorOpen ? "entry" : "change");
  const [product, setProduct] = useState<ProductFile | null>(null);
  const [productError, setProductError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [reviewMessage, setReviewMessage] = useState<string | null>(null);
  const productUrlRef = useRef<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const restored = parseStoredWorkflowSession(readSessionStorage(WORKFLOW_STORAGE_KEY), initialModelId);
    // Browser storage is intentionally restored only after hydration.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setWorkflow({ ...restored, modelId: initialModelId, activeStep: "product" });

    return () => {
      if (productUrlRef.current) URL.revokeObjectURL(productUrlRef.current);
    };
  }, [initialModelId]);

  const commitWorkflow = (
    updater: StudioWorkflowSession | ((current: StudioWorkflowSession) => StudioWorkflowSession),
  ) => {
    setWorkflow((current) => {
      const next = typeof updater === "function" ? updater(current) : updater;
      writeSessionStorage(WORKFLOW_STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  };

  const modelId = workflow.modelId;
  const model = STUDIO_MODEL_BY_ID[modelId];
  const setup = workflow.setups[modelId];
  const lighting = getLightingPresetsForModel(modelId);
  const poses = getPosePresetsForModel(modelId);
  const cameras = getCameraPresetsForModel(modelId);
  const currentStepIndex = STUDIO_STEPS.indexOf(workflow.activeStep);
  const selectedLighting = setup.lightingPresetId ? LIGHTING_PRESET_BY_ID[setup.lightingPresetId] : null;
  const selectedPose = setup.posePresetId ? POSE_PRESET_BY_ID[setup.posePresetId] : null;
  const selectedCamera = setup.cameraPresetId ? CAMERA_PRESET_BY_ID[setup.cameraPresetId] : null;

  const previewAsset = useMemo(() => {
    if (workflow.activeStep === "lighting" && selectedLighting) return selectedLighting;
    if (workflow.activeStep === "pose" && selectedPose) return selectedPose;
    if ((workflow.activeStep === "camera" || workflow.activeStep === "review") && selectedCamera) return selectedCamera;
    return null;
  }, [selectedCamera, selectedLighting, selectedPose, workflow.activeStep]);

  const chooseModel = (nextModelId: StudioModelId) => {
    const nextStep = selectorReason === "entry" ? "product" : workflow.activeStep;
    commitWorkflow((current) => ({ ...current, modelId: nextModelId, activeStep: nextStep }));
    setSelectorOpen(false);
    const params = new URLSearchParams(window.location.search);
    params.set("stage", "workspace");
    params.set("model", nextModelId);
    window.history.replaceState(null, "", `${window.location.pathname}?${params.toString()}`);
  };

  const openModelSelector = () => {
    setSelectorReason("change");
    setSelectorOpen(true);
  };

  const goToStep = (step: StudioStep) => {
    setReviewMessage(null);
    commitWorkflow((current) => ({ ...current, activeStep: step }));
  };

  const updateSetup = (patch: Partial<ModelSetupSelection>) => {
    commitWorkflow((current) => ({
      ...current,
      setups: {
        ...current.setups,
        [current.modelId]: { ...current.setups[current.modelId], ...patch },
      },
    }));
  };

  const acceptProductFile = (file: File | undefined) => {
    setDragging(false);
    setProductError(null);
    if (!file) return;
    if (!ACCEPTED_TYPES.has(file.type)) {
      setProductError("Choose a PNG, JPG or WEBP image.");
      return;
    }
    if (file.size > MAX_PRODUCT_BYTES) {
      setProductError("The product image must be 10 MB or smaller.");
      return;
    }
    if (productUrlRef.current) URL.revokeObjectURL(productUrlRef.current);
    const previewUrl = URL.createObjectURL(file);
    productUrlRef.current = previewUrl;
    setProduct({ fileName: file.name, sizeLabel: formatBytes(file.size), previewUrl });
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    acceptProductFile(event.target.files?.[0]);
    event.target.value = "";
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    acceptProductFile(event.dataTransfer.files?.[0]);
  };

  const removeProduct = () => {
    if (productUrlRef.current) {
      URL.revokeObjectURL(productUrlRef.current);
      productUrlRef.current = null;
    }
    setProduct(null);
    setProductError(null);
  };

  const canContinue = (() => {
    if (workflow.activeStep === "product") return product !== null;
    if (workflow.activeStep === "lighting") return setup.lightingPresetId !== null;
    if (workflow.activeStep === "pose") return setup.posePresetId !== null;
    if (workflow.activeStep === "camera") return setup.cameraPresetId !== null;
    return product !== null && setup.lightingPresetId !== null && setup.posePresetId !== null && setup.cameraPresetId !== null;
  })();

  const continueWorkflow = () => {
    if (!canContinue || workflow.activeStep === "review") return;
    const nextStep = STUDIO_STEPS[currentStepIndex + 1];
    if (nextStep) goToStep(nextStep);
  };

  const previousStep = () => {
    const previous = STUDIO_STEPS[currentStepIndex - 1];
    if (previous) goToStep(previous);
  };

  const setupItems = [
    { label: "Product", value: product?.fileName ?? "Not uploaded" },
    { label: "Model", value: model.displayName },
    { label: "Lighting", value: selectedLighting?.label ?? "Not selected" },
    { label: "Pose", value: selectedPose?.label ?? "Not selected" },
    { label: "Camera", value: selectedCamera?.label ?? "Not selected" },
  ];

  const renderStep = () => {
    if (workflow.activeStep === "product") {
      return (
        <div className={styles.productStep}>
          {product ? (
            <div className={styles.productCard}>
              <div className={styles.productImage}>
                {/* Object URLs are local-only and cannot use Next image optimization. */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={product.previewUrl} alt={`Uploaded product: ${product.fileName}`} />
              </div>
              <div className={styles.productMeta}>
                <div><strong>{product.fileName}</strong><span>{product.sizeLabel} · Ready</span></div>
                <div className={styles.productActions}>
                  <button className={styles.replaceProduct} type="button" onClick={() => fileInputRef.current?.click()}>
                    Replace image
                  </button>
                  <button className={styles.removeProduct} type="button" onClick={removeProduct}>
                    Remove image
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div
              className={styles.dropZone}
              data-dragging={dragging}
              onDragEnter={(event) => { event.preventDefault(); setDragging(true); }}
              onDragOver={(event) => event.preventDefault()}
              onDragLeave={(event) => {
                if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setDragging(false);
              }}
              onDrop={handleDrop}
            >
              <span className={styles.uploadGlyph} aria-hidden="true">↑</span>
              <strong>Drop the product image here</strong>
              <span>or choose a local file</span>
              <Button type="button" variant="secondary" onClick={() => fileInputRef.current?.click()}>Browse files</Button>
              <small>PNG, JPG or WEBP · maximum 10 MB</small>
            </div>
          )}
          <input className="sr-only" ref={fileInputRef} type="file" accept="image/png,image/jpeg,image/webp" onChange={handleFileChange} aria-label="Choose product image" />
          {productError ? <StatusMessage tone="error">{productError}</StatusMessage> : null}
          <div className={styles.privacyNote}><span aria-hidden="true">◎</span><p><strong>Local preview only</strong>Your file is not uploaded to a server during this prototype.</p></div>
        </div>
      );
    }

    if (workflow.activeStep === "lighting") {
      return <PresetGrid name="lighting" presets={lighting} selectedId={setup.lightingPresetId} onSelect={(id) => updateSetup({ lightingPresetId: id as LightingPresetId })} />;
    }
    if (workflow.activeStep === "pose") {
      return <PresetGrid name="pose" presets={poses} selectedId={setup.posePresetId} onSelect={(id) => updateSetup({ posePresetId: id as PosePresetId })} />;
    }
    if (workflow.activeStep === "camera") {
      return <PresetGrid name="camera" presets={cameras} selectedId={setup.cameraPresetId} onSelect={(id) => updateSetup({ cameraPresetId: id as CameraPresetId })} />;
    }

    return (
      <div className={styles.reviewGrid}>
        {setupItems.map((item, index) => (
          <article className={styles.reviewItem} key={item.label}>
            <span>{String(index + 1).padStart(2, "0")}</span>
            <div><p>{item.label}</p><strong>{item.value}</strong></div>
            <button
              type="button"
              onClick={() => {
                if (item.label === "Model") {
                  openModelSelector();
                  return;
                }

                const editStep = {
                  Product: "product",
                  Lighting: "lighting",
                  Pose: "pose",
                  Camera: "camera",
                }[item.label] as StudioStep | undefined;
                if (editStep) goToStep(editStep);
              }}
            >Edit</button>
          </article>
        ))}
        <div className={styles.reviewTotals}>
          <div><span>Estimated generation</span><strong>About 45 sec</strong></div>
          <div><span>Campaign cost</span><strong>40 credits</strong></div>
          <div><span>Balance after</span><strong>200 credits</strong></div>
        </div>
        {reviewMessage ? <StatusMessage tone="success">{reviewMessage}</StatusMessage> : null}
      </div>
    );
  };

  return (
    <div className={styles.page}>
      <AppHeader />
      <main className={styles.main} data-selector-open={selectorOpen} aria-hidden={selectorOpen} inert={selectorOpen}>
        <header className={styles.workspaceHeader}>
          <div><p className={styles.eyebrow}>Basic Studio / Creative workspace</p><h1>Build the campaign.</h1></div>
          <div className={styles.headerActions}>
            <StatusBadge tone="success">● Autosaved</StatusBadge>
            <button type="button" onClick={openModelSelector}>Change model</button>
          </div>
        </header>

        <nav className={styles.stepperWrap} aria-label="Studio progress">
          <ol className={styles.stepper}>
            {STUDIO_STEPS.map((step, index) => (
              <li key={step} data-current={step === workflow.activeStep} data-complete={index < currentStepIndex}>
                <button type="button" onClick={() => goToStep(step)} aria-current={step === workflow.activeStep ? "step" : undefined}>
                  <span aria-hidden="true">{index < currentStepIndex ? "✓" : String(index + 1).padStart(2, "0")}</span>{STEP_LABELS[step]}
                </button>
              </li>
            ))}
          </ol>
        </nav>

        <div className={styles.workspace}>
          <aside className={styles.previewPanel}>
            <div className={styles.previewStage} data-has-scene={Boolean(previewAsset)}>
              {previewAsset ? (
                <Image src={previewAsset.imagePath} fill sizes="(max-width: 900px) 100vw, 58vw" alt={previewAsset.accessibilityLabel} priority />
              ) : (
                <Image className={styles.modelImage} src={model.imagePath} width={896} height={1200} sizes="(max-width: 900px) 70vw, 34vw" alt={model.accessibilityLabel} priority />
              )}
              {product ? (
                <div className={styles.productInset}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={product.previewUrl} alt="" /><span>Product</span>
                </div>
              ) : null}
            </div>
          </aside>

          <section className={styles.controls} aria-labelledby="step-title">
            <header className={styles.controlHeader}>
              <div><p className={styles.eyebrow}>{STEP_COPY[workflow.activeStep].eyebrow}</p><h2 id="step-title">{STEP_COPY[workflow.activeStep].title}</h2><span>{STEP_COPY[workflow.activeStep].description}</span></div>
              {workflow.activeStep === "lighting" ? <strong>{lighting.length} presets</strong> : null}
              {workflow.activeStep === "pose" ? <strong>{poses.length} presets</strong> : null}
              {workflow.activeStep === "camera" ? <strong>{cameras.length} presets</strong> : null}
            </header>
            <div className={styles.controlBody}>{renderStep()}</div>
            <footer className={styles.actions}>
              <Button type="button" variant="secondary" onClick={previousStep} disabled={currentStepIndex === 0}>Previous</Button>
              {workflow.activeStep === "review" ? (
                <Button type="button" disabled={!canContinue} onClick={() => setReviewMessage("Creative setup saved. Mock generation is connected in Checkpoint 4.")}>Generate Campaign <span aria-hidden="true">→</span></Button>
              ) : (
                <Button type="button" disabled={!canContinue} onClick={continueWorkflow}>Continue <span aria-hidden="true">→</span></Button>
              )}
            </footer>
          </section>
        </div>
      </main>
      {selectorOpen ? <ModelSelectorOverlay initialModelId={modelId} onChoose={chooseModel} /> : null}
    </div>
  );
}
