"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { PartyPopper } from "lucide-react";
import Balloon from "../art/Balloon";
import { useParty } from "../PartyProvider";
import { settings } from "@/config/settings";
import { content } from "@/config/content";
import { turningAge } from "@/lib/dates";
import { assetPath } from "@/lib/paths";

const LINES = ["Happy", "Birthday", settings.name];
const LONGEST = Math.max(...LINES.map((l) => l.length));
// Size the poster so the longest line always fits the width, and the three lines fit the height.
const POSTER_SIZE = `clamp(3.4rem, min(calc(94vw / ${(LONGEST * 0.4).toFixed(2)}), 21svh), 17rem)`;

// A bouquet that fills the empty right-hand side next to the poster type.
const BALLOONS = [
  { color: "#2b35e8", left: "49%", top: "10%", width: "clamp(3.4rem,8vw,7.6rem)", delay: 0.2, drift: 7 },
  { color: "#ff6a2b", left: "62%", top: "33%", width: "clamp(3rem,7vw,6.4rem)", delay: 0.35, drift: 5.4 },
  { color: "#ffb6cf", left: "70%", top: "5%", width: "clamp(2.8rem,6vw,5.4rem)", delay: 0.5, drift: 6.2 },
  { color: "#f7f5ff", left: "88%", top: "46%", width: "clamp(3rem,6.4vw,5.8rem)", delay: 0.3, drift: 6.8 },
  { color: "#2b35e8", left: "76%", top: "48%", width: "clamp(2.8rem,5.4vw,4.8rem)", delay: 0.55, drift: 5.8 },
  { color: "#ff6a2b", left: "36%", top: "3%", width: "clamp(2.4rem,4.4vw,4rem)", delay: 0.65, drift: 6.4 },
];

function HeroBalloon({
  b,
  index,
  revealed,
}: {
  b: (typeof BALLOONS)[number];
  index: number;
  revealed: boolean;
}) {
  const party = useParty();
  const [popped, setPopped] = useState(false);

  // Blow it back up a few seconds after it pops.
  useEffect(() => {
    if (!popped) return;
    const id = window.setTimeout(() => setPopped(false), 3600);
    return () => clearTimeout(id);
  }, [popped]);

  return (
    <motion.button
      type="button"
      aria-label="Pop the balloon"
      className="absolute z-20 cursor-pointer"
      style={{ left: b.left, top: b.top, width: b.width }}
      initial={{ y: "115svh" }}
      animate={
        popped
          ? { scale: 0, opacity: 0 }
          : revealed
            ? { y: 0, scale: 1, opacity: 1 }
            : { y: "115svh", scale: 1, opacity: 1 }
      }
      transition={
        popped
          ? { duration: 0.12 }
          : revealed
            ? { type: "spring", stiffness: 36, damping: 13, delay: b.delay }
            : { duration: 0 }
      }
      onClick={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        party.burst(r.left + r.width / 2, r.top + r.height * 0.35, { count: 36, power: 8 });
        party.sfx("pop");
        setPopped(true);
      }}
    >
      <motion.span
        className="block"
        animate={{ y: [0, -14, 0], rotate: [-3, 3, -3] }}
        transition={{ duration: b.drift, repeat: Infinity, ease: "easeInOut", delay: index * 0.4 }}
      >
        <Balloon color={b.color} className="block w-full drop-shadow-[0_10px_14px_rgb(15_16_51/0.22)]" />
      </motion.span>
    </motion.button>
  );
}

function AgeSeal({ revealed }: { revealed: boolean }) {
  return (
    <motion.div
      className="absolute right-[clamp(1rem,5vw,5rem)] top-[clamp(4.6rem,14vh,9rem)] z-10 grid size-[clamp(6.2rem,12vw,10.5rem)] place-items-center rounded-full bg-cobalt text-butter shadow-[0_18px_34px_rgb(15_16_51/0.28)]"
      initial={{ scale: 0, rotate: -40 }}
      animate={revealed ? { scale: 1, rotate: 0 } : { scale: 0, rotate: -40 }}
      transition={revealed ? { type: "spring", stiffness: 120, damping: 12, delay: 1.1 } : { duration: 0 }}
    >
      <svg viewBox="0 0 200 200" className="spin-slow absolute inset-0 size-full" aria-hidden>
        <defs>
          <path id="seal-ring" d="M100 100m-77 0a77 77 0 1 1 154 0a77 77 0 1 1-154 0" />
        </defs>
        <text
          fontSize="22"
          fontWeight="700"
          fill="currentColor"
          style={{ fontFamily: "var(--font-display)" }}
        >
          <textPath href="#seal-ring" textLength="478" lengthAdjust="spacing">
            Happy birthday ✦ Happy birthday ✦{" "}
          </textPath>
        </text>
      </svg>
      <span className="poster text-[clamp(2.3rem,5.4vw,4.6rem)]">{turningAge}</span>
    </motion.div>
  );
}

