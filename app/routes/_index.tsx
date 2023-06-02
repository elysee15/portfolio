import type { V2_MetaFunction } from "@remix-run/node";
import Navbar from "./_landing/navbar";
import Resume from "./_landing/resume";
import ContactMe from "./_landing/contact-me";
import Introduce from "./_landing/introduce";
import Skills from "./_landing/skills";

export const meta: V2_MetaFunction = () => {
  return [
    { title: "New Remix App" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

export default function Index() {
  return (
    <>
      <Navbar />
      <main className="text-primary">
        <Introduce />
        <Resume />
        <Skills />
        <ContactMe />
      </main>
    </>
  );
}
