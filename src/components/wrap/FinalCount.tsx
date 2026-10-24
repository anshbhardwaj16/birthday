"use client";

import { AnimatePresence, motion } from "framer-motion";

/** The last ten seconds: one enormous number at a time. */
export default function FinalCount({ seconds, name }: { seconds: number; name: string }) {
  return (
    <motion.div
      className="paper grain absolute inset-0 z-30 grid place-items-center overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.45 }}
    >
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(70% 60% at 50% 50%, rgb(95 104 255 / 0.55), transparent 70%), radial-gradient(120% 90% at 50% 120%, rgb(4 5 70 / 0.55), transparent 60%)",
        }}
      />

      <div className="relative grid place-items-center" style={{ width: "min(74vmin, 40rem)", height: "min(74vmin, 40rem)" }}>
        <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full -rotate-90" aria-hidden>
          <circle cx="50" cy="50" r="47" fill="none" stroke="rgb(247 245 255 / 0.16)" strokeWidth="0.9" />
          <motion.circle
            key={seconds}
            cx="50"
            cy="50"
            r="47"
            fill="none"
            stroke="#ffd95a"
            strokeWidth="1.2"
            strokeLinecap="round"
            initial={{ pathLength: 1 }}
            animate={{ pathLength: 0 }}
            transition={{ duration: 1, ease: "linear" }}
          />
        </svg>

        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={seconds}
            className="poster tnum block text-butter"
            style={{ fontSize: "min(46vmin, 26rem)", lineHeight: 0.9 }}
            initial={{ scale: 1.4, opacity: 0, filter: "blur(14px)" }}
            animate={{ scale: 1, opacity: 1, filter: "blur(0px)" }}
            exit={{ scale: 0.72, opacity: 0, filter: "blur(8px)" }}
            transition={{ duration: 0.5, ease: [0.2, 0.9, 0.2, 1] }}
          >
            {seconds}
          </motion.span>
        </AnimatePresence>
      </div>

      <p className="voice absolute inset-x-0 bottom-[5%] text-center text-[clamp(1.4rem,3.4vw,2.6rem)] text-milk">
        Ready, {name}?
      </p>
    </motion.div>
  );
}
