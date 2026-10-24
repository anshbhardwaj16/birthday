/**
 * Lets the video tell the background music to step aside.
 *
 * The video calls `announceMedia(true)` when it starts and `announceMedia(false)`
 * when it pauses or ends. Whatever plays the music listens with `onMedia`.
 */

export const MEDIA_EVENT = "birthday:media";

type MediaEventDetail = { playing: boolean };

export function announceMedia(playing: boolean) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent<MediaEventDetail>(MEDIA_EVENT, { detail: { playing } }));
}

/** Subscribe to video play/pause. Returns an unsubscribe function, so it fits straight into useEffect. */
export function onMedia(handler: (playing: boolean) => void) {
  const listener = (event: Event) => handler((event as CustomEvent<MediaEventDetail>).detail.playing);
  window.addEventListener(MEDIA_EVENT, listener);
  return () => window.removeEventListener(MEDIA_EVENT, listener);
}
