"use client";

/**
 * All the sound is synthesised with the Web Audio API, so the site needs no audio
 * files: a music-box "Happy Birthday" plus a handful of little effects.
 *
 * Browsers only allow audio after a tap, so nothing here makes a sound until
 * `sound.setEnabled(true)` has been called from a user gesture.
 */

export type SfxName = "fanfare" | "pop" | "tick" | "chime" | "puff" | "win" | "flip";

type Graph = {
  ctx: AudioContext;
  master: GainNode;
  reverb: GainNode;
  sfx: GainNode;
  noise: AudioBuffer;
};

let g: Graph | null = null;
let enabled = false;
let running = false;
let bus: GainNode | null = null;
let timer: ReturnType<typeof setTimeout> | null = null;
let loops = 0;

const midi = (n: number) => 440 * Math.pow(2, (n - 69) / 12);

function impulse(ctx: AudioContext, seconds: number, decay: number) {
  const length = Math.floor(ctx.sampleRate * seconds);
  const buffer = ctx.createBuffer(2, length, ctx.sampleRate);
  for (let ch = 0; ch < 2; ch++) {
    const data = buffer.getChannelData(ch);
    for (let i = 0; i < length; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, decay);
    }
  }
  return buffer;
}

function graph(): Graph | null {
  if (g) return g;
  if (typeof window === "undefined") return null;
  const Ctor =
    window.AudioContext ??
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctor) return null;

  const ctx = new Ctor();
  const master = ctx.createGain();
  master.gain.value = 0.85;
  master.connect(ctx.destination);

  const convolver = ctx.createConvolver();
  convolver.buffer = impulse(ctx, 2.2, 2.8);
  const wet = ctx.createGain();
  wet.gain.value = 0.32;
  const reverb = ctx.createGain();
  reverb.connect(convolver);
  convolver.connect(wet);
  wet.connect(master);

  const sfx = ctx.createGain();
  sfx.gain.value = 1;
  sfx.connect(master);
  sfx.connect(reverb);

  const noise = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
  const data = noise.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;

  g = { ctx, master, reverb, sfx, noise };
  return g;
}

/** A struck-bell / music-box note: a sine plus a few quickly fading overtones. */
function pluck(
  gr: Graph,
  dest: AudioNode,
  freq: number,
  at: number,
  dur: number,
  vol: number,
  bright = 1,
) {
  const { ctx } = gr;
  const env = ctx.createGain();
  env.gain.setValueAtTime(0.0001, at);
  env.gain.exponentialRampToValueAtTime(vol, at + 0.008);
  env.gain.exponentialRampToValueAtTime(0.0001, at + dur);
  env.connect(dest);

  const partials: [number, number][] = [
    [1, 1],
    [2.005, 0.32 * bright],
    [4.02, 0.14 * bright],
    [6.9, 0.05 * bright],
  ];
  for (const [mult, amp] of partials) {
    const osc = ctx.createOscillator();
    osc.type = "sine";
    osc.frequency.value = freq * mult;
    const gain = ctx.createGain();
    gain.gain.value = amp;
    osc.connect(gain);
    gain.connect(env);
    osc.start(at);
    osc.stop(at + dur + 0.05);
  }
}

function noiseBurst(
  gr: Graph,
  at: number,
  dur: number,
  vol: number,
  type: BiquadFilterType,
  from: number,
  to?: number,
) {
  const { ctx } = gr;
  const src = ctx.createBufferSource();
  src.buffer = gr.noise;
  src.loop = true;
  const filter = ctx.createBiquadFilter();
  filter.type = type;
  filter.frequency.setValueAtTime(from, at);
  if (to) filter.frequency.exponentialRampToValueAtTime(to, at + dur);
  const env = ctx.createGain();
  env.gain.setValueAtTime(vol, at);
  env.gain.exponentialRampToValueAtTime(0.0001, at + dur);
  src.connect(filter);
  filter.connect(env);
  env.connect(gr.sfx);
  src.start(at);
  src.stop(at + dur + 0.05);
}

function sweep(gr: Graph, at: number, from: number, to: number, dur: number, vol: number) {
  const { ctx } = gr;
  const osc = ctx.createOscillator();
  osc.type = "sine";
  osc.frequency.setValueAtTime(from, at);
  osc.frequency.exponentialRampToValueAtTime(to, at + dur);
  const env = ctx.createGain();
  env.gain.setValueAtTime(vol, at);
  env.gain.exponentialRampToValueAtTime(0.0001, at + dur);
  osc.connect(env);
  env.connect(gr.sfx);
  osc.start(at);
  osc.stop(at + dur + 0.05);
}

const SCALE = [72, 74, 76, 79, 81, 84, 88];

