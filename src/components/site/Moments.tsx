"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import PhotoArt from "../art/PhotoArt";
import { H2 } from "./Section";
import { content } from "@/config/content";

type Moment = (typeof content.moments)[number];

const TILTS = [-3, 2.2, -1.4, 3, -2.4, 1.6];

function Picture({ m, className }: { m: Moment; className?: string }) {
  // eslint-disable-next-line @next/next/no-img-element
  if (m.image) return <img src={m.image} alt={m.caption} className={className} draggable={false} />;
  return <PhotoArt tone={m.tone} className={className} />;
}

function Lightbox({
  index,
  onClose,
  onStep,
}: {
  index: number;
  onClose: () => void;
  onStep: (dir: 1 | -1) => void;
}) {
  const m = content.moments[index];

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") onStep(1);
      if (e.key === "ArrowLeft") onStep(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, onStep]);

  const btn =
    "grid size-12 place-items-center rounded-full bg-milk text-ink transition-transform hover:scale-110 active:scale-95";

  return (
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-label={m.caption || m.alt}
      className="fixed inset-0 z-[70] grid place-items-center bg-ink/92 p-4 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <button type="button" aria-label="Close" onClick={onClose} className={`${btn} absolute right-4 top-4`} autoFocus>
        <X size={22} aria-hidden />
      </button>
      <button
        type="button"
        aria-label="Previous moment"
        onClick={(e) => {
          e.stopPropagation();
          onStep(-1);
        }}
        className={`${btn} absolute left-3 top-1/2 -translate-y-1/2 sm:left-6`}
      >
        <ChevronLeft size={24} aria-hidden />
      </button>
      <button
        type="button"
        aria-label="Next moment"
        onClick={(e) => {
          e.stopPropagation();
          onStep(1);
        }}
        className={`${btn} absolute right-3 top-1/2 -translate-y-1/2 sm:right-6`}
      >
        <ChevronRight size={24} aria-hidden />
      </button>

      <AnimatePresence mode="wait">
        <motion.figure
          key={index}
          className="max-h-full w-[min(88vw,30rem)] bg-white p-3 pb-6 text-ink shadow-2xl"
          initial={{ opacity: 0, scale: 0.9, rotate: -3 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          exit={{ opacity: 0, scale: 0.94 }}
          transition={{ duration: 0.28 }}
          onClick={(e) => e.stopPropagation()}
        >
          <Picture m={m} className="aspect-[4/5] max-h-[68svh] w-full object-cover" />
          {m.caption ? (
            <figcaption className="voice mt-5 px-2 text-center text-[clamp(1.4rem,3vw,2rem)]">
              {m.caption}
            </figcaption>
          ) : null}
        </motion.figure>
      </AnimatePresence>
    </motion.div>
  );
}

export default function Moments() {
  const scroller = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState<number | null>(null);
  const total = content.moments.length;

  const scrollBy = (dir: 1 | -1) => {
    const el = scroller.current;
    if (!el) return;
    el.scrollBy({ left: dir * Math.min(el.clientWidth * 0.8, 520), behavior: "smooth" });
  };

  const step = useCallback(
    (dir: 1 | -1) => setOpen((i) => (i === null ? i : (i + dir + total) % total)),
    [total],
  );
  const close = useCallback(() => setOpen(null), []);

  const arrow =
    "grid size-14 place-items-center rounded-full border-2 border-milk text-milk transition-colors hover:bg-milk hover:text-cobalt";

  return (
    <section id="moments" className="paper grain overflow-hidden py-[clamp(4.5rem,11vw,10rem)] text-milk">
      <div className="relative z-10 px-[clamp(1.1rem,4vw,4rem)]">
        <div className="mx-auto flex max-w-[78rem] flex-wrap items-end justify-between gap-6">
          <div>
            <h2 className={H2}>Moments worth framing.</h2>
            <p className="voice mt-6 text-[clamp(1.5rem,2.6vw,2.2rem)] text-milk/85">Tap any photo to see it up close.</p>
          </div>
          <div className="hidden gap-3 md:flex">
            <button type="button" aria-label="Scroll left" onClick={() => scrollBy(-1)} className={arrow}>
              <ChevronLeft size={26} aria-hidden />
            </button>
            <button type="button" aria-label="Scroll right" onClick={() => scrollBy(1)} className={arrow}>
              <ChevronRight size={26} aria-hidden />
            </button>
          </div>
        </div>
      </div>

      {/* The strip bleeds off both edges but starts level with the heading above. */}
      <div
        ref={scroller}
        className="no-scrollbar relative z-10 mt-12 flex snap-x snap-mandatory gap-[clamp(1.5rem,3.5vw,3.5rem)] overflow-x-auto px-[max(clamp(1.1rem,4vw,4rem),calc((100vw-78rem)/2+clamp(1.1rem,4vw,4rem)))] pb-14 pt-8"
      >
        {content.moments.map((m, i) => (
          <button
            key={`${m.image ?? m.caption ?? "moment"}-${i}`}
            type="button"
            onClick={() => setOpen(i)}
            aria-label={`Open photo: ${m.caption || m.alt}`}
            className="group relative w-[min(74vw,19rem)] shrink-0 snap-center rotate-[var(--tilt)] bg-white p-3 pb-5 text-ink shadow-[0_26px_40px_-16px_rgb(4_5_70/0.65)] transition-transform duration-300 hover:-translate-y-3 hover:rotate-0"
            style={{ "--tilt": `${TILTS[i % TILTS.length]}deg` } as React.CSSProperties}
          >
            <span
              aria-hidden
              className="absolute -top-3 left-1/2 h-7 w-24 -translate-x-1/2 bg-butter/90 shadow-sm"
              style={{ rotate: `${(i % 2 ? 1 : -1) * 3}deg` }}
            />
            <Picture m={m} className="aspect-[4/5] w-full object-cover" />
            {m.caption ? (
              <span className="voice mt-4 block px-1 text-center text-[clamp(1.25rem,2vw,1.55rem)]">
                {m.caption}
              </span>
            ) : null}
          </button>
        ))}
      </div>

      <AnimatePresence>
        {open !== null && <Lightbox key="lightbox" index={open} onClose={close} onStep={step} />}
      </AnimatePresence>
    </section>
  );
}
