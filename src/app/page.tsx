import Image from "next/image";
import Link from "next/link";

import { ScenePicture } from "@/components/landing/scene-picture";
import { SiteHeader } from "@/components/landing/site-header";

import styles from "./page.module.css";

const process = [
  {
    number: "01",
    title: "Bring the product",
    description:
      "Start with the product image that should lead the campaign. It remains the visual anchor throughout the studio.",
  },
  {
    number: "02",
    title: "Direct the scene",
    description:
      "Choose the model, lighting, pose, and camera framing to shape a clear fashion direction around the product.",
  },
  {
    number: "03",
    title: "Build the campaign",
    description:
      "Create a focused set of campaign-ready fashion imagery inside one intelligent studio.",
  },
] as const;

const creativeControls = [
  {
    label: "Model",
    title: "Set the presence",
    description: "Choose the person who carries the product and the campaign attitude.",
    image: "/images/models/model-man.webp",
    imageClassName: styles.controlModel,
  },
  {
    label: "Lighting",
    title: "Shape the mood",
    description: "Move from clean commerce light to a directional editorial atmosphere.",
    image: "/images/basic-studio/lighting/cinematic-softbox.webp",
    imageClassName: "",
  },
  {
    label: "Pose",
    title: "Direct the body",
    description: "Select a pose that supports the silhouette without distracting from it.",
    image: "/images/basic-studio/models/male-model-01/poses/folded-arms.webp",
    imageClassName: "",
  },
  {
    label: "Camera",
    title: "Control the frame",
    description: "Move between full-length, close-up, and elevated campaign compositions.",
    image: "/images/basic-studio/models/male-model-01/camera/upper-body-close-up.webp",
    imageClassName: "",
  },
] as const;

