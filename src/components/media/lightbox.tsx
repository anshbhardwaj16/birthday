"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import styles from "./media.module.css";

export type LightboxItem = { src: string; alt: string; caption?: string };

type LightboxProps = {
  items: LightboxItem[];
  /** Index of the open item, or null when closed. */
  index: number | null;
  onChange: (index: number | null) => void;
};

const noopSubscribe = () => () => {};

export function Lightbox({ items, index, onChange }: LightboxProps) {
  // Portals need document.body, which only exists in the browser.
  const isClient = useSyncExternalStore(noopSubscribe, () => true, () => false);
  if (!isClient) return null;

  return createPortal(
    <AnimatePresence>
      {index !== null && index >= 0 && index < items.length ? (
        <Viewer key="viewer" items={items} index={index} onChange={onChange} />
      ) : null}
    </AnimatePresence>,
    document.body,
  );
}

type ViewerProps = { items: LightboxItem[]; index: number; onChange: (index: number | null) => void };

function Viewer({ items, index, onChange }: ViewerProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const reduce = useReducedMotion();
  const count = items.length;
  const many = count > 1;
  const item = items[index];

  const close = useCallback(() => onChange(null), [onChange]);
  const step = useCallback((by: number) => onChange((index + by + count) % count), [index, count, onChange]);

  // Lock page scroll, move focus in, and give focus back on close.
  useEffect(() => {
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus({ preventScroll: true });
    return () => {
      document.body.style.overflow = overflow;
      previous?.focus({ preventScroll: true });
    };
  }, []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
      else if (many && event.key === "ArrowRight") step(1);
      else if (many && event.key === "ArrowLeft") step(-1);
      else if (event.key === "Tab") trapFocus(event, rootRef.current);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [close, step, many]);

  return (
    <motion.div
      ref={rootRef}
      className={`${styles.vars} ${styles.lightbox}`}
      role="dialog"
      aria-modal="true"
      aria-label="Photo viewer"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: reduce ? 0 : 0.2 }}
    >
      <div className={styles.lbBar}>
        <span className={styles.lbCount}>{many ? `${index + 1} of ${count}` : ""}</span>
        <button ref={closeRef} type="button" className={styles.iconButton} onClick={close} aria-label="Close">
          <X size={20} aria-hidden="true" />
        </button>
      </div>

      <div className={styles.lbStage}>
        <motion.div
          className={styles.lbDrag}
          drag={many ? "x" : false}
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.3}
          onDragEnd={(_, info) => {
            if (info.offset.x < -70) step(1);
            else if (info.offset.x > 70) step(-1);
          }}
        >
          <AnimatePresence initial={false} mode="popLayout">
            <motion.div
              key={index}
              className={styles.lbImage}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: reduce ? 0 : 0.25 }}
            >
              <Image src={item.src} alt={item.alt} fill sizes="100vw" className={styles.lbImg} draggable={false} />
            </motion.div>
          </AnimatePresence>
        </motion.div>

        {many ? (
          <>
            <button
              type="button"
              className={`${styles.iconButton} ${styles.lbPrev}`}
              onClick={() => step(-1)}
              aria-label="Previous photo"
            >
              <ChevronLeft size={22} aria-hidden="true" />
            </button>
            <button
              type="button"
              className={`${styles.iconButton} ${styles.lbNext}`}
              onClick={() => step(1)}
              aria-label="Next photo"
            >
              <ChevronRight size={22} aria-hidden="true" />
            </button>
          </>
        ) : null}
      </div>

      <p className={styles.lbCaption}>{item.caption ?? ""}</p>
    </motion.div>
  );
}

/** Keep Tab cycling inside the open lightbox. */
function trapFocus(event: KeyboardEvent, root: HTMLElement | null) {
  if (!root) return;
  const focusable = root.querySelectorAll<HTMLElement>("button:not([disabled])");
  if (focusable.length === 0) return;
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
