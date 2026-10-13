"use client";

import { useTheme } from "next-themes";
import { useTranslations } from "next-intl";
import { useCallback, useSyncExternalStore } from "react";

/** Never-changing store: `false` while rendering on the server, `true` after. */
const subscribeNever = () => () => {};
const onClient = () => true;
const onServer = () => false;

export function ThemeToggle() {
  const t = useTranslations("Theme");
  const { theme, setTheme, themes } = useTheme();

  // next-themes reads localStorage on its first client render, so the stored
  // choice can't be shown until the tree is mounted.
  const mounted = useSyncExternalStore(subscribeNever, onClient, onServer);

  const cycle = useCallback(() => {
    setTheme((current) => themes[(themes.indexOf(current) + 1) % themes.length]);
  }, [setTheme, themes]);

  const current = (mounted && theme) || "system";
  const label = t(current === "light" || current === "dark" ? current : "system");

  return (
    <button
      type="button"
      onClick={cycle}
      aria-label={t("action", { theme: label })}
      className="hover:text-foreground -my-2.5 py-2.5 transition-colors duration-fast ease-out"
    >
      {t("label", { theme: label })}
    </button>
  );
}
