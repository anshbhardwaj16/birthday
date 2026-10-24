"use client";

import Image from "next/image";
import { useId, useState, type CSSProperties } from "react";
import clsx from "clsx";
import { motion, useReducedMotion } from "framer-motion";
import { Expand, Puzzle, Shuffle } from "lucide-react";
import { collage, showEmptySlots } from "@/config/media";
import { Lightbox, type LightboxItem } from "@/components/media/lightbox";
import { FilePath, Hint, MediaHeading, parseRatio } from "@/components/media/parts";
import styles from "@/components/media/media.module.css";

const ratio = parseRatio(collage.ratio, 4 / 5);
const landscape = ratio > 1.1;
const [COLS, ROWS] = collage.pieces ?? (ratio < 0.9 ? [4, 5] : landscape ? [6, 4] : [5, 5]);
// Matches the board's max width in media.module.css.
const SIZES = landscape ? "(max-width: 1000px) 100vw, 960px" : "(max-width: 600px) 100vw, 544px";
const ZOOM: LightboxItem[] = [{ src: collage.src, alt: collage.alt }];
const PLACEHOLDER = collage.src ? "" : placeholderArt(ratio);

/** Small, repeatable pseudo-random numbers so the scatter is the same on every load. */
function seeded(n: number) {
  let t = (n * 0x6d2b79f5) >>> 0;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

/** How far a piece strays, as % of its own size. Edge pieces mostly stray inward. */
function stray(position: number, count: number, t: number) {
  const reach = 55;
  const min = position === 0 ? -12 : -reach;
  const max = position === count - 1 ? 12 : reach;
  return Math.round(min + t * (max - min));
}

const PIECES = Array.from({ length: COLS * ROWS }, (_, i) => {
  const c = i % COLS;
  const r = Math.floor(i / COLS);
  return {
    c,
    r,
    x: stray(c, COLS, seeded(i * 5 + 1)),
    y: stray(r, ROWS, seeded(i * 5 + 2)),
    rotate: Math.round((seeded(i * 5 + 3) - 0.5) * 36),
    delay: Math.round(seeded(i * 5 + 4) * 50) / 100,
    z: 1 + Math.floor(seeded(i * 5 + 5) * 9),
  };
});

export function Collage() {
  const headingId = useId();
  const reduce = useReducedMotion();
  const [assembled, setAssembled] = useState(false);
  const [zoom, setZoom] = useState<number | null>(null);

  if (!collage.src && !showEmptySlots) return null;

  // With reduced motion the collage just shows up whole.
  const done = assembled || Boolean(reduce);
  const canZoom = Boolean(collage.src);

  const fill = (alt: string) =>
    collage.src ? (
      <Image src={collage.src} alt={alt} fill sizes={SIZES} className={styles.cover} draggable={false} />
    ) : (
      <span className={styles.fillBg} style={{ backgroundImage: `url("${PLACEHOLDER}")` }} />
    );

  const onBoard = () => {
    if (!done) setAssembled(true);
    else if (canZoom) setZoom(0);
  };

  return (
    <section aria-labelledby={headingId} className={clsx(styles.vars, styles.band, styles.collageBand)}>
      <MediaHeading id={headingId} title={collage.title} note={collage.note} />

      <button
        type="button"
        className={styles.board}
        style={{ "--ratio": ratio } as CSSProperties}
        data-landscape={landscape}
        data-done={done}
        data-zoom={canZoom}
        onClick={onBoard}
        aria-label={
          done ? (canZoom ? "See the collage full size" : collage.alt || "Collage") : "Put the collage together"
        }
      >
        {PIECES.map((p, i) => (
          <motion.span
            key={i}
            className={styles.piece}
            style={{
              left: `${(p.c * 100) / COLS}%`,
              top: `${(p.r * 100) / ROWS}%`,
              width: `${100 / COLS}%`,
              height: `${100 / ROWS}%`,
              zIndex: done ? 1 : p.z,
            }}
            initial={false}
            animate={
              done
                ? { x: "0%", y: "0%", rotate: 0, scale: 1 }
                : { x: `${p.x}%`, y: `${p.y}%`, rotate: p.rotate, scale: 0.9 }
            }
            transition={
              reduce
                ? { duration: 0 }
                : { type: "spring", stiffness: 110, damping: 15, mass: 0.9, delay: done ? p.delay : p.delay * 0.3 }
            }
          >
            <span
              className={styles.pieceInner}
              style={{
                width: `${COLS * 100}%`,
                height: `${ROWS * 100}%`,
                left: `${-p.c * 100}%`,
                top: `${-p.r * 100}%`,
              }}
            >
              {fill("")}
            </span>
          </motion.span>
        ))}

        {/* The whole image fades in on top once the pieces land, so no seams show. */}
        <motion.span
          className={styles.whole}
          initial={false}
          animate={{ opacity: done ? 1 : 0 }}
          transition={{ duration: reduce ? 0 : 0.4, delay: done && !reduce ? 1.2 : 0 }}
        >
          {fill(collage.alt)}
        </motion.span>
      </button>

      <div className={styles.actions}>
        {!done ? (
          <button type="button" className={styles.pill} onClick={() => setAssembled(true)}>
            <Puzzle size={18} aria-hidden="true" />
            Put it together
          </button>
        ) : (
          <>
            {canZoom ? (
              <button type="button" className={styles.pill} onClick={() => setZoom(0)}>
                <Expand size={18} aria-hidden="true" />
                See it full size
              </button>
            ) : null}
            {!reduce ? (
              <button type="button" className={clsx(styles.pill, styles.pillGhost)} onClick={() => setAssembled(false)}>
                <Shuffle size={18} aria-hidden="true" />
                Mix it up again
              </button>
            ) : null}
          </>
        )}
      </div>

      {!collage.src ? (
        <Hint>
          Add the collage at <FilePath>public/media/collage/collage.jpg</FilePath>, then set{" "}
          <FilePath>collage.src</FilePath> in <FilePath>src/config/media.ts</FilePath>
        </Hint>
      ) : null}

      {canZoom ? <Lightbox items={ZOOM} index={zoom} onChange={setZoom} /> : null}
    </section>
  );
}

/** A stand-in collage drawn as SVG, used until the real image is added. */
function placeholderArt(r: number) {
  const W = 1000;
  const H = Math.round(W / r);
  const palette = ["#f4c9d3", "#ebb84f", "#7b1431", "#fbe3e8", "#a3294a", "#f1dcc0", "#3a1d42", "#f2a9ba"];
  const dark = new Set(["#7b1431", "#a3294a", "#3a1d42"]);
  const shapes: string[] = [];
  let k = 0;

  const split = (x: number, y: number, w: number, h: number, depth: number, seed: number) => {
    if (depth === 0) {
      const fill = palette[k++ % palette.length];
      const g = 9;
      const s = Math.min(w, h) * 0.2;
      const cx = x + w / 2;
      const cy = y + h / 2;
      const ink = dark.has(fill) ? "#ffffff" : "#2a1530";
      shapes.push(
        `<rect x="${x + g}" y="${y + g}" width="${w - 2 * g}" height="${h - 2 * g}" fill="${fill}"/>`,
        `<g fill="none" stroke="${ink}" stroke-opacity="0.35" stroke-width="${Math.max(3, s * 0.08)}" stroke-linejoin="round">` +
          `<rect x="${cx - s}" y="${cy - s * 0.8}" width="${s * 2}" height="${s * 1.6}" rx="${s * 0.12}"/>` +
          `<circle cx="${cx - s * 0.4}" cy="${cy - s * 0.3}" r="${s * 0.2}"/>` +
          `<path d="M${cx - s * 0.9} ${cy + s * 0.6} L${cx - s * 0.2} ${cy} L${cx + s * 0.25} ${cy + s * 0.4} L${cx + s * 0.5} ${cy + s * 0.15} L${cx + s * 0.9} ${cy + s * 0.6}"/>` +
          `</g>`,
      );
      return;
    }
    const vertical = w / h > 1.15 ? true : h / w > 1.15 ? false : seeded(seed) > 0.5;
    const t = 0.38 + seeded(seed + 7) * 0.24;
    if (vertical) {
      const a = Math.round(w * t);
      split(x, y, a, h, depth - 1, seed * 2 + 1);
      split(x + a, y, w - a, h, depth - 1, seed * 2 + 2);
    } else {
      const a = Math.round(h * t);
      split(x, y, w, a, depth - 1, seed * 2 + 1);
      split(x, y + a, w, h - a, depth - 1, seed * 2 + 2);
    }
  };

  split(9, 9, W - 18, H - 18, 3, 5);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice"><rect width="${W}" height="${H}" fill="#fff8f9"/>${shapes.join("")}</svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}
