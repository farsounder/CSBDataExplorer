import MapViewer from "@/app/dashboard/map/_components/mapviewer";
import PlotContainer from "@/app/dashboard/map/_components/plot/plot-container";

const DEFAULT_PLOT_WINDOW_DAYS = 14;

export default async function Page({
  searchParams,
}: {
  searchParams?: { time_window_days: string };
}) {
  const time_window_days =
    Number(searchParams?.time_window_days) || DEFAULT_PLOT_WINDOW_DAYS;
  return (
    <div className="flex flex-col p-0 m-0 h-full relative">
      <div className="w-full sm:w-96 h-2/5 sm:h-80 sm:absolute sm:top-4 sm:left-4 z-50 bg-white rounded-lg p-1 shadow-md">
        <PlotContainer time_window_days={time_window_days} />
      </div>
      <MapViewer />
    </div>
  );
}
