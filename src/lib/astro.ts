/** Star sign, birthstone, flower and "life by the numbers" maths. */

// Text-presentation selector, so the glyphs render as type and not as colour emoji.
const T = "︎";

const SIGNS = [
  { name: "Capricorn", glyph: `♑${T}`, element: "Earth", trait: "Patient, driven, secretly very funny" },
  { name: "Aquarius", glyph: `♒${T}`, element: "Air", trait: "Original, independent, a little mysterious" },
  { name: "Pisces", glyph: `♓${T}`, element: "Water", trait: "Dreamy, generous, feels everything" },
  { name: "Aries", glyph: `♈${T}`, element: "Fire", trait: "Bold, quick, first through the door" },
  { name: "Taurus", glyph: `♉${T}`, element: "Earth", trait: "Loyal, steady, loves a good meal" },
  { name: "Gemini", glyph: `♊${T}`, element: "Air", trait: "Curious, witty, never bored" },
  { name: "Cancer", glyph: `♋${T}`, element: "Water", trait: "Warm, protective, remembers everything" },
  { name: "Leo", glyph: `♌${T}`, element: "Fire", trait: "Generous, magnetic, born for the spotlight" },
  { name: "Virgo", glyph: `♍${T}`, element: "Earth", trait: "Thoughtful, sharp, quietly brilliant" },
  { name: "Libra", glyph: `♎${T}`, element: "Air", trait: "Charming, fair, makes peace look easy" },
  { name: "Scorpio", glyph: `♏${T}`, element: "Water", trait: "Intense, loyal, impossible to read" },
  { name: "Sagittarius", glyph: `♐${T}`, element: "Fire", trait: "Adventurous, honest, always off exploring" },
] as const;

// [month, day] each sign starts on, in calendar order from January.
const SIGN_STARTS: [number, number, number][] = [
  [1, 20, 1], // Aquarius
  [2, 19, 2], // Pisces
  [3, 21, 3], // Aries
  [4, 20, 4], // Taurus
  [5, 21, 5], // Gemini
  [6, 21, 6], // Cancer
  [7, 23, 7], // Leo
  [8, 23, 8], // Virgo
  [9, 23, 9], // Libra
  [10, 23, 10], // Scorpio
  [11, 22, 11], // Sagittarius
  [12, 22, 0], // Capricorn
];

const BIRTHSTONES = [
  "Garnet", "Amethyst", "Aquamarine", "Diamond", "Emerald", "Pearl",
  "Ruby", "Peridot", "Sapphire", "Opal", "Topaz", "Turquoise",
];

const BIRTH_FLOWERS = [
  "Carnation", "Violet", "Daffodil", "Daisy", "Lily of the valley", "Rose",
  "Larkspur", "Gladiolus", "Aster", "Marigold", "Chrysanthemum", "Narcissus",
];

export function starSign(month: number, day: number) {
  let idx = 0; // before Jan 20 is Capricorn
  for (const [m, d, i] of SIGN_STARTS) {
    if (month > m || (month === m && day >= d)) idx = i;
  }
  return SIGNS[idx];
}

export function birthProfile(birthMs: number) {
  const d = new Date(birthMs);
  const month = d.getMonth();
  return {
    sign: starSign(month + 1, d.getDate()),
    stone: BIRTHSTONES[month],
    flower: BIRTH_FLOWERS[month],
    weekday: new Intl.DateTimeFormat("en-GB", { weekday: "long" }).format(d),
    longDate: new Intl.DateTimeFormat("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(d),
  };
}

const DAY = 86_400_000;

/** Rough, friendly figures. They're approximations and the site says so. */
export function lifeStats(birthMs: number, nowMs: number) {
  const ms = Math.max(0, nowMs - birthMs);
  const days = ms / DAY;
  const years = days / 365.25;
  return {
    seconds: Math.floor(ms / 1000),
    days: Math.floor(days),
    heartbeats: Math.round(days * 100_000),
    breaths: Math.round(days * 23_000),
    sleepHours: Math.round(days * 8),
    fullMoons: Math.floor(days / 29.530588),
    orbits: years,
    kmAroundSun: Math.round(years * 940_000_000),
  };
}
