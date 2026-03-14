import Link from "next/link";
import { DEFAULT_PLOT_WINDOW_DAYS } from "@/lib/constants";
import { formatNumber } from "@/lib/utils";
import ProviderDailyStackedChart from "./_components/provider-daily-stacked-chart";
import ProviderPlatformDailyChart from "./_components/provider-platform-daily-chart";
import ProviderSelect from "./_components/provider-select";
import {
  getPlatformInfoFromNoaa,
  getProviderDailyStackedChartData,
  getProviderPlatformDailyStackedChartData,
  getTopPlatformsByCount,
  getTopProvidersByCount,
} from "@/services/noaa-csb-api";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export const metadata = {
  title: "CSB Explorer | Stats",
  description: "Top contributing trusted nodes and platforms over a selected time window.",
};

function safeNumber(value: string | undefined, fallback: number) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

export default async function StatsPage({
  searchParams,
}: {
  searchParams?: Promise<{ timeWindowDays?: string; topN?: string; provider?: string }>;
}) {
  const sp = searchParams ? await searchParams : undefined;
  const timeWindowDays = safeNumber(sp?.timeWindowDays, DEFAULT_PLOT_WINDOW_DAYS);
  const topN = Math.min(50, Math.max(1, safeNumber(sp?.topN, 10)));
  const selectedProvider = sp?.provider;

  const [topProviders, topPlatforms, platformInfo, providerDailyChartData, providerPlatformChartData] =
    await Promise.all([
      getTopProvidersByCount({ timeWindowDays, limit: topN }),
      getTopPlatformsByCount({ timeWindowDays, limit: topN }),
      getPlatformInfoFromNoaa(),
      getProviderDailyStackedChartData({ timeWindowDays, limit: topN }),
      getProviderPlatformDailyStackedChartData({ timeWindowDays, limit: topN, selectedProvider }),
    ]);

  const platformById = new Map(platformInfo.map((p) => [p.noaa_id, p]));

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6 w-full">

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200 h-full">
          <div className="mb-4 flex min-h-[120px] flex-col gap-4">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="flex-1">
                <div className="text-blue-800 text-xl font-bold">Daily Total Stacked by Trusted Node</div>
                <div className="text-gray-600 text-sm">
                  Each bar shows the full daily total, stacked by the top trusted nodes in the
                  selected window.
                </div>
              </div>
              <div className="hidden w-full lg:block lg:max-w-[320px]" />
            </div>
            <div className="min-h-[20px] text-sm text-gray-600">
              Includes the top trusted nodes plus all remaining contributions combined as
              <span className="font-semibold text-gray-900"> Other</span>.
            </div>
          </div>
          <ProviderDailyStackedChart data={providerDailyChartData} />
        </div>

        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200 h-full">
          <div className="mb-4 flex min-h-[120px] flex-col gap-4">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="flex-1">
                <div className="text-blue-800 text-xl font-bold">Daily Total Stacked by Platform</div>
                <div className="text-gray-600 text-sm">
                  View the daily total for a trusted node, stacked by the top 10 contributing
                  platforms in the selected window.
                </div>
              </div>
              <div className="w-full lg:max-w-[320px]">
                <ProviderSelect
                  providers={providerPlatformChartData.providerOptions}
                  selectedProvider={providerPlatformChartData.selectedProvider}
                />
              </div>
            </div>
            <div className="min-h-[20px] text-sm text-gray-600">
              Showing top platform contributions for{" "}
              <span className="font-semibold text-gray-900">
                {providerPlatformChartData.selectedProvider || "the selected provider"}
              </span>
              , with remaining platforms grouped into
              <span className="font-semibold text-gray-900"> All Others</span>.
            </div>
          </div>
          <ProviderPlatformDailyChart data={providerPlatformChartData} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
          <div className="text-blue-800 text-xl font-bold mb-2">Top Trusted Nodes</div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Trusted Node</TableHead>
                <TableHead className="text-right">Points</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {topProviders.map((row) => (
                <TableRow key={row.provider}>
                  <TableCell className="font-medium">
                    <Link
                      className="text-blue-700 hover:underline"
                      href={`/provider/${encodeURIComponent(row.provider)}?timeWindowDays=${timeWindowDays}`}
                    >
                      {row.provider}
                    </Link>
                  </TableCell>
                  <TableCell className="text-right">{formatNumber(row.totalCount)}</TableCell>
                </TableRow>
              ))}
              {topProviders.length === 0 && (
                <TableRow>
                  <TableCell colSpan={2} className="text-gray-500">
                    No data found for this time window.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
          <div className="text-blue-800 text-xl font-bold mb-2">Top Platforms</div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Platform</TableHead>
                <TableHead>Trusted Node</TableHead>
                <TableHead className="text-right">Points</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {topPlatforms.map((row) => {
                const info = platformById.get(row.noaaId);
                const label = info?.platform ? `${info.platform} (${row.noaaId})` : row.noaaId;
                return (
                  <TableRow key={row.noaaId}>
                    <TableCell className="font-medium">
                      <Link
                        className="text-blue-700 hover:underline"
                        href={`/platform/${encodeURIComponent(row.noaaId)}?timeWindowDays=${timeWindowDays}`}
                      >
                        {label}
                      </Link>
                    </TableCell>
                    <TableCell>{info?.provider ?? "-"}</TableCell>
                    <TableCell className="text-right">{formatNumber(row.totalCount)}</TableCell>
                  </TableRow>
                );
              })}
              {topPlatforms.length === 0 && (
                <TableRow>
                  <TableCell colSpan={3} className="text-gray-500">
                    No data found for this time window.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}


