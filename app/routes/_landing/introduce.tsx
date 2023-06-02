import CountUp from "react-countup";

function Introduce() {
  return (
    <section className="h-screen flex flex-col justify-center container">
      <div className="">
        <h1 className="font-bold text-3xl md:text-6xl leading-tight">
          Salut, je suis <span className="text-secondary">Elysée Bleu</span>{" "}
          développeur <span className="italic">Frontend</span>
        </h1>
        <p className="text-gray-500 text-sm mt-5">
          Je suis passionné par le développement web, la conception
          d&apos;interfaces et la résolution de problèmes.
        </p>
        <div className="flex gap-8 py-10">
          <div>
            <span className="text-5xl text-secondary font-bold block">
              <CountUp end={3} />+
            </span>
            <span className="uppercase text-gray-500 text-sm font-medium">
              Années <br /> d&apos;expériences
            </span>
          </div>
          <div>
            <span className="text-5xl text-secondary font-bold block">
              <CountUp end={10} />+
            </span>
            <span className="uppercase text-gray-500 text-sm font-medium">
              Projets <br /> réalisés
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Introduce;
