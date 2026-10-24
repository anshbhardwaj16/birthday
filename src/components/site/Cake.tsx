"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Mic, RotateCcw, Wind } from "lucide-react";
import Section, { H2 } from "./Section";
import { useParty } from "../PartyProvider";

const CANDLES = [
  { x: 168, color: "#2b35e8" },
  { x: 214, color: "#ff6a2b" },
  { x: 260, color: "#2b35e8" },
  { x: 306, color: "#ff6a2b" },
  { x: 352, color: "#2b35e8" },
];
const CANDLE_TOP = 132;

/** Frosting with rounded top corners and drips hanging from the base line. */
function frosting(x0: number, top: number, width: number, n: number, seed: number) {
  const x1 = x0 + width;
  const base = top + 14;
  const w = width / n;
  let d = `M${x0} ${base} Q${x0} ${top} ${x0 + 14} ${top} H${x1 - 14} Q${x1} ${top} ${x1} ${base} `;
  for (let i = 0; i < n; i++) {
    const depth = 8 + ((i * 37 + seed * 17) % 5) * 5 + (i % 3 === 0 ? 9 : 0);
    d += `c0 ${depth} ${-w} ${depth} ${-w} 0 `;
  }
  return `${d}Z`;
}

const SPRINKLES = Array.from({ length: 16 }, (_, i) => ({
  x: 92 + ((i * 53) % 336),
  y: 330 + ((i * 29) % 26),
  r: (i * 47) % 160,
  c: ["#2b35e8", "#ffd95a", "#ff6a2b", "#f7f5ff"][i % 4],
}));

function CakeArt({ lit }: { lit: boolean }) {
  return (
    <svg
      viewBox="0 0 520 420"
      className="mx-auto block w-full max-w-[34rem] overflow-visible"
      role="img"
      aria-label={`A birthday cake with five candles, ${lit ? "all lit" : "all blown out"}`}
    >
      <defs>
        <radialGradient id="flame-glow">
          <stop offset="0" stopColor="#ffd95a" stopOpacity="0.55" />
          <stop offset="1" stopColor="#ffd95a" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="flame-outer" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor="#ff6a2b" />
          <stop offset="1" stopColor="#ffd95a" />
        </linearGradient>
      </defs>

      <ellipse cx="260" cy="396" rx="236" ry="16" fill="#000" opacity="0.35" />
      <ellipse cx="260" cy="374" rx="236" ry="28" fill="#f7f5ff" />
      <ellipse cx="260" cy="372" rx="204" ry="19" fill="#dcd8ff" />

      {/* bottom tier */}
      <rect x="70" y="262" width="380" height="108" rx="20" fill="#ffb6cf" />
      <rect x="70" y="316" width="380" height="9" fill="#ff94b9" />
      <path d={frosting(70, 262, 380, 12, 1)} fill="#f7f5ff" />
      {SPRINKLES.map((s, i) => (
        <rect key={i} x={s.x} y={s.y} width="12" height="4.5" rx="2.2" fill={s.c} transform={`rotate(${s.r} ${s.x + 6} ${s.y + 2})`} />
      ))}

      {/* top tier */}
      <rect x="130" y="176" width="260" height="94" rx="18" fill="#ffd95a" />
      <rect x="130" y="226" width="260" height="8" fill="#ffc42e" />
      <path d={frosting(130, 176, 260, 8, 3)} fill="#f7f5ff" />

      {CANDLES.map((c, i) => (
        <g key={c.x}>
          <rect x={c.x - 6} y={CANDLE_TOP} width="12" height="50" rx="3" fill={c.color} />
          <rect x={c.x - 6} y={CANDLE_TOP} width="4" height="50" rx="2" fill="#fff" opacity="0.28" />
          <path d={`M${c.x} ${CANDLE_TOP} v-9`} stroke="#0f1033" strokeWidth="2" strokeLinecap="round" />

          {/* flame: shrinks away when blown out */}
          <g
            style={{
              transformBox: "fill-box",
              transformOrigin: "50% 100%",
              transition: "opacity 0.3s ease, transform 0.3s ease",
              opacity: lit ? 1 : 0,
              transform: lit ? "scale(1)" : "scale(0.1)",
            }}
          >
            <circle cx={c.x} cy={CANDLE_TOP - 22} r="34" fill="url(#flame-glow)" />
            <g transform={`translate(${c.x} ${CANDLE_TOP - 9})`}>
              <path className="flame" d="M0 0C-10 -9 -12 -21 0 -36C12 -21 10 -9 0 0Z" fill="url(#flame-outer)" style={{ animationDelay: `${i * 0.07}s` }} />
              <path className="flame" d="M0 -1.5C-4.5 -6 -4.5 -13 0 -20C4.5 -13 4.5 -6 0 -1.5Z" fill="#fffbe6" style={{ animationDelay: `${i * 0.07}s` }} />
            </g>
          </g>

          {!lit && (
            <path
              className="smoke"
              d={`M${c.x} ${CANDLE_TOP - 10} c-6 -8 6 -14 0 -24`}
              fill="none"
              stroke="#f7f5ff"
              strokeWidth="3"
              strokeLinecap="round"
              style={{ animationDelay: `${i * 0.09}s` }}
            />
          )}
        </g>
      ))}
    </svg>
  );
}

