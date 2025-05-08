import { BuildingOfficeIcon, CalendarIcon, FaceFrownIcon } from "@heroicons/react/24/outline";
import { getPlatformCountPerDayData, getProviderCountPerDayData } from "@/services/noaa";
import { formatNumber, bytesToDepthPoints } from "@/lib/utils";

function NoDataCard({
  platformId,
  providerId,
  timeWindowDays,
}: {
  platformId?: string;
  providerId?: string;
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
      {platformId && <div className="text-xs text-gray-500">Unique ID: {platformId}</div>}
      {providerId && <div className="text-xs text-gray-500">Trusted Node: {providerId}</div>}
    </div>
  );
}

function CoolNumber({ stat, label }: { stat: number; label: string }) {
  return (
    <div className="flex flex-col items-center border border-gray-200 rounded-lg p-4 shadow-lg">
      <div className="text-4xl font-bold text-blue-800">{formatNumber(stat)}</div>
      <div className="text-xs text-gray-500">{label}</div>
    </div>
  );
}

export default async function StatsCardTrustedNode({
  providerId,
  timeWindowDays,
  children,
}: {
  providerId: string;
  timeWindowDays: number;
  children: React.ReactNode;
}) {
  const data = await getProviderCountPerDayData({
    provider: providerId,
    timeWindowDays: timeWindowDays,
  });

  if (!data || data.length === 0) {
    return <NoDataCard providerId={providerId} timeWindowDays={timeWindowDays} />;
  }

  const totalDataSize = data.reduce((acc, { dataSize }) => acc + dataSize, 0);
  return (
    <div className="flex flex-col gap-4">
      <div className="">
        <div className="text-gray-500 text-sm flex items-center">
          <BuildingOfficeIcon className="w-4 h-4 inline-block" />
          Trusted Node: {providerId}
        </div>
        <div className="text-gray-500 text-sm flex items-center">
          <CalendarIcon className="w-4 h-4 inline-block" />
          Time Window: {timeWindowDays} days
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3 text-center">
        <CoolNumber stat={data.length} label={`of ${timeWindowDays} days with data`} />
        <CoolNumber stat={totalDataSize} label="approximate bytes of data" />
        <CoolNumber
          stat={bytesToDepthPoints(totalDataSize)}
          label="approximate depth measurements"
        />
      </div>
      <div>
        <div className="text-gray-500 text-xs text-center">
          <span className="font-bold">Note:</span> These are approximate values based on the data we
          have collected.
        </div>
      </div>
      <div className="pt-4 flex flex-col gap-1">{children}</div>
    </div>
  );
}