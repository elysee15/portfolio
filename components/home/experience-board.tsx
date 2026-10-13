"use client";

import { Accordion } from "@base-ui/react/accordion";
import { Plus } from "lucide-react";
import { useState } from "react";
import type {
  ExperienceRow,
  ExperienceSegment,
} from "@/src/lib/experience/timeline";

interface ExperienceBoardProps {
  /** Newest first, already resolved to the active language and formatted. */
  entries: readonly ExperienceRow[];
  /** Chronological, the reverse of `entries`. */
  segments: readonly ExperienceSegment[];
  todo: string;
}

/**
 * Timeline and disclosure rows in one island: hovering a row fills its segment,
 * so the two halves share a single piece of state. Base UI drives the open
 * state and the ARIA wiring; every animation is a CSS transition on the
 * DESIGN.md tokens, so § Motion keeps this off Motion.
 */
export function ExperienceBoard({
  entries,
  segments,
  todo,
}: ExperienceBoardProps) {
  const [activeId, setActiveId] = useState<string | null>(null);

  return (
    <div className="flex flex-col gap-4">
      <div aria-hidden className="flex flex-col gap-1.5 pt-2 pb-4">
        <div className="flex gap-2">
          {segments.map((segment) => (
            <div
              key={segment.id}
              style={{ flexGrow: segment.months, flexBasis: 0 }}
              className={`duration-base ease-out h-0.5 rounded-full transition-colors ${
                activeId === segment.id ? "bg-foreground" : "bg-subtle"
              }`}
            />
          ))}
        </div>
        <div className="flex gap-2">
          {segments.map((segment, index) => (
            <span
              key={segment.id}
              style={{ flexGrow: segment.months, flexBasis: 0 }}
              className={`text-xs font-sans duration-fast ease-out min-w-0 whitespace-nowrap transition-colors ${
                activeId === segment.id
                  ? "text-foreground"
                  : "text-muted-foreground"
              } ${index === segments.length - 1 ? "text-right" : ""}`}
            >
              {segment.year}
            </span>
          ))}
        </div>
      </div>

      <Accordion.Root className="group/list border-border-token flex flex-col border-b">
        {entries.map((entry) => (
          <Accordion.Item
            key={entry.id}
            value={entry.id}
            className="border-border-token border-t"
          >
            <Accordion.Header>
              {/* DESIGN.md § Motion, Lists: the hovered row keeps its weight,
                  the others drop to 50%. Opacity only — no tinted block.
                  Focus tracks the fill too, so the keyboard path matches. */}
              <Accordion.Trigger
                onMouseEnter={() => setActiveId(entry.id)}
                onMouseLeave={() =>
                  setActiveId((id) => (id === entry.id ? null : id))
                }
                onFocus={() => setActiveId(entry.id)}
                onBlur={() =>
                  setActiveId((id) => (id === entry.id ? null : id))
                }
                className="group duration-fast ease-out flex w-full cursor-pointer flex-col gap-1 py-3 text-left transition-opacity group-has-[button:hover]/list:opacity-50 hover:opacity-100! focus-visible:relative focus-visible:z-1"
              >
                <span className="flex w-full flex-wrap items-baseline gap-x-3 gap-y-1">
                  <span className="text-[19px]">{entry.company}</span>
                  <span className="text-meta text-muted-foreground">
                    {entry.role}
                  </span>
                  <span className="text-meta text-muted-foreground ml-auto flex items-center gap-2">
                    {entry.period}
                    <Plus
                      aria-hidden
                      strokeWidth={1.5}
                      className="text-muted group-hover:text-foreground duration-base ease-out size-2.5 shrink-0 transition-[transform,color] group-data-panel-open:rotate-45"
                    />
                  </span>
                </span>
                <span className="text-muted-foreground text-base">
                  {entry.summary}
                </span>
              </Accordion.Trigger>
            </Accordion.Header>

            <Accordion.Panel className="duration-slow ease-out h-(--accordion-panel-height) overflow-hidden transition-[height] data-ending-style:h-0 data-starting-style:h-0">
              <div className="flex flex-col gap-4 pt-1 pb-6">
                {entry.details.map((detail) => (
                  <p key={detail.slice(0, 32)}>{detail}</p>
                ))}
                <p className="text-meta text-muted-foreground">
                  {entry.stack.join(" · ")}
                </p>
                <p className="text-meta text-muted-foreground">{todo}</p>
              </div>
            </Accordion.Panel>
          </Accordion.Item>
        ))}
      </Accordion.Root>
    </div>
  );
}
