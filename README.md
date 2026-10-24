# Birthday surprise

A countdown that looks like a wrapped gift. At the set time the ribbon is cut, the paper
slides apart and an interactive birthday site is revealed.

Built with Next.js 16, React 19, Tailwind 4 and Framer Motion. There are no audio or
image files to manage: the music, sound effects, confetti and fireworks are all generated
in code.

## Run it

```bash
npm install
npm run dev      # http://localhost:3100
npm run build && npm start
```

## Make it theirs

Edit three files, nothing else:

| File | What's in it |
| --- | --- |
| `src/config/settings.ts` | Their name, who it's from, the unlock date and time, their date of birth, the teaser lines under the countdown |
| `src/config/content.ts` | The letter, story timeline, photo captions, reasons, messages from other people, the scratch-card gift, the closing message |
| `src/config/media.ts` | The video, the extra photos and the collage |

The sample copy in `content.ts` is placeholder text. Replace all of it.

**Unlock time.** `unlockAt: "2026-11-15T00:00:00"` means midnight in the *opener's own*
timezone. Add an offset (`"2026-11-15T00:00:00+05:30"`) to pin one exact moment for everyone.

**Photos.** Put images in `public/photos/` and set `image: "/photos/1.jpg"` on a moment.
Without an image, a moment shows an illustrated placeholder.

**Video, more photos and a collage.** Put the files in `public/media/` and set their paths
in `src/config/media.ts`. `public/media/README.md` lists the file names, sizes and formats.
While you run `npm run dev`, each empty slot shows a placeholder with the file it's waiting
for. In the build you share, empty slots are hidden, and a section with nothing in it
doesn't appear at all.

## Preview it without waiting

These work while `allowPreviewLinks` is `true` in `settings.ts`:

| Link | What it does |
| --- | --- |
| `/?demo=20` | Runs the whole countdown and unwrapping in 20 seconds |
| `/?open` | Skips the wait and shows the "Unwrap" knot |
| `/?site` | Jumps straight to the unlocked site |

**Set `allowPreviewLinks` to `false` before you share the site.**

## How the unlock works

- The countdown follows the visitor's clock, but if that clock is more than a few seconds
  off, it corrects itself using the server's `Date` header. Changing the device clock
  won't unlock it early.
- The unlocked site is a separate code chunk that is only fetched in the last two minutes.
  It's a surprise-keeper, not a security feature: anyone determined could read the
  bundle. Don't put anything truly private in `content.ts`.
- Opening the page after the time has passed shows the "Unwrap" knot, so the first tap
  also allows sound.
- Music starts only after the reveal. The speaker button (bottom right) mutes it.

## Music and the video

This is already wired up, so there's nothing to add. The video sends a signal through
`src/lib/mediabus.ts` when it plays or pauses. `src/components/PartyProvider.tsx` listens
for it, fades the music out while the video plays and starts it again afterwards. If the
visitor had muted the music, it stays muted.

The music box starts its tune from the beginning each time it comes back.

## Features

- Rolling-odometer countdown printed on the ribbon, with a 10-second final countdown
- Cut-and-part unwrap, confetti cannons, fireworks and a synthesized music-box "Happy Birthday"
- Hero poster with pop-able balloons and a rotating age seal
- Sealed letter, life in numbers (live seconds counter, star sign, birthstone), story timeline
- Polaroid strip with lightbox, flip-over reason stickers, scrolling wall of messages
- A scrapbook page of taped-in photos with a swipeable lightbox
- A video behind theatre curtains that part when it plays, and close again at the end
- A collage that arrives scattered in pieces and snaps together on a tap
- A cake to blow out by tapping or with the microphone, a balloon-popping game, a scratch-card gift
- Responsive from small phones to wide desktops; respects `prefers-reduced-motion`

## Deploying

It's a standard Next.js app, so Vercel, Netlify or any Node host works. Use a host that
returns a `Date` header (almost all do) so the clock correction works.
