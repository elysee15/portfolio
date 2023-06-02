import getImgSrc from "~/utils/getImgSrc";

function Skills() {
  return (
    <section id="skills" className="container flex items-center py-10">
      <div className="w-full">
        <h2 className="text-2xl md:text-4xl font-medium text-center mb-8">
          Mes <span className="text-secondary">compétences</span>
        </h2>
        <div className="flex gap-4 flex-wrap justify-center">
          <img
            src={getImgSrc("node.svg")}
            className="hover:scale-110 transition-all duration-200 grayscale hover:filter-none"
            width={60}
            height={60}
            alt="Node"
          />
          <img
            src={getImgSrc("git.svg")}
            className="hover:scale-110 transition-all duration-200 grayscale hover:filter-none"
            width={60}
            height={60}
            alt="Git"
          />
          <img
            src={getImgSrc("typescript.svg")}
            width={60}
            height={60}
            alt="Typescript"
            className="hover:scale-110 transition-all duration-200 grayscale hover:filter-none"
          />
          <img
            src={getImgSrc("js.svg")}
            className="hover:scale-110 transition-all duration-200 grayscale hover:filter-none"
            width={60}
            height={60}
            alt="Javascript"
          />
          <img
            src={getImgSrc("react.svg")}
            className="hover:scale-110 transition-all duration-200 grayscale hover:filter-none"
            width={60}
            height={60}
            alt="ReactJs"
          />
          <img
            src={getImgSrc("remix.svg")}
            className="hover:scale-110 transition-all duration-200 grayscale hover:filter-none"
            width={60}
            height={60}
            alt="Remix"
          />
          <img
            src={getImgSrc("next.svg")}
            className="hover:scale-110 transition-all duration-200 grayscale hover:filter-none"
            width={60}
            height={60}
            alt="NextJs"
          />
          <img
            src={getImgSrc("bootstrap.svg")}
            width={60}
            height={60}
            alt="Bootstrap"
            className="hover:scale-110 transition-all duration-200 grayscale hover:filter-none"
          />
          <img
            src={getImgSrc("tailwind.svg")}
            width={60}
            height={60}
            alt="tailwindcss"
            className="hover:scale-110 transition-all duration-200 grayscale hover:filter-none"
          />
          <img
            src={getImgSrc("mui.svg")}
            width={60}
            height={60}
            alt="Material UI"
            className="hover:scale-110 transition-all duration-200 grayscale hover:filter-none"
          />
          <img
            src={getImgSrc("styled-component.svg")}
            width={60}
            height={60}
            alt="Styled Component"
            className="hover:scale-110 transition-all duration-200 grayscale hover:filter-none"
          />
          <img
            src={getImgSrc("jest.svg")}
            width={60}
            height={60}
            alt="Jest"
            className="hover:scale-110 transition-all duration-200 grayscale hover:filter-none"
          />
        </div>
      </div>
    </section>
  );
}

export default Skills;
