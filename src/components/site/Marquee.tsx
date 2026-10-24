import clsx from "clsx";

/**
 * An endless ticker. The children are rendered twice and the track slides by
 * exactly half its width, so the loop is seamless. Items should carry their own
 * horizontal padding (not a flex gap) for the maths to stay exact.
 */
export default function Marquee({
  children,
  duration = 40,
  reverse = false,
  className,
}: {
  children: React.ReactNode;
  duration?: number;
  reverse?: boolean;
  className?: string;
}) {
  return (
    <div className={clsx("marquee overflow-hidden", className)}>
      <div
        className={clsx("marquee-track", reverse && "reverse")}
        style={{ "--marquee-duration": `${duration}s` } as React.CSSProperties}
      >
        <div className="flex shrink-0 items-center">{children}</div>
        <div className="flex shrink-0 items-center" aria-hidden>
          {children}
        </div>
      </div>
    </div>
  );
}
