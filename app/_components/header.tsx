import { getAPIAvailabilityStatus } from "@/services/noaa-csb-api";
import { Suspense } from "react";
import HeaderControls from "./explorer-controls";

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
      <Suspense
        fallback={
          <div className="explorer-header">
            <h1>CSB Data Explorer</h1>
          </div>
        }
      >
        <HeaderControls
          availablePlatforms={availablePlatforms}
          availableProviders={availableProviders}
        />
      </Suspense>
      {hasIssues && (
        <div className="px-4 py-2 border-b border-amber-300 bg-amber-50 text-amber-900 text-sm">
          Data or map service issue detected: {listFormatter.format(issues)}. Some controls and map
          data may be unavailable until the service recovers.
        </div>
      )}
    </header>
  );
}
