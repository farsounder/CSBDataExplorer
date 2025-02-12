import {
  getPlatformCountPerDayData,
  getProviderCountPerDayData,
} from "@/services/noaa";
import dynamic from "next/dynamic";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";

// was getting an ssr error with the plotly plot, this should force it to be
// completely client side, we need this file to be server side rendered so it
// can fetch the data
const ContributionsPlot = dynamic(() => import("./contributions-plot"), {
  ssr: false,
});

const ErrorMessage = ({ time_window_days }: { time_window_days: number }) => {
  return (
    <div className="flex flex-col justify-center items-center h-full px-8 text-center">
      <ExclamationTriangleIcon className="w-16 h-16 text-gray-500" />
      <h3 className="text-lg text-gray-600">No data available</h3>
      <p className="text-sm text-gray-500">
        No data found for the last {time_window_days} days, try a longer time
        window. If you believe there should be data in the selected time window,
        reload to try again and if the problem persists, please contact us to
        report the issue (sw@farsounder.com).
      </p>
    </div>
  );
};

export default async function PlotContainer({
  platformId,
  provider,
  time_window_days,
}: {
  platformId: string;
  provider: string;
  time_window_days: number;
}) {
  const [providerData, platformData] = await Promise.all([
    getProviderCountPerDayData({
      provider: provider,
      time_window_days: time_window_days,
    }).catch((e) => {
      console.error(e);
      return [];
    }),
    getPlatformCountPerDayData({
      noaa_id: platformId,
      time_window_days: time_window_days,
    }).catch((e) => {
      console.error(e);
      return [];
    }),
  ]);

  const showPlot = providerData && providerData.length > 0;

  return (
    <>
      {showPlot ? (
        <ContributionsPlot
          providerContributions={providerData}
          userContributions={platformData}
        />
      ) : (
        <ErrorMessage time_window_days={time_window_days} />
      )}
    </>
  );
}
