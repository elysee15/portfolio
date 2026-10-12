"use client";

import { useTheme } from "next-themes";
import { useCallback, useSyncExternalStore } from "react";

const LABEL: Record<string, string> = {
  system: "système",
  light: "clair",
  dark: "sombre",
};

/** Never-changing store: `false` while rendering on the server, `true` after. */
const subscribeNever = () => () => {};
const onClient = () => true;
const onServer = () => false;

export function ThemeToggle() {
  const { theme, setTheme, themes } = useTheme();

  // next-themes reads localStorage on its first client render, so the stored
  // choice can't be shown until the tree is mounted.
  const mounted = useSyncExternalStore(subscribeNever, onClient, onServer);

  const cycle = useCallback(() => {
    setTheme((current) => themes[(themes.indexOf(current) + 1) % themes.length]);
  }, [setTheme, themes]);

  const label = (mounted && LABEL[theme ?? ""]) || LABEL.system;

  return (
    <button
      type="button"
      onClick={cycle}
      aria-label={`Thème ${label}. Changer de thème`}
      className="hover:text-foreground -my-2.5 py-2.5 transition-colors duration-fast ease-out"
    >
      Thème&nbsp;: {label}
    </button>
  );
}
