"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useReducedMotion } from "framer-motion";
import { createFx, type BurstOptions, type Fx } from "@/lib/fx";
import { sound, type SfxName } from "@/lib/audio";
import { onMedia } from "@/lib/mediabus";

type Party = {
  burst: (x: number, y: number, options?: BurstOptions) => void;
  cannons: () => void;
  fireworks: (count?: number) => void;
  rain: (ms?: number) => void;
  soundOn: boolean;
  setSound: (on: boolean) => void;
  toggleSound: () => void;
  sfx: (name: SfxName, arg?: number) => void;
};

const PartyContext = createContext<Party | null>(null);

export function useParty() {
  const ctx = useContext(PartyContext);
  if (!ctx) throw new Error("useParty must be used inside <PartyProvider>");
  return ctx;
}

/**
 * Owns the full-screen confetti canvas and the sound switch, so any component
 * can pop confetti or play a chime with one call.
 */
export function PartyProvider({
  children,
  musicActive,
}: {
  children: React.ReactNode;
  /** The music box only plays once the site itself is showing. */
  musicActive: boolean;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fxRef = useRef<Fx | null>(null);
  const reduced = useReducedMotion();
  const [soundOn, setSoundOn] = useState(false);
  const [mediaPlaying, setMediaPlaying] = useState(false);

  useEffect(() => {
    if (!canvasRef.current) return;
    const fx = createFx(canvasRef.current, reduced ? 0.35 : 1);
    fxRef.current = fx;
    return () => {
      fx.destroy();
      fxRef.current = null;
    };
  }, [reduced]);

  // The video announces when it plays or pauses, and the music steps aside.
  useEffect(() => onMedia(setMediaPlaying), []);

  // Because this also checks `soundOn`, the music only comes back after the video
  // if it was playing before, so the video never undoes the mute button.
  useEffect(() => {
    if (soundOn && musicActive && !mediaPlaying) sound.startMusic();
    else sound.stopMusic();
    return () => sound.stopMusic();
  }, [soundOn, musicActive, mediaPlaying]);

  const setSound = useCallback((on: boolean) => {
    // Must run inside the click handler so the browser allows audio.
    sound.setEnabled(on);
    setSoundOn(on);
  }, []);

  const toggleSound = useCallback(() => setSound(!sound.enabled), [setSound]);

  const value = useMemo<Party>(
    () => ({
      burst: (x, y, o) => fxRef.current?.burst(x, y, o),
      cannons: () => fxRef.current?.cannons(),
      fireworks: (n) => fxRef.current?.fireworks(n),
      rain: (ms) => fxRef.current?.rain(ms),
      soundOn,
      setSound,
      toggleSound,
      sfx: (name, arg) => sound.sfx(name, arg),
    }),
    [soundOn, setSound, toggleSound],
  );

  return (
    <PartyContext.Provider value={value}>
      {children}
      <canvas
        ref={canvasRef}
        aria-hidden
        className="pointer-events-none fixed inset-0 z-[100] h-full w-full"
      />
    </PartyContext.Provider>
  );
}
