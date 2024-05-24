import Link from "next/link";
import Image from "next/image";
import FSLogo from "@/components/icons/fslogo";
import Seabed2030Logo from "@/components/icons/seabed";
import SeakeepersLogo from "@/components/icons/seakeepers";

export default function Footer() {
  return (
    <footer className="flex flex-col w-full border-t-1 border-t-gray-200 pb-1">
      <div className="w-full text-center p-2 pb-0 md:hidden text-xs">
        Made possible by the following organizations:
      </div>
      <div className="md:hidden text-center text-xs">
        <p>FarSounder, Seakeepers, Seabed2030, NOAA/DCDB, and others</p>
      </div>
      <div className="border-b hidden md:flex justify-between w-full">
        <div className="flex py-4 items-center px-4 gap-8">
          <Link href="https://www.farsounder.com">
            <FSLogo />
          </Link>
        </div>
        <div className="flex py-4 items-center px-4 gap-8">
          <Link href="https://seabed2030.org/" className="w-16">
            <Seabed2030Logo />
          </Link>
        </div>
        <div className="flex py-4 items-center px-4 gap-8">
          <Link
            href="https://seakeepers.org/"
            className="w-16 text-blue-800"
          >
            <SeakeepersLogo />
          </Link>
        </div>
        <div className="flex py-4 items-center px-4 gap-8">
          <Link href="https://www.ngdc.noaa.gov/iho/" className="w-24">
            <Image
              src="/iho-csb-logo.png"
              width={256}
              height={128}
              alt="IHO logo"
            />
          </Link>
        </div>
      </div>
    </footer>
  );
}
