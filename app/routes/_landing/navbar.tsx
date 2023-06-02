import type { LinkProps } from "@remix-run/react";
import { Link, useLocation } from "@remix-run/react";
import { useEffect, useState } from "react";
import BagIcon from "~/components/icons/bag";
import HomeIcon from "~/components/icons/home";
import MailIcon from "~/components/icons/mail";
import UserIcon from "~/components/icons/user";
import {
  Tooltip,
  TooltipArrow,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import { cn } from "~/utils/cn";

function Navbar() {
  return (
    <nav className="fixed border border-[#343337] rounded-full right-3 top-32 z-10">
      <ul className="flex flex-col gap-4 px-2 py-5">
        <li>
          <ActiveHashLink label="Introduction" to="/">
            <HomeIcon />
          </ActiveHashLink>
        </li>
        <li>
          <ActiveHashLink label="Experiences" to="/#experiences">
            <BagIcon />
          </ActiveHashLink>
        </li>
        <li>
          <ActiveHashLink label="Compétences" to="/#skills">
            <UserIcon />
          </ActiveHashLink>
        </li>
        <li>
          <ActiveHashLink label="Me contacter" to="/#contact-me">
            <MailIcon />
          </ActiveHashLink>
        </li>
      </ul>
    </nav>
  );
}

export default Navbar;

const ActiveHashLink = ({
  children,
  label,
  ...props
}: LinkProps & { label: string }) => {
  const location = useLocation();
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    setIsActive(location.pathname + location.hash === props.to);
  }, [location, props.to]);

  return (
    <Link
      {...props}
      className={cn("text-slate-500 hover:text-slate-400", {
        "text-secondary hover:text-secondary/80": isActive,
      })}
    >
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>{children}</TooltipTrigger>
          <TooltipContent
            side="left"
            className="bg-slate-500 border-none"
            avoidCollisions
          >
            <p>{label}</p>
            <TooltipArrow className="fill-slate-500" />
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </Link>
  );
};
