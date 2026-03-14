import { DATA_CACHE_SECONDS } from "@/lib/constants";
import {
  CSBCountData,
  CSBPlatform,
  CSBPlatformCountData,
  CSBProvider,
  ProviderPlatformStackedChartData,
  ProviderSelectOption,
  StackedChartData,
  StackedChartRow,
  StackedChartSeries,
} from "@/lib/types";

export const NOAA_CACHE_TAG = "noaa-data";

const APP_NAME = "FarSounder CSB Viewer App";
const NOAA_ANALYTICS_API_BASE_URL =
  process.env.NOAA_ANALYTICS_API_BASE_URL ??
  "https://noaa-csb-api-613155890800.us-central1.run.app";

const MAP_LAYER_URL = "https://tiles.arcgis.com/tiles/C8EMgrsFcRFL6LrL/arcgis/rest/services/csb_vector_tiles/VectorTileServer";

type RequestConfig = {
  path: string;
  revalidate?: number;
};

export type APIAvailabilityStatus = {
  availablePlatforms: CSBPlatform[];
  availableProviders: CSBProvider[];
  platformFetchFailed: boolean;
  providerFetchFailed: boolean;
  apiUnavailable: boolean;
  mapLayerUnavailable: boolean;
  issues: string[];
};

type PlatformsResponse = {
  platforms: {
    unique_id: string;
    platform_name: string;
    provider: string;
  }[];
};

type ProvidersResponse =
  | {
      providers: string[];
    }
  | {
      providers: {
        provider: string;
      }[];
    };

type TopProvidersResponse = {
  providers: {
    provider: string;
    points: number;
  }[];
};

type TopPlatformsResponse = {
  platforms: {
    unique_id?: string;
    platform_name: string;
    provider?: string;
    points: number;
  }[];
};

type DailyPointsRow = {
  date: string;
  points: number;
  provider?: string;
};

type DailyProviderPointsRow = {
  date: string;
  provider: string;
  points: number;
};

type DailyPlatformPointsRow = {
  date: string;
  unique_id: string;
  platform_name: string;
  points: number;
};

type DailyResponse = {
  daily: DailyPointsRow[];
};

type DailyProvidersResponse = {
  daily: DailyProviderPointsRow[];
};

type DailyPlatformsResponse = {
  daily: DailyPlatformPointsRow[];
};

type DailyPlatformAggregateRow = CSBPlatformCountData & {
  platform: string;
};

const chartDateLabelFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  timeZone: "UTC",
});

const CHART_COLORS = [
  "#2563eb",
  "#0f766e",
  "#7c3aed",
  "#db2777",
  "#ea580c",
  "#ca8a04",
  "#0891b2",
  "#4f46e5",
  "#059669",
  "#dc2626",
  "#9333ea",
  "#0284c7",
];

const OTHER_SERIES_COLOR = "#94a3b8";
const MAX_PLATFORM_SERIES = 10;

function buildApiUrl(path: string): string {
  return `${NOAA_ANALYTICS_API_BASE_URL.replace(/\/$/, "")}${path}`;
}

async function fetchData<T>({ path, revalidate = DATA_CACHE_SECONDS }: RequestConfig): Promise<T> {
  const url = buildApiUrl(path);
  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      "x-application-name": APP_NAME,
    },
    next: { revalidate, tags: [NOAA_CACHE_TAG] },
  });

  if (!response.ok) {
    console.error(`[NOAA CSB API] Response error: ${response.status} ${response.statusText} for ${url}`);
    throw new Error(`Failed to fetch NOAA CSB API data (${response.status} ${response.statusText})`);
  }

  return (await response.json()) as T;
}

function mapPlatform(row: PlatformsResponse["platforms"][number]): CSBPlatform {
  return {
    noaa_id: row.unique_id,
    platform: row.platform_name,
    provider: row.provider,
  };
}

function parseDateParts(date: string): { year: number; month: number; day: number } | null {
  const parsed = new Date(date);
  if (!Number.isFinite(parsed.getTime())) {
    return null;
  }
  return {
    year: parsed.getUTCFullYear(),
    month: parsed.getUTCMonth() + 1,
    day: parsed.getUTCDate(),
  };
}

