"use client";

import Hero from "./Hero";
import Marquee from "./Marquee";
import Controls from "./Controls";
import Letter from "./Letter";
import Numbers from "./Numbers";
import Story from "./Story";
import Moments from "./Moments";
import Reasons from "./Reasons";
import Wishes from "./Wishes";
import { VideoMessage } from "./videomessage";
import { Collage } from "./collage";
import Cake from "./Cake";
import BalloonGame from "./BalloonGame";
import Gift from "./Gift";
import Footer from "./Footer";
import Sparkle from "../art/Sparkle";
import { settings } from "@/config/settings";

/** Everything the birthday person sees once the wrapping comes off. */
export default function Site({ onReplay, revealed }: { onReplay: () => void; revealed: boolean }) {
  return (
    <div className="relative bg-ink">
      <Controls />
      <Hero revealed={revealed} />

      <div aria-hidden className="overflow-hidden bg-cobalt py-4 text-milk">
        <Marquee duration={38}>
          {Array.from({ length: 6 }, (_, i) => (
            <span
              key={i}
              className="poster flex items-center gap-8 whitespace-nowrap pr-8 text-[clamp(2.2rem,4.6vw,4.2rem)]"
            >
              Happy birthday, {settings.name}
              <Sparkle className="size-[0.55em] text-butter" />
            </span>
          ))}
        </Marquee>
      </div>

      <Letter />
      <Numbers />
      <Story />
      <Moments />
      <Reasons />
      <Wishes />
      <VideoMessage />
      <Collage />
      <Cake />
      <BalloonGame />
      <Gift />
      <Footer onReplay={onReplay} />
    </div>
  );
}