function play(name: SfxName, arg = 0) {
  const gr = graph();
  if (!gr) return;
  const t = gr.ctx.currentTime + 0.01;

  switch (name) {
    case "tick":
      pluck(gr, gr.sfx, arg === 1 ? 1318.5 : 880, t, 0.22, 0.3, 0.6);
      break;
    case "pop":
      noiseBurst(gr, t, 0.1, 0.8, "highpass", 1400);
      sweep(gr, t, 420, 110, 0.09, 0.5);
      break;
    case "puff":
      noiseBurst(gr, t, 0.55, 0.55, "lowpass", 1100, 180);
      break;
    case "flip":
      pluck(gr, gr.sfx, midi(SCALE[arg % SCALE.length] - 12), t, 0.5, 0.25, 0.8);
      break;
    case "chime":
      pluck(gr, gr.sfx, midi(SCALE[arg % SCALE.length]), t, 1.3, 0.28, 1.2);
      break;
    case "win":
      [67, 71, 74, 79, 83].forEach((n, i) =>
        pluck(gr, gr.sfx, midi(n), t + i * 0.09, 1.3, 0.24, 1.3),
      );
      break;
    case "fanfare":
      sweep(gr, t, 150, 38, 0.55, 0.9);
      noiseBurst(gr, t, 1.2, 0.2, "bandpass", 700, 7000);
      [60, 64, 67, 72, 76, 79, 84].forEach((n, i) =>
        pluck(gr, gr.sfx, midi(n), t + 0.12 + i * 0.07, 1.8, 0.22, 1.4),
      );
      break;
  }
}

// ---------------------------------------------------------------------------
// The music box
// ---------------------------------------------------------------------------

const BEAT = 60 / 92;

// [MIDI note, length in beats]. 3/4 time, 8 bars.
const MELODY: [number, number][] = [
  [67, 0.75], [67, 0.25], [69, 1], [67, 1], [72, 1], [71, 2],
  [67, 0.75], [67, 0.25], [69, 1], [67, 1], [74, 1], [72, 2],
  [67, 0.75], [67, 0.25], [79, 1], [76, 1], [72, 1], [71, 1], [69, 1],
  [77, 0.75], [77, 0.25], [76, 1], [72, 1], [74, 1], [72, 2],
];

const CHORDS = {
  C: { bass: 48, triad: [60, 64, 67] },
  G: { bass: 43, triad: [59, 62, 65] },
  F: { bass: 41, triad: [57, 60, 65] },
} as const;
const BARS: (keyof typeof CHORDS)[] = ["C", "G", "G", "C", "C", "F", "F", "C"];

// Each pass of the tune climbs or falls a little, so the loop never feels stuck.
const SHIFTS = [0, 2, 4, -2];

function loop(gr: Graph, at: number) {
  if (!running || !bus) return;
  const dest = bus;
  const shift = SHIFTS[loops++ % SHIFTS.length];

  let t = at;
  for (const [note, beats] of MELODY) {
    pluck(gr, dest, midi(note + shift), t, Math.min(2, 0.7 + beats * BEAT), 0.3);
    t += beats * BEAT;
  }

  BARS.forEach((bar, i) => {
    const chord = CHORDS[bar];
    const t0 = at + i * 3 * BEAT;
    pluck(gr, dest, midi(chord.bass + shift), t0, 1.2, 0.2, 0.3);
    for (const beat of [1, 2]) {
      chord.triad.forEach((n, k) =>
        pluck(gr, dest, midi(n + shift), t0 + beat * BEAT + k * 0.014, 0.6, 0.075, 0.5),
      );
    }
  });

  const length = 27 * BEAT; // 8 bars of tune and a bar of rest
  const next = Math.max(at + length, gr.ctx.currentTime + 0.1);
  timer = setTimeout(
    () => loop(gr, next),
    Math.max(0, (next - gr.ctx.currentTime - 1) * 1000),
  );
}

function startMusic() {
  const gr = graph();
  if (!gr || running) return;
  void gr.ctx.resume();
  running = true;
  const b = gr.ctx.createGain();
  b.gain.value = 0.0001;
  b.gain.setTargetAtTime(0.5, gr.ctx.currentTime, 0.6);
  b.connect(gr.master);
  b.connect(gr.reverb);
  bus = b;
  loop(gr, gr.ctx.currentTime + 0.2);
}

function stopMusic() {
  if (!running) return;
  running = false;
  if (timer) clearTimeout(timer);
  timer = null;
  const b = bus;
  bus = null;
  if (g && b) {
    b.gain.cancelScheduledValues(g.ctx.currentTime);
    b.gain.setTargetAtTime(0.0001, g.ctx.currentTime, 0.12);
    setTimeout(() => b.disconnect(), 900);
  }
}

export const sound = {
  get enabled() {
    return enabled;
  },
  /** Call from a click or tap, the first time. */
  setEnabled(on: boolean) {
    enabled = on;
    if (on) {
      const gr = graph();
      if (gr) void gr.ctx.resume();
    }
  },
  startMusic,
  stopMusic,
  sfx(name: SfxName, arg?: number) {
    if (enabled) play(name, arg);
  },
};
