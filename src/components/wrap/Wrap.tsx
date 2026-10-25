"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Volume2, VolumeX } from "lucide-react";
import Paper from "./Paper";
import FinalCount from "./FinalCount";
import { Rolling } from "../Rolling";
import { useParty } from "../PartyProvider";
import { settings } from "@/config/settings";
import { splitDuration } from "@/lib/clock";

type Props = {
  /** ms until unlock, or null before the clock has started. */
  remaining: number | null;
  /** The unlock moment (epoch ms), for the "opens on" line. */
  target: number;
  /** True when coming back after the site has already been seen. */
  rewrap: boolean;
  /** Called when the site underneath should be rendered, ready and hidden. */
  onPrime: () => void;
  /** Called as the paper starts to part, so the site can play its entrance. */
  onOpenStart: () => void;
  /** Called when the paper has fully cleared the screen. */
  onDone: () => void;
};

const EASE = [0.76, 0, 0.24, 1] as const;
const { name } = settings;

const dateFmt = new Intl.DateTimeFormat("en-GB", { weekday: "long", day: "numeric", month: "long" });
const timeFmt = new Intl.DateTimeFormat("en-GB", { hour: "numeric", minute: "2-digit", hour12: true });

/**
 * The locked screen, and the unwrapping.
 *
 * Counting down it is a wrapped gift with the time printed on the ribbon.
 * At zero the ribbon is cut and the two halves of the paper slide apart.
 * If the page is opened after the time has passed, the knot becomes a button.
 */
