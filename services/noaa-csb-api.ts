import { DATA_CACHE_SECONDS } from "@/lib/constants";
import {
  CSBCountData,
  CSBPlatform,
  CSBPlatformCountData,
  CSBProvider,
} from "@/lib/types";

export const NOAA_CACHE_TAG = "noaa-data";

const APP_NAME = "FarSounder CSB Viewer App";
const NOAA_ANALYTICS_API_BASE_URL =
  process.env.NOAA_ANALYTICS_API_BASE_URL ??
  "https://noaa-csb-api-613155890800.us-central1.run.app";

type NoaaRequestConfig = {
  path: string;
  revalidate?: number;
};

export type NoaaAvailabilityStatus = {
  availablePlatforms: CSBPlatform[];
  availableProviders: CSBProvider[];
  platformFetchFailed: boolean;
  providerFetchFailed: boolean;
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

type PlatformByIdResponse = {
  unique_id: string;
  platform_name: string;
  provider: string;
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

function buildApiUrl(path: string): string {
  return `${NOAA_ANALYTICS_API_BASE_URL.replace(/\/$/, "")}${path}`;
}

async function fetchNoaaData<T>({ path, revalidate = DATA_CACHE_SECONDS }: NoaaRequestConfig): Promise<T> {
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

function mapPlatform(row: PlatformsResponse["platforms"][number] | PlatformByIdResponse): CSBPlatform {
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

async function getAllPlatforms(): Promise<CSBPlatform[]> {
  const payload = await fetchNoaaData<PlatformsResponse>({ path: "/platforms" });
  return payload.platforms.map(mapPlatform).sort((a, b) => a.noaa_id.localeCompare(b.noaa_id));
}

async function getAllProviders(): Promise<CSBProvider[]> {
  const payload = await fetchNoaaData<ProvidersResponse>({ path: "/providers" });
  const names = payload.providers.map((row) => (typeof row === "string" ? row : row.provider));

  return Array.from(new Set(names))
    .sort((a, b) => a.localeCompare(b))
    .map((provider) => ({ provider }));
}

async function getPlatformById(noaaId: string): Promise<CSBPlatform | null> {
  try {
    const payload = await fetchNoaaData<PlatformByIdResponse>({
      path: `/platforms/${encodeURIComponent(noaaId)}`,
    });
    return mapPlatform(payload);
  } catch {
    return null;
  }
}

export async function getNoaaAvailabilityStatus(): Promise<NoaaAvailabilityStatus> {
  const [platformsResult, providersResult, healthResult] = await Promise.allSettled([
    getAllPlatforms(),
    getAllProviders(),
    fetchNoaaData<unknown>({ path: "/health", revalidate: 60 }),
  ]);

  const availablePlatforms = platformsResult.status === "fulfilled" ? platformsResult.value : [];
  const availableProviders = providersResult.status === "fulfilled" ? providersResult.value : [];
  const platformFetchFailed = platformsResult.status === "rejected";
  const providerFetchFailed = providersResult.status === "rejected";
  const mapLayerUnavailable = healthResult.status === "rejected";

  const issues: string[] = [];
  if (platformFetchFailed) {
    issues.push("platform list is unavailable");
  }
  if (providerFetchFailed) {
    issues.push("provider list is unavailable");
  }
  if (mapLayerUnavailable) {
    issues.push("analytics API is unavailable");
  }

  return {
    availablePlatforms,
    availableProviders,
    platformFetchFailed,
    providerFetchFailed,
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
    const payload = await fetchNoaaData<TopProvidersResponse>({
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
      fetchNoaaData<TopPlatformsResponse>({
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
    const payload = await fetchNoaaData<DailyResponse>({
      path: `/stats/daily/provider/${encodeURIComponent(provider)}?days=${encodeURIComponent(
        String(timeWindowDays)
      )}`,
    });

    const rows: CSBCountData[] = [];
    for (const row of payload.daily) {
      const date = parseDateParts(row.date);
      if (!date) {
        continue;
      }
      rows.push({
        ...date,
        provider: row.provider ?? provider,
        count: row.points,
      });
    }

    return sortByDateAsc(rows);
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
    const payload = await fetchNoaaData<DailyResponse>({
      path: `/stats/daily/all/providers?days=${encodeURIComponent(String(timeWindowDays))}`,
    });

    const rows: CSBCountData[] = [];
    for (const row of payload.daily) {
      const date = parseDateParts(row.date);
      if (!date) {
        continue;
      }
      rows.push({
        ...date,
        provider: row.provider ?? "All Providers",
        count: row.points,
      });
    }

    return sortByDateAsc(rows);
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
    const [payload, platformById, platforms] = await Promise.all([
      fetchNoaaData<DailyResponse>({
        path: `/stats/daily/platform/${encodeURIComponent(noaaId)}?days=${encodeURIComponent(
          String(timeWindowDays)
        )}`,
      }),
      getPlatformById(noaaId),
      getPlatformInfoFromNoaa(),
    ]);

    const provider = platformById?.provider ?? platforms.find((platform) => platform.noaa_id === noaaId)?.provider;

    const rows: CSBPlatformCountData[] = [];
    for (const row of payload.daily) {
      const date = parseDateParts(row.date);
      if (!date) {
        continue;
      }
      rows.push({
        ...date,
        noaa_id: noaaId,
        provider: row.provider ?? provider ?? "Unknown provider",
        count: row.points,
      });
    }

    return sortByDateAsc(rows);
  } catch (error) {
    console.error("Error fetching platform daily counts:", error);
    return [];
  }
}
