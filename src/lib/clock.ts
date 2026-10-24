"use client";

import { useSyncExternalStore } from "react";

/**
 * A once-per-second clock that the whole experience hangs off.
 *
 * - Returns epoch milliseconds floored to the second, or 0 on the server so that
 *   the server render and the first client render always agree.
 * - If the visitor's device clock is clearly wrong (more than a few seconds off),
 *   it corrects itself using the server's `Date` header, so a wrong or tampered
 *   clock can't unlock the surprise early or hold it back.
 */

let offset = 0;
let synced = false;
let timer: ReturnType<typeof setInterval> | null = null;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((listener) => listener());
}

async function syncWithServer() {
  if (synced) return;
  synced = true;
  try {
    const sentAt = Date.now();
    const res = await fetch(window.location.pathname || "/", {
      method: "HEAD",
      cache: "no-store",
    });
    const receivedAt = Date.now();
    const header = res.headers.get("date");
    if (!header) return;
    const age = Number(res.headers.get("age") ?? 0) || 0;
    // The Date header only has 1s resolution, so aim for the middle of that second.
    const serverNow = new Date(header).getTime() + age * 1000 + 500;
    const skew = serverNow - (sentAt + receivedAt) / 2;
    if (Math.abs(skew) > 2500) {
      offset = skew;
      emit();
    }
  } catch {
    // Offline or blocked: fall back to the device clock.
  }
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  if (listeners.size === 1) {
    timer = setInterval(emit, 250);
    document.addEventListener("visibilitychange", emit);
    void syncWithServer();
  }
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) {
      if (timer) clearInterval(timer);
      timer = null;
      document.removeEventListener("visibilitychange", emit);
    }
  };
}

const getSnapshot = () => Math.floor((Date.now() + offset) / 1000) * 1000;
const getServerSnapshot = () => 0;

export function useNow() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

/** Breaks a duration into the parts the countdown shows. */
export function splitDuration(ms: number) {
  const total = Math.max(0, Math.floor(ms / 1000));
  return {
    days: Math.floor(total / 86400),
    hours: Math.floor((total % 86400) / 3600),
    minutes: Math.floor((total % 3600) / 60),
    seconds: total % 60,
    totalSeconds: total,
  };
}
