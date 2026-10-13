import { Suspense } from "react";

import { ActivityFallback } from "@/components/home/activity-fallback";
import { AllProjects } from "@/components/home/all-projects";
import { Activity } from "@/components/home/activity";
import { Experience } from "@/components/home/experience";
import { Intro } from "@/components/home/intro";
import { Projects } from "@/components/home/projects";
import { IllustrationSlot } from "@/components/layout/illustration-slot";

export default function Home() {
  return (
    <div className="container-page">
      <div className="layout-reading pt-10 pb-12 sm:pt-18">
        <main
          id="contenu"
          tabIndex={-1}
          className="flex flex-col gap-16 outline-none"
        >
          <Intro />

          <Experience />

          {/* The contribution calendar is the one section that can fail: it
              streams in so a GitHub outage degrades a block, not the page. */}
          <Suspense fallback={<ActivityFallback />}>
            <Activity />
          </Suspense>

          <Projects />

          <AllProjects />
        </main>

        <aside className="hidden lg:block">
          <IllustrationSlot />
        </aside>
      </div>
    </div>
  );
}
