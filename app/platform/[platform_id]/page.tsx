import MapViewer from "@/app/_components/map/mapviewer";
import PlotContainer from "@/app/platform/[platform_id]/_components/plot/plot-container";
import ToggleChartButton from "@/app/platform/[platform_id]/_components/plot/toggle-chart-button";
import { CSBPlatform } from "@/lib/types";
import { getPlatformInfoFromNoaa } from "@/services/noaa";
import { Stats } from "fs";
import { ShipIcon } from "lucide-react";
import StatsCard from "./_components/stats/stats-card";
import ToggleStatsCard from "./_components/stats/toggle-stats-card";

const DEFAULT_PLOT_WINDOW_DAYS = 30;

export async function generateMetadata({
  params,
}: {
  params: { platform_id: string };
}) {
  return {
    title: `CSB Data for ID: ${params.platform_id}`,
    description: `CSB data collected by platform ${params.platform_id} in the DCDB Crowd-sourced Bathymetry  Database.`,
    openGraph: {
      title: `CSB Data for ID: ${params.platform_id}`,
      images: [
        {
          url: `/api/og/platform/${params.platform_id}.png`,
        },
      ],
      url: `/platform/${params.platform_id}`,
    },
    twitter: {
      card: "summary_large_image",
      site: `/platform/${params.platform_id}`,
      images: `/api/og/platform/${params.platform_id}.png`,
    },
  };
}

function VesselInfoDisplay({ platform }: { platform: CSBPlatform }) {
  return (
    <div className="absolute bottom-2 left-2 p-2 m-2 bg-white bg-opacity-80 rounded-lg flex items-center">
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

  if (!validPlatforms) {
    throw new Error("No valid platforms found");
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
      {platform && <VesselInfoDisplay platform={platform} />}
      {platform && (
        <div className="absolute bottom-28 left-4">
          <ToggleStatsCard>
            <StatsCard
              platformId={platform_id}
              timeWindowDays={time_window_days}
            />
          </ToggleStatsCard>
        </div>
      )}
    </div>
  );
}
