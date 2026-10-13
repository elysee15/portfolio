"use client";

import { useLocale } from "next-intl";
import { useEffect, useMemo, useState } from "react";

import { contact } from "@/src/data/contact";

/**
 * The hour in Abidjan, refreshed on the minute boundary rather than every
 * second — DESIGN.md § Motion: the clock does not animate, it just changes.
 *
 * Renders empty on the server: the visitor's clock is not the server's, and a
 * mismatch would be a hydration error for a decorative line.
 */
export function AbidjanClock() {
  const locale = useLocale();
  const [time, setTime] = useState<string | null>(null);

  // `h23` in both languages: the footer line is a fact, not a local habit, and
  // an AM/PM suffix would wrap the row at the reading width.
  const formatter = useMemo(
    () =>
      new Intl.DateTimeFormat(locale, {
        timeZone: contact.timezone,
        hour: "2-digit",
        minute: "2-digit",
        hourCycle: "h23",
      }),
    [locale],
  );

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;

    const tick = () => {
      const now = new Date();
      setTime(formatter.format(now));
      // Land on the next minute, not 60s after mount.
      const delay = 60_000 - (now.getSeconds() * 1000 + now.getMilliseconds());
      timer = setTimeout(tick, delay);
    };

    tick();

    return () => clearTimeout(timer);
  }, [formatter]);

  return (
    <span>
      {contact.city}{" "}
      <time className="text-foreground tabular-nums">{time ?? "—"}</time>
    </span>
  );
}
