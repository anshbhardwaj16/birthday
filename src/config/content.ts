import { settings } from "./settings";

const { name, from } = settings;

/**
 * Everything the birthday person sees once the surprise is unlocked.
 *
 * This is SAMPLE COPY. Replace it with your own words, names and memories.
 *
 * Photos: drop images into `public/media/photos/` and set their `/media/photos/...` paths.
 * Moments without an image get an illustrated placeholder.
 */
export const content = {
  tagline:
    "Another trip around the sun, and somehow you keep getting better at it.",

  letter: {
    greeting: `Dear ${name},`,
    paragraphs: [
      "I wanted to give you something that couldn't be bought in a hurry, so I built this instead. It took a while. You were worth every minute.",
      "I know me as well as you were manifesting to celebrate your birthday together, but you know the situation, nvm we will meet soon along with Manish Mama",
      "You know you are my first love, I love you to the moon and back. May this year brings you everything you want.",
    ],
    signoff: "With all my love,",
  },

  /** Years are free text, so "Summer 2019" works too. */
  story: [
    {
      year: "December 29th 2025",
      title: "The day we had our first one to one call",
      text: "The Autoheal Agent, our matchmaker, are yaar! aapne 4 bje kyu rakh di call, 4:30 ya 5 rakh dete, meri shift khtm ho jaati, Prerna bhi nhi hai.",
    },
    {
      year: "January 15th 2026",
      title: "Your Reel! Naam tera dil pe likhaan de phire",
      text: "I was travelling to Office, mai buddhu ko smj bhi nhi aaya, what you were trying to show, you sent the reel again to make me notice",
    },
    {
      year: "January 19th 2026",
      title: "The Proposal",
      text: "When the world got small, you made it feel bigger. Hours on the phone, nothing and everything said. And I said I Love You! at approx 9:50pm(correct me)",
    },
    {
      year: "January 20th 2026",
      title: "You asked confirmation!, is this not just attraction",
      text: "I said NO!, I am clear about you and me.",
    },
    {
      year: "July 09th 2026",
      title: "My Birthday! and you travelled to Noida to meet me. My Best Birthday Ever",
      text: "The Delhi Airport, I was waiting at wrong Gate, but I got you ₹10 water from wending machine, and our first in person meet and our first hug.",
    },
    {
      year: "Today",
      title: "Still here",
      text: "Older, a little wiser, exactly as ridiculous.My day doesn't end without seeing you or hearing your bak bak!, I am making this when you are at Anjali's wedding, I am missing you badly",
    },
  ],

  /** Set image paths for each unique photo in public/media/photos. */
  moments: [
    { tone: 0, alt: "Photo 1", image: "/media/photos/1.jpg" },
    { tone: 1, alt: "Photo 2", image: "/media/photos/IMG-20260713-WA0199.jpg" },
    { tone: 2, alt: "Photo 3", image: "/media/photos/IMG-20260713-WA0200.jpg" },
    { tone: 3, alt: "Photo 4", image: "/media/photos/IMG-20260713-WA0204-2.jpg" },
    { tone: 4, alt: "Photo 5", image: "/media/photos/IMG-20260713-WA0204.jpg" },
    { tone: 5, alt: "Photo 6", image: "/media/photos/IMG-20260713-WA0207.jpg" },
    { tone: 0, alt: "Photo 7", image: "/media/photos/IMG-20260713-WA0235.jpg" },
    { tone: 1, alt: "Photo 8", image: "/media/photos/Snapchat-1040214177.jpg" },
    { tone: 2, alt: "Photo 9", image: "/media/photos/Snapchat-1714887473.jpg" },
    { tone: 3, alt: "Photo 10", image: "/media/photos/VID-20260713-WA0240(1).jpg" },
    { tone: 4, alt: "Photo 11", image: "/media/photos/VID-20260713-WA0240.jpg" },
    { tone: 5, alt: "Photo 12", image: "/media/photos/VID-20260713-WA0243(2).jpg" },
    { tone: 0, alt: "Photo 13", image: "/media/photos/VID-20260713-WA0243(3).jpg" },
    { tone: 1, alt: "Photo 14", image: "/media/photos/VID-20260713-WA0243(6).jpg" },
  ] as { tone: number; alt: string; image: string; caption?: string }[],

  /** Keep each under about 70 characters so it fits on a sticker. */
  reasons: [
    "You make everyone feel like the main character.",
    "Your laugh arrives before the joke does.",
    "You remember the small things.",
    "You show up. Every time, no questions asked.",
    "Your playlists are dangerously good.",
    "You're braver than you give yourself credit for.",
    "You turn bad days into stories worth telling.",
    "You give great advice, then ignore it yourself.",
    "You're always up for one more adventure.",
    "Your kindness is never for show.",
    "You make quiet moments feel full.",
    "You are, quite simply, one of the good ones.",
  ],

  wishes: [
    {
      from: "Mum & Dad",
      note: "family",
      text: "Our favourite person since day one. We're so proud of who you've become.",
    },
    {
      from: "Priya",
      note: "best friend",
      text: "Thank you for every 2am conversation. Happy birthday to my person.",
    },
    {
      from: "Jordan",
      note: "teammate",
      text: "Best colleague, worst at keeping secrets. Have the day you deserve.",
    },
    {
      from: "Grandma",
      note: "family",
      text: "Eat the cake. Then eat a second slice. That's an order.",
    },
    {
      from: "Marcus",
      note: "old friend",
      text: "Another year older and I'm still not catching up. Happy birthday!",
    },
    {
      from: "Chloe",
      note: "neighbour",
      text: "You make the whole street brighter. Enjoy every minute today.",
    },
    {
      from: "Sam",
      note: "the one who built this",
      text: "Look at that. You made it to another year. Slightly alarming, mostly wonderful.",
    },
    {
      from: "The whole team",
      note: "everyone",
      text: "Cake is in the fridge. Do not tell anyone we told you.",
    },
  ],

  /** The scratch card. */
  gift: {
    title: "One dinner, your choice",
    text: "Any place, any city, any craving. I'll book it and I'll pay.",
    fine: `Redeem by telling ${from}. Valid all year, no take-backs.`,
  },

  footer: {
    title: `Happy birthday, ${name}.`,
    text: "Here's to the year ahead, and everyone who gets to share it with you.",
  },
};