function sortByDateAsc<T extends { year: number; month: number; day: number }>(rows: T[]): T[] {
  return [...rows].sort((a, b) => {
    if (a.year !== b.year) {
      return a.year - b.year;
    }
    if (a.month !== b.month) {
      return a.month - b.month;
    }
    return a.day - b.day;
  });
}

function toDateKey({ year, month, day }: { year: number; month: number; day: number }): string {
  return `${year.toString().padStart(4, "0")}-${month.toString().padStart(2, "0")}-${day
    .toString()
    .padStart(2, "0")}`;
}

function buildWindowRows(timeWindowDays: number): StackedChartRow[] {
  const endDate = new Date();
  endDate.setUTCHours(0, 0, 0, 0);

  const rows: StackedChartRow[] = [];

  for (let offset = timeWindowDays - 1; offset >= 0; offset -= 1) {
    const date = new Date(endDate);
    date.setUTCDate(endDate.getUTCDate() - offset);

    const dateKey = date.toISOString().slice(0, 10);

    rows.push({
      date: dateKey,
      dateLabel: chartDateLabelFormatter.format(date),
      total: 0,
    });
  }

  return rows;
}

function getSeriesColor(index: number): string {
  return CHART_COLORS[index % CHART_COLORS.length];
}

function getSeriesKey(index: number): string {
  return `series${index + 1}`;
}

function buildProviderOptions(rows: { provider: string }[]): ProviderSelectOption[] {
  return rows.map((row) => ({
    value: row.provider,
    label: row.provider,
  }));
}

function buildTopProvidersFromDailyRows(
  rows: CSBCountData[],
  limit: number
): { provider: string; totalCount: number }[] {
  const totalsByProvider = new Map<string, number>();

  rows.forEach((row) => {
    totalsByProvider.set(row.provider, (totalsByProvider.get(row.provider) ?? 0) + row.count);
  });

  return Array.from(totalsByProvider.entries())
    .map(([provider, totalCount]) => ({
      provider,
      totalCount,
    }))
    .filter((row) => row.totalCount > 0)
    .sort((a, b) => b.totalCount - a.totalCount)
    .slice(0, limit);
}

async function getAllPlatforms(): Promise<CSBPlatform[]> {
  const payload = await fetchData<PlatformsResponse>({ path: "/platforms" });
  return payload.platforms.map(mapPlatform).sort((a, b) => a.noaa_id.localeCompare(b.noaa_id));
}

async function getAllProviders(): Promise<CSBProvider[]> {
  const payload = await fetchData<ProvidersResponse>({ path: "/providers" });
  const names = payload.providers.map((row) => (typeof row === "string" ? row : row.provider));

  return Array.from(new Set(names))
    .sort((a, b) => a.localeCompare(b))
    .map((provider) => ({ provider }));
}

export async function getAPIAvailabilityStatus(): Promise<APIAvailabilityStatus> {
  const [platformsResult, providersResult, healthResult, mapLayerResult] = await Promise.allSettled([
    getAllPlatforms(),
    getAllProviders(),
    fetchData<unknown>({ path: "/health", revalidate: 60 }),
    fetch(MAP_LAYER_URL),
  ]);

  const availablePlatforms = platformsResult.status === "fulfilled" ? platformsResult.value : [];
  const availableProviders = providersResult.status === "fulfilled" ? providersResult.value : [];
  const platformFetchFailed = platformsResult.status === "rejected";
  const providerFetchFailed = providersResult.status === "rejected";
  const apiUnavailable = healthResult.status === "rejected";
  const mapLayerUnavailable = mapLayerResult.status === "rejected";

  const issues: string[] = [];
  if (platformFetchFailed) {
    issues.push("platform list is unavailable");
  }
  if (providerFetchFailed) {
    issues.push("provider list is unavailable");
  }
  if (apiUnavailable) {
    issues.push("analytics API is unavailable");
  }
  if (mapLayerUnavailable) {
    issues.push("CSB map layer is unavailable");
  }

  return {
    availablePlatforms,
    availableProviders,
    platformFetchFailed,
    providerFetchFailed,
    apiUnavailable,
    mapLayerUnavailable,
    issues,
  };
}

export async function getPlatformInfoFromNoaa(): Promise<CSBPlatform[]> {
  try {
    return await getAllPlatforms();
  } catch (error) {
    console.error("Error fetching platforms:", error);
    return [];
  }
}

