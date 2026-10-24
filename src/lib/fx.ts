/**
 * A tiny particle engine for confetti cannons, bursts, streamers and fireworks.
 * One transparent canvas sits over the whole page; the animation loop only runs
 * while there is something to draw.
 */

export type BurstOptions = {
  count?: number;
  /** Direction in radians. Default: straight up. */
  angle?: number;
  /** Total fan width in radians. Default: a full circle. */
  spread?: number;
  /** Launch speed in px per frame. */
  power?: number;
};

export interface Fx {
  burst(x: number, y: number, options?: BurstOptions): void;
  cannons(): void;
  fireworks(count?: number): void;
  rain(ms?: number): void;
  clear(): void;
  destroy(): void;
}

const COLORS = ["#2b35e8", "#ffb6cf", "#ffd95a", "#ff6a2b", "#f7f5ff", "#5f68ff", "#0f1033"];
const FIRE_COLORS = ["#2b35e8", "#ff6a2b", "#ff4f93", "#0f1033", "#ffffff", "#ffd95a"];
const TAU = Math.PI * 2;
const MAX_PARTICLES = 1800;

type Kind = 0 | 1 | 2 | 3 | 4; // rect, dot, streamer, spark, rocket

type Particle = {
  kind: Kind;
  x: number;
  y: number;
  vx: number;
  vy: number;
  w: number;
  h: number;
  rot: number;
  vr: number;
  tilt: number;
  vt: number;
  color: string;
  life: number;
  max: number;
  g: number;
  drag: number;
};

const rand = (a: number, b: number) => a + Math.random() * (b - a);
const pick = <T,>(list: readonly T[]) => list[Math.floor(Math.random() * list.length)];

