"use client";

import { motion, useScroll, useSpring } from "framer-motion";
import { PartyPopper, Volume2, VolumeX } from "lucide-react";
import { useParty } from "../PartyProvider";

function RoundButton({
  label,
  onClick,
  pressed,
  children,
}: {
  label: string;
  onClick: () => void;
  pressed?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={pressed}
      title={label}
      onClick={onClick}
      className="grid size-12 place-items-center rounded-full bg-ink text-milk shadow-[0_8px_22px_rgb(15_16_51/0.35)] ring-2 ring-milk transition-transform hover:scale-110 active:scale-95"
    >
      {children}
    </button>
  );
}

/** Reading progress along the top, plus the always-there sound and confetti buttons. */
export default function Controls() {
  const party = useParty();
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 140, damping: 28, mass: 0.4 });

  return (
    <>
      <motion.div
        aria-hidden
        className="fixed inset-x-0 top-0 z-50 h-1.5 origin-left bg-white mix-blend-difference"
        style={{ scaleX }}
      />
      <div className="fixed bottom-[max(1rem,env(safe-area-inset-bottom))] right-[max(1rem,env(safe-area-inset-right))] z-50 flex flex-col gap-3">
        <RoundButton
          label={party.soundOn ? "Mute the music" : "Play the music"}
          pressed={party.soundOn}
          onClick={party.toggleSound}
        >
          {party.soundOn ? <Volume2 size={22} aria-hidden /> : <VolumeX size={22} aria-hidden />}
        </RoundButton>
        <RoundButton
          label="Throw confetti"
          onClick={() => {
            party.cannons();
            party.sfx("pop");
          }}
        >
          <PartyPopper size={22} aria-hidden />
        </RoundButton>
      </div>
    </>
  );
}
