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
      "Choose the model, lighting, and pose to shape a clear fashion direction around the product.",
  },
  {
    number: "03",
    title: "Build the campaign",
    description:
      "Create a focused set of campaign-ready fashion imagery inside one intelligent studio.",
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
              Choose the model, lighting, and pose. Build campaign-ready fashion
              imagery inside one intelligent studio.
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
          <p className={styles.sectionLabel}>One image. A new context.</p>
          <h2 id="transformation-heading" className={styles.statementHeading}>
            Your product remains the focus.
            <span>The world around it transforms.</span>
          </h2>
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
            <p className={styles.availability}>Available now</p>
            <div>
              <h3>Basic Studio</h3>
              <p>
                Select a model, lighting direction, and pose—then build your fashion
                campaign from one clear starting point.
              </p>
            </div>
            <Link className={styles.studioLink} href="/studio/basic">
              Enter Basic Studio <span aria-hidden="true">↗</span>
            </Link>
          </article>
        </section>

        <section className={`${styles.section} ${styles.finalCta}`} aria-labelledby="final-heading">
          <p className={styles.sectionLabel}>Your campaign begins here</p>
          <h2 id="final-heading" className={styles.finalHeading}>
            Make the product
            <span>the story.</span>
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