export function createFx(canvas: HTMLCanvasElement, intensity = 1): Fx {
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    const noop = () => {};
    return { burst: noop, cannons: noop, fireworks: noop, rain: noop, clear: noop, destroy: noop };
  }

  let W = 0;
  let H = 0;
  let raf = 0;
  let last = 0;
  const parts: Particle[] = [];
  const timeouts = new Set<number>();
  const intervals = new Set<number>();

  const resize = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth;
    H = window.innerHeight;
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  resize();
  window.addEventListener("resize", resize);

  const scaled = (n: number) => Math.max(4, Math.round(n * intensity));

  function add(p: Particle) {
    if (parts.length < MAX_PARTICLES) parts.push(p);
  }

  function confetti(x: number, y: number, count: number, angle: number, spread: number, power: number) {
    for (let i = 0; i < scaled(count); i++) {
      const a = angle + (Math.random() - 0.5) * spread;
      const speed = power * rand(0.4, 1.1);
      const r = Math.random();
      add({
        kind: r < 0.6 ? 0 : r < 0.82 ? 1 : 2,
        x,
        y,
        vx: Math.cos(a) * speed,
        vy: Math.sin(a) * speed,
        w: rand(6, 12),
        h: rand(4, 8),
        rot: rand(0, TAU),
        vr: rand(-0.3, 0.3),
        tilt: rand(0, TAU),
        vt: rand(0.1, 0.34),
        color: pick(COLORS),
        life: 0,
        max: rand(130, 240),
        g: rand(0.2, 0.3),
        drag: 0.972,
      });
    }
  }

  function explode(x: number, y: number, color: string) {
    const n = scaled(78);
    const second = pick(FIRE_COLORS);
    for (let i = 0; i < n; i++) {
      const a = (i / n) * TAU + rand(-0.05, 0.05);
      const speed = rand(2.5, 8.5);
      add({
        kind: 3,
        x,
        y,
        vx: Math.cos(a) * speed,
        vy: Math.sin(a) * speed,
        w: 0,
        h: 0,
        rot: 0,
        vr: 0,
        tilt: 0,
        vt: 0,
        color: Math.random() < 0.7 ? color : second,
        life: 0,
        max: rand(46, 84),
        g: 0.075,
        drag: 0.955,
      });
    }
  }

  function step(p: Particle, dt: number) {
    p.vx *= Math.pow(p.drag, dt);
    p.vy = p.vy * Math.pow(p.drag, dt) + p.g * dt;
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.rot += p.vr * dt;
    p.tilt += p.vt * dt;
    p.life += dt;
  }

  function draw(p: Particle) {
    const fade = p.life > p.max * 0.72 ? 1 - (p.life - p.max * 0.72) / (p.max * 0.28) : 1;
    ctx!.globalAlpha = Math.max(0, fade);
    ctx!.fillStyle = p.color;
    ctx!.strokeStyle = p.color;

    if (p.kind === 3) {
      ctx!.lineWidth = 2.6 * (1 - p.life / p.max) + 0.5;
      ctx!.lineCap = "round";
      ctx!.beginPath();
      ctx!.moveTo(p.x - p.vx * 1.8, p.y - p.vy * 1.8);
      ctx!.lineTo(p.x, p.y);
      ctx!.stroke();
      return;
    }
    if (p.kind === 4) {
      ctx!.beginPath();
      ctx!.arc(p.x, p.y, 2.6, 0, TAU);
      ctx!.fill();
      return;
    }

    ctx!.save();
    ctx!.translate(p.x, p.y);
    ctx!.rotate(p.rot);
    ctx!.scale(1, Math.cos(p.tilt));
    if (p.kind === 0) ctx!.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
    else if (p.kind === 1) {
      ctx!.beginPath();
      ctx!.arc(0, 0, p.h * 0.55, 0, TAU);
      ctx!.fill();
    } else ctx!.fillRect(-1.6, -p.w * 1.3, 3.2, p.w * 2.6);
    ctx!.restore();
  }

  function frame(t: number) {
    const dt = Math.min((t - last) / 16.667, 2.5);
    last = t;
    ctx!.clearRect(0, 0, W, H);

    for (let i = parts.length - 1; i >= 0; i--) {
      const p = parts[i];
      step(p, dt);

      let dead = p.life >= p.max || p.y > H + 80 || p.x < -120 || p.x > W + 120;
      if (p.kind === 4) {
        // Rockets leave a trail, then burst.
        add({
          kind: 3, x: p.x, y: p.y, vx: rand(-0.4, 0.4), vy: rand(0.4, 1.2),
          w: 0, h: 0, rot: 0, vr: 0, tilt: 0, vt: 0,
          color: p.color, life: 0, max: rand(10, 18), g: 0.02, drag: 0.9,
        });
        if (p.vy > -2.4 || p.life >= p.max) {
          explode(p.x, p.y, p.color);
          dead = true;
        }
      }

      if (dead) {
        parts[i] = parts[parts.length - 1];
        parts.pop();
      } else {
        draw(p);
      }
    }

    ctx!.globalAlpha = 1;
    raf = parts.length ? requestAnimationFrame(frame) : 0;
  }

  function wake() {
    if (!raf) {
      last = performance.now();
      raf = requestAnimationFrame(frame);
    }
  }

  const later = (fn: () => void, ms: number) => {
    const id = window.setTimeout(() => {
      timeouts.delete(id);
      fn();
    }, ms);
    timeouts.add(id);
  };

  return {
    burst(x, y, o = {}) {
      confetti(x, y, o.count ?? 46, o.angle ?? 0, o.spread ?? TAU, o.power ?? 9);
      wake();
    },

    cannons() {
      const power = Math.min(30, Math.max(15, H / 34));
      for (let wave = 0; wave < 3; wave++) {
        later(() => {
          confetti(-10, H + 10, 70, -Math.PI / 2 + 0.62, 0.7, power);
          confetti(W + 10, H + 10, 70, -Math.PI / 2 - 0.62, 0.7, power);
          wake();
        }, wave * 260);
      }
    },

    fireworks(count = 4) {
      for (let i = 0; i < count; i++) {
        later(() => {
          const x = rand(W * 0.14, W * 0.86);
          add({
            kind: 4,
            x,
            y: H + 10,
            vx: rand(-0.8, 0.8),
            vy: -Math.sqrt(2 * 0.16 * rand(H * 0.42, H * 0.72)),
            w: 0, h: 0, rot: 0, vr: 0, tilt: 0, vt: 0,
            color: pick(FIRE_COLORS),
            life: 0,
            max: 120,
            g: 0.16,
            drag: 0.999,
          });
          wake();
        }, i * 380 + rand(0, 160));
      }
    },

    rain(ms = 3500) {
      const id = window.setInterval(() => {
        for (let i = 0; i < scaled(4); i++) {
          const r = Math.random();
          add({
            kind: r < 0.6 ? 0 : 1,
            x: rand(0, W),
            y: -12,
            vx: rand(-0.8, 0.8),
            vy: rand(1.4, 3.6),
            w: rand(6, 11),
            h: rand(4, 8),
            rot: rand(0, TAU),
            vr: rand(-0.12, 0.12),
            tilt: rand(0, TAU),
            vt: rand(0.08, 0.2),
            color: pick(COLORS),
            life: 0,
            max: 600,
            g: 0.03,
            drag: 0.995,
          });
        }
        wake();
      }, 70);
      intervals.add(id);
      later(() => {
        clearInterval(id);
        intervals.delete(id);
      }, ms);
    },

    clear() {
      parts.length = 0;
    },

    destroy() {
      cancelAnimationFrame(raf);
      raf = 0;
      timeouts.forEach((id) => clearTimeout(id));
      intervals.forEach((id) => clearInterval(id));
      timeouts.clear();
      intervals.clear();
      window.removeEventListener("resize", resize);
      parts.length = 0;
    },
  };
}