export default function Wrap({ remaining, target, rewrap, onPrime, onOpenStart, onDone }: Props) {
  const party = useParty();
  const [opening, setOpening] = useState(false);
  const openedRef = useRef(false);
  const timers = useRef<number[]>([]);

  const loading = remaining === null;
  const counting = remaining !== null && remaining > 0;
  const ready = remaining !== null && remaining <= 0;
  const finalSeconds = counting && remaining <= 10_000 ? Math.ceil(remaining / 1000) : null;
  const parts = splitDuration(remaining ?? 0);

  // Did this visit watch the clock run out? Then the wrap opens by itself and
  // never shows the "tap the knot" state. Adjusted during render, not in an effect.
  const [watchedCountdown, setWatchedCountdown] = useState(false);
  if (counting && !watchedCountdown) setWatchedCountdown(true);
  const askToOpen = ready && !watchedCountdown;

  // Keep the page from scrolling behind the wrapping.
  useEffect(() => {
    const root = document.documentElement;
    const previous = root.style.overflow;
    root.style.overflow = "hidden";
    return () => {
      root.style.overflow = previous;
    };
  }, []);

  useEffect(
    () => () => {
      timers.current.forEach((id) => clearTimeout(id));
    },
    [],
  );

  const later = useCallback((fn: () => void, ms: number) => {
    timers.current.push(window.setTimeout(fn, ms));
  }, []);

  const unwrap = useCallback(() => {
    if (openedRef.current) return;
    openedRef.current = true;
    setOpening(true);
    window.scrollTo(0, 0);
    party.sfx("fanfare");
    later(onOpenStart, 500);
    later(() => {
      party.cannons();
      party.fireworks(4);
    }, 700);
    later(() => party.rain(3200), 1500);
    later(onDone, 2500);
  }, [later, onDone, onOpenStart, party]);

  // Render the site under the paper a few seconds early, so nothing is still
  // loading when the halves slide apart.
  const needsSite = askToOpen || opening || (counting && remaining <= 4000);
  useEffect(() => {
    if (needsSite) onPrime();
  }, [needsSite, onPrime]);

  // Open on its own if the clock runs out while the page is open.
  useEffect(() => {
    if (ready && watchedCountdown) unwrap();
  }, [ready, watchedCountdown, unwrap]);

  // Tick sound for the final ten.
  useEffect(() => {
    if (finalSeconds !== null) party.sfx("tick", finalSeconds);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [finalSeconds]);

  const handleKnot = () => {
    party.setSound(party.soundOn);
    unwrap();
  };

  const half = (side: "left" | "right") => {
    const away = side === "left" ? "-52%" : "52%";
    return {
      style: { clipPath: side === "left" ? "inset(0 50% 0 0)" : "inset(0 0 0 50%)" },
      initial: rewrap ? { x: away } : false,
      animate: { x: opening ? away : "0%" },
      transition: opening
        ? { delay: 0.5, duration: 1.5, ease: EASE }
        : { duration: 1.1, ease: EASE },
    } as const;
  };

  const teaser = settings.teasers[Math.floor((target - (remaining ?? 0)) / 6000) % settings.teasers.length];

  return (
    <div
      className="fixed inset-0 z-[60] overflow-hidden"
      style={
        {
          "--rib-h": "clamp(10.5rem, 34svh, 21rem)",
          "--rib-w": "clamp(2.6rem, 7vw, 6.5rem)",
          "--knot": "calc(var(--rib-w) * 1.5)",
        } as React.CSSProperties
      }
    >
      {/* the two halves of the paper */}
      {(["left", "right"] as const).map((side) => (
        <motion.div key={side} className="absolute inset-0 will-change-transform" {...half(side)}>
          <Paper />
          <motion.div
            aria-hidden
            className={`absolute inset-y-0 w-10 ${
              side === "left"
                ? "right-1/2 bg-gradient-to-r from-transparent to-[rgb(4_5_70/0.4)]"
                : "left-1/2 bg-gradient-to-l from-transparent to-[rgb(4_5_70/0.4)]"
            }`}
            animate={{ opacity: opening ? 1 : 0 }}
            transition={{ duration: 0.3 }}
          />
        </motion.div>
      ))}

      {/* the cut */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 left-1/2 z-10 w-[3px] -translate-x-1/2 bg-white"
        style={{ boxShadow: "0 0 36px 14px rgb(255 255 255 / 0.9), 0 0 120px 50px rgb(255 217 90 / 0.65)" }}
        initial={{ scaleY: 0, opacity: 0 }}
        animate={opening ? { scaleY: [0, 1, 1], opacity: [0, 1, 0] } : { scaleY: 0, opacity: 0 }}
        transition={{ duration: 0.95, times: [0, 0.3, 1] }}
      />

      {/* everything printed on the ribbon and around it */}
      <motion.div
        className="absolute inset-0 z-20 grid grid-rows-[minmax(0,1fr)_auto_minmax(0,1fr)] px-[clamp(1.1rem,4vw,4rem)] pb-[max(1.1rem,env(safe-area-inset-bottom))] pt-[max(1.1rem,env(safe-area-inset-top))]"
        initial={{ opacity: 0 }}
        animate={{ opacity: opening || loading ? 0 : 1 }}
        transition={{ duration: opening ? 0.25 : 0.7 }}
      >
        <header className="flex items-end pb-[clamp(1rem,4svh,3rem)] max-md:justify-center">
          {/* Desktop: set in the left half, clear of the ribbon. Mobile: a gift tag laid over it. */}
          <h1 className="display text-balance text-[clamp(2.1rem,4.9vw,5rem)] text-milk max-md:-rotate-1 max-md:rounded-2xl max-md:bg-ink max-md:px-5 max-md:py-4 max-md:text-center max-md:shadow-[0_14px_28px_rgb(4_5_70/0.4)] md:max-w-[calc(50vw-var(--rib-w)/2-clamp(1.1rem,4vw,4rem)-1.5rem)]">
            {askToOpen ? `Go on, ${name}. It's yours.` : `Something is wrapped up for ${name}.`}
          </h1>
        </header>

        <div
          className="relative grid grid-cols-[1fr_1fr_var(--knot)_1fr_1fr] items-center text-ink"
          style={{ height: "var(--rib-h)" }}
          role={counting ? "timer" : undefined}
          aria-label={
            counting
              ? `${parts.days} days, ${parts.hours} hours, ${parts.minutes} minutes and ${parts.seconds} seconds to go`
              : undefined
          }
        >
          {askToOpen ? (
            <>
              <p className="poster col-span-2 pr-[3%] text-right text-[clamp(1.8rem,9.5vw,9.5rem)]">It&rsquo;s time</p>
              <span aria-hidden />
              <p className="poster col-span-2 pl-[3%] text-[clamp(1.8rem,9.5vw,9.5rem)]">{name}</p>
            </>
          ) : (
            <>
              <Unit value={parts.days} label={parts.days === 1 ? "day" : "days"} pad={parts.days > 99 ? 3 : 2} />
              <Unit value={parts.hours} label={parts.hours === 1 ? "hour" : "hours"} />
              <span aria-hidden />
              <Unit value={parts.minutes} label={parts.minutes === 1 ? "minute" : "minutes"} />
              <Unit value={parts.seconds} label={parts.seconds === 1 ? "second" : "seconds"} />
            </>
          )}

          {askToOpen && (
            <button
              type="button"
              onClick={handleKnot}
              aria-label="Unwrap your gift"
              className="group absolute left-1/2 top-1/2 z-10 grid -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-ink text-butter shadow-[0_14px_30px_rgb(4_5_70/0.55)] transition-transform hover:scale-105 active:scale-95"
              style={{ width: "max(calc(var(--knot) * 1.1), 4.2rem)", height: "max(calc(var(--knot) * 1.1), 4.2rem)" }}
            >
              <span aria-hidden className="pulse-ring absolute inset-0 rounded-full border-2 border-ink" />
              <span className="display text-[clamp(0.8rem,1.4vw,1.15rem)]">Unwrap</span>
            </button>
          )}
        </div>

        <footer className="mt-[clamp(1rem,4svh,3rem)] flex flex-col justify-start gap-5 self-start max-md:rounded-2xl max-md:bg-ink max-md:p-5 max-md:shadow-[0_14px_28px_rgb(4_5_70/0.4)] md:flex-row md:items-start md:justify-between md:self-auto">
          <div className="min-h-[4.5rem] max-w-md">
            {!askToOpen && !loading && (
              <p className="display text-[clamp(1rem,1.5vw,1.3rem)] text-milk">
                Opens {dateFmt.format(target)} at {timeFmt.format(target)}
              </p>
            )}
            {askToOpen && (
              <p className="voice text-[clamp(1.3rem,2.2vw,1.9rem)] text-milk">
                Tap the knot when you&rsquo;re ready.
              </p>
            )}
            {!askToOpen && !loading && (
              <AnimatePresence mode="wait" initial={false}>
                <motion.p
                  key={teaser}
                  className="voice mt-1 text-[clamp(1.25rem,2.2vw,1.9rem)] text-ribbon"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.4 }}
                >
                  {teaser}
                </motion.p>
              </AnimatePresence>
            )}
          </div>

          <button
            type="button"
            onClick={party.toggleSound}
            aria-pressed={party.soundOn}
            aria-label={party.soundOn ? "Mute music after unwrap" : "Play music after unwrap"}
            className="display inline-flex w-fit items-center gap-2.5 rounded-full border-2 border-milk/70 px-5 py-3 text-base text-milk transition-colors hover:bg-milk hover:text-cobalt"
          >
            {party.soundOn ? <Volume2 size={20} aria-hidden /> : <VolumeX size={20} aria-hidden />}
            {party.soundOn ? "Music on after unwrap" : "Music muted"}
          </button>
        </footer>
      </motion.div>

      {/* the last ten seconds */}
      <AnimatePresence>
        {finalSeconds !== null && !opening && <FinalCount key="final" seconds={finalSeconds} name={name} />}
      </AnimatePresence>
    </div>
  );
}

function Unit({ value, label, pad = 2 }: { value: number; label: string; pad?: number }) {
  return (
    <div className="flex flex-col items-center">
      <Rolling value={value} pad={pad} className="poster tnum text-[clamp(2.7rem,min(12vw,25svh),12rem)]" />
      <span className="voice mt-[0.15em] text-[clamp(1rem,1.9vw,1.9rem)] text-ink/80">{label}</span>
    </div>
  );
}
