"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";

import { contact } from "@/src/data/contact";

interface Errors {
  name?: string;
  email?: string;
  message?: string;
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Messages are passed in so the rule stays pure and the copy stays translated. */
function validate(
  name: string,
  email: string,
  message: string,
  messages: Required<Errors>,
): Errors {
  const errors: Errors = {};

  if (!name.trim()) errors.name = messages.name;
  if (!EMAIL.test(email.trim())) errors.email = messages.email;
  if (!message.trim()) errors.message = messages.message;

  return errors;
}

/**
 * No backend: the form composes a `mailto:` and hands it to the visitor's mail
 * client. Nothing is sent anywhere, so there is nothing to store or to leak.
 */
export function ContactForm() {
  const t = useTranslations("Contact");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [sent, setSent] = useState(false);

  function submit(event: React.FormEvent) {
    event.preventDefault();

    const found = validate(name, email, message, {
      name: t("errorName"),
      email: t("errorEmail"),
      message: t("errorMessage"),
    });
    setErrors(found);

    if (Object.keys(found).length > 0) {
      setSent(false);
      return;
    }

    const body = `${message}\n\n— ${name} (${email})`;
    window.location.href = `mailto:${contact.email}?subject=${encodeURIComponent(
      t("subject", { name }),
    )}&body=${encodeURIComponent(body)}`;
    setSent(true);
  }

  return (
    <form
      onSubmit={submit}
      onKeyDown={(event) => {
        if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) submit(event);
      }}
      className="flex flex-col gap-6"
      noValidate
    >
      <Field
        id="c-name"
        label={t("name")}
        error={errors.name}
        value={name}
        onChange={setName}
      />

      <Field
        id="c-email"
        label={t("email")}
        type="email"
        error={errors.email}
        value={email}
        onChange={setEmail}
      />

      <div className="flex flex-col gap-1.5">
        <label htmlFor="c-msg" className="text-meta">
          {t("message")}
        </label>
        <textarea
          id="c-msg"
          rows={6}
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          aria-invalid={errors.message ? true : undefined}
          aria-describedby={errors.message ? "c-msg-error" : "c-msg-count"}
          className="border-border-token focus-visible:border-foreground rounded-sm border bg-transparent px-3 py-2 outline-none transition-colors duration-fast ease-out"
        />
        <div className="text-meta text-muted-foreground flex justify-between gap-4">
          <span id="c-msg-count">{t("characters", { count: message.length })}</span>
          {errors.message ? (
            <span id="c-msg-error" className="text-destructive">
              {errors.message}
            </span>
          ) : null}
        </div>
      </div>

      <div className="flex flex-wrap items-baseline gap-x-5 gap-y-2">
        <button
          type="submit"
          className="border-border-token hover:bg-hover active:scale-[0.96] rounded-sm border px-4 py-2 transition-[background-color,scale] duration-fast ease-out"
        >
          {t("send")}
        </button>
        <span className="text-meta text-muted-foreground">
          <kbd>⌘</kbd>
          <kbd>{t("enter")}</kbd>
        </span>
      </div>

      <p role="status" className="text-meta text-muted-foreground">
        {sent ? t("sent") : ""}
      </p>
    </form>
  );
}

interface FieldProps {
  id: string;
  label: string;
  type?: string;
  error?: string;
  value: string;
  onChange: (value: string) => void;
}

function Field({ id, label, type = "text", error, value, onChange }: FieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-meta">
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        className="border-border-token focus-visible:border-foreground rounded-sm border bg-transparent px-3 py-2 outline-none transition-colors duration-fast ease-out"
      />
      {error ? (
        <span id={`${id}-error`} className="text-meta text-destructive">
          {error}
        </span>
      ) : null}
    </div>
  );
}
