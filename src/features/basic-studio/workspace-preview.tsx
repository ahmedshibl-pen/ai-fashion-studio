"use client";

import Image from "next/image";
import { useState } from "react";

import { AppHeader } from "@/components/shell/app-header";
import { Button, StatusBadge, UploadSurface } from "@/components/ui";

import { getCameraPresetsForModel } from "./camera-presets";
import { getLightingPresetsForModel } from "./lighting-presets";
import { ModelSelectorOverlay } from "./model-selector-overlay";
import { STUDIO_MODEL_BY_ID, type StudioModelId } from "./model-catalog";
import { getPosePresetsForModel } from "./pose-presets";
import styles from "./workspace-preview.module.css";

type Preset = { id: string; label: string; description: string; thumbnailPath: string };

function PresetSection({ eyebrow, title, countLabel, presets }: { eyebrow: string; title: string; countLabel: string; presets: readonly Preset[] }) {
  return (
    <section className={styles.controlSection}>
      <header>
        <div><p>{eyebrow}</p><h2>{title}</h2></div>
        <span>{countLabel}</span>
      </header>
      <div className={styles.presetGrid}>
        {presets.slice(0, 4).map((preset, index) => (
          <button className={styles.presetCard} type="button" data-selected={index === 0} key={preset.id}>
            <span className={styles.presetImage}>
              <Image src={preset.thumbnailPath} fill sizes="(max-width: 700px) 44vw, 14vw" alt="" />
            </span>
            <span className={styles.presetCopy}><strong>{preset.label}</strong><small>{preset.description}</small></span>
            <span className={styles.check} aria-hidden="true">{index === 0 ? "✓" : ""}</span>
          </button>
        ))}
      </div>
    </section>
  );
}

export function WorkspacePreview({
  modelId: initialModelId,
  selectorOpen: initiallySelectorOpen,
}: {
  modelId: StudioModelId;
  selectorOpen: boolean;
}) {
  const [modelId, setModelId] = useState(initialModelId);
  const [selectorOpen, setSelectorOpen] = useState(initiallySelectorOpen);
  const model = STUDIO_MODEL_BY_ID[modelId];
  const lighting = getLightingPresetsForModel(modelId);
  const poses = getPosePresetsForModel(modelId);
  const cameras = getCameraPresetsForModel(modelId);

  const chooseModel = (nextModelId: StudioModelId) => {
    setModelId(nextModelId);
    setSelectorOpen(false);

    const params = new URLSearchParams(window.location.search);
    params.set("stage", "workspace");
    params.set("model", nextModelId);
    window.history.replaceState(null, "", `${window.location.pathname}?${params.toString()}`);
  };

  return (
    <div className={styles.page}>
      <AppHeader />
      <main
        className={styles.main}
        data-selector-open={selectorOpen}
        aria-hidden={selectorOpen}
        inert={selectorOpen}
      >
        <header className={styles.workspaceHeader}>
          <div>
            <p className={styles.eyebrow}>Basic Studio / Creative workspace</p>
            <h1>Build the campaign around the product.</h1>
            <p>Upload once, then direct lighting, pose and camera from the same page.</p>
          </div>
          <div className={styles.headerActions}>
            <StatusBadge tone="success">● Autosaved</StatusBadge>
            <button type="button" onClick={() => setSelectorOpen(true)}>Change model</button>
          </div>
        </header>

        <div className={styles.workspace}>
          <aside className={styles.modelPanel}>
            <div className={styles.modelStage}>
              <span className={styles.modelNumber} aria-hidden="true">01</span>
              <Image src={model.imagePath} width={896} height={1200} sizes="(max-width: 800px) 100vw, 30vw" alt={model.accessibilityLabel} priority />
            </div>
            <div className={styles.modelCopy}>
              <p>Selected model</p>
              <h2>{model.displayName}</h2>
              <span>{model.description}</span>
            </div>
          </aside>

          <div className={styles.controls}>
            <section className={styles.uploadSection}>
              <header><div><p>01 / Product</p><h2>Bring in the product</h2></div><span>LOCAL FILE</span></header>
              <UploadSurface id="workspace-upload" accept="image/png,image/jpeg,image/webp" label="Upload product image" hint="PNG, JPG or WEBP · local preview only" />
            </section>

            <PresetSection eyebrow="02 / Lighting" title="Shape the light" countLabel={`${lighting.length} PRESETS`} presets={lighting} />
            <PresetSection eyebrow="03 / Pose" title="Direct the body" countLabel={`${poses.length} PRESETS`} presets={poses} />
            <PresetSection eyebrow="04 / Camera" title="Frame the campaign" countLabel={`${cameras.length} PRESETS`} presets={cameras} />
            <footer className={styles.actions}>
              <Button variant="secondary">Save draft</Button>
              <Button>Review setup <span aria-hidden="true">→</span></Button>
            </footer>
          </div>
        </div>
      </main>
      {selectorOpen ? <ModelSelectorOverlay initialModelId={modelId} onChoose={chooseModel} /> : null}
    </div>
  );
}
