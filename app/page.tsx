import { Intro } from "@/components/intro";
import { IllustrationSlot } from "@/components/illustration-slot";

export default function Home() {
  return (
    <div className="container-page">
      <div className="layout-reading pt-10 pb-12 sm:pt-18">
        <main id="contenu" tabIndex={-1} className="flex flex-col gap-16 outline-none">
          <Intro />

          <section className="flex flex-col gap-4">
            <h2 className="text-h2">Section</h2>
            <p>
              Les sections sont espacées de 64px, le titre et son contenu de
              16px. Raccourci : <kbd>⌘K</kbd>.
            </p>
          </section>
        </main>

        <aside className="hidden lg:block">
          <IllustrationSlot />
        </aside>
      </div>
    </div>
  );
}
