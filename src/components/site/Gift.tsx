"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Section, { H2 } from "./Section";
import { useParty } from "../PartyProvider";
import { content } from "@/config/content";
import { settings } from "@/config/settings";

const BRUSH = 58;

function ScratchCard() {
  const party = useParty();
  const boxRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const last = useRef<{ x: number; y: number } | null>(null);
  const touched = useRef(false);
  const moves = useRef(0);
  const revealed = useRef(false);
  const [done, setDone] = useState(false);

  const paintFoil = useCallback(() => {
    const canvas = canvasRef.current;
    const box = boxRef.current;
    // The first getContext call fixes the options; we read pixels back to measure how much is scratched.
    const ctx = canvas?.getContext("2d", { willReadFrequently: true });
    if (!canvas || !box || !ctx) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = box.clientWidth;
    const h = box.clientHeight;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.globalCompositeOperation = "source-over";

    const g = ctx.createLinearGradient(0, 0, w, h);
    g.addColorStop(0, "#ffb6cf");
    g.addColorStop(0.5, "#ffe9a8");
    g.addColorStop(1, "#ff9ec1");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);

    ctx.save();
    ctx.globalAlpha = 0.32;
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 10;
    for (let x = -h; x < w + h; x += 46) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x + h, h);
      ctx.stroke();
    }
    ctx.restore();

    ctx.fillStyle = "#0f1033";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = `800 ${Math.round(w * 0.085)}px "Bricolage Grotesque Variable", system-ui, sans-serif`;
    ctx.fillText("Scratch here", w / 2, h / 2);
  }, []);

  useEffect(() => {
    const box = boxRef.current;
    if (!box) return;
    paintFoil();
    // Repaint on resize, but never wipe away scratches that are already there.
    const ro = new ResizeObserver(() => {
      if (!touched.current) paintFoil();
    });
    ro.observe(box);
    return () => ro.disconnect();
  }, [paintFoil]);

  const reveal = useCallback(() => {
    if (revealed.current) return;
    revealed.current = true;
    setDone(true);
    party.cannons();
    party.sfx("win");
  }, [party]);

  const clearedShare = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return 0;
    const { width, height } = canvas;
    const data = ctx.getImageData(0, 0, width, height).data;
    let clear = 0;
    let total = 0;
    for (let y = 0; y < height; y += 12) {
      for (let x = 0; x < width; x += 12) {
        total++;
        if (data[(y * width + x) * 4 + 3] < 24) clear++;
      }
    }
    return clear / total;
  };

  const scratchTo = (e: React.PointerEvent) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx || e.buttons === 0 && e.pointerType === "mouse") return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    touched.current = true;

    ctx.globalCompositeOperation = "destination-out";
    ctx.lineWidth = BRUSH;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    const from = last.current ?? { x, y };
    ctx.beginPath();
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(x, y);
    ctx.stroke();
    last.current = { x, y };

    if (++moves.current % 10 === 0 && clearedShare() > 0.5) reveal();
  };

  return (
    <div className="mx-auto w-full max-w-[34rem]">
      <div className="-rotate-2 drop-shadow-[0_28px_24px_rgb(15_16_51/0.35)]">
        <div ref={boxRef} className="ticket paper relative aspect-[16/10] w-full text-milk">
          <div className="absolute inset-0 grid content-center justify-items-center gap-[0.6em] p-[9%] text-center">
            <p className="voice text-[clamp(1.15rem,2.1vw,1.6rem)] text-ribbon">A gift for {settings.name}</p>
            <p className="poster text-[clamp(2.3rem,5.2vw,4.4rem)]">{content.gift.title}</p>
            <p className="voice text-[clamp(1.15rem,2vw,1.55rem)]">{content.gift.text}</p>
            <p className="display text-[clamp(0.8rem,1.2vw,0.95rem)] text-milk/75">{content.gift.fine}</p>
          </div>

          <canvas
            ref={canvasRef}
            aria-hidden
            className={`absolute inset-0 size-full touch-none transition-opacity duration-700 ${
              done ? "pointer-events-none opacity-0" : "cursor-grab"
            }`}
            onPointerDown={(e) => {
              e.currentTarget.setPointerCapture(e.pointerId);
              last.current = null;
              scratchTo(e);
            }}
            onPointerMove={scratchTo}
            onPointerUp={() => {
              last.current = null;
              if (clearedShare() > 0.5) reveal();
            }}
            onPointerCancel={() => {
              last.current = null;
            }}
          />
        </div>
      </div>

      {!done && (
        <button
          type="button"
          onClick={reveal}
          className="voice mt-8 block text-xl underline decoration-2 underline-offset-4 hover:text-cobalt"
        >
          Can&rsquo;t scratch? Show me.
        </button>
      )}
    </div>
  );
}

export default function Gift() {
  return (
    <Section id="gift" className="bg-butter text-ink" innerClassName="grid items-center gap-14 lg:grid-cols-[0.9fr_1.1fr]">
      <div>
        <h2 className={H2}>One more thing.</h2>
        <p className="voice mt-6 max-w-[22ch] text-[clamp(1.5rem,2.6vw,2.2rem)]">
          Scratch the card to find out what&rsquo;s inside.
        </p>
      </div>
      <ScratchCard />
    </Section>
  );
}
