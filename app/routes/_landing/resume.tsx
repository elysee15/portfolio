import Timeline from "./timeline";

function Resume() {
  return (
    <section className="container flex items-center py-10" id="experiences">
      <div className="w-full">
        <h2 className="text-2xl md:text-4xl font-medium my-5">
          Mes <span className="text-secondary">expériences</span>
        </h2>
        <Timeline />
      </div>
    </section>
  );
}

export default Resume;
