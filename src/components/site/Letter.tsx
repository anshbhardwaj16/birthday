"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Heart } from "lucide-react";
import Section, { H2 } from "./Section";
import { useParty } from "../PartyProvider";
import { content } from "@/config/content";
import { settings } from "@/config/settings";

type Stage = "sealed" | "opening" | "open";

function Envelope({ opening, onOpen }: { opening: boolean; onOpen: (e: React.MouseEvent) => void }) {
  return (
    <motion.button
      type="button"
      onClick={onOpen}
      disabled={opening}
      aria-label="Break the seal and open your letter"
      className="group relative mx-auto block aspect-[3/2] w-full max-w-[34rem] [perspective:1400px]"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 40, scale: 0.96 }}
      transition={{ duration: 0.5 }}
      whileHover={opening ? undefined : { rotate: -1.2, y: -4 }}
    >
      <div className="paper grain absolute inset-0 overflow-hidden rounded-xl shadow-[0_34px_60px_-24px_rgb(15_16_51/0.6)]">
        <svg viewBox="0 0 300 200" preserveAspectRatio="none" className="absolute inset-0 size-full" aria-hidden>
          <path d="M0 200 L150 100 L300 200Z" fill="#1a22b0" />
          <path d="M0 0 L150 104 L0 200Z" fill="#2430d4" />
          <path d="M300 0 L150 104 L300 200Z" fill="#2430d4" />
        </svg>
      </div>

      <motion.div
        aria-hidden
        className="absolute inset-x-0 top-0 h-1/2 origin-top"
        style={{ transformStyle: "preserve-3d" }}
        animate={{ rotateX: opening ? 180 : 0 }}
        transition={{ duration: 0.75, ease: [0.6, 0, 0.2, 1] }}
      >
        <svg viewBox="0 0 300 100" preserveAspectRatio="none" className="size-full drop-shadow-[0_6px_6px_rgb(4_5_70/0.35)]">
          <path d="M0 0 H300 L150 100Z" fill="#4650f2" />
        </svg>
      </motion.div>

      <motion.span
        aria-hidden
        className="absolute left-1/2 top-1/2 grid size-[clamp(4.2rem,15vw,5.8rem)] -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full text-milk"
        style={{
          background: "radial-gradient(circle at 34% 28%, #ff9a6a 0%, #ff6a2b 45%, #d9460f 100%)",
          boxShadow: "0 10px 20px rgb(4 5 70 / 0.5), inset 0 -6px 10px rgb(120 20 0 / 0.4), inset 0 4px 8px rgb(255 255 255 / 0.35)",
        }}
        animate={opening ? { scale: 0, rotate: 40, opacity: 0 } : { scale: 1 }}
        transition={{ duration: 0.4 }}
      >
        <span className="absolute inset-[12%] rounded-full border-2 border-milk/30" />
        <Heart size={26} fill="currentColor" strokeWidth={0} />
      </motion.span>
    </motion.button>
  );
}

function LetterCard({ onReseal }: { onReseal: () => void }) {
  const { letter } = content;
  return (
    <motion.article
      className="relative mx-auto max-w-[40rem] bg-white px-[clamp(1.6rem,5vw,3.5rem)] pb-[clamp(2rem,5vw,3.25rem)] pt-[clamp(2.4rem,5vw,3.75rem)] shadow-[0_40px_70px_-30px_rgb(15_16_51/0.55)]"
      initial={{ opacity: 0, y: 70, rotate: 3 }}
      animate={{ opacity: 1, y: 0, rotate: -1 }}
      transition={{ type: "spring", stiffness: 90, damping: 16 }}
    >
      <span aria-hidden className="absolute -top-3.5 left-1/2 h-8 w-32 -translate-x-1/2 rotate-2 bg-butter/90 shadow-sm" />

      <motion.div
        initial="hidden"
        animate="shown"
        variants={{ shown: { transition: { staggerChildren: 0.45, delayChildren: 0.35 } } }}
      >
        {[
          <p key="g" className="voice text-[clamp(2.2rem,5vw,3.2rem)]">{letter.greeting}</p>,
          ...letter.paragraphs.map((p, i) => (
            <p key={i} className="voice text-[clamp(1.35rem,2.3vw,1.75rem)] leading-[1.4]">
              {p}
            </p>
          )),
          <div key="s">
            <p className="voice text-[clamp(1.35rem,2.3vw,1.75rem)]">{letter.signoff}</p>
            <p className="voice text-[clamp(2.2rem,5vw,3.2rem)]">{settings.from}</p>
          </div>,
        ].map((node, i) => (
          <motion.div
            key={i}
            className={i === 0 ? "" : "mt-5"}
            variants={{ hidden: { opacity: 0, y: 14 }, shown: { opacity: 1, y: 0 } }}
            transition={{ duration: 0.6 }}
          >
            {node}
          </motion.div>
        ))}
      </motion.div>

      <button
        type="button"
        onClick={onReseal}
        className="display mt-8 rounded-full border-2 border-ink px-4 py-2 text-sm transition-colors hover:bg-ink hover:text-milk"
      >
        Fold it back up
      </button>
    </motion.article>
  );
}

export default function Letter() {
  const party = useParty();
  const [stage, setStage] = useState<Stage>("sealed");

  const open = (e: React.MouseEvent) => {
    const r = e.currentTarget.getBoundingClientRect();
    party.burst(r.left + r.width / 2, r.top + r.height / 2, { count: 34, power: 8 });
    party.sfx("chime", 3);
    setStage("opening");
    window.setTimeout(() => setStage("open"), 800);
  };

  return (
    <Section
      id="letter"
      className="relative isolate overflow-hidden"
      innerClassName="relative z-10 grid items-center gap-14 lg:grid-cols-[0.85fr_1.15fr]"
    >
      <div
        aria-hidden
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage:
            "linear-gradient(rgb(247 245 255 / 0.78), rgb(247 245 255 / 0.78)), url('/media/photos/IMG-20261028-WA0013.jpg')",
          backgroundPosition: "90% center",
        }}
      />
      <div>
        <h2 className={H2}>A letter, just for you.</h2>
        <p className="voice mt-6 max-w-[22ch] text-[clamp(1.5rem,2.6vw,2.2rem)] text-ink/80">
          {stage === "open" ? "Take your time. It isn't going anywhere." : "Tap the seal to open it."}
        </p>
      </div>

      <div className="relative">
        <AnimatePresence mode="wait">
          {stage !== "open" ? (
            <Envelope key="envelope" opening={stage === "opening"} onOpen={open} />
          ) : (
            <LetterCard key="letter" onReseal={() => setStage("sealed")} />
          )}
        </AnimatePresence>
      </div>
    </Section>
  );
}
