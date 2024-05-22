import { getPlatformInfoFromNoaa } from "@/services/noaa";
import PlatformDisplayPanel from "./platform-planel";
import Link from "next/link";

export default async function Header() {
  const availablePlatforms = await getPlatformInfoFromNoaa();

  return (
    <header className="flex flex-col w-full">
      <div className="border-b flex items-center justify-between">
        <div className="flex py-4 flex-col  px-4 ">
          <Link href="/">
            <h1 className="hidden sm:block text-xl md:text-4xl font-bold text-blue-800">
              CSB Data Explorer
            </h1>
            <div className="hidden sm:block sm:text-sm text-gray-600 italic text-xs">
              A view of the data{" "}
              <span className="text-blue-600 font-extrabold">YOU</span>&apos;ve
              collected and sent to the IHO DCDB
            </div>
          </Link>
        </div>
        {availablePlatforms && (
          <PlatformDisplayPanel availablePlatforms={availablePlatforms} />
        )}
      </div>
    </header>
  );
}
