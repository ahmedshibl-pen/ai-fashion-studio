"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { AppHeader } from "@/components/shell/app-header";
import { Button, EmptyState, StatusBadge, StatusMessage } from "@/components/ui";
import { STUDIO_MODEL_BY_ID } from "@/features/basic-studio/model-catalog";
import {
  MockServiceError,
  mockBillingService,
  mockProjectService,
} from "@/lib/mock-platform";
import type { CreditPackage, MockOutcome, MockProject } from "@/types/mock-platform";
import type { PublicGenerationStatus } from "@/types/generation";

import styles from "./checkout-experience.module.css";

export function CheckoutExperience({ projectId, generationStatus }: { projectId: string; generationStatus: PublicGenerationStatus }) {
  const router = useRouter();
  const [project, setProject] = useState<MockProject | null>(null);
  const [balance, setBalance] = useState(0);
  const [packages, setPackages] = useState<readonly CreditPackage[]>([]);
  const [selectedPackage, setSelectedPackage] = useState<CreditPackage["id"] | "balance">("balance");
  const [outcome, setOutcome] = useState<MockOutcome>("success");
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const liveProviderName = "Replicate Nano Banana 2";
  const isLiveGeneration = generationStatus.mode !== "mock";

  useEffect(() => {
    let active = true;
    void Promise.all([
      mockProjectService.getProject(projectId),
      mockBillingService.getBalance(),
      mockBillingService.getPackages(),
    ]).then(([nextProject, nextBalance, nextPackages]) => {
      if (!active) return;
      setProject(nextProject);
      setBalance(nextBalance);
      setPackages(nextPackages);
      setLoading(false);
    });
    return () => { active = false; };
  }, [projectId]);

  const payAndGenerate = async () => {
    if (!project) return;
    setPaying(true);
    setError(null);
    try {
      const result = await mockBillingService.checkout(project.id, selectedPackage, outcome);
      setBalance(result.balance);
      router.push(`/projects/${encodeURIComponent(result.project.id)}?generate=1`);
    } catch (caught) {
      setError(caught instanceof MockServiceError ? caught.message : "The mocked checkout could not be completed.");
    } finally {
      setPaying(false);
    }
  };

  if (!loading && !project) {
    return (
      <div className={styles.page}>
        <AppHeader />
        <main className={styles.centered}>
          <EmptyState title="Campaign draft not found" description="Return to Basic Studio and save the setup again." action={<Link className={styles.inlineLink} href="/studio/basic">Return to Studio</Link>} />
        </main>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <AppHeader />
      <main className={styles.main}>
        <header className={styles.pageHeader}>
          <div><p className={styles.eyebrow}>Credit confirmation / {isLiveGeneration ? "Live generation" : "Mock generation"}</p><h1>Ready the campaign for production.</h1><p>Confirm how the prototype should allocate credits. No real payment is collected.</p></div>
          <Link href={`/studio/basic?stage=workspace&model=${project?.setup.modelId ?? "male-model-01"}`}>← Return to Studio</Link>
        </header>

        {loading ? <div className={styles.loadingCard}>Loading local campaign draft…</div> : null}

        {project ? (
          <div className={styles.checkoutGrid}>
            <section className={styles.summary} aria-labelledby="order-summary-title">
              <div className={styles.productPreview}>
                {/* The validated local data URL is intentionally not sent through image optimization. */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={project.product.previewDataUrl} alt={`Product preview for ${project.name}`} />
                <StatusBadge tone="success">Draft saved</StatusBadge>
              </div>
              <div className={styles.summaryCopy}>
                <p className={styles.eyebrow}>Saved project</p>
                <h2 id="order-summary-title">{project.name}</h2>
                <dl>
                  <div><dt>Studio</dt><dd>Basic Studio</dd></div>
                  <div><dt>Model</dt><dd>{STUDIO_MODEL_BY_ID[project.setup.modelId].displayName}</dd></div>
                  <div><dt>Version</dt><dd>01</dd></div>
                  <div><dt>Generation</dt><dd>{isLiveGeneration ? `Live ${liveProviderName} · 1K` : "Validated mock · 1K"}</dd></div>
                </dl>
                <div className={styles.costLine}><span>Campaign generation</span><strong>{project.creditsCost} credits</strong></div>
              </div>
            </section>

            <section className={styles.paymentPanel} aria-labelledby="credit-options-title">
              <header><p className={styles.eyebrow}>Credits</p><h2 id="credit-options-title">Choose a credit source</h2><span>Current balance: <strong>{balance} credits</strong></span></header>

              <div className={styles.packageList} role="radiogroup" aria-label="Credit source">
                <label className={styles.packageCard} data-selected={selectedPackage === "balance"}>
                  <input className="sr-only" type="radio" name="credit-package" value="balance" checked={selectedPackage === "balance"} onChange={() => setSelectedPackage("balance")} />
                  <div><strong>Use current balance</strong><span>{balance - project.creditsCost} credits remain</span></div><i aria-hidden="true">{selectedPackage === "balance" ? "✓" : ""}</i>
                </label>
                {packages.map((pack) => (
                  <label className={styles.packageCard} data-selected={selectedPackage === pack.id} key={pack.id}>
                    <input className="sr-only" type="radio" name="credit-package" value={pack.id} checked={selectedPackage === pack.id} onChange={() => setSelectedPackage(pack.id)} />
                    <div><strong>{pack.name}</strong><span>{pack.credits} credits · {pack.description}</span></div><b>{pack.price}</b><i aria-hidden="true">{selectedPackage === pack.id ? "✓" : ""}</i>
                  </label>
                ))}
              </div>

              {process.env.NODE_ENV === "development" ? (
                <fieldset className={styles.prototypeControls}>
                  <legend>Prototype payment outcome</legend>
                  <label><input type="radio" name="mock-outcome" checked={outcome === "success"} onChange={() => setOutcome("success")} /> Success</label>
                  <label><input type="radio" name="mock-outcome" checked={outcome === "failure"} onChange={() => setOutcome("failure")} /> Failure</label>
                </fieldset>
              ) : null}

              <div className={styles.secureArea}><span aria-hidden="true">◇</span><div><strong>{isLiveGeneration ? "Live provider confirmation" : "Secure mock generation"}</strong><p>{isLiveGeneration ? `One explicit 1K ${liveProviderName} request will be sent. Provider charges may apply; no automatic retry is used.` : "The complete server validation and provider flow runs with no external image request or provider charge."}</p></div></div>
              {!generationStatus.ready ? <StatusMessage tone="warning">Live image generation is not configured on the server yet. Add the API key to .env.local before continuing.</StatusMessage> : null}
              {error ? <StatusMessage tone="error">{error}</StatusMessage> : null}
              <Button className={styles.payButton} type="button" onClick={() => void payAndGenerate()} disabled={!generationStatus.ready || paying || (selectedPackage === "balance" && balance < project.creditsCost)}>{paying ? "Confirming…" : selectedPackage === "balance" ? "Use Credits & Generate" : "Pay & Generate"} <span aria-hidden="true">→</span></Button>
              <p className={styles.terms}>Your setup remains available if checkout or generation fails.</p>
            </section>
          </div>
        ) : null}
      </main>
    </div>
  );
}
