/**
 * Rendering helpers for content metadata. French, and timezone-pinned to UTC
 * so `2026-03-01` never renders as « 28 février ».
 */

const dateFormatter = new Intl.DateTimeFormat("fr-FR", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

/** `"2026-03-14"` → `"14 mars 2026"`. */
export function formatDate(iso: string): string {
  return dateFormatter.format(new Date(`${iso}T00:00:00Z`));
}

/** Value for the `dateTime` attribute of `<time>`. Already ISO; kept explicit. */
export function formatDateTime(iso: string): string {
  return iso;
}

/** `6` → `"6 min de lecture"`. `reading-time`'s own `.text` is English. */
export function formatReadingTime(minutes: number): string {
  return `${minutes} min de lecture`;
}
