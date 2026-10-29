/**
 * Photos, video and collage.
 *
 * 1. Put the files in `public/media/` (see public/media/README.md).
 * 2. Point to them below with a path that starts with "/media/...".
 *
 * Anything left as "" shows a placeholder while you run `npm run dev`, so you
 * can see where it will go. In the build you share, empty slots are hidden and
 * a section with nothing in it disappears.
 */

/** Width/height of a picture or video, e.g. "4/5" (portrait) or "16/9" (landscape). */
export type Ratio = `${number}/${number}`;

export type Photo = {
  /** e.g. "/media/photos/1.jpg". Leave "" for a placeholder. */
  src: string;
  /** What's in the photo, for screen readers. */
  alt: string;
  caption?: string;
  /** Shape of this photo. Defaults to "4/5". */
  ratio?: Ratio;
};

export type PhotosConfig = { title: string; note?: string; items: Photo[] };

export type VideoConfig = {
  /** Name shown on the video selector. */
  title: string;
  /** e.g. "/media/video/message.mp4". */
  src: string;
  /** "16/9" for landscape, "9/16" for a video filmed upright on a phone. */
  ratio?: Ratio;
  /** Optional still shown before it plays, e.g. "/media/video/poster.jpg". */
  poster?: string;
  /** Optional subtitles file, e.g. "/media/video/message.vtt". */
  captions?: string;
};

export type CollageConfig = {
  title: string;
  note?: string;
  /** e.g. "/media/collage/collage.jpg". Leave "" for a placeholder. */
  src: string;
  alt: string;
  /** Shape of the collage image. Defaults to "4/5". */
  ratio?: Ratio;
  /** How many pieces it breaks into: [columns, rows]. Picked from the ratio if left out. */
  pieces?: [columns: number, rows: number];
};

/** Show empty slots? On while developing, off in the build you share. */
export const showEmptySlots = process.env.NODE_ENV === "development";

export const photos: PhotosConfig = {
  title: "A few more photos",
  note: "Tap one to see it bigger.",
  items: [
    {
      src: "/media/photos/1.jpg",
      alt: "Two people posing together in front of a colorful wall mural",
      caption: "A favorite day together",
      ratio: "4/5",
    },
    { src: "", alt: "", caption: "Caption for photo 2", ratio: "1/1" },
    { src: "", alt: "", caption: "Caption for photo 3", ratio: "3/4" },
    { src: "", alt: "", caption: "Caption for photo 4", ratio: "4/3" },
    { src: "", alt: "", caption: "Caption for photo 5", ratio: "4/5" },
  ],
};

export const videos: VideoConfig[] = [
  { title: "❤️‍🔥", src: "/media/video/Screen_Recording_20261028_234000_Instagram.mp4", ratio: "9/16" },
  { title: "💖", src: "/media/video/Screen_Recording_20261029_180808_Instagram.mp4", ratio: "4/5" },
];

export const collage: CollageConfig = {
  title: "All in one picture",
  note: "It comes in pieces. Tap to put it together.",
  src: "/media/collage/20260713_235225.jpg",
  alt: "A collage of two memories together",
  ratio: "4/5",
};
