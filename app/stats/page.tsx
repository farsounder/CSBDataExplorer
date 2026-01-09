import Link from "next/link";
import { DEFAULT_PLOT_WINDOW_DAYS } from "@/lib/constants";
import { bytesToDepthPoints, formatNumber } from "@/lib/utils";
import {
  getPlatformInfoFromNoaa,
  getTopPlatformsByDataSize,
  getTopProvidersByDataSize,
} from "@/services/noaa";
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
  searchParams?: Promise<{ timeWindowDays?: string; topN?: string }>;
}) {
  const sp = searchParams ? await searchParams : undefined;
  const timeWindowDays = safeNumber(sp?.timeWindowDays, DEFAULT_PLOT_WINDOW_DAYS);
  const topN = Math.min(50, Math.max(1, safeNumber(sp?.topN, 10)));

  const [topProviders, topPlatforms, platformInfo] = await Promise.all([
    getTopProvidersByDataSize({ timeWindowDays, limit: topN }),
    getTopPlatformsByDataSize({ timeWindowDays, limit: topN }),
    getPlatformInfoFromNoaa(),
  ]);

  const platformById = new Map(platformInfo.map((p) => [p.noaa_id, p]));

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6 w-full">
      <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
        <div className="text-blue-800 text-2xl font-bold">Stats</div>
        <div className="text-gray-600 text-sm mt-1">
          Top contributors for the last <span className="font-semibold">{timeWindowDays} days</span>.
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
          <div className="text-blue-800 text-xl font-bold mb-2">Top Trusted Nodes</div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Trusted Node</TableHead>
                <TableHead className="text-right">Approx bytes</TableHead>
                <TableHead className="text-right">Approx depth points</TableHead>
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
                  <TableCell className="text-right">{formatNumber(row.totalDataSize)}</TableCell>
                  <TableCell className="text-right">
                    {formatNumber(bytesToDepthPoints(row.totalDataSize))}
                  </TableCell>
                </TableRow>
              ))}
              {topProviders.length === 0 && (
                <TableRow>
                  <TableCell colSpan={3} className="text-gray-500">
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
                <TableHead className="text-right">Approx bytes</TableHead>
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
                    <TableCell className="text-right">{formatNumber(row.totalDataSize)}</TableCell>
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


