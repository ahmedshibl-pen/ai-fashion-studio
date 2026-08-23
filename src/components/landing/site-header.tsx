"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import styles from "./site-header.module.css";

const navigation = [
  { href: "#how-it-works", label: "How It Works" },
  { href: "#studios", label: "Studios" },
] as const;

export function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const mobileNavigationRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = document.documentElement;
    let frame = 0;

    const commitScroll = () => {
      const progress = Math.min(window.scrollY / Math.max(window.innerHeight, 1), 1);
      root.style.setProperty("--scene-scroll", progress.toFixed(3));
      root.dataset.scrolled = window.scrollY > 40 ? "true" : "false";
      frame = 0;
    };

    const handleScroll = () => {
      if (!frame) {
        frame = window.requestAnimationFrame(commitScroll);
      }
    };

    commitScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (frame) window.cancelAnimationFrame(frame);
      delete root.dataset.scrolled;
      root.style.removeProperty("--scene-scroll");
    };
  }, []);

  useEffect(() => {
    if (!menuOpen) return;

    const previousOverflow = document.body.style.overflow;
    const navigation = mobileNavigationRef.current;
    const focusable = navigation?.querySelectorAll<HTMLElement>("a[href], button:not([disabled])");
    document.body.style.overflow = "hidden";
    focusable?.[0]?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
        menuButtonRef.current?.focus();
      }

      if (event.key === "Tab" && focusable?.length) {
        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [menuOpen]);

  const closeMenu = () => setMenuOpen(false);

  return (
    <header className={styles.header}>
      <nav className={styles.nav} aria-label="Primary navigation">
        <Link className={styles.brand} href="#top" onClick={closeMenu}>
          <span className={styles.monogram} aria-hidden="true">
            A
          </span>
          <span>AI Fashion Studio</span>
        </Link>

        <div className={styles.desktopNavigation}>
          {navigation.map((item) => (
            <Link className={styles.navLink} href={item.href} key={item.href}>
              {item.label}
            </Link>
          ))}
          <Link className={styles.enterLink} href="/studio/basic">
            Enter Studio
            <span aria-hidden="true">↗</span>
          </Link>
        </div>

        <button
          ref={menuButtonRef}
          className={styles.menuButton}
          type="button"
          aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={menuOpen}
          aria-controls="mobile-navigation"
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span aria-hidden="true" className={styles.menuIcon} data-open={menuOpen}>
            <i />
            <i />
          </span>
        </button>
      </nav>

      <div
        ref={mobileNavigationRef}
        id="mobile-navigation"
        className={styles.mobileNavigation}
        data-open={menuOpen}
        aria-hidden={!menuOpen}
      >
        <div className={styles.mobileNavigationInner}>
          {navigation.map((item) => (
            <Link
              className={styles.mobileLink}
              href={item.href}
              key={item.href}
              onClick={closeMenu}
            >
              {item.label}
            </Link>
          ))}
          <Link className={styles.mobileEnterLink} href="/studio/basic" onClick={closeMenu}>
            Enter Studio <span aria-hidden="true">↗</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
