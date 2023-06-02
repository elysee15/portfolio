import { Link } from "@remix-run/react";

function Timeline() {
  return (
    <ol className="relative border-l-[0.5px] border-gray-200 dark:border-gray-700 mt-8 ml-1">
      <li className="mb-10 ml-10">
        <div className="absolute w-2.5 h-2.5 bg-secondary rounded-full mt-0 -left-1.5 dark:bg-secondary"></div>
        <time className="mb-1 text-sm font-normal leading-none text-gray-400 dark:text-gray-500">
          Octobre 2021 - Avril 2023
        </time>
        <h3 className="text-lg font-semibold text-gray-900">
          Développeur ReactJs
        </h3>
        <p className="text-sm font-normal text-gray-500 dark:text-gray-400">
          <Link to="https://rotational.io/" target="_blank">
            Rotational Labs
          </Link>
        </p>
        <ul className="list-disc text-sm mt-4 ml-3 space-y-2">
          <li>Contribué principalement à des projets internes open sources.</li>
          <li>
            Assuré la maintenance des applications développées, corrigé les
            bogues et optimisé les performances pour garantir une expérience
            utilisateur fiable et de qualité.
          </li>
        </ul>
        <div className="text-sm py-2">
          Liens:{" "}
          <Link to={"https://github.com/trisacrypto/directory"} target="_blank">
            Trisa Directory
          </Link>
          ,{" "}
          <Link to={"https://github.com/rotationalio/ensign"} target="_blank">
            Ensign
          </Link>
          ,{" "}
          <Link to={"https://github.com/rotationalio/baleen"} target="_blank">
            Baleen
          </Link>
          ,{" "}
          <Link to={"https://github.com/rotationalio/whisper"} target="_blank">
            Whisper
          </Link>
        </div>
      </li>
      <li className="mb-10 ml-10">
        <div className="absolute w-2.5 h-2.5 bg-secondary rounded-full mt-0 -left-1.5 dark:bg-secondary"></div>
        <time className="mb-1 text-sm font-normal leading-none text-gray-400 dark:text-gray-500">
          Octobre 2020 - Aujourd&apos;hui
        </time>
        <h3 className="text-lg font-semibold text-gray-900">
          Développeur ReactJs
        </h3>
        <p className="text-sm font-normal text-gray-500 dark:text-gray-400">
          <Link to="https://www.akiltechnologies.com/" target="_blank">
            Akiltechnologies
          </Link>
        </p>
        <ul className="list-disc text-sm mt-4 ml-3 space-y-2">
          <li>Contribué principalement à des projets internes.</li>
          <li>
            Travaillé en étroite collaboration avec l&apos;équipe de
            développement backend pour assurer une intégration fluide des
            fonctionnalités et une expérience utilisateur cohérente.
          </li>
        </ul>
      </li>
      <li className="mb-10 ml-10">
        <div className="absolute w-2.5 h-2.5 bg-secondary rounded-full mt-0 -left-1.5 dark:bg-secondary"></div>
        <time className="mb-1 text-sm font-normal leading-none text-gray-400 dark:text-gray-500">
          Janvier 2020 - Octobre 2020
        </time>
        <h3 className="text-lg font-semibold text-gray-900">
          Développeur Backend stagiaire
        </h3>
        <p className="text-sm font-normal text-gray-500 dark:text-gray-400">
          <Link to="https://www.akiltechnologies.com/" target="_blank">
            Akiltechnologies
          </Link>
        </p>
        <ul className="list-disc text-sm mt-4 ml-3 space-y-2">
          <li>Contribué principalement à des projets internes.</li>
          <li>
            Travaillé en étroite collaboration avec l&apos;équipe de
            développement backend pour assurer une intégration fluide des
            fonctionnalités et une expérience utilisateur cohérente.
          </li>
        </ul>
      </li>
    </ol>
  );
}

export default Timeline;
