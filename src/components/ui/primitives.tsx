"use client";

import type {
  ButtonHTMLAttributes,
  HTMLAttributes,
  InputHTMLAttributes,
  ReactNode,
} from "react";

import styles from "./ui.module.css";

function cx(...names: Array<string | false | null | undefined>) {
  return names.filter(Boolean).join(" ");
}

export type ButtonVariant = "primary" | "secondary" | "quiet" | "danger";

export function Button({
  className,
  variant = "primary",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant }) {
  return <button className={cx(styles.button, styles[variant], className)} {...props} />;
}

export function IconButton({
  label,
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { label: string }) {
  return (
    <button className={cx(styles.iconButton, className)} aria-label={label} {...props} />
  );
}

export function Card({
  className,
  tone = "elevated",
  ...props
}: HTMLAttributes<HTMLDivElement> & { tone?: "elevated" | "quiet" | "dark" }) {
  return <div className={cx(styles.card, styles[`card-${tone}`], className)} {...props} />;
}

export type StatusTone = "neutral" | "success" | "warning" | "error" | "information";

export function StatusBadge({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: StatusTone;
}) {
  return <span className={cx(styles.statusBadge, styles[`status-${tone}`])}>{children}</span>;
}

export type StepperItem = { id: string; label: string };

export function Stepper({ steps, currentIndex }: { steps: readonly StepperItem[]; currentIndex: number }) {
  return (
    <ol className={styles.stepper} aria-label="Studio progress">
      {steps.map((step, index) => {
        const complete = index < currentIndex;
        const current = index === currentIndex;
        return (
          <li
            className={styles.step}
            data-complete={complete}
            data-current={current}
            aria-current={current ? "step" : undefined}
            key={step.id}
          >
            <span className={styles.stepMarker} aria-hidden="true">
              {complete ? "✓" : String(index + 1).padStart(2, "0")}
            </span>
            <span>{step.label}</span>
          </li>
        );
      })}
    </ol>
  );
}

export function Tabs({
  items,
  activeId,
  onSelect,
  label,
}: {
  items: readonly { id: string; label: string }[];
  activeId: string;
  onSelect?: (id: string) => void;
  label: string;
}) {
  return (
    <div className={styles.tabs} role="tablist" aria-label={label}>
      {items.map((item) => (
        <button
          className={styles.tab}
          type="button"
          role="tab"
          aria-selected={item.id === activeId}
          tabIndex={item.id === activeId ? 0 : -1}
          onClick={() => onSelect?.(item.id)}
          key={item.id}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}

export function RadioCard({
  name,
  value,
  checked,
  title,
  description,
  metadata,
  disabled,
  onChange,
  image,
}: {
  name: string;
  value: string;
  checked: boolean;
  title: string;
  description?: string;
  metadata?: string;
  disabled?: boolean;
  onChange?: (value: string) => void;
  image?: ReactNode;
}) {
  return (
    <label className={styles.radioCard} data-selected={checked} data-disabled={disabled}>
      <input
        className="sr-only"
        type="radio"
        name={name}
        value={value}
        checked={checked}
        disabled={disabled}
        onChange={() => onChange?.(value)}
      />
      {image ? <span className={styles.radioImage}>{image}</span> : null}
      <span className={styles.radioCopy}>
        <span className={styles.radioTitle}>{title}</span>
        {description ? <span className={styles.radioDescription}>{description}</span> : null}
        {metadata ? <span className={styles.metadata}>{metadata}</span> : null}
      </span>
      <span className={styles.selectionMark} aria-hidden="true">{checked ? "✓" : ""}</span>
    </label>
  );
}

export function UploadSurface({
  id,
  label = "Upload product image",
  hint = "PNG, JPG or WEBP · up to 20 MB",
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { id: string; label?: string; hint?: string }) {
  return (
    <label className={cx(styles.uploadSurface, className)} htmlFor={id}>
      <span className={styles.uploadGlyph} aria-hidden="true">↑</span>
      <span className={styles.uploadLabel}>{label}</span>
      <span className={styles.uploadHint}>{hint}</span>
      <input className="sr-only" id={id} type="file" {...props} />
    </label>
  );
}

export function Progress({ value, label }: { value: number; label: string }) {
  const normalized = Math.max(0, Math.min(value, 100));
  return (
    <div className={styles.progressGroup}>
      <div className={styles.progressCopy}><span>{label}</span><span className={styles.metadata}>{normalized}%</span></div>
      <div className={styles.progressTrack} role="progressbar" aria-label={label} aria-valuemin={0} aria-valuemax={100} aria-valuenow={normalized}>
        <span className={styles.progressValue} style={{ width: `${normalized}%` }} />
      </div>
    </div>
  );
}

export function ImageFrame({ children, caption, className }: { children: ReactNode; caption?: string; className?: string }) {
  return <figure className={cx(styles.imageFrame, className)}><div className={styles.imageFrameMedia}>{children}</div>{caption ? <figcaption>{caption}</figcaption> : null}</figure>;
}

export function SectionHeading({ eyebrow, title, description, actions }: { eyebrow?: string; title: string; description?: string; actions?: ReactNode }) {
  return <div className={styles.sectionHeading}><div>{eyebrow ? <p className={styles.eyebrow}>{eyebrow}</p> : null}<h2>{title}</h2>{description ? <p className={styles.sectionDescription}>{description}</p> : null}</div>{actions ? <div className={styles.headingActions}>{actions}</div> : null}</div>;
}

export function CurrentSetup({ items, title = "Current setup" }: { title?: string; items: readonly { label: string; value: string }[] }) {
  return <section className={styles.currentSetup} aria-labelledby="current-setup-title"><p className={styles.eyebrow}>Configuration</p><h2 id="current-setup-title">{title}</h2><dl>{items.map((item) => <div key={item.label}><dt>{item.label}</dt><dd>{item.value}</dd></div>)}</dl></section>;
}

export function EmptyState({ title, description, action }: { title: string; description: string; action?: ReactNode }) {
  return <div className={styles.emptyState}><span className={styles.emptyGlyph} aria-hidden="true">◇</span><h3>{title}</h3><p>{description}</p>{action ? <div>{action}</div> : null}</div>;
}

export function StatusMessage({ children, tone = "information" }: { children: ReactNode; tone?: Exclude<StatusTone, "neutral"> }) {
  return <div className={cx(styles.statusMessage, styles[`message-${tone}`])} role={tone === "error" ? "alert" : "status"}>{children}</div>;
}

export function Skeleton({ className }: { className?: string }) {
  return <span className={cx(styles.skeleton, className)} aria-hidden="true" />;
}
