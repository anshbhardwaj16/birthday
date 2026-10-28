"use client";

import { useEffect, useId, useRef, useState, type CSSProperties } from "react";
import clsx from "clsx";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { Play, RotateCcw } from "lucide-react";
import { videos } from "@/config/media";
import { announceMedia } from "@/lib/mediabus";
import { assetPath } from "@/lib/paths";
import { MediaHeading, parseRatio } from "@/components/media/parts";
import styles from "@/components/media/media.module.css";

const PART_EASE: [number, number, number, number] = [0.7, 0, 0.3, 1];

type FullscreenVideo = HTMLVideoElement & {
  webkitDisplayingFullscreen?: boolean;
  webkitEnterFullscreen?: () => void;
};

export function VideoMessage() {
  const headingId = useId();
  const [selected, setSelected] = useState(0);
  const current = videos[selected];

  if (!current) return null;

  return (
    <section aria-labelledby={headingId} className={clsx(styles.vars, styles.band, styles.screening)}>
      <MediaHeading id={headingId} title="Videos" />
      {videos.length > 1 ? (
        <div className="mx-auto mb-6 flex max-w-[60rem] flex-wrap justify-center gap-3">
          {videos.map((item, index) => (
            <button
              key={item.src}
              type="button"
              aria-pressed={selected === index}
              onClick={() => setSelected(index)}
              className={clsx(
                "rounded-full border px-5 py-3 text-sm font-semibold transition-colors",
                selected === index
                  ? "border-[var(--m-gold)] bg-[var(--m-gold)] text-[var(--m-stage)]"
                  : "border-white/40 text-white hover:border-white",
              )}
            >
              {item.title}
            </button>
          ))}
        </div>
      ) : null}
      <VideoStage key={current.src} item={current} />
    </section>
  );
}

function VideoStage({ item }: { item: (typeof videos)[number] }) {
  const ratio = parseRatio(item.ratio, 16 / 9);
  const stageRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [open, setOpen] = useState(false);
  const [watched, setWatched] = useState(false);
  const [playError, setPlayError] = useState<string | null>(null);
  const reduce = useReducedMotion();
  const inView = useInView(stageRef, { amount: 0.3 });

  // Scrolling away pauses the video (but not while it's fullscreen).
  useEffect(() => {
    const element = videoRef.current as FullscreenVideo | null;
    if (inView || !element || document.fullscreenElement || element.webkitDisplayingFullscreen) return;
    element.pause();
  }, [inView]);

  // If the section unmounts mid-video, let the music come back.
  useEffect(() => {
    const element = videoRef.current;
    return () => {
      if (element && !element.paused) announceMedia(false);
    };
  }, []);

  useEffect(() => {
    const element = videoRef.current as FullscreenVideo | null;
    const stage = stageRef.current;
    if (!element || !open) return;

    const exitFullscreen = () => {
      if (document.fullscreenElement === stage || element.webkitDisplayingFullscreen) return;
      element.pause();
      setOpen(false);
    };

    document.addEventListener("fullscreenchange", exitFullscreen);
    element.addEventListener("webkitendfullscreen", exitFullscreen);
    return () => {
      document.removeEventListener("fullscreenchange", exitFullscreen);
      element.removeEventListener("webkitendfullscreen", exitFullscreen);
    };
  }, [open]);

  const start = () => {
    setPlayError(null);
    const element = videoRef.current as FullscreenVideo | null;
    const stage = stageRef.current;
    if (!element) return;
    if (element.ended) element.currentTime = 0;

    if (!stage?.requestFullscreen && !element.webkitEnterFullscreen) {
      setPlayError("Full-screen video playback isn't supported in this browser.");
      return;
    }

    setOpen(true);
    const playback = element.play();
    playback.catch(() => {
      setOpen(false);
      setPlayError("Video playback couldn't start. Please try again.");
    });

    if (stage?.requestFullscreen) {
      stage.requestFullscreen().catch(() => {
        element.pause();
        setOpen(false);
        setPlayError("Full-screen playback couldn't start. Please try again.");
      });
    } else {
      try {
        element.webkitEnterFullscreen?.();
      } catch {
        element.pause();
        setOpen(false);
        setPlayError("Full-screen playback couldn't start. Please try again.");
      }
    }
  };

  const curtain = (side: "left" | "right") => (
    <motion.span
      aria-hidden="true"
      className={clsx(styles.curtain, side === "left" ? styles.curtainLeft : styles.curtainRight)}
      initial={false}
      animate={{ x: open ? (side === "left" ? "-100%" : "100%") : "0%" }}
      transition={{ duration: reduce ? 0 : 1.15, ease: PART_EASE }}
    />
  );

  return (
    <div
      ref={stageRef}
      className={styles.stage}
      style={{ "--ratio": ratio } as CSSProperties}
      data-portrait={ratio < 1}
    >
      <video
        ref={videoRef}
        className={styles.video}
        src={assetPath(item.src)}
        poster={item.poster ? assetPath(item.poster) : undefined}
        preload="metadata"
        playsInline
        controls={open}
        aria-label={item.title}
        onPlay={() => announceMedia(true)}
        onPause={() => announceMedia(false)}
        onEnded={() => {
          setOpen(false);
          setWatched(true);
        }}
      >
        {item.captions ? (
          <track kind="captions" src={assetPath(item.captions)} srcLang="en" label="Captions" default />
        ) : null}
      </video>

      {curtain("left")}
      {curtain("right")}

      {!open ? (
        <div className={styles.overlay}>
          <button type="button" className={styles.playButton} onClick={start}>
            {watched ? (
              <RotateCcw size={18} aria-hidden="true" />
            ) : (
              <Play size={18} aria-hidden="true" fill="currentColor" />
            )}
            {watched ? "Watch again" : "Play the video"}
          </button>
          {playError ? <p role="alert">{playError}</p> : null}
        </div>
      ) : null}
    </div>
  );
}