export async function getProviderInfoFromNoaa(): Promise<CSBProvider[]> {
  try {
    return await getAllProviders();
  } catch (error) {
    console.error("Error fetching providers:", error);
    return [];
  }
}

export async function getTopProvidersByCount({
  timeWindowDays,
  limit,
}: {
  timeWindowDays: number;
  limit: number;
}): Promise<{ provider: string; totalCount: number }[]> {
  try {
    const payload = await fetchData<TopProvidersResponse>({
      path: `/top-providers?days=${encodeURIComponent(String(timeWindowDays))}&limit=${encodeURIComponent(
        String(limit)
      )}`,
    });
    return payload.providers
      .map((row) => ({
        provider: row.provider,
        totalCount: row.points,
      }))
      .sort((a, b) => b.totalCount - a.totalCount)
      .slice(0, limit);
  } catch (error) {
    console.error("Error fetching top providers:", error);
    return [];
  }
}

export async function getTopPlatformsByCount({
  timeWindowDays,
  limit,
}: {
  timeWindowDays: number;
  limit: number;
}): Promise<{ noaaId: string; totalCount: number }[]> {
  try {
    const [payload, allPlatforms] = await Promise.all([
      fetchData<TopPlatformsResponse>({
        path: `/top-platforms?days=${encodeURIComponent(String(timeWindowDays))}&limit=${encodeURIComponent(
          String(limit)
        )}`,
      }),
      getAllPlatforms().catch(() => []),
    ]);
    const platformNameToId = new Map(
      allPlatforms.map((platform) => [platform.platform.toUpperCase(), platform.noaa_id])
    );
    return payload.platforms
      .map((row) => ({
        noaaId: row.unique_id ?? platformNameToId.get(row.platform_name.toUpperCase()) ?? "",
        totalCount: row.points,
      }))
      .filter((row) => row.noaaId)
      .sort((a, b) => b.totalCount - a.totalCount)
      .slice(0, limit);
  } catch (error) {
    console.error("Error fetching top platforms:", error);
    return [];
  }
}

export async function getProviderCountPerDayData({
  provider,
  timeWindowDays,
}: {
  provider: string;
  timeWindowDays: number;
}): Promise<CSBCountData[]> {
  try {
    const payload = await fetchData<DailyResponse>({
      path: `/stats/daily/provider/${encodeURIComponent(provider)}?days=${encodeURIComponent(
        String(timeWindowDays)
      )}`,
    });
    return sortByDateAsc(
      payload.daily.map((row) => {
        const date = parseDateParts(row.date);
        if (!date) {
          return null;
        }
        return {
          ...date,
          provider: row.provider ?? provider,
          count: row.points,
        };
      }).filter((row): row is CSBCountData => row !== null)
    );
  } catch (error) {
    console.error("Error fetching provider daily counts:", error);
    return [];
  }
}

async function getAllProviderCountsPerDayData({
  timeWindowDays,
}: {
  timeWindowDays: number;
}): Promise<CSBCountData[]> {
  try {
    const payload = await fetchData<DailyProvidersResponse>({
      path: `/stats/daily/all/providers?days=${encodeURIComponent(String(timeWindowDays))}`,
    });
    return sortByDateAsc(
      payload.daily
        .map((row) => {
          const date = parseDateParts(row.date);
          if (!date) {
            return null;
          }
          return {
            ...date,
            provider: row.provider,
            count: row.points,
          };
        })
        .filter((row): row is CSBCountData => row !== null)
    );
  } catch (error) {
    console.error("Error fetching all-provider daily provider counts:", error);
    return [];
  }
}

export async function getTotalPerDayAllProviders({
  timeWindowDays,
}: {
  timeWindowDays: number;
}): Promise<CSBCountData[]> {
  try {
    const providerRows = await getAllProviderCountsPerDayData({ timeWindowDays });
    const totalsByDate = new Map<string, number>();

    providerRows.forEach((row) => {
      const dateKey = toDateKey(row);
      totalsByDate.set(dateKey, (totalsByDate.get(dateKey) ?? 0) + row.count);
    });

    return sortByDateAsc(
      Array.from(totalsByDate.entries())
        .map(([dateKey, count]) => {
          const date = parseDateParts(dateKey);
          if (!date) {
            return null;
          }
          return {
            ...date,
            provider: "All Providers",
            count,
          };
        })
        .filter((row): row is CSBCountData => row !== null)
    );
  } catch (error) {
    console.error("Error fetching total per day across all providers:", error);
    return [];
  }
}

