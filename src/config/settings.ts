/**
 * The essentials. Edit this file first.
 *
 * Everything else (letter, photos, reasons, messages, gift) lives in
 * `src/config/content.ts`.
 */
export const settings = {
  /** Who the birthday is for. Shown on the countdown and across the site. */
  name: "Juhi",

  /** Who the site is from. Signs the letter and the footer. */
  from: "Ansh",

  /**
   * The moment the surprise unlocks.
   *
   * Pinned to midnight in India (IST), so every visitor sees the same unlock moment.
   */
  unlockAt: "2026-10-30T00:00:00+05:30",

  /** Their date of birth (YYYY-MM-DD). Drives the age, star sign and "by the numbers". */
  birthDate: "2000-10-30",

  /** One-liners that rotate under the countdown. Keep them free of spoilers. */
  teasers: [
    "It isn't socks.",
    "Slightly dramatic. Entirely worth it.",
    "Somebody has been planning this for weeks.",
    "Good things take their sweet time.",
    "Changing your clock won't speed it up.",
  ],

  /**
   * Preview links, handy while you build. Keep disabled on the shared site.
   *   ?demo=20   run the whole countdown and unwrapping in 20 seconds
   *   ?open      skip the wait and show the "unwrap" button
   *   ?site      jump straight to the unlocked site
   */
  allowPreviewLinks: false,
} as const;