export default function Home() {
  return (
    <div className={styles.landing}>
      <SiteHeader />

      <main id="top" className={styles.scene}>
        <ScenePicture className={styles.scenePicture} />
        <div className={styles.sceneShade} aria-hidden="true" />
        <div className={styles.sceneGlow} aria-hidden="true" />

        <section className={styles.hero} aria-labelledby="hero-heading">
          <div className={styles.heroContent}>
            <p className={styles.eyebrow}>AI Fashion Studio</p>
            <h1 id="hero-heading" className={styles.heroHeading}>
              <span className={styles.heroHeadingFirst}>From product image</span>
              <span>to fashion campaign.</span>
            </h1>
            <p className={styles.heroBody}>
              Choose the model, lighting, pose, and camera framing. Build
              campaign-ready fashion imagery inside one intelligent studio.
            </p>
            <div className={styles.heroActions}>
              <Link className={styles.primaryAction} href="/studio/basic">
                Start Creating <span aria-hidden="true">↗</span>
              </Link>
              <Link className={styles.secondaryAction} href="#studios">
                Explore Studios <span aria-hidden="true">↓</span>
              </Link>
            </div>
          </div>

          <a className={styles.scrollCue} href="#transformation">
            <span aria-hidden="true" /> Scroll to enter
          </a>
        </section>

        <section
          id="transformation"
          className={`${styles.section} ${styles.transformation}`}
          aria-labelledby="transformation-heading"
        >
          <div className={styles.transformationCopy}>
            <p className={styles.sectionLabel}>One image. A new context.</p>
            <h2 id="transformation-heading" className={styles.statementHeading}>
              Your product remains the focus.
              <span>The world around it transforms.</span>
            </h2>
            <p className={styles.transformationBody}>
              Begin with a clean product reference, then build the person, light,
              direction, and framing around it—without losing the original design.
            </p>
          </div>

          <div className={styles.transformationBoard} aria-label="Product-to-campaign transformation preview">
            <article className={styles.sourceFrame}>
              <Image
                src="/images/studio-hero.png"
                fill
                sizes="(max-width: 699px) 88vw, 30vw"
                alt="A light garment prepared inside a professional studio."
              />
              <span>01 / Product reference</span>
            </article>

            <div className={styles.directionStage}>
              <span className={styles.stageIndex} aria-hidden="true">02</span>
              <Image
                className={styles.directionModel}
                src="/images/models/model-man.webp"
                width={896}
                height={1200}
                sizes="(max-width: 699px) 72vw, 28vw"
                alt="Male fashion model shown on a transparent studio stage."
              />
              <div className={styles.directionCaption}>
                <span>Creative direction</span>
                <strong>Model · Light · Pose · Camera</strong>
              </div>
            </div>
          </div>
        </section>

        <section
          id="how-it-works"
          className={`${styles.section} ${styles.howItWorks}`}
          aria-labelledby="how-heading"
        >
          <div className={styles.sectionIntro}>
            <p className={styles.sectionLabel}>The Process</p>
            <h2 id="how-heading" className={styles.sectionHeading}>
              How It <span>Works</span>
            </h2>
          </div>

          <ol className={styles.processList}>
            {process.map((step) => (
              <li className={styles.processItem} key={step.number}>
                <span className={styles.processNumber}>{step.number}</span>
                <div>
                  <h3>{step.title}</h3>
                  <p>{step.description}</p>
                </div>
                <span className={styles.processArrow} aria-hidden="true">
                  ↗
                </span>
              </li>
            ))}
          </ol>
        </section>

        <section
          id="studios"
          className={`${styles.section} ${styles.studios}`}
          aria-labelledby="studios-heading"
        >
          <div className={styles.studiosIntro}>
            <div>
              <p className={styles.sectionLabel}>Choose your setting</p>
              <h2 id="studios-heading" className={styles.sectionHeading}>
                Studio Collection
              </h2>
            </div>
            <p>
              A focused production environment for building fashion imagery around
              your product.
            </p>
          </div>

          <article className={styles.studioEntry}>
            <div className={styles.studioImage}>
              <Image
                src="/images/studio-hero.png"
                fill
                sizes="(max-width: 699px) 100vw, 46vw"
                alt="A cinematic production studio with camera and lighting equipment."
              />
              <p className={styles.availability}>Available now</p>
            </div>
            <div className={styles.studioDetails}>
              <div>
                <p className={styles.studioNumber}>Studio 01</p>
                <h3>Basic Studio</h3>
                <p>
                  Select a model, lighting direction, pose, and camera frame—then
                  build your fashion campaign from one clear starting point.
                </p>
              </div>
              <Link className={styles.studioLink} href="/studio/basic">
                Enter Basic Studio <span aria-hidden="true">↗</span>
              </Link>
            </div>
          </article>

          <div className={styles.futureStudios} aria-label="Future studios">
            <article data-disabled="true">
              <span>Studio 02</span>
              <h3>Editorial Atelier</h3>
              <p>In development</p>
            </article>
            <article data-disabled="true">
              <span>Studio 03</span>
              <h3>Campaign Suite</h3>
              <p>In development</p>
            </article>
          </div>
        </section>

        <section
          className={`${styles.section} ${styles.controlsPreview}`}
          aria-labelledby="controls-heading"
        >
          <div className={styles.controlsIntro}>
            <p className={styles.sectionLabel}>Creative controls</p>
            <h2 id="controls-heading" className={styles.sectionHeading}>
              Direct every decision.
              <span>Keep one clear visual language.</span>
            </h2>
          </div>

          <div className={styles.controlsGrid}>
            {creativeControls.map((control, index) => (
              <article className={styles.controlCard} key={control.label}>
                <div className={styles.controlImage}>
                  <Image
                    className={control.imageClassName}
                    src={control.image}
                    fill
                    sizes="(max-width: 699px) 88vw, 22vw"
                    alt=""
                  />
                  <span>{String(index + 1).padStart(2, "0")}</span>
                </div>
                <p>{control.label}</p>
                <h3>{control.title}</h3>
                <small>{control.description}</small>
              </article>
            ))}
          </div>
        </section>

        <section className={`${styles.section} ${styles.finalCta}`} aria-labelledby="final-heading">
          <p className={styles.sectionLabel}>Your campaign begins here</p>
          <h2 id="final-heading" className={styles.finalHeading}>
            Your next campaign
            <span>starts in the studio.</span>
          </h2>
          <p>
            Step into the studio and turn a product image into a considered fashion
            campaign.
          </p>
          <Link className={styles.primaryAction} href="/studio/basic">
            Start Creating <span aria-hidden="true">↗</span>
          </Link>
        </section>
      </main>

      <footer className={styles.footer}>
        <p>AI Fashion Studio</p>
        <p>Product imagery, art directed.</p>
      </footer>
    </div>
  );
}
