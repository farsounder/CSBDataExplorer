import { Suspense } from "react";
import MapViewer from "@/app/_components/map/mapviewer";
import PlotContainer from "@/app/platform/[platform_id]/_components/plot/plot-container";
import ToggleChartButton from "@/app/platform/[platform_id]/_components/plot/toggle-chart-button";
import { CSBPlatform } from "@/lib/types";
import { getPlatformInfoFromNoaa } from "@/services/noaa";
import { ShipIcon } from "lucide-react";
import StatsCard from "@/app/_components/stats/stats-card";
import ToggleStatsCard from "@/app/_components/stats/toggle-stats-card";
import SocialButtons from "@/app/_components/stats/social-buttons-with-create";
import { DEFAULT_PLOT_WINDOW_DAYS } from "@/lib/constants";

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: { platform_id: string };
  searchParams?: { time_window_days: string };
}) {
  const time_window_days = Number(searchParams?.time_window_days) || 30;
  return {
    title: `CSB Data for ID: ${params.platform_id} | ${time_window_days} Days`,
    description: `CSB data collected by platform ${params.platform_id} in the DCDB Crowd-sourced Bathymetry Database over the last ${time_window_days} days.`,
    openGraph: {
      title: `CSB Data for ID: ${params.platform_id} | ${time_window_days} Days`,
      images: [
        {
          url: `/api/og/platform/${params.platform_id}.png?time_window_days=${time_window_days}`,
        },
      ],
      url: `/platform/${params.platform_id}?time_window_days=${time_window_days}`,
    },
    twitter: {
      card: "summary_large_image",
      site: `/platform/${params.platform_id}?time_window_days=${time_window_days}`,
      images: `/api/og/platform/${params.platform_id}.png?time_window_days=${time_window_days}`,
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
        <div className="text-sm font-bold text-blue-800">
          Displaying data for:
        </div>
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
  params: { platform_id: string };
  searchParams?: { time_window_days: string };
}) {
  const time_window_days =
    Number(searchParams?.time_window_days) || DEFAULT_PLOT_WINDOW_DAYS;

  const { platform_id } = params;
  const validPlatforms = await getPlatformInfoFromNoaa();

  if (!validPlatforms || validPlatforms.length === 0) {
    throw new Error("No valid platforms returned from NOAA endpoint.");
  }

  const validPlatformIds = validPlatforms.map((platform) =>
    platform.noaa_id.toUpperCase()
  );

  if (!validPlatformIds.includes(platform_id.toUpperCase())) {
    throw new Error("Invalid platform ID");
  }

  const platform = validPlatforms.find(
    (platform) => platform.noaa_id === platform_id
  );

  return (
    <div className="flex flex-col p-0 m-0 h-full relative">
      {platform?.provider && (
        <ToggleChartButton>
          <PlotContainer
            platformId={platform_id}
            provider={platform.provider}
            time_window_days={time_window_days}
          />
        </ToggleChartButton>
      )}
      <MapViewer platformId={platform_id} />
      <div className="absolute bottom-4 left-4 flex flex-col gap-2 w-full pr-8 max-w-lg">
        {platform && (
          <Suspense fallback={<div>Loading...</div>}>
            <ToggleStatsCard>
              <StatsCard
                platformId={platform_id}
                timeWindowDays={time_window_days}
              >
                <SocialButtons
                  platformId={platform_id}
                  timeWindowDays={time_window_days}
                />
              </StatsCard>
            </ToggleStatsCard>
          </Suspense>
        )}
        {platform && <VesselInfoDisplay platform={platform} />}
      </div>
    </div>
  );
}
