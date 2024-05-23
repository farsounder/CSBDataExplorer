import Link from "next/link";
import { GithubIcon } from "lucide-react";

export default function SplashPageFooter() {
  return (
    <footer className="w-full p-2 flex items-center justify-center bg-white shadow-inner">
      <div>
        Hosted by{" "}
        <Link
          className="text-blue-800 font-bold"
          href="https://www.farsounder.com/"
        >
          FarSounder.
        </Link>{" "}
        Report issues or contribute on{" "}
        <Link className="font-bold" href="https://github.com">
          Github <GithubIcon className="h-5 w-5 inline-block" />
        </Link>
      </div>
    </footer>
  );
}
