import MapViewer from "@/app/_components/map/mapviewer";
import PlotContainer from "@/app/_components/map/plot/plot-container";
import ToggleChartButton from "@/app/_components/map/plot/toggle-chart-button";
import { CSBPlatform } from "@/lib/types";
import { getPlatformInfoFromNoaa } from "@/services/noaa";
import { ShipIcon } from "lucide-react";

const DEFAULT_PLOT_WINDOW_DAYS = 30;

export async function generateMetadata({
  params,
}: {
  params: { platform_id: string };
}) {
  return {
    title: `Platform ${params.platform_id}`,
    description: `View data for platform ${params.platform_id}`,
    openGraph: {
      images: [`/api/og/platform/${params.platform_id}`],
    },
  };
}

function VesselInfoDisplay({ platform }: { platform: CSBPlatform }) {
  return (
    <div className="absolute bottom-0 left-0 p-2 m-2 bg-white bg-opacity-50 rounded-lg flex items-center">
      <div className="p-2">
        <ShipIcon className="w-4 h-4 sm:w-8 sm:h-8 text-blue-800" />
      </div>
      <div>
        <div className="text-sm font-bold text-blue-800">Displaying data for:</div>
        <div className="text-xs">Unique id: {platform.noaa_id}</div>
        <div className="text-xs">Platform: {platform.platform}</div>
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
    </div>
  );
}
