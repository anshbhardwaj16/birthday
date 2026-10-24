"use client";

import { lazy, Suspense, useCallback, useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { MotionConfig } from "framer-motion";
import { PartyProvider } from "./PartyProvider";
import Wrap from "./wrap/Wrap";
import { settings } from "@/config/settings";
import { useNow } from "@/lib/clock";

// The unlocked site is its own chunk: it isn't downloaded (or readable in the
// page source) until the countdown is nearly over.
const loadSite = () => import("./site/Site");
const Site = lazy(loadSite);

const unlockMs = new Date(settings.unlockAt).getTime();
const bootedAt = typeof window === "undefined" ? 0 : Date.now();

const subscribeNothing = () => () => {};
const readSearch = () => window.location.search;
const readServerSearch = () => "";

type Phase = "wrap" | "site";

export default function Experience() {
  const now = useNow();
  const search = useSyncExternalStore(subscribeNothing, readSearch, readServerSearch);

  const preview = useMemo(() => {
    if (!settings.allowPreviewLinks) return {};
    const q = new URLSearchParams(search);
    const demo = Number(q.get("demo"));
    return {
      demo: Number.isFinite(demo) && demo > 0 ? demo : undefined,
      open: q.has("open"),
      site: q.has("site"),
    };
  }, [search]);

  const target = useMemo(() => {
    if (preview.demo) return Math.ceil((bootedAt + preview.demo * 1000) / 1000) * 1000;
    if (preview.open) return Math.floor(bootedAt / 1000) * 1000 - 1000;
    return unlockMs;
  }, [preview]);

  // "auto" resolves to whatever the URL asks for until the visitor takes over.
  const [choice, setChoice] = useState<Phase | "auto">("auto");
  const [siteMounted, setSiteMounted] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [wrapRun, setWrapRun] = useState(0);

  const phase: Phase = choice === "auto" ? (preview.site ? "site" : "wrap") : choice;
  const showSite = siteMounted || phase === "site";
  const siteRevealed = revealed || phase === "site";
  const remaining = now === 0 ? null : target - now;

  // Fetch the site's code a couple of minutes early so the reveal never stutters.
  useEffect(() => {
    if (remaining !== null && remaining < 120_000) void loadSite();
  }, [remaining]);

  // The site is rendered (hidden under the wrapping) just before it's needed,
  // and only "revealed" when the paper actually starts to part.
  const handlePrime = useCallback(() => setSiteMounted(true), []);
  const handleOpenStart = useCallback(() => setRevealed(true), []);
  const handleDone = useCallback(() => {
    setChoice("site");
    window.scrollTo(0, 0);
  }, []);

  const replay = useCallback(() => {
    window.scrollTo({ top: 0 });
    setRevealed(false);
    setWrapRun((n) => n + 1);
    setChoice("wrap");
  }, []);

  return (
    <MotionConfig reducedMotion="user">
      <PartyProvider musicActive={siteRevealed}>
        {showSite && (
          <Suspense fallback={null}>
            {/* Not focusable or readable while it's still wrapped. */}
            <div inert={phase === "wrap"}>
              <Site onReplay={replay} revealed={siteRevealed} />
            </div>
          </Suspense>
        )}
        {phase === "wrap" && (
          <Wrap
            key={wrapRun}
            remaining={remaining}
            target={target}
            rewrap={wrapRun > 0}
            onPrime={handlePrime}
            onOpenStart={handleOpenStart}
            onDone={handleDone}
          />
        )}
      </PartyProvider>
    </MotionConfig>
  );
}