export async function getPlatformCountPerDayData({
  noaaId,
  timeWindowDays,
}: {
  noaaId: string;
  timeWindowDays: number;
}): Promise<CSBPlatformCountData[]> {
  try {
    const [payload, platforms] = await Promise.all([
      fetchData<DailyResponse>({
        path: `/stats/daily/platform/${encodeURIComponent(noaaId)}?days=${encodeURIComponent(
          String(timeWindowDays)
        )}`,
      }),
      getAllPlatforms().catch(() => []),
    ]);
    const platformProvider =
      platforms.find((platform) => platform.noaa_id.toUpperCase() === noaaId.toUpperCase())?.provider ??
      "Unknown provider";
    return sortByDateAsc(payload.daily.map((row) => {
      const date = parseDateParts(row.date);
      if (!date) {
        return null;
      }
      return {
        ...date,
        noaa_id: noaaId,
        provider: row.provider ?? platformProvider,
        count: row.points,
      };
    }).filter((row): row is CSBPlatformCountData => row !== null));
  } catch (error) {
    console.error("Error fetching platform daily counts:", error);
    return [];
  }
}

async function getAllPlatformCountsPerDayData({
  timeWindowDays,
  platformsById,
}: {
  timeWindowDays: number;
  platformsById?: Map<string, CSBPlatform>;
}): Promise<DailyPlatformAggregateRow[]> {
  try {
    const [payload, allPlatforms] = await Promise.all([
      fetchData<DailyPlatformsResponse>({
        path: `/stats/daily/all/platforms?days=${encodeURIComponent(String(timeWindowDays))}`,
      }),
      platformsById ? Promise.resolve(null) : getAllPlatforms().catch(() => []),
    ]);

    const resolvedPlatformsById =
      platformsById ??
      new Map((allPlatforms ?? []).map((platform) => [platform.noaa_id.toUpperCase(), platform]));

    return sortByDateAsc(
      payload.daily
        .map((row) => {
          const date = parseDateParts(row.date);
          if (!date || !row.unique_id) {
            return null;
          }

          const normalizedId = row.unique_id.toUpperCase();
          const platformInfo = resolvedPlatformsById.get(normalizedId);

          return {
            ...date,
            noaa_id: normalizedId,
            provider: platformInfo?.provider ?? "Unknown provider",
            platform: platformInfo?.platform ?? row.platform_name,
            count: row.points,
          };
        })
        .filter((row): row is DailyPlatformAggregateRow => row !== null)
    );
  } catch (error) {
    console.error("Error fetching all-platform daily counts:", error);
    return [];
  }
}

export async function getProviderDailyStackedChartData({
  timeWindowDays,
  limit,
}: {
  timeWindowDays: number;
  limit: number;
}): Promise<StackedChartData> {
  // TODO most of this logic belongs not in here
  const rows = buildWindowRows(timeWindowDays);
  const rowByDate = new Map(rows.map((row) => [row.date, row]));

  try {
    const allProviderRows = await getAllProviderCountsPerDayData({ timeWindowDays });
    const topProviders = buildTopProvidersFromDailyRows(allProviderRows, limit);
    const providerSeriesKeyByName = new Map<string, string>();
    const series: StackedChartSeries[] = topProviders.map((providerRow, index) => {
      const seriesKey = getSeriesKey(index);
      providerSeriesKeyByName.set(providerRow.provider, seriesKey);

      return {
        key: seriesKey,
        label: providerRow.provider,
        color: getSeriesColor(index),
        total: providerRow.totalCount,
      };
    });

    let otherTotal = 0;

    allProviderRows.forEach((row) => {
      const chartRow = rowByDate.get(toDateKey(row));
      if (!chartRow) {
        return;
      }

      chartRow.total += row.count;

      const seriesKey = providerSeriesKeyByName.get(row.provider);
      if (seriesKey) {
        chartRow[seriesKey] = Number(chartRow[seriesKey] ?? 0) + row.count;
      } else {
        chartRow.other = Number(chartRow.other ?? 0) + row.count;
        otherTotal += row.count;
      }
    });

    if (otherTotal > 0) {
      series.push({
        key: "other",
        label: "Other",
        color: OTHER_SERIES_COLOR,
        total: otherTotal,
      });
    }

    return {
      rows,
      series,
    };
  } catch (error) {
    console.error("Error building provider stacked chart data:", error);
    return {
      rows,
      series: [],
    };
  }
}

