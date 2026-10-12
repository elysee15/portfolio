interface CalloutProps {
  /** Changes the label, never the hue — the scale has no accent color. */
  variant?: "note" | "avertissement";
  children: React.ReactNode;
}

const labels: Record<NonNullable<CalloutProps["variant"]>, string> = {
  note: "Note",
  avertissement: "Avertissement",
};

export function Callout({ variant = "note", children }: CalloutProps) {
  return (
    <aside
      role="note"
      className="bg-hover border-border-token my-8 flex flex-col gap-2 rounded-md border p-4"
    >
      <p className="text-meta text-muted-foreground uppercase">
        {labels[variant]}
      </p>
      <div className="[&>p:last-child]:mb-0">{children}</div>
    </aside>
  );
}
