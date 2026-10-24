"use client";

import Image from "next/image";
import { useId, useState, type CSSProperties } from "react";
import clsx from "clsx";
import { photos, showEmptySlots } from "@/config/media";
import { Lightbox, type LightboxItem } from "@/components/media/lightbox";
import { FilePath, Hint, MediaHeading, PhotoIcon, parseRatio } from "@/components/media/parts";
import styles from "@/components/media/media.module.css";

// A loose, hand-placed look. Sizes, tilts and tape repeat every six photos.
const LOOK = [
  { size: "l", tilt: -2.2, tape: "top", lift: false },
  { size: "m", tilt: 1.8, tape: "corners", lift: true },
  { size: "s", tilt: -1.4, tape: "top", lift: false },
  { size: "m", tilt: 2.4, tape: "top", lift: true },
  { size: "l", tilt: -1.6, tape: "corners", lift: false },
  { size: "s", tilt: 1.2, tape: "top", lift: true },
] as const;

// The config is static, so work out the slots once.
const viewable: LightboxItem[] = [];
const slots = photos.items.flatMap((photo, i) => {
  if (!photo.src && !showEmptySlots) return [];
  const view = photo.src ? viewable.push({ src: photo.src, alt: photo.alt, caption: photo.caption }) - 1 : null;
  return [{ ...photo, number: i + 1, view }];
});

export function Scrapbook() {
  const headingId = useId();
  const [open, setOpen] = useState<number | null>(null);

  if (slots.length === 0) return null;

  return (
    <section aria-labelledby={headingId} className={clsx(styles.vars, styles.band, styles.scrapbook)}>
      <MediaHeading id={headingId} title={photos.title} note={photos.note} />

      <div className={styles.pile}>
        {slots.map((photo, i) => {
          const look = LOOK[i % LOOK.length];
          const style = { "--tilt": `${look.tilt}deg` } as CSSProperties;
          const frameStyle = { "--ratio": parseRatio(photo.ratio, 4 / 5) } as CSSProperties;

          return (
            <figure
              key={photo.number}
              className={styles.snap}
              style={style}
              data-size={look.size}
              data-tape={look.tape}
              data-lift={look.lift}
            >
              {photo.view !== null ? (
                <button
                  type="button"
                  className={styles.print}
                  onClick={() => setOpen(photo.view)}
                  aria-label={`See bigger: ${photo.alt || photo.caption || `photo ${photo.number}`}`}
                >
                  <span className={styles.frame} style={frameStyle}>
                    <Image
                      src={photo.src}
                      alt={photo.alt}
                      fill
                      sizes="(max-width: 640px) 100vw, 440px"
                      className={styles.cover}
                    />
                  </span>
                </button>
              ) : (
                <div className={clsx(styles.print, styles.printEmpty)}>
                  <span className={styles.frame} style={frameStyle}>
                    <span className={styles.empty}>
                      <PhotoIcon className={styles.emptyIcon} />
                      <Hint>
                        Photo {photo.number}: add <FilePath>public/media/photos/{photo.number}.jpg</FilePath>
                      </Hint>
                    </span>
                  </span>
                </div>
              )}
              {photo.caption ? <figcaption className={styles.caption}>{photo.caption}</figcaption> : null}
            </figure>
          );
        })}
      </div>

      <Lightbox items={viewable} index={open} onChange={setOpen} />
    </section>
  );
}
