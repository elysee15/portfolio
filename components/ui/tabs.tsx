"use client";

import { Tabs as TabsPrimitive } from "@base-ui/react/tabs";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "cn";

function Tabs({ className, ...props }: TabsPrimitive.Root.Props) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      className={cn("flex flex-col gap-4", className)}
      {...props}
    />
  );
}

const tabsListVariants = cva("relative flex gap-5", {
  variants: {
    variant: {
      underline: "border-border-token border-b",
      bare: "",
    },
  },
  defaultVariants: {
    variant: "underline",
  },
});

function TabsList({
  className,
  variant,
  children,
  ...props
}: TabsPrimitive.List.Props & VariantProps<typeof tabsListVariants>) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      className={cn(tabsListVariants({ variant }), className)}
      {...props}
    >
      {children}
      <TabsPrimitive.Indicator
        renderBeforeHydration
        data-slot="tabs-indicator"
        className="bg-foreground duration-base ease-out absolute -bottom-px left-(--active-tab-left) h-px w-(--active-tab-width) transition-[left,width]"
      />
    </TabsPrimitive.List>
  );
}

function TabsTrigger({ className, ...props }: TabsPrimitive.Tab.Props) {
  return (
    <TabsPrimitive.Tab
      data-slot="tabs-trigger"
      className={cn(
        "text-sm font-sans data-active:text-fg text-muted-foreground data-selected:text-foreground hover:text-foreground duration-fast ease-out flex cursor-pointer items-baseline gap-1.5 pb-1.5 transition-colors",
        className,
      )}
      {...props}
    />
  );
}

function TabsContent({ className, ...props }: TabsPrimitive.Panel.Props) {
  return (
    <TabsPrimitive.Panel
      data-slot="tabs-content"
      className={cn(
        "duration-base ease-out flex flex-col gap-4 opacity-100 transition-opacity outline-none data-hidden:hidden data-starting-style:opacity-0",
        className,
      )}
      {...props}
    />
  );
}

export { Tabs, TabsList, TabsTrigger, TabsContent, tabsListVariants };
