import MapViewer from "@/app/_components/map/mapviewer";
import ToggleStatsCard from "@/app/_components/stats/toggle-stats-card";
import { DEFAULT_PLOT_WINDOW_DAYS } from "@/lib/constants";
import { CSBProvider } from "@/lib/types";
import { getProviderInfoFromNoaa } from "@/services/noaa";
import { BuildingOfficeIcon } from "@heroicons/react/24/outline";
import { Suspense } from "react";
import StatsCardTrustedNode from "@/app/_components/stats/stats-card-provider";
import ToggleChartButton from "@/app/provider/[providerId]/_components/plot/toggle-chart-button";
import PlotContainer from "@/app/provider/[providerId]/_components/plot/plot-container";
import SocialButtonsProvider from "@/app/_components/stats/social-buttons-provider";

const ProviderInfoDisplay = ({ provider }: { provider: CSBProvider }) => {
  return (
    <div className="p-2 bg-white bg-opacity-80 rounded-lg flex items-center">
      <div className="p-2">
        <BuildingOfficeIcon className="w-6 h-6 sm:w-8 sm:h-8 text-gray-500" />
      </div>
      <div>
        <div className="text-sm font-bold text-blue-800">Displaying data for:</div>
        <div className="text-xs">Trusted Node: {provider.provider}</div>
        <div className="text-xs"> NOTE: Data displayed on the map is all time </div>
      </div>
    </div>
  );
};

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: { providerId: string };
  searchParams?: { timeWindowDays: string };
}) {
  const timeWindowDays = Number(searchParams?.timeWindowDays) || DEFAULT_PLOT_WINDOW_DAYS;
  return {
    title: `CSB Data for ID: ${params.providerId} | ${timeWindowDays} Days`,
    description: `CSB data collected by provider ${params.providerId} in the DCDB Crowd-sourced Bathymetry Database over the last ${timeWindowDays} days.`,
    openGraph: {
      title: `CSB Data for ID: ${params.providerId} | ${timeWindowDays} Days`,
      images: [
        {
          url: `/api/og/provider/${params.providerId}.png?timeWindowDays=${timeWindowDays}`,
        },
      ],
      url: `/provider/${params.providerId}?timeWindowDays=${timeWindowDays}`,
    },
    twitter: {
      card: "summary_large_image",
      site: `/provider/${params.providerId}?timeWindowDays=${timeWindowDays}`,
      images: `/api/og/provider/${params.providerId}.png?timeWindowDays=${timeWindowDays}`,
    },
  };
}

export default async function ProviderPage({
  params,
  searchParams,
}: {
  params: { providerId: string };
  searchParams?: { timeWindowDays: string };
}) {
  const timeWindowDays = Number(searchParams?.timeWindowDays) || DEFAULT_PLOT_WINDOW_DAYS;
  if (isNaN(timeWindowDays)) {
    throw new Error("Invalid time window days");
  }

  const { providerId } = params;
  // it's URL encoded, so we need to decode it
  const decodedProviderId = decodeURIComponent(providerId);
  const validProvider = await getProviderInfoFromNoaa();

  if (!validProvider || validProvider.length === 0) {
    throw new Error("No valid providers returned from NOAA endpoint.");
  }

  const validProviderIds = validProvider.map((provider) => provider.provider.toUpperCase());

  if (!validProviderIds.includes(decodedProviderId.toUpperCase())) {
    throw new Error("Invalid provider ID");
  }

  const providerData = validProvider.find((provider) => provider.provider === decodedProviderId);

  const captureElementId = "stats-card-provider-capture";

  return (
    <div className="flex flex-col p-0 m-0 h-full relative">
      {providerData && (
        <ToggleChartButton>
          <PlotContainer provider={providerData} timeWindowDays={timeWindowDays} />
        </ToggleChartButton>
      )}
      <MapViewer providerId={decodedProviderId} />
      <div className="absolute bottom-4 left-4 flex flex-col gap-2 w-1/2 pr-8 max-w-lg">
        {providerData && (
          <Suspense fallback={<div>Loading...</div>}>
            <ToggleStatsCard
              triggerTitle="See/Share Platform Stats"
              triggerDescription="Click to view a summary of the data collected by this provider over the selected time window."
              title="Trusted Node Stats Summary"
              description="A simple summary of the data collected by this provider over the selected time window."
            >
              <StatsCardTrustedNode
                providerId={decodedProviderId}
                timeWindowDays={timeWindowDays}
                captureElementId={captureElementId}
              >
                <SocialButtonsProvider
                  captureElementId={captureElementId}
                  fileBase={`csb-provider-${decodedProviderId}-${timeWindowDays}`}
                />
              </StatsCardTrustedNode>
            </ToggleStatsCard>
          </Suspense>
        )}
        {providerData && <ProviderInfoDisplay provider={providerData} />}
      </div>
    </div>
  );
}
