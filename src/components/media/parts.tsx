import type { ReactNode } from "react";
import type { Ratio } from "@/config/media";
import styles from "./media.module.css";

/** File-path hints on placeholders only appear while you run `npm run dev`. */
export const devHints = process.env.NODE_ENV === "development";

/** "4/5" → 0.8. Falls back if the ratio is missing or malformed. */
export function parseRatio(ratio: Ratio | undefined, fallback: number): number {
  if (!ratio) return fallback;
  const [w, h] = ratio.split("/").map(Number);
  return w > 0 && h > 0 ? w / h : fallback;
}

export function MediaHeading({ id, title, note }: { id: string; title: string; note?: string }) {
  return (
    <header className={styles.head}>
      <h2 id={id} className={styles.title}>
        {title}
      </h2>
      {note ? <p className={styles.note}>{note}</p> : null}
    </header>
  );
}

export function Hint({ children }: { children: ReactNode }) {
  if (!devHints) return null;
  return <span className={styles.hint}>{children}</span>;
}

export function FilePath({ children }: { children: ReactNode }) {
  return <code className={styles.path}>{children}</code>;
}

export function PhotoIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 40"
      className={className}
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinejoin="round"
      strokeLinecap="round"
    >
      <rect x="2" y="2" width="44" height="36" rx="3" />
      <circle cx="15" cy="13" r="4" />
      <path d="M4 33 16 21l9 9 6-6 13 12" />
    </svg>
  );
}
