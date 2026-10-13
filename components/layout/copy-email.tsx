"use client";

import { useTranslations } from "next-intl";
import { useCallback, useEffect, useRef, useState } from "react";

import { contact } from "@/src/data/contact";

const RESET_MS = 1600;

/**
 * Copies the email address. Both labels stay in the DOM, stacked in one grid
 * cell and crossfaded — the button never changes width, so the footer row does
 * not reflow mid-copy (better-ui § 7).
 */
export function CopyEmail() {
  const t = useTranslations("Footer");
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  const copy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(contact.email);
    } catch {
      // Insecure context or a browser without the async clipboard: the old way
      // still works, and a silent no-copy would be worse than a hidden input.
      const field = document.createElement("textarea");
      field.value = contact.email;
      field.setAttribute("readonly", "");
      field.style.position = "fixed";
      field.style.opacity = "0";
      document.body.append(field);
      field.select();
      document.execCommand("copy");
      field.remove();
    }

    setCopied(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied(false), RESET_MS);
  }, []);

  return (
    <>
      <button
        type="button"
        onClick={copy}
        title={contact.email}
        aria-label={t("copyAction", { email: contact.email })}
        className="decoration-subtle hover:decoration-fg inline-grid underline decoration-1 underline-offset-[3px] transition-[text-decoration-color] duration-fast ease-out"
      >
        <span
          className="col-start-1 row-start-1 transition-opacity duration-base ease-out"
          style={{ opacity: copied ? 0 : 1 }}
        >
          {t("email")}
        </span>
        <span
          aria-hidden
          className="text-foreground col-start-1 row-start-1 transition-opacity duration-base ease-out"
          style={{ opacity: copied ? 1 : 0 }}
        >
          {t("copied")}
        </span>
      </button>

      <span role="status" className="sr-only">
        {copied ? t("copiedStatus") : ""}
      </span>
    </>
  );
}
