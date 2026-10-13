"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { BioVariantRow } from "@/src/lib/profile/bio";

interface BioTabsProps {
  /** Already resolved to the active language by the server. */
  variants: readonly BioVariantRow[];
  todo: string;
}

export function BioTabs({ variants, todo }: BioTabsProps) {
  const [value, setValue] = useState<BioVariantRow["id"]>(variants[0].id);

  return (
    <Tabs
      value={value}
      onValueChange={(next) => setValue(next as BioVariantRow["id"])}
    >
      <TabsList className="gap-3">
        {variants.map((variant) => (
          <TabsTrigger key={variant.id} value={variant.id}>
            {variant.label}
          </TabsTrigger>
        ))}
      </TabsList>

      {variants.map((variant) => (
        <TabsContent key={variant.id} value={variant.id}>
          {variant.paragraphs.map((paragraph) => (
            <p key={paragraph.slice(0, 32)}>{paragraph}</p>
          ))}
          <p className="text-muted-foreground">{todo}</p>
        </TabsContent>
      ))}
    </Tabs>
  );
}
