"use client";

import { useEffect, useEffectEvent, useRef, useState } from "react";
import Balloon from "../art/Balloon";
import Sparkle from "../art/Sparkle";
import Section, { H2 } from "./Section";
import { useParty } from "../PartyProvider";

const DURATION = 30;
const BEST_KEY = "birthday-balloon-best";
const COLORS = ["#ffb6cf", "#ffd95a", "#ff6a2b", "#f7f5ff", "#5f68ff"];

type Floater = {
  id: number;
  x: number;
  size: number;
  color: string;
  duration: number;
  drift: number;
  gold: boolean;
};

const rand = (a: number, b: number) => a + Math.random() * (b - a);

function verdict(score: number) {
  if (score >= 45) return "Absolute legend.";
  if (score >= 30) return "Balloon assassin.";
  if (score >= 18) return "Not bad at all.";
  if (score >= 8) return "A decent warm-up.";
  return "They got away. Try again?";
}

export default function BalloonGame() {
  const party = useParty();
  const [status, setStatus] = useState<"idle" | "playing" | "over">("idle");
  const [score, setScore] = useState(0);
  const [time, setTime] = useState(DURATION);
  const [floaters, setFloaters] = useState<Floater[]>([]);
  const [newBest, setNewBest] = useState(false);
  const [best, setBest] = useState(() => {
    try {
      return Number(localStorage.getItem(BEST_KEY)) || 0;
    } catch {
      return 0;
    }
  });
  const scoreRef = useRef(0);
  const idRef = useRef(0);

  const finish = useEffectEvent(() => {
    setStatus("over");
    setFloaters([]);
    const final = scoreRef.current;
    if (final > best) {
      setBest(final);
      setNewBest(true);
      try {
        localStorage.setItem(BEST_KEY, String(final));
      } catch {
        // Private mode: the high score just won't be remembered.
      }
      party.cannons();
      party.sfx("win");
    } else {
      party.sfx("chime", 2);
    }
  });

  useEffect(() => {
    if (status !== "playing") return;
    let left = DURATION;
    const clock = window.setInterval(() => {
      left -= 1;
      setTime(left);
      if (left <= 0) {
        window.clearInterval(clock);
        window.clearInterval(spawn);
        finish();
      }
    }, 1000);
    const spawn = window.setInterval(() => {
      const gold = Math.random() < 0.09;
      const next: Floater = {
        id: idRef.current++,
        x: rand(3, 86),
        size: rand(3.6, 5.8),
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        duration: rand(4.2, 7.2) * (gold ? 0.75 : 1),
        drift: rand(-40, 40),
        gold,
      };
      setFloaters((list) => [...list.slice(-30), next]);
    }, 470);
    return () => {
      window.clearInterval(clock);
      window.clearInterval(spawn);
    };
  }, [status]);

  const start = () => {
    scoreRef.current = 0;
    setScore(0);
    setTime(DURATION);
    setFloaters([]);
    setNewBest(false);
    setStatus("playing");
  };

  const pop = (f: Floater, e: React.PointerEvent) => {
    e.preventDefault();
    setFloaters((list) => list.filter((x) => x.id !== f.id));
    scoreRef.current += f.gold ? 5 : 1;
    setScore(scoreRef.current);
    party.burst(e.clientX, e.clientY, { count: f.gold ? 54 : 20, power: f.gold ? 11 : 7 });
    party.sfx("pop");
  };

  return (
    <Section id="game" className="paper grain overflow-hidden text-milk">
      <div className="relative z-10 flex flex-wrap items-end justify-between gap-6">
        <div>
          <h2 className={H2}>Pop them all.</h2>
          <p className="voice mt-6 max-w-[26ch] text-[clamp(1.5rem,2.6vw,2.2rem)] text-milk/85">
            Thirty seconds. Gold balloons are worth five.
          </p>
        </div>
      </div>

      <div
        className="relative z-10 mt-12 h-[min(72svh,40rem)] touch-manipulation select-none overflow-hidden rounded-[clamp(1.5rem,3vw,2.5rem)] border-2 border-milk/40 bg-cobalt-deep/70 [container-type:size]"
      >
        {floaters.map((f) => (
          <div
            key={f.id}
            className="balloon-rise absolute cursor-pointer"
            style={
              {
                left: `${f.x}%`,
                bottom: "-12rem",
                width: `${f.size}rem`,
                "--duration": `${f.duration}s`,
                "--drift": `${f.drift}px`,
                "--rise": "calc(100cqh + 14rem)",
              } as React.CSSProperties
            }
            onPointerDown={(e) => pop(f, e)}
            onAnimationEnd={() => setFloaters((list) => list.filter((x) => x.id !== f.id))}
          >
            <Balloon color={f.gold ? "#ffd95a" : f.color} className="block w-full" />
            {f.gold && (
              <Sparkle className="absolute -right-1 top-0 size-[28%] animate-pulse text-milk" />
            )}
          </div>
        ))}

        {status === "playing" && (
          <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex items-start justify-between p-[clamp(1rem,2.5vw,1.75rem)]">
            <p className="poster tnum text-[clamp(2.4rem,5vw,4rem)]" aria-live="off">
              {score}
            </p>
            <p className="poster tnum text-[clamp(2.4rem,5vw,4rem)]" aria-label={`${time} seconds left`}>
              {time}s
            </p>
          </div>
        )}

        {status !== "playing" && (
          <div className="absolute inset-0 z-20 grid place-items-center p-6 text-center">
            <div>
              {status === "over" ? (
                <>
                  <p className="voice text-[clamp(1.6rem,3vw,2.4rem)]">{verdict(score)}</p>
                  <p className="poster mt-2 text-[clamp(4.5rem,13vw,10rem)] text-butter">{score}</p>
                  <p className="voice mt-2 text-[clamp(1.3rem,2.2vw,1.8rem)] text-milk/85">
                    {newBest ? "That's a new personal best." : `Personal best: ${best}`}
                  </p>
                </>
              ) : (
                <p className="poster text-[clamp(3rem,9vw,7rem)]">Ready?</p>
              )}
              <button
                type="button"
                onClick={start}
                className="display mt-7 rounded-full bg-butter px-8 py-4 text-xl text-ink transition-transform hover:scale-105 active:scale-95"
              >
                {status === "over" ? "Play again" : "Start"}
              </button>
              {status === "idle" && best > 0 && (
                <p className="voice mt-4 text-xl text-milk/80">Personal best: {best}</p>
              )}
            </div>
          </div>
        )}
      </div>
    </Section>
  );
}
