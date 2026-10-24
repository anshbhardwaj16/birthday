"use client";

import { AnimatePresence, motion } from "framer-motion";
import clsx from "clsx";

/** One odometer digit: the old numeral rolls up and out as the new one rolls in. */
function Digit({ char }: { char: string }) {
  return (
    <span className="relative inline-block h-[1em] w-[0.43em] overflow-hidden text-center leading-none">
      <AnimatePresence initial={false} mode="popLayout">
        <motion.span
          key={char}
          className="block"
          initial={{ y: "105%" }}
          animate={{ y: "0%" }}
          exit={{ y: "-105%" }}
          transition={{ duration: 0.55, ease: [0.7, 0, 0.15, 1] }}
        >
          {char}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

/**
 * A number made of rolling digits. `pad` zero-fills to a minimum width;
 * `grouped` adds thousands separators instead.
 */
export function Rolling({
  value,
  pad = 0,
  grouped = false,
  className,
}: {
  value: number;
  pad?: number;
  grouped?: boolean;
  className?: string;
}) {
  const text = grouped ? value.toLocaleString("en-US") : String(value).padStart(pad, "0");
  return (
    <span aria-hidden className={clsx("inline-flex", className)}>
      {text.split("").map((char, i) =>
        /\d/.test(char) ? (
          // Key by position from the right so digits keep their identity when the length changes.
          <Digit key={text.length - i} char={char} />
        ) : (
          <span key={text.length - i} className="inline-block w-[0.2em] text-center leading-none">
            {char}
          </span>
        ),
      )}
    </span>
  );
}
