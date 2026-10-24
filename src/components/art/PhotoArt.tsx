/**
 * Illustrated stand-in for a photo, so the polaroids look finished before any
 * real pictures are added. Six tones, each a little scene in the party palette.
 */
const TONES = [
  { sky: "#ffd95a", sun: "#ff6a2b", far: "#2b35e8", near: "#ffb6cf", sx: 142, sy: 84, sr: 40 },
  { sky: "#ffb6cf", sun: "#f7f5ff", far: "#ff6a2b", near: "#2b35e8", sx: 62, sy: 74, sr: 34 },
  { sky: "#2b35e8", sun: "#ffd95a", far: "#5f68ff", near: "#ff6a2b", sx: 128, sy: 96, sr: 46 },
  { sky: "#ff6a2b", sun: "#ffd95a", far: "#0f1033", near: "#ffb6cf", sx: 100, sy: 70, sr: 30 },
  { sky: "#f7f5ff", sun: "#2b35e8", far: "#ffb6cf", near: "#ffd95a", sx: 150, sy: 70, sr: 36 },
  { sky: "#0f1033", sun: "#ffb6cf", far: "#2b35e8", near: "#ff6a2b", sx: 76, sy: 90, sr: 38 },
];

export default function PhotoArt({ tone, className }: { tone: number; className?: string }) {
  const t = TONES[tone % TONES.length];
  const flip = tone % 2 === 1;
  return (
    <svg viewBox="0 0 200 250" preserveAspectRatio="xMidYMid slice" className={className} aria-hidden>
      <rect width="200" height="250" fill={t.sky} />
      <g transform={flip ? "translate(200 0) scale(-1 1)" : undefined}>
        <circle cx={t.sx} cy={t.sy} r={t.sr} fill={t.sun} />
        <path d="M0 168 Q46 112 98 160 T200 146 V250 H0Z" fill={t.far} />
        <path d="M0 208 Q58 158 118 200 T200 188 V250 H0Z" fill={t.near} />
        <g fill={t.sun} opacity="0.9">
          <path d="M30 40l2.4 5.6 5.6 2.4-5.6 2.4L30 56l-2.4-5.6L22 48l5.6-2.4z" />
          <path d="M176 128l1.8 4.2 4.2 1.8-4.2 1.8-1.8 4.2-1.8-4.2-4.2-1.8 4.2-1.8z" />
        </g>
      </g>
    </svg>
  );
}
