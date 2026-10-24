import { useId } from "react";

/** A glossy party balloon with a knot and a curling string. */
export default function Balloon({
  color,
  className,
  string = true,
}: {
  color: string;
  className?: string;
  string?: boolean;
}) {
  const id = useId().replace(/:/g, "");
  const body = "M50 4C22 4 6 26 6 54c0 31 24 54 44 62 20-8 44-31 44-62C94 26 78 4 50 4Z";
  return (
    <svg viewBox="0 0 100 172" className={className} aria-hidden>
      <defs>
        <radialGradient id={id} cx="35%" cy="28%" r="85%">
          <stop offset="0" stopColor="#fff" stopOpacity="0.32" />
          <stop offset="0.5" stopColor="#fff" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity="0.28" />
        </radialGradient>
      </defs>
      {string && (
        <path
          d="M50 124c-8 11 8 19 0 30s7 11 3 17"
          fill="none"
          stroke="#0f1033"
          strokeOpacity="0.55"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      )}
      <path d="M43 116l7 10 7-10Z" fill={color} />
      <path d="M43 116l7 10 7-10Z" fill="#000" opacity="0.22" />
      <path d={body} fill={color} />
      <path d={body} fill={`url(#${id})`} />
      <ellipse cx="30" cy="35" rx="7.5" ry="15" transform="rotate(24 30 35)" fill="#fff" opacity="0.5" />
    </svg>
  );
}
