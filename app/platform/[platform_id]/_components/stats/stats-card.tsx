import { getPlatformData } from "@/services/noaa";
import {
  BuildingOfficeIcon,
  CalendarIcon,
  FaceFrownIcon,
} from "@heroicons/react/24/outline";
import { FacebookIcon, LinkIcon, LinkedinIcon } from "lucide-react";

// This is just estimated based on some recent submissions size vs number of
// of depth points and the reported size of the data from the dcdb endpoint,
// they must be compressing it because the sizes of we have cached that we sent
// are larger than what they are reporting, but compressing would make sense.
const bytesToDepthPoints = (bytes: number) => Math.round(bytes / 20);

const formatNumber = (num: number): string => {
  if (num > 1000000000) {
    return `${(num / 1000000000).toFixed(1)}B`;
  }
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  }
  return `${num}`;
};

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
}: {
  platformId: string;
  timeWindowDays: number;
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
        {/*Social media share buttons*/}
        <div className="flex justify-center gap-4">
          <LinkedinIcon className="w-4 h-4 text-blue-800" />
          <FacebookIcon className="w-4 h-4 text-blue-800" />
          <LinkIcon className="w-4 h-4 text-blue-800" />
        </div>
      </div>
    </div>
  );
}
