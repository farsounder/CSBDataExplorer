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
      <PlotContainer time_window_days={time_window_days} />
      <MapViewer />
    </div>
  );
}
