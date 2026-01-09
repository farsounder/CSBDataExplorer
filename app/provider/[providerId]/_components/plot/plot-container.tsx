import {
  getProviderCountPerDayData,
  getTotalPerDayAllProviders,
} from "@/services/noaa";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import { CSBProvider } from "@/lib/types";
import PlotClient from "./plot-client";

const ErrorMessage = ({ timeWindowDays }: { timeWindowDays: number }) => {
  return (
    <div className="flex flex-col justify-center items-center h-full px-8 text-center">
      <ExclamationTriangleIcon className="w-16 h-16 text-gray-500" />
      <h3 className="text-lg text-gray-600">No data available</h3>
      <p className="text-sm text-gray-500">
        No data found for the last {timeWindowDays} days, try a longer time window. If you believe
        there should be data in the selected time window, reload to try again and if the problem
        persists, please contact us to report the issue (sw@farsounder.com).
      </p>
    </div>
  );
};

export default async function PlotContainer({
  provider,
  timeWindowDays,
}: {
  provider: CSBProvider;
  timeWindowDays: number;
}) {
  const [providerData, totalData] = await Promise.all([
    getProviderCountPerDayData({
      provider: provider.provider,
      timeWindowDays: timeWindowDays,
    }).catch((e) => {
      console.error(e);
      return [];
    }),
    getTotalPerDayAllProviders({
      timeWindowDays: timeWindowDays,
    }).catch((e) => {
      console.error(e);
      return [];
    }),
  ]);

  const showPlot = providerData && providerData.length > 0;

  return (
    <>
      {showPlot ? (
        <PlotClient providerContributions={providerData} totalData={totalData} />
      ) : (
        <ErrorMessage timeWindowDays={timeWindowDays} />
      )}
    </>
  );
}
