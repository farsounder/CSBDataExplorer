import { getAPIAvailabilityStatus } from "@/services/noaa-csb-api";
import Link from "next/link";
import { Suspense } from "react";
import HeaderControls from "./header-controls";

const listFormatter = new Intl.ListFormat("en", {
  style: "long",
  type: "conjunction",
});

export default async function Header() {
  const apiStatus = await getAPIAvailabilityStatus();
  const { availablePlatforms, availableProviders, issues } = apiStatus;
  const hasIssues = issues.length > 0;

  return (
    <header className="flex flex-col w-full">
      <div className="border-b flex items-center justify-between">
        <div className="flex py-4 flex-col  px-4 ">
          <Link href="/">
            <h1 className="text-xl md:text-4xl font-bold text-blue-800">CSB Data Explorer</h1>
            <div className="hidden sm:block md:text-sm text-gray-600 italic text-xs">
              A view of the data <span className="text-blue-600 font-extrabold">YOU</span>&apos;ve
              collected and sent to the IHO DCDB
            </div>
          </Link>
          <div className="mt-2 flex gap-3 text-sm text-gray-600">
            <Link className="hover:underline" href="/">
              Map
            </Link>
            <Link className="hover:underline" href="/stats">
              Stats
            </Link>
          </div>
        </div>
        <div className="justify-center items-center flex px-4">
          <Suspense fallback={<div>Loading...</div>}>
            <HeaderControls availablePlatforms={availablePlatforms} availableProviders={availableProviders} />
          </Suspense>
        </div>
      </div>
      {hasIssues && (
        <div className="px-4 py-2 border-b border-amber-300 bg-amber-50 text-amber-900 text-sm">
          Data or map service issue detected: {listFormatter.format(issues)}. Some controls and map data may be
          unavailable until the service recovers.
        </div>
      )}
    </header>
  );
}
