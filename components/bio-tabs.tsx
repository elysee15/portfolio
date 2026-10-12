"use client";

import { Tabs } from "@base-ui/react/tabs";
import { useState } from "react";
import { bioTodo, type BioVariant } from "@/src/data/profile";

interface BioTabsProps {
  variants: readonly BioVariant[];
}

export function BioTabs({ variants }: BioTabsProps) {
  const [value, setValue] = useState<BioVariant["id"]>(variants[0].id);

  return (
    <Tabs.Root
      value={value}
      onValueChange={(next) => setValue(next as BioVariant["id"])}
      className="flex flex-col gap-6"
    >
      <Tabs.List className="border-border-token relative flex gap-3 border-b">
        {variants.map((variant) => (
          <Tabs.Tab
            key={variant.id}
            value={variant.id}
            className="text-meta text-muted-foreground data-selected:text-foreground hover:text-foreground cursor-pointer pb-2.5 transition-colors duration-fast ease-out"
          >
            {variant.label}
          </Tabs.Tab>
        ))}
        <Tabs.Indicator
          renderBeforeHydration
          className="bg-foreground absolute -bottom-px left-(--active-tab-left) h-px w-(--active-tab-width) transition-[left,width] duration-base ease-out"
        />
      </Tabs.List>

      {variants.map((variant) => (
        <Tabs.Panel
          key={variant.id}
          value={variant.id}
          className="flex flex-col gap-4 outline-none data-hidden:hidden"
        >
          {variant.paragraphs.map((paragraph) => (
            <p key={paragraph.slice(0, 32)}>{paragraph}</p>
          ))}
          <p className="text-muted-foreground">{bioTodo}</p>
        </Tabs.Panel>
      ))}
    </Tabs.Root>
  );
}
