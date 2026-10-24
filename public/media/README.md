# Media files

Put files here, then point to them in `src/config/media.ts`. Paths in the config start
with `/media/`, without `public`.

```
public/media/
  photos/                →  add each unique image to content.moments in src/config/content.ts
  video/                 →  add each video to videos in src/config/media.ts
  video/poster.jpg       →  videos[].poster   (optional: the still shown before it plays)
  video/message.vtt      →  videos[].captions (optional: subtitles)
  collage/collage.jpg    →  collage.src = "/media/collage/collage.jpg"
```

You can use any file names. The ones above are just what the placeholders suggest.

## Photos

- Put images in `public/media/photos/` and add each unique file to `content.moments` in
  `src/config/content.ts`, using a path that starts with `/media/photos/`.
- JPG, PNG or WebP. iPhone HEIC photos don't open in most browsers, so export them as JPG.
- Next.js resizes photos for each screen automatically, so full-size files are fine.
- Fill in `alt` with a few words on what's in the photo. Screen readers read it out.

## Video

- Add one entry per video in the `videos` array in `src/config/media.ts`.
- MP4 (H.264 + AAC) plays everywhere. Keep it under about 50 MB so it starts quickly.
- If it's filmed upright on a phone, set `ratio: "9/16"` and the frame turns portrait.
- To shrink a phone video with ffmpeg:

  ```bash
  ffmpeg -i input.mov -vf scale=-2:1080 -c:v libx264 -crf 26 -preset slow \
    -c:a aac -b:a 128k -movflags +faststart message.mp4
  ```

- To grab a poster frame three seconds in:

  ```bash
  ffmpeg -ss 3 -i message.mp4 -frames:v 1 -q:v 3 poster.jpg
  ```

- The background music fades out while the video plays and comes back afterwards. This
  is automatic. See "Music and the video" in the main README.

## Collage

- One image. Set `ratio` to its shape so the pieces line up with the picture.
- It's split into pieces in the browser, so the original file is loaded as is. Keep it to
  around 2500 px on the long side and under about 2 MB.
- Change how many pieces it breaks into with `pieces: [columns, rows]`.

## Before the day

Anything in `public/` can be opened by anyone who guesses its address, countdown or not.
If that matters, give the files names that are hard to guess (`/media/photos/k3x9.jpg`).
