/**
 * The wrapped surface: patterned cobalt paper with a satin ribbon crossing it.
 * The Wrap renders this twice, each copy clipped to one half of the screen,
 * so the "cut" runs straight down the middle of the ribbon and the knot.
 *
 * Sizes come from CSS variables set on the Wrap root, so the countdown text
 * that sits on the ribbon always lines up with it.
 */
export default function Paper() {
  return (
    <div className="paper grain absolute inset-0 overflow-hidden">
      {/* light from above, shade from below */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 70% at 50% -10%, rgb(255 255 255 / 0.2), transparent 60%), radial-gradient(110% 60% at 50% 115%, rgb(4 5 70 / 0.6), transparent 62%)",
        }}
      />

      {/* horizontal ribbon: the countdown is printed on it */}
      <div
        className="satin absolute inset-x-0 top-1/2 -translate-y-1/2 bg-ribbon"
        style={{
          height: "var(--rib-h)",
          boxShadow: "0 22px 44px -14px rgb(4 5 70 / 0.65), 0 -14px 34px -18px rgb(4 5 70 / 0.5)",
        }}
      >
        <div className="absolute inset-x-0 top-[0.7rem] border-t-2 border-dashed border-ink/20" />
        <div className="absolute inset-x-0 bottom-[0.7rem] border-t-2 border-dashed border-ink/20" />
      </div>

      {/* vertical ribbon passes over the horizontal one */}
      <div
        className="satin-v absolute inset-y-0 left-1/2 -translate-x-1/2 bg-ribbon-deep"
        style={{
          width: "var(--rib-w)",
          boxShadow: "-12px 0 28px -14px rgb(4 5 70 / 0.55), 12px 0 28px -14px rgb(4 5 70 / 0.55)",
        }}
      >
        <div className="absolute inset-y-0 left-[0.6rem] border-l-2 border-dashed border-ink/20" />
        <div className="absolute inset-y-0 right-[0.6rem] border-r-2 border-dashed border-ink/20" />
      </div>

      {/* the knot where they cross */}
      <div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          width: "var(--knot)",
          height: "var(--knot)",
          background:
            "radial-gradient(circle at 34% 28%, #ffe0ea 0%, #ffb6cf 36%, #ff7aa6 100%)",
          boxShadow:
            "0 12px 26px rgb(4 5 70 / 0.5), inset 0 -8px 14px rgb(150 10 70 / 0.32), inset 0 5px 9px rgb(255 255 255 / 0.65)",
        }}
      >
        <div className="absolute inset-[17%] rounded-full border-2 border-ink/15" />
        <div className="absolute inset-[34%] rounded-full bg-ribbon-deep/70 shadow-[inset_0_2px_5px_rgb(255_255_255/0.6)]" />
      </div>
    </div>
  );
}