export default function Hero({ revealed }: { revealed: boolean }) {
  const party = useParty();
  const [introDone, setIntroDone] = useState(false);

  // When the site is re-wrapped, the entrance should be able to play again.
  const [wasRevealed, setWasRevealed] = useState(revealed);
  if (wasRevealed !== revealed) {
    setWasRevealed(revealed);
    if (!revealed) setIntroDone(false);
  }

  return (
    <section
      id="top"
      className="relative isolate flex min-h-[100svh] flex-col overflow-hidden px-[clamp(1.1rem,4vw,4rem)] pb-[clamp(1.5rem,4vw,3rem)] pt-24 text-ink"
      style={{
        backgroundImage:
          `linear-gradient(0deg, rgb(255 217 90 / 0.96) 0%, rgb(255 217 90 / 0.72) 27%, rgb(255 217 90 / 0.12) 68%, rgb(255 217 90 / 0.08) 100%), url('${assetPath("/media/photos/IMG-20261028-WA0015.jpg")}')`,
        backgroundPosition: "center 38%",
        backgroundSize: "cover",
      }}
    >
      {BALLOONS.map((b, i) => (
        <HeroBalloon key={i} b={b} index={i} revealed={revealed} />
      ))}
      <AgeSeal revealed={revealed} />

      <div className="relative z-10 mt-auto">
        <h1 aria-label={`Happy Birthday ${settings.name}`} className="poster" style={{ fontSize: POSTER_SIZE }}>
          {LINES.map((line, li) => (
            <span
              key={li}
              aria-hidden
              className={`-my-[0.04em] block py-[0.04em] pb-[0.1em] ${introDone && revealed ? "overflow-visible" : "overflow-hidden"}`}
            >
              {line.split("").map((ch, i) => (
                <motion.span
                  key={i}
                  className="inline-block cursor-pointer select-none"
                  initial={{ y: "115%", rotate: 7 }}
                  animate={revealed ? { y: "0%", rotate: 0 } : { y: "115%", rotate: 7 }}
                  transition={
                    revealed
                      ? { delay: 0.1 + (li * 7 + i) * 0.04, duration: 0.85, ease: [0.2, 0.85, 0.2, 1] }
                      : { duration: 0 }
                  }
                  whileHover={{
                    y: "-6%",
                    rotate: i % 2 ? 3 : -3,
                    transition: { type: "spring", stiffness: 420, damping: 14 },
                  }}
                  onAnimationComplete={() => {
                    if (revealed && li === LINES.length - 1 && i === line.length - 1) setIntroDone(true);
                  }}
                  onClick={(e) => {
                    const r = e.currentTarget.getBoundingClientRect();
                    party.burst(r.left + r.width / 2, r.top + r.height / 2, { count: 26, power: 7 });
                    party.sfx("chime", li * 3 + i);
                  }}
                >
                  {ch === " " ? " " : ch}
                </motion.span>
              ))}
            </span>
          ))}
        </h1>

        <motion.div
          className="mt-[clamp(1.5rem,4vh,2.75rem)] flex flex-col gap-6 md:flex-row md:items-end md:justify-between md:pr-[4.5rem]"
          initial={{ opacity: 0, y: 18 }}
          animate={revealed ? { opacity: 1, y: 0 } : { opacity: 0, y: 18 }}
          transition={revealed ? { delay: 0.9, duration: 0.8 } : { duration: 0 }}
        >
          <p className="voice max-w-[24ch] text-[clamp(1.5rem,2.8vw,2.5rem)]">{content.tagline}</p>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => {
                party.cannons();
                party.sfx("pop");
              }}
              className="display inline-flex items-center gap-2.5 rounded-full bg-ink px-6 py-4 text-lg text-butter transition-transform hover:scale-105 active:scale-95"
            >
              <PartyPopper size={22} aria-hidden />
              Pop the confetti
            </button>
            <a
              href="#letter"
              className="display inline-flex items-center rounded-full border-2 border-ink px-6 py-4 text-lg transition-colors hover:bg-ink hover:text-butter"
            >
              Open your letter
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
