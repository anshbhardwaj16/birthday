"use client";

import { RotateCcw } from "lucide-react";
import { useReducedMotion } from "framer-motion";
import Section from "./Section";
import { useParty } from "../PartyProvider";
import { content } from "@/config/content";
import { settings } from "@/config/settings";
import { ordinal, turningAge } from "@/lib/dates";
import { assetPath } from "@/lib/paths";

export default function Footer({ onReplay }: { onReplay: () => void }) {
  const party = useParty();
  const reduceMotion = useReducedMotion();

  return (
    <Section className="relative isolate overflow-hidden bg-ink text-milk" innerClassName="relative">
      <video
        aria-hidden="true"
        className="absolute inset-0 z-0 size-full object-cover"
        src={assetPath("/media/video/2-landscape.mp4")}
        autoPlay={!reduceMotion}
        muted
        loop
        playsInline
        preload="metadata"
        tabIndex={-1}
      />
      <div aria-hidden="true" className="absolute inset-0 z-0 bg-ink/65" />
      <div className="relative z-10">
        <h2 className="poster max-w-[9ch] text-[clamp(4.2rem,14vw,13rem)]">{content.footer.title}</h2>
        <p className="voice mt-10 max-w-[24ch] text-[clamp(1.6rem,3.2vw,2.8rem)]">{content.footer.text}</p>

        <div className="mt-14 flex flex-wrap items-end justify-between gap-8">
          <p className="voice text-[clamp(2.2rem,5vw,3.6rem)]">With love, {settings.from}</p>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => {
                party.cannons();
                party.fireworks(3);
                party.sfx("fanfare");
              }}
              className="display rounded-full bg-ribbon px-6 py-4 text-lg text-ink transition-transform hover:scale-105 active:scale-95"
            >
              One last confetti
            </button>
            <button
              type="button"
              onClick={onReplay}
              className="display inline-flex items-center gap-2.5 rounded-full border-2 border-milk px-6 py-4 text-lg transition-colors hover:bg-milk hover:text-ink"
            >
              <RotateCcw size={20} aria-hidden />
              Wrap it back up
            </button>
          </div>
        </div>

        <p className="display mt-16 text-base text-milk/70">
          Made by hand for {settings.name}&rsquo;s {ordinal(turningAge)} birthday.
        </p>
      </div>
    </Section>
  );
}