export default function Cake() {
  const party = useParty();
  const [lit, setLit] = useState(true);
  const [mic, setMic] = useState<"idle" | "listening" | "unavailable">("idle");
  const stopMic = useRef<(() => void) | null>(null);

  useEffect(() => () => stopMic.current?.(), []);

  const blow = useCallback(() => {
    setLit(false);
    stopMic.current?.();
    party.sfx("puff");
    window.setTimeout(() => {
      party.cannons();
      party.sfx("win");
    }, 520);
  }, [party]);

  const listen = async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setMic("unavailable");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false },
      });
      const audio = new AudioContext();
      const analyser = audio.createAnalyser();
      analyser.fftSize = 1024;
      audio.createMediaStreamSource(stream).connect(analyser);
      const samples = new Uint8Array(analyser.fftSize);

      let raf = 0;
      let loud = 0;
      const stop = () => {
        cancelAnimationFrame(raf);
        stream.getTracks().forEach((t) => t.stop());
        void audio.close();
        stopMic.current = null;
        setMic("idle");
      };
      stopMic.current = stop;
      setMic("listening");

      const tick = () => {
        analyser.getByteTimeDomainData(samples);
        let sum = 0;
        for (const v of samples) {
          const x = (v - 128) / 128;
          sum += x * x;
        }
        const rms = Math.sqrt(sum / samples.length);
        // Breath is loud, broadband noise; speech sits well below this.
        loud = rms > 0.26 ? loud + 1 : Math.max(0, loud - 1);
        if (loud > 7) {
          blow();
          return;
        }
        raf = requestAnimationFrame(tick);
      };
      tick();
    } catch {
      setMic("unavailable");
    }
  };

  const btnPrimary =
    "display inline-flex items-center gap-2.5 rounded-full bg-butter px-6 py-4 text-lg text-ink transition-transform hover:scale-105 active:scale-95";
  const btnGhost =
    "display inline-flex items-center gap-2.5 rounded-full border-2 border-milk px-6 py-4 text-lg text-milk transition-colors hover:bg-milk hover:text-ink";

  return (
    <Section id="wish" className="relative overflow-hidden bg-ink text-milk" innerClassName="grid items-center gap-12 lg:grid-cols-[1fr_1.05fr]">
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 size-[70rem] max-w-[160vw] -translate-y-1/2 rounded-full transition-opacity duration-700 lg:left-[72%]"
        style={{
          transform: "translate(-50%, -50%)",
          background: "radial-gradient(closest-side, rgb(255 110 120 / 0.22), transparent)",
          opacity: lit ? 1 : 0,
        }}
      />

      <div className="relative">
        <h2 className={H2}>Make a wish.</h2>
        <p className="voice mt-6 max-w-[22ch] text-[clamp(1.5rem,2.6vw,2.2rem)] text-milk/85">
          Close your eyes, think of it, then blow.
        </p>

        <div className="mt-9 flex flex-wrap gap-3">
          {lit ? (
            <>
              <button type="button" onClick={blow} className={btnPrimary}>
                <Wind size={22} aria-hidden />
                Blow out the candles
              </button>
              <button
                type="button"
                onClick={mic === "listening" ? () => stopMic.current?.() : listen}
                className={btnGhost}
                aria-pressed={mic === "listening"}
              >
                <Mic size={22} aria-hidden />
                {mic === "listening" ? "Listening. Blow now." : "Blow into my mic"}
              </button>
            </>
          ) : (
            <button type="button" onClick={() => setLit(true)} className={btnGhost}>
              <RotateCcw size={22} aria-hidden />
              Light them again
            </button>
          )}
        </div>
        {mic === "unavailable" && lit && (
          <p className="voice mt-4 text-xl text-ribbon">The mic isn&rsquo;t available here, so tap the button instead.</p>
        )}

        <div className="mt-8 min-h-[3.5rem]" aria-live="polite">
          <AnimatePresence>
            {!lit && (
              <motion.p
                className="voice text-[clamp(1.6rem,3vw,2.5rem)] text-butter"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ delay: 0.5 }}
              >
                Wish made. We won&rsquo;t tell anyone.
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="relative">
        <button
          type="button"
          onClick={lit ? blow : undefined}
          tabIndex={-1}
          aria-hidden
          className="block w-full cursor-pointer"
        >
          <CakeArt lit={lit} />
        </button>
      </div>
    </Section>
  );
}
