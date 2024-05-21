import { Suspense } from "react";
import MapViewer from "@/app/dashboard/map/_components/mapviewer";
import PlotContainer from "@/app/dashboard/map/_components/plot/plot-container";
import ThreeDotsIcon from "@/components/icons/three-dots";
import ToggleChartButton from "./_components/plot/toggle-chart-button";
import { currentUser } from "@clerk/nextjs/server";

const DEFAULT_PLOT_WINDOW_DAYS = 30;

const LoadingMessage = () => {
  return (
    <div className="flex flex-col justify-center items-center h-full px-8 text-center">
      <ThreeDotsIcon className="w-16 h-16" fill="#FFFFF" />
      <h3 className="text-lg text-gray-600">Loading contribution plot...</h3>
      <p className="text-sm text-gray-500">
        Data is being fetched, please wait a moment.
      </p>
    </div>
  );
};

export default async function Page({
  searchParams,
}: {
  searchParams?: { time_window_days: string };
}) {
  const time_window_days =
    Number(searchParams?.time_window_days) || DEFAULT_PLOT_WINDOW_DAYS;

  const user = await currentUser();

  return (
    <div className="flex flex-col p-0 m-0 h-full relative">
      {user ? (
        <ToggleChartButton>
          <Suspense fallback={<LoadingMessage />}>
            <PlotContainer time_window_days={time_window_days} />
          </Suspense>
        </ToggleChartButton>
      ) : null}
      <MapViewer />
    </div>
  );
}
