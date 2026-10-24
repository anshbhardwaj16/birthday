"use client";

import { useRef } from "react";
import { motion, useInView, useScroll, useSpring } from "framer-motion";
import Section, { H2 } from "./Section";
import { content } from "@/config/content";

function Entry({ item }: { item: (typeof content.story)[number] }) {
  const ref = useRef<HTMLLIElement>(null);
  const reached = useInView(ref, { once: true, margin: "0px 0px -45% 0px" });

  return (
    <li ref={ref} className="relative">
      <motion.span
        aria-hidden
        className="absolute -left-[2.2rem] top-[0.9rem] size-5 rounded-full border-[3px] border-ink sm:-left-[3.2rem]"
        animate={{ backgroundColor: reached ? "#0f1033" : "#ffb6cf", scale: reached ? 1.25 : 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 14 }}
      />
      <p className="poster text-[clamp(3.6rem,8.4vw,7.4rem)] text-cobalt">{item.year}</p>
      <h3 className="display mt-3 text-[clamp(1.7rem,3.2vw,2.6rem)]">{item.title}</h3>
      <p className="voice mt-3 max-w-[30ch] text-[clamp(1.3rem,2.3vw,1.85rem)]">{item.text}</p>
    </li>
  );
}

export default function Story() {
  const trackRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: trackRef,
    offset: ["start 65%", "end 60%"],
  });
  const scaleY = useSpring(scrollYProgress, { stiffness: 120, damping: 26, mass: 0.3 });

  return (
    <Section id="story" className="bg-ribbon" innerClassName="grid gap-14 lg:grid-cols-[0.8fr_1.2fr]">
      <div className="lg:sticky lg:top-24 lg:self-start">
        <h2 className={H2}>How we got here.</h2>
        <p className="voice mt-6 max-w-[20ch] text-[clamp(1.5rem,2.6vw,2.2rem)]">
          A few chapters, in order.
        </p>
      </div>

      <div ref={trackRef} className="relative pl-9 sm:pl-14">
        <div aria-hidden className="absolute bottom-2 left-0 top-2 w-[3px] bg-ink/15" />
        <motion.div
          aria-hidden
          className="absolute bottom-2 left-0 top-2 w-[3px] origin-top bg-ink"
          style={{ scaleY }}
        />
        <ol className="space-y-[clamp(3.5rem,8vw,7rem)]">
          {content.story.map((item) => (
            <Entry key={item.year + item.title} item={item} />
          ))}
        </ol>
      </div>
    </Section>
  );
}
