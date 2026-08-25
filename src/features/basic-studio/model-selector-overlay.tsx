"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type CSSProperties, type PointerEvent } from "react";

import { STUDIO_MODELS, type StudioModelId } from "./model-catalog";
import styles from "./model-selector-overlay.module.css";

const profiles = {
  "male-model-01": {
    eyebrow: "Editorial profile / 01",
    statement: "A grounded presence for precise, contemporary menswear stories.",
    details:
      "Relaxed posture, clean proportions and a quiet confidence that keeps the product at the center of the frame.",
    availability: "Ready for full studio direction",
    fit: "Menswear · Unisex · Product-led",
  },
  "female-model-01": {
    eyebrow: "Editorial profile / 02",
    statement: "A composed, sculptural presence with a calm editorial rhythm.",
    details:
      "A clean silhouette and understated expression designed for modern fashion campaigns and product-led compositions.",
    availability: "Ready for full studio direction",
    fit: "Womenswear · Unisex · Editorial",
  },
} as const;

type ModelSelectorOverlayProps = {
  initialModelId: StudioModelId;
  onChoose: (modelId: StudioModelId) => void;
};

export function ModelSelectorOverlay({ initialModelId, onChoose }: ModelSelectorOverlayProps) {
  const initialIndex = Math.max(
    0,
    STUDIO_MODELS.findIndex((model) => model.id === initialModelId),
  );
  const [activeIndex, setActiveIndex] = useState(initialIndex);
  const [dragOffset, setDragOffset] = useState(0);
  const [dragging, setDragging] = useState(false);
  const pointerStart = useRef<number | null>(null);
  const dialogRef = useRef<HTMLElement>(null);
  const activeModel = STUDIO_MODELS[activeIndex];
  const activeProfile = profiles[activeModel.id];

  const selectIndex = (index: number) => {
    setActiveIndex((index + STUDIO_MODELS.length) % STUDIO_MODELS.length);
    setDragOffset(0);
  };

  const finishDrag = (event: PointerEvent<HTMLDivElement>) => {
    if (pointerStart.current === null) return;
    const distance = event.clientX - pointerStart.current;
    pointerStart.current = null;
    setDragging(false);
    if (Math.abs(distance) > 54) selectIndex(activeIndex + (distance < 0 ? 1 : -1));
    else setDragOffset(0);
  };

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialogRef.current?.focus();
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  return (
    <section
      className={styles.selectorOverlay}
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="model-selector-title"
      tabIndex={-1}
      onKeyDown={(event) => {
        if (event.key === "ArrowLeft") selectIndex(activeIndex - 1);
        if (event.key === "ArrowRight") selectIndex(activeIndex + 1);
      }}
    >
      <div className={styles.description}>
        <p className={styles.eyebrow}>{activeProfile.eyebrow}</p>
        <p className={styles.status}><span aria-hidden="true" /> {activeProfile.availability}</p>
        <h1 id="model-selector-title">{activeModel.displayName}</h1>
        <p className={styles.statement}>{activeProfile.statement}</p>
        <p className={styles.details}>{activeProfile.details}</p>

        <dl>
          <div><dt>Studio</dt><dd>Basic Studio</dd></div>
          <div><dt>Best fit</dt><dd>{activeProfile.fit}</dd></div>
          <div><dt>Controls</dt><dd>Lighting · Pose · Camera</dd></div>
        </dl>

        <button className={styles.chooseAction} type="button" onClick={() => onChoose(activeModel.id)}>
          Choose {activeModel.name} <span aria-hidden="true">→</span>
        </button>
      </div>

      <div
        className={styles.viewport}
        data-dragging={dragging}
        style={{ "--drag-offset": `${dragOffset}px` } as CSSProperties}
        onPointerDown={(event) => {
          if ((event.target as HTMLElement).closest("button")) return;
          pointerStart.current = event.clientX;
          setDragging(true);
          event.currentTarget.setPointerCapture(event.pointerId);
        }}
        onPointerMove={(event) => {
          if (pointerStart.current !== null) setDragOffset(event.clientX - pointerStart.current);
        }}
        onPointerUp={finishDrag}
        onPointerCancel={finishDrag}
        aria-label="Model showroom. Use left and right arrow keys or swipe to browse."
      >
        <div className={styles.spotlight} aria-hidden="true" />

        <div className={styles.modelTrack} aria-live="polite">
          {STUDIO_MODELS.map((model, index) => {
            const position = index === activeIndex ? "active" : index < activeIndex ? "previous" : "next";
            return (
              <button
                className={styles.modelCard}
                type="button"
                data-position={position}
                aria-label={position === "active" ? `${model.displayName}, selected` : `Preview ${model.displayName}`}
                tabIndex={position === "active" ? -1 : 0}
                onClick={() => selectIndex(index)}
                key={model.id}
              >
                <Image
                  className={styles.modelImage}
                  src={model.imagePath}
                  width={1792}
                  height={2400}
                  sizes="(max-width: 700px) 72vw, 44vw"
                  alt={model.accessibilityLabel}
                  loading={index === initialIndex ? "eager" : "lazy"}
                />
                <span className={styles.modelLabel}>{model.displayName}</span>
              </button>
            );
          })}
        </div>

        <button
          className={`${styles.arrow} ${styles.previous}`}
          type="button"
          aria-label="Show previous model"
          onClick={() => selectIndex(activeIndex - 1)}
        >
          ←
        </button>
        <button
          className={`${styles.arrow} ${styles.next}`}
          type="button"
          aria-label="Show next model"
          onClick={() => selectIndex(activeIndex + 1)}
        >
          →
        </button>

        <footer className={styles.footer}>
          <p><span aria-hidden="true">↔</span> Swipe or use arrow keys</p>
          <span className={styles.liveIndex}>
            {String(activeIndex + 1).padStart(2, "0")} / {String(STUDIO_MODELS.length).padStart(2, "0")}
          </span>
          <div className={styles.pagination} role="radiogroup" aria-label="Choose model preview">
            {STUDIO_MODELS.map((model, index) => (
              <button
                type="button"
                role="radio"
                aria-checked={index === activeIndex}
                aria-label={`Show ${model.displayName}`}
                onClick={() => selectIndex(index)}
                key={model.id}
              >
                <span aria-hidden="true" />
              </button>
            ))}
          </div>
        </footer>
      </div>
    </section>
  );
}
