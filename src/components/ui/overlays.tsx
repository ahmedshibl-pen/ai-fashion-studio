"use client";

import { useEffect, useRef, type ReactNode } from "react";

import { IconButton } from "./primitives";
import styles from "./ui.module.css";

function useOverlayFocus(open: boolean, onClose: () => void) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const panel = panelRef.current;
    const focusable = panel?.querySelectorAll<HTMLElement>('button:not([disabled]), a[href], input:not([disabled]), [tabindex]:not([tabindex="-1"])');
    focusable?.[0]?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (event.key !== "Tab" || !focusable?.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
      previous?.focus();
    };
  }, [onClose, open]);

  return panelRef;
}

type OverlayProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
};

export function Dialog({ open, onClose, title, description, children, footer }: OverlayProps) {
  const panelRef = useOverlayFocus(open, onClose);
  if (!open) return null;
  return <div className={styles.overlay} role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}><div ref={panelRef} className={styles.dialog} role="dialog" aria-modal="true" aria-labelledby="dialog-title" aria-describedby={description ? "dialog-description" : undefined}><header className={styles.overlayHeader}><div><p className={styles.eyebrow}>AI Fashion Studio</p><h2 id="dialog-title">{title}</h2>{description ? <p id="dialog-description">{description}</p> : null}</div><IconButton label="Close dialog" onClick={onClose}>×</IconButton></header><div className={styles.overlayBody}>{children}</div>{footer ? <footer className={styles.overlayFooter}>{footer}</footer> : null}</div></div>;
}

export function Sheet({ open, onClose, title, description, children, footer }: OverlayProps) {
  const panelRef = useOverlayFocus(open, onClose);
  if (!open) return null;
  return <div className={styles.overlay} role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}><aside ref={panelRef} className={styles.sheet} role="dialog" aria-modal="true" aria-labelledby="sheet-title" aria-describedby={description ? "sheet-description" : undefined}><header className={styles.overlayHeader}><div><p className={styles.eyebrow}>AI Fashion Studio</p><h2 id="sheet-title">{title}</h2>{description ? <p id="sheet-description">{description}</p> : null}</div><IconButton label="Close sheet" onClick={onClose}>×</IconButton></header><div className={styles.overlayBody}>{children}</div>{footer ? <footer className={styles.overlayFooter}>{footer}</footer> : null}</aside></div>;
}
