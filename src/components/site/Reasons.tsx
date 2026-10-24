"use client";

import { useEffect, useEffectEvent, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Coffee, Crown, Flame, Gem, Heart, Music, Rocket, Smile, Sparkles, Star, Sun, Zap } from "lucide-react";
import Section, { H2 } from "./Section";
import { useParty } from "../PartyProvider";
import { content } from "@/config/content";

const ICONS = [Heart, Sparkles, Smile, Sun, Zap, Music, Coffee, Flame, Gem, Crown, Rocket, Star];

// Each sticker gets its own colour, die-cut shape and tilt, like a sheet of stickers.
const STICKERS = [
  { bg: "bg-cobalt", fg: "text-milk", shape: "rounded-full", tilt: -3 },
  { bg: "bg-ribbon", fg: "text-ink", shape: "rounded-[2.4rem]", tilt: 2.5 },
  { bg: "bg-butter", fg: "text-ink", shape: "rounded-[42%_58%_52%_48%/50%_44%_56%_50%]", tilt: -1.5 },
  { bg: "bg-tangerine", fg: "text-ink", shape: "rounded-full", tilt: 3 },
  { bg: "bg-ink", fg: "text-butter", shape: "rounded-[2.4rem]", tilt: -2.5 },
  { bg: "bg-cobalt-light", fg: "text-milk", shape: "rounded-[50%_50%_46%_46%/64%_64%_36%_36%]", tilt: 1.5 },
];

function Sticker({
  text,
  index,
  flipped,
  onFlip,
}: {
  text: string;
  index: number;
  flipped: boolean;
  onFlip: () => void;
}) {
  const s = STICKERS[index % STICKERS.length];
  const Icon = ICONS[index % ICONS.length];
  const face = `absolute inset-0 grid place-items-center overflow-hidden p-[12%] text-center shadow-[0_14px_22px_-10px_rgb(15_16_51/0.5)] [backface-visibility:hidden] ${s.bg} ${s.fg} ${s.shape}`;

  return (
    <button
      type="button"
      onClick={onFlip}
      aria-pressed={flipped}
      aria-label={flipped ? text : `Reason ${index + 1}. Tap to reveal.`}
      className="group relative aspect-square w-full [perspective:900px]"
      style={{ rotate: `${s.tilt}deg` }}
    >
      <motion.span
        className="absolute inset-0 block [transform-style:preserve-3d]"
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ type: "spring", stiffness: 140, damping: 16 }}
        whileHover={flipped ? undefined : { scale: 1.06 }}
      >
        <span className={face}>
          <Icon className="size-[34%]" strokeWidth={1.6} aria-hidden />
        </span>
        <span className={`${face} [transform:rotateY(180deg)]`}>
          <span className="voice text-[clamp(1.05rem,1.75vw,1.45rem)] leading-[1.15] text-balance">{text}</span>
        </span>
      </motion.span>
    </button>
  );
}

export default function Reasons() {
  const party = useParty();
  const reasons = content.reasons;
  // `flipped` is what's showing a reason right now; `seen` remembers every sticker turned at least once.
  const [flipped, setFlipped] = useState<ReadonlySet<number>>(new Set());
  const [seen, setSeen] = useState<ReadonlySet<number>>(new Set());
  const celebrated = seen.size === reasons.length;

  const celebrate = useEffectEvent(() => {
    party.cannons();
    party.sfx("win");
  });
  useEffect(() => {
    if (celebrated) celebrate();
  }, [celebrated]);

  const handleFlip = (i: number) => {
    party.sfx("flip", i);
    setFlipped((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
    setSeen((prev) => new Set(prev).add(i));
  };

  return (
    <Section id="reasons" className="bg-milk">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <h2 className={H2}>{reasons.length} reasons, to start with.</h2>
          <p className="voice mt-6 text-[clamp(1.5rem,2.6vw,2.2rem)] text-ink/80">Tap a sticker to flip it.</p>
        </div>
        <p className="display rounded-full border-2 border-ink px-5 py-3 text-lg tnum" aria-live="polite">
          {seen.size} of {reasons.length} found
        </p>
      </div>

      <div className="mt-[clamp(2.5rem,6vw,5rem)] grid grid-cols-2 gap-[clamp(1rem,2.4vw,2.25rem)] sm:grid-cols-3 lg:grid-cols-4">
        {reasons.map((text, i) => (
          <Sticker key={i} text={text} index={i} flipped={flipped.has(i)} onFlip={() => handleFlip(i)} />
        ))}
      </div>

      <AnimatePresence>
        {celebrated && (
          <motion.p
            className="poster mt-[clamp(2.5rem,6vw,5rem)] text-[clamp(2.4rem,6vw,5rem)] text-cobalt"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            &hellip;and about a million more.
          </motion.p>
        )}
      </AnimatePresence>
    </Section>
  );
}
