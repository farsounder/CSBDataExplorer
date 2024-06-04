import {
  BuildingOfficeIcon,
  CalendarIcon,
  FaceFrownIcon,
} from "@heroicons/react/24/outline";
import { getPlatformData } from "@/services/noaa";
import { formatNumber } from "@/lib/utils";


// TODO: dry this up, used in three places now
// This is just estimated based on some recent submissions size vs number of
// of depth points and the reported size of the data from the dcdb endpoint,
// they must be compressing it because the sizes of we have cached that we sent
// are larger than what they are reporting, but compressing would make sense.
const bytesToDepthPoints = (bytes: number) => Math.round(bytes / 20);

function NoDataCard({
  platformId,
  timeWindowDays,
}: {
  platformId: string;
  timeWindowDays: number;
}) {
  return (
    <div className="flex flex-col items-center">
      <div>
        <FaceFrownIcon className="w-24 h-24 text-gray-500" />
      </div>
      <div className="text-gray-500 text-center">
        No data found in the last{" "}
        <span className="text-blue-500 font-bold">{timeWindowDays} days</span>
      </div>
      <div className="text-xs text-gray-500">Unique ID: {platformId}</div>
    </div>
  );
}

function CoolNumber({ stat, label }: { stat: number; label: string }) {
  return (
    <div className="flex flex-col items-center border border-gray-200 rounded-lg p-4 shadow-lg">
      <div className="text-4xl font-bold text-blue-800">
        {formatNumber(stat)}
      </div>
      <div className="text-xs text-gray-500">{label}</div>
    </div>
  );
}

export default async function StatsCard({
  platformId,
  timeWindowDays,
  children,
}: {
  platformId: string;
  timeWindowDays: number;
  children: React.ReactNode;
}) {
  const data = await getPlatformData({
    noaa_id: platformId,
    time_window_days: timeWindowDays,
  });

  if (!data || data.length === 0) {
    return (
      <NoDataCard platformId={platformId} timeWindowDays={timeWindowDays} />
    );
  }

  const totalDataSize = data.reduce((acc, { dataSize }) => acc + dataSize, 0);
  const provider = data[0].provider;
  return (
    <div className="flex flex-col gap-4">
      <div className="">
        <div className="text-gray-500 text-sm flex items-center">
          <BuildingOfficeIcon className="w-4 h-4 inline-block" />
          Trusted Node: {provider}
        </div>
        <div className="text-gray-500 text-sm flex items-center">
          <CalendarIcon className="w-4 h-4 inline-block" />
          Time Window: {timeWindowDays} days
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3 text-center">
        <CoolNumber
          stat={data.length}
          label={`of ${timeWindowDays} days with data`}
        />
        <CoolNumber stat={totalDataSize} label="approximate bytes of data" />
        <CoolNumber
          stat={bytesToDepthPoints(totalDataSize)}
          label="approximate depth measurements"
        />
      </div>
      <div>
        <div className="text-gray-500 text-xs text-center">
          <span className="font-bold">Note:</span> These are approximate values
          based on the data we have collected.
        </div>
      </div>
      <div className="pt-4 flex flex-col gap-1">
        {children}
      </div>
    </div>
  );
}