export async function getProviderPlatformDailyStackedChartData({
  timeWindowDays,
  limit,
  selectedProvider,
}: {
  timeWindowDays: number;
  limit: number;
  selectedProvider?: string;
}): Promise<ProviderPlatformStackedChartData> {
  // TODO most of this logic belongs not in here
  const rows = buildWindowRows(timeWindowDays);
  const rowByDate = new Map(rows.map((row) => [row.date, row]));

  try {
    const platforms = await getPlatformInfoFromNoaa();
    const platformsById = new Map(platforms.map((platform) => [platform.noaa_id.toUpperCase(), platform]));
    const [allProviderRows, allPlatformRows] = await Promise.all([
      getAllProviderCountsPerDayData({ timeWindowDays }),
      getAllPlatformCountsPerDayData({ timeWindowDays, platformsById }),
    ]);

    // TODO this should just be all providers
    const providerOptions = buildProviderOptions(buildTopProvidersFromDailyRows(allProviderRows, limit));
    const resolvedProvider =
      providerOptions.find((provider) => provider.value === selectedProvider)?.value ??
      providerOptions[0]?.value ??
      "";

    if (!resolvedProvider) {
      return {
        selectedProvider: "",
        providerOptions,
        rows,
        series: [],
      };
    }

    const providerPlatformRows = allPlatformRows.filter((row) => row.provider === resolvedProvider);
    const totalsByPlatformId = new Map<string, DailyPlatformAggregateRow & { total: number }>();

    providerPlatformRows.forEach((row) => {
      const platformIdKey = row.noaa_id.toUpperCase();
      const existing = totalsByPlatformId.get(platformIdKey);
      if (existing) {
        existing.total += row.count;
        return;
      }

      totalsByPlatformId.set(platformIdKey, {
        ...row,
        total: row.count,
      });
    });

    const sortedPlatformResults = Array.from(totalsByPlatformId.values())
      .filter((platformResult) => platformResult.total > 0)
      .sort((a, b) => b.total - a.total);

    const topPlatformResults = sortedPlatformResults.slice(0, MAX_PLATFORM_SERIES);
    const visibleSeriesKeyByPlatformId = new Map<string, string>();
    const series: StackedChartSeries[] = topPlatformResults.map((platformResult, index) => {
      const seriesKey = getSeriesKey(index);
      visibleSeriesKeyByPlatformId.set(platformResult.noaa_id.toUpperCase(), seriesKey);

      const platformInfo = platformsById.get(platformResult.noaa_id.toUpperCase());
      const label = platformInfo?.platform
        ? `${platformInfo.platform} (${platformInfo.noaa_id})`
        : platformResult.platform
          ? `${platformResult.platform} (${platformResult.noaa_id})`
          : platformResult.noaa_id;

      return {
        key: seriesKey,
        label,
        color: getSeriesColor(index),
        total: platformResult.total,
      };
    });

    let otherTotal = 0;

    providerPlatformRows.forEach((row) => {
      const chartRow = rowByDate.get(toDateKey(row));
      if (!chartRow) {
        return;
      }

      chartRow.total += row.count;

      const seriesKey = visibleSeriesKeyByPlatformId.get(row.noaa_id.toUpperCase());
      if (seriesKey) {
        chartRow[seriesKey] = Number(chartRow[seriesKey] ?? 0) + row.count;
      } else {
        chartRow.allOthers = Number(chartRow.allOthers ?? 0) + row.count;
        otherTotal += row.count;
      }
    });

    if (otherTotal > 0) {
      series.push({
        key: "allOthers",
        label: "All Others",
        color: OTHER_SERIES_COLOR,
        total: otherTotal,
      });
    }

    return {
      selectedProvider: resolvedProvider,
      providerOptions,
      rows,
      series,
    };
  } catch (error) {
    console.error("Error building provider platform stacked chart data:", error);
    return {
      selectedProvider: "",
      providerOptions: [],
      rows,
      series: [],
    };
  }
}
