import { settings } from "@/config/settings";

export const unlockMs = new Date(settings.unlockAt).getTime();
export const birthMs = new Date(`${settings.birthDate}T00:00:00`).getTime();

/** The age they're turning on the day the site unlocks. */
export const turningAge =
  new Date(unlockMs).getFullYear() - new Date(birthMs).getFullYear();

export function ordinal(n: number) {
  const mod100 = n % 100;
  if (mod100 >= 11 && mod100 <= 13) return `${n}th`;
  switch (n % 10) {
    case 1:
      return `${n}st`;
    case 2:
      return `${n}nd`;
    case 3:
      return `${n}rd`;
    default:
      return `${n}th`;
  }
}
