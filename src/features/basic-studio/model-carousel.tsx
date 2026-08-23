"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState, type PointerEvent } from "react";

import { STUDIO_MODELS } from "./model-catalog";
import styles from "./model-carousel.module.css";

const profiles = {
  "male-model-01": {
    eyebrow: "Editorial profile / 01",
    statement: "A grounded presence for precise, contemporary menswear stories.",
    details: "Relaxed posture, clean proportions and a quiet confidence that keeps the product at the center of the frame.",
    availability: "Full studio direction available",
  },
  "female-model-01": {
    eyebrow: "Editorial profile / 02",
    statement: "A composed, sculptural presence with a calm editorial rhythm.",
    details: "A clean silhouette and understated expression designed for modern fashion campaigns and product-led compositions.",
    availability: "Studio options are being prepared",
  },
} as const;

export function ModelCarousel() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);
  const [dragging, setDragging] = useState(false);
  const pointerStart = useRef<number | null>(null);

  const selectIndex = (index: number) => {
    setActiveIndex((index + STUDIO_MODELS.length) % STUDIO_MODELS.length);
    setDragOffset(0);
  };

  const finishDrag = (event: PointerEvent<HTMLDivElement>) => {
    if (pointerStart.current === null) return;
    const distance = event.clientX - pointerStart.current;
    pointerStart.current = null;
    setDragging(false);
    if (Math.abs(distance) > 58) selectIndex(activeIndex + (distance < 0 ? 1 : -1));
    else setDragOffset(0);
  };

  return (
    <section className={styles.carousel} aria-labelledby="model-carousel-title">
      <div
        className={styles.viewport}
        tabIndex={0}
        onKeyDown={(event) => {
          if (event.key === "ArrowLeft") selectIndex(activeIndex - 1);
          if (event.key === "ArrowRight") selectIndex(activeIndex + 1);
        }}
        onPointerDown={(event) => {
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
        <div
          className={styles.track}
          data-dragging={dragging}
          style={{ transform: `translateX(calc(-${activeIndex * 100}% + ${dragOffset}px))` }}
        >
          {STUDIO_MODELS.map((model, index) => {
            const profile = profiles[model.id];
            return (
              <article className={styles.slide} aria-hidden={index !== activeIndex} key={model.id}>
                <div className={styles.description}>
                  <p className={styles.eyebrow}>{profile.eyebrow}</p>
                  <h2 id={index === activeIndex ? "model-carousel-title" : undefined}>{model.displayName}</h2>
                  <p className={styles.statement}>{profile.statement}</p>
                  <p className={styles.details}>{profile.details}</p>
                  <dl>
                    <div><dt>Studio</dt><dd>Basic Studio</dd></div>
                    <div><dt>Status</dt><dd>{profile.availability}</dd></div>
                  </dl>
                  <Link className={styles.chooseAction} href={`/studio/basic?stage=workspace&model=${model.id}`} tabIndex={index === activeIndex ? 0 : -1}>
                    Choose {model.name} <span aria-hidden="true">→</span>
                  </Link>
                </div>

                <div className={styles.modelStage}>
                  <div className={styles.spotlight} aria-hidden="true" />
                  <span className={styles.modelIndex} aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
                  <Image
                    className={styles.modelImage}
                    src={model.imagePath}
                    width={1792}
                    height={2400}
                    sizes="(max-width: 760px) 100vw, 62vw"
                    alt={model.accessibilityLabel}
                    priority={index === 0}
                  />
                </div>
              </article>
            );
          })}
        </div>

        <button className={`${styles.arrow} ${styles.previous}`} type="button" aria-label="Show previous model" onClick={() => selectIndex(activeIndex - 1)}>←</button>
        <button className={`${styles.arrow} ${styles.next}`} type="button" aria-label="Show next model" onClick={() => selectIndex(activeIndex + 1)}>→</button>
      </div>

      <footer className={styles.footer}>
        <p><span aria-hidden="true">↔</span> Swipe to move between models</p>
        <span className={styles.liveIndex} aria-live="polite">{String(activeIndex + 1).padStart(2, "0")} / {String(STUDIO_MODELS.length).padStart(2, "0")}</span>
        <div className={styles.selector} role="radiogroup" aria-label="Choose model">
          {STUDIO_MODELS.map((model, index) => (
            <button type="button" role="radio" aria-checked={index === activeIndex} aria-label={`Show ${model.displayName}`} onClick={() => selectIndex(index)} key={model.id}>
              <span aria-hidden="true" /> {model.name}
            </button>
          ))}
        </div>
      </footer>
    </section>
  );
}
