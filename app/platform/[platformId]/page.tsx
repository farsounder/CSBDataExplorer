import { Suspense } from "react";
import MapViewer from "@/app/_components/map/mapviewer";
import PlotContainer from "@/app/platform/[platformId]/_components/plot/plot-container";
import ToggleChartButton from "@/app/platform/[platformId]/_components/plot/toggle-chart-button";
import { CSBPlatform } from "@/lib/types";
import { getPlatformInfoFromNoaa } from "@/services/noaa";
import { ShipIcon } from "lucide-react";
import StatsCard from "@/app/_components/stats/stats-card";
import ToggleStatsCard from "@/app/_components/stats/toggle-stats-card";
import SocialButtons from "@/app/_components/stats/social-buttons-with-create";
import { DEFAULT_PLOT_WINDOW_DAYS } from "@/lib/constants";
import { DATA_CACHE_SECONDS } from "@/lib/constants";

export const revalidate = DATA_CACHE_SECONDS;

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: { platformId: string };
  searchParams?: { timeWindowDays: string };
}) {
  const timeWindowDays = Number(searchParams?.timeWindowDays) || DEFAULT_PLOT_WINDOW_DAYS;
  return {
    title: `CSB Data for ID: ${params.platformId} | ${timeWindowDays} Days`,
    description: `CSB data collected by platform ${params.platformId} in the DCDB Crowd-sourced Bathymetry Database over the last ${timeWindowDays} days.`,
    openGraph: {
      title: `CSB Data for ID: ${params.platformId} | ${timeWindowDays} Days`,
      images: [
        {
          url: `/api/og/platform/${params.platformId}.png?timeWindowDays=${timeWindowDays}`,
        },
      ],
      url: `/platform/${params.platformId}?timeWindowDays=${timeWindowDays}`,
    },
    twitter: {
      card: "summary_large_image",
      site: `/platform/${params.platformId}?timeWindowDays=${timeWindowDays}`,
      images: `/api/og/platform/${params.platformId}.png?timeWindowDays=${timeWindowDays}`,
    },
  };
}

function VesselInfoDisplay({ platform }: { platform: CSBPlatform }) {
  return (
    <div className="p-2 bg-white bg-opacity-80 rounded-lg flex items-center">
      <div className="p-2">
        <ShipIcon className="w-6 h-6 sm:w-8 sm:h-8 text-gray-500" />
      </div>
      <div>
        <div className="text-sm font-bold text-blue-800">Displaying data for:</div>
        <div className="text-xs">Unique ID: {platform.noaa_id}</div>
        <div className="text-xs">Vessel: {platform.platform}</div>
        <div className="text-xs">Trusted Node: {platform.provider}</div>
      </div>
    </div>
  );
}

export default async function Page({
  params,
  searchParams,
}: {
  params: { platformId: string };
  searchParams?: { timeWindowDays: string };
}) {
  const timeWindowDays = Number(searchParams?.timeWindowDays) || DEFAULT_PLOT_WINDOW_DAYS;

  const { platformId } = params;
  const validPlatforms = await getPlatformInfoFromNoaa();

  if (!validPlatforms || validPlatforms.length === 0) {
    throw new Error("No valid platforms returned from NOAA endpoint.");
  }

  const validPlatformIds = validPlatforms.map((platform) => platform.noaa_id.toUpperCase());

  if (!validPlatformIds.includes(platformId.toUpperCase())) {
    throw new Error("Invalid platform ID");
  }

  const platform = validPlatforms.find((platform) => platform.noaa_id === platformId);

  return (
    <div className="flex flex-col p-0 m-0 h-full relative">
      {platform?.provider && (
        <ToggleChartButton>
          <PlotContainer
            platformId={platformId}
            provider={platform.provider}
            timeWindowDays={timeWindowDays}
          />
        </ToggleChartButton>
      )}
      <MapViewer platformId={platformId} />
      <div className="absolute bottom-4 left-4 flex flex-col gap-2 w-full pr-8 max-w-lg">
        {platform && (
          <Suspense fallback={<div>Loading...</div>}>
            <ToggleStatsCard
              triggerTitle="See/Share Platform Stats"
              triggerDescription="Click to view a summary of the data collected by this vessel over the selected time window."
              title="Platform Stats Summary"
              description="A simple summary of the data collected by this vessel over the selected time window."
            >
              <StatsCard platformId={platformId} timeWindowDays={timeWindowDays}>
                <SocialButtons platformId={platformId} timeWindowDays={timeWindowDays} />
              </StatsCard>
            </ToggleStatsCard>
          </Suspense>
        )}
        {platform && <VesselInfoDisplay platform={platform} />}
      </div>
    </div>
  );
}
