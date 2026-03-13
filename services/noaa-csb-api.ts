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

type DailyResponse = {
  daily: DailyPointsRow[];
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

function sumCounts<T extends { count: number }>(rows: T[]): number {
  return rows.reduce((sum, row) => sum + row.count, 0);
}

function buildProviderOptions(rows: { provider: string }[]): ProviderSelectOption[] {
  return rows.map((row) => ({
    value: row.provider,
    label: row.provider,
  }));
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

export async function getTotalPerDayAllProviders({
  timeWindowDays,
}: {
  timeWindowDays: number;
}): Promise<CSBCountData[]> {
  try {
    const payload = await fetchData<DailyResponse>({
      path: `/stats/daily/all/providers?days=${encodeURIComponent(String(timeWindowDays))}`,
    });
    return sortByDateAsc(payload.daily.map((row) => {
      const date = parseDateParts(row.date);
      if (!date) {
        return null;
      }
      return {
        ...date,
        provider: row.provider ?? "All Providers",
        count: row.points,
      };
    }).filter((row): row is CSBCountData => row !== null));
  } catch (error) {
    console.error("Error fetching all-provider daily counts:", error);
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

export async function getProviderDailyStackedChartData({
  timeWindowDays,
  limit,
}: {
  timeWindowDays: number;
  limit: number;
}): Promise<StackedChartData> {
  const rows = buildWindowRows(timeWindowDays);
  const rowByDate = new Map(rows.map((row) => [row.date, row]));

  try {
    const [topProviders, totalData] = await Promise.all([
      getTopProvidersByCount({ timeWindowDays, limit }),
      getTotalPerDayAllProviders({ timeWindowDays }),
    ]);

    totalData.forEach((row) => {
      const dateKey = toDateKey(row);
      const chartRow = rowByDate.get(dateKey);
      if (chartRow) {
        chartRow.total = row.count;
      }
    });

    const providerResults = await Promise.all(
      topProviders.map(async (providerRow) => ({
        provider: providerRow.provider,
        rows: await getProviderCountPerDayData({
          provider: providerRow.provider,
          timeWindowDays,
        }),
      }))
    );

    const series: StackedChartSeries[] = [];

    providerResults.forEach((providerResult) => {
      const providerTotal = sumCounts(providerResult.rows);
      if (providerTotal <= 0) {
        return;
      }

      const seriesKey = getSeriesKey(series.length);

      providerResult.rows.forEach((row) => {
        const chartRow = rowByDate.get(toDateKey(row));
        if (chartRow) {
          chartRow[seriesKey] = row.count;
        }
      });

      series.push({
        key: seriesKey,
        label: providerResult.provider,
        color: getSeriesColor(series.length),
        total: providerTotal,
      });
    });

    let otherTotal = 0;

    rows.forEach((row) => {
      const visibleTotal = series.reduce((sum, currentSeries) => {
        return sum + Number(row[currentSeries.key] ?? 0);
      }, 0);

      row.total = Math.max(row.total, visibleTotal);

      const other = Math.max(0, row.total - visibleTotal);
      if (other > 0) {
        row.other = other;
        otherTotal += other;
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
  const rows = buildWindowRows(timeWindowDays);
  const rowByDate = new Map(rows.map((row) => [row.date, row]));

  try {
    const [topProviders, platforms] = await Promise.all([
      getTopProvidersByCount({ timeWindowDays, limit }),
      getPlatformInfoFromNoaa(),
    ]);

    const providerOptions = buildProviderOptions(topProviders);
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

    const providerPlatforms = platforms.filter((platform) => platform.provider === resolvedProvider);

    const platformResults = await Promise.all(
      providerPlatforms.map(async (platform) => ({
        platform,
        rows: await getPlatformCountPerDayData({
          noaaId: platform.noaa_id,
          timeWindowDays,
        }),
      }))
    );

    const sortedPlatformResults = platformResults
      .map((platformResult) => ({
        ...platformResult,
        total: sumCounts(platformResult.rows),
      }))
      .filter((platformResult) => platformResult.total > 0)
      .sort((a, b) => b.total - a.total);

    const topPlatformResults = sortedPlatformResults.slice(0, MAX_PLATFORM_SERIES);
    const otherPlatformResults = sortedPlatformResults.slice(MAX_PLATFORM_SERIES);

    const series: StackedChartSeries[] = [];

    topPlatformResults.forEach((platformResult) => {
      const seriesKey = getSeriesKey(series.length);
      const label = platformResult.platform.platform
        ? `${platformResult.platform.platform} (${platformResult.platform.noaa_id})`
        : platformResult.platform.noaa_id;

      platformResult.rows.forEach((row) => {
        const chartRow = rowByDate.get(toDateKey(row));
        if (chartRow) {
          chartRow[seriesKey] = row.count;
        }
      });

      series.push({
        key: seriesKey,
        label,
        color: getSeriesColor(series.length),
        total: platformResult.total,
      });
    });

    let otherTotal = 0;

    otherPlatformResults.forEach((platformResult) => {
      const seriesKey = "allOthers";

      platformResult.rows.forEach((row) => {
        const chartRow = rowByDate.get(toDateKey(row));
        if (chartRow) {
          chartRow[seriesKey] = Number(chartRow[seriesKey] ?? 0) + row.count;
        }
      });

      otherTotal += platformResult.total;
    });

    if (otherTotal > 0) {
      series.push({
        key: "allOthers",
        label: "All Others",
        color: OTHER_SERIES_COLOR,
        total: otherTotal,
      });
    }

    rows.forEach((row) => {
      row.total = series.reduce((sum, currentSeries) => sum + Number(row[currentSeries.key] ?? 0), 0);
    });

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
