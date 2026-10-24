"use client";

import { useEffect, useRef } from "react";
import { animate, useInView, useMotionValue, useTransform, motion } from "framer-motion";
import Section, { H2 } from "./Section";
import { Rolling } from "../Rolling";
import { useNow } from "@/lib/clock";
import { birthMs } from "@/lib/dates";
import { birthProfile, lifeStats } from "@/lib/astro";

const profile = birthProfile(birthMs);
const nf = new Intl.NumberFormat("en-US");

/** Counts up from zero the first time it scrolls into view. */
function CountUp({ value, decimals = 0 }: { value: number; decimals?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -15% 0px" });
  const mv = useMotionValue(0);
  const text = useTransform(mv, (v) =>
    decimals ? v.toFixed(decimals) : nf.format(Math.round(v)),
  );

  useEffect(() => {
    if (!inView) return;
    const controls = animate(mv, value, { duration: 2.2, ease: [0.16, 1, 0.3, 1] });
    return () => controls.stop();
  }, [inView, value, mv]);

  return (
    <motion.span ref={ref} className="tnum">
      {text}
    </motion.span>
  );
}

export default function Numbers() {
  const now = useNow();
  const stats = lifeStats(birthMs, now || birthMs);

  const rows: { label: string; value: number; decimals?: number }[] = [
    { label: "heartbeats, give or take", value: stats.heartbeats },
    { label: "breaths, most of them unnoticed", value: stats.breaths },
    { label: "hours of sleep, which is a lot of dreaming", value: stats.sleepHours },
    { label: "full moons overhead", value: stats.fullMoons },
    { label: "laps around the sun", value: Number(stats.orbits.toFixed(2)), decimals: 2 },
    { label: "kilometres travelled along the way", value: stats.kmAroundSun },
  ];

  return (
    <Section id="numbers" className="bg-ink text-milk">
      <h2 className={H2}>Your life so far, in numbers.</h2>

      <div className="mt-[clamp(3rem,7vw,6rem)]">
        <p className="voice text-[clamp(1.5rem,2.8vw,2.4rem)] text-milk/80">You have been alive for</p>
        <p
          className="poster mt-2 text-butter"
          style={{ fontSize: "clamp(2.4rem, min(17.5vw, 11.5rem), 11.5rem)" }}
          role="img"
          aria-label={`${nf.format(stats.seconds)} seconds`}
        >
          <Rolling value={stats.seconds} grouped />
        </p>
        <p className="voice mt-2 text-[clamp(1.5rem,2.8vw,2.4rem)] text-milk/80">
          seconds, and still counting.
        </p>
      </div>

      <dl className="mt-[clamp(3.5rem,8vw,7rem)] divide-y divide-milk/15 border-y border-milk/15">
        {rows.map((row) => (
          <div
            key={row.label}
            className="grid grid-cols-1 items-baseline gap-x-8 gap-y-1 py-6 sm:grid-cols-[1fr_auto] sm:py-8"
          >
            <dt className="voice order-2 text-[clamp(1.25rem,2.3vw,2rem)] text-milk/80 sm:order-1">
              {row.label}
            </dt>
            <dd className="poster order-1 text-[clamp(2.4rem,6vw,5.4rem)] sm:order-2 sm:text-right">
              <CountUp value={row.value} decimals={row.decimals} />
            </dd>
          </div>
        ))}
      </dl>
      <p className="voice mt-5 text-lg text-milk/60">
        All of it rounded off from averages. Your heart may beat to its own tune.
      </p>

      <div className="mt-[clamp(4rem,9vw,8rem)] grid items-center gap-10 lg:grid-cols-[1fr_1.15fr]">
        <div className="flex items-center gap-[clamp(1rem,3vw,2.5rem)]">
          <span aria-hidden className="poster text-[clamp(7rem,17vw,14rem)] leading-none text-ribbon">
            {profile.sign.glyph}
          </span>
          <div>
            <h3 className="display text-[clamp(2.2rem,5vw,3.8rem)]">{profile.sign.name}</h3>
            <p className="voice mt-2 max-w-[18ch] text-[clamp(1.25rem,2.2vw,1.8rem)] text-milk/80">
              {profile.sign.trait}
            </p>
          </div>
        </div>

        <dl className="grid grid-cols-3 gap-x-4 gap-y-6 border-t border-milk/15 pt-6 lg:border-l lg:border-t-0 lg:pl-10 lg:pt-0">
          {[
            ["Born on a", profile.weekday],
            ["Birthstone", profile.stone],
            ["Birth flower", profile.flower],
          ].map(([label, value]) => (
            <div key={label}>
              <dt className="voice text-[clamp(1.05rem,1.8vw,1.4rem)] text-milk/70">{label}</dt>
              <dd className="display mt-1 text-[clamp(1.25rem,2.6vw,2.2rem)] text-butter">{value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </Section>
  );
}
