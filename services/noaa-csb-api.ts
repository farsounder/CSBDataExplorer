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

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : null;
}

function pickArray(payload: unknown, keys: string[]): unknown[] {
  if (Array.isArray(payload)) {
    return payload;
  }
  const record = asRecord(payload);
  if (!record) {
    return [];
  }
  for (const key of keys) {
    const maybeArray = record[key];
    if (Array.isArray(maybeArray)) {
      return maybeArray;
    }
  }
  return [];
}

function pickString(record: Record<string, unknown>, keys: string[], fallback = ""): string {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }
  return fallback;
}

function pickNumber(record: Record<string, unknown>, keys: string[], fallback = 0): number {
  for (const key of keys) {
    const raw = record[key];
    const numeric = typeof raw === "number" ? raw : Number(raw);
    if (Number.isFinite(numeric)) {
      return numeric;
    }
  }
  return fallback;
}

function parseDateParts(record: Record<string, unknown>): { year: number; month: number; day: number } | null {
  const year = pickNumber(record, ["year", "Year", "YEAR"], NaN);
  const month = pickNumber(record, ["month", "Month", "MONTH"], NaN);
  const day = pickNumber(record, ["day", "Day", "DAY"], NaN);

  if (Number.isFinite(year) && Number.isFinite(month) && Number.isFinite(day)) {
    return { year, month, day };
  }

  const dateText = pickString(record, ["date", "Date", "DATE", "day_date"]);
  if (!dateText) {
    return null;
  }
  const parsed = new Date(dateText);
  if (!Number.isFinite(parsed.getTime())) {
    return null;
  }
  return {
    year: parsed.getUTCFullYear(),
    month: parsed.getUTCMonth() + 1,
    day: parsed.getUTCDate(),
  };
}

function parseDailyRows(payload: unknown): Record<string, unknown>[] {
  return pickArray(payload, ["daily", "rows", "data", "items", "results"])
    .map(asRecord)
    .filter((row): row is Record<string, unknown> => Boolean(row));
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
  const payload = await fetchNoaaData<unknown>({ path: "/platforms" });
  const rows = pickArray(payload, ["platforms", "rows", "data", "items", "results"]);

  const mapped = rows
    .map(asRecord)
    .filter((row): row is Record<string, unknown> => Boolean(row))
    .map((row) => ({
      noaa_id: pickString(row, [
        "id",
        "unique_id",
        "external_id",
        "platform_id",
        "platformId",
        "noaa_id",
        "noaaId",
      ]),
      platform: pickString(row, ["name", "platform", "display_name", "platform_name"], "Unknown platform"),
      provider: pickString(row, ["provider", "PROVIDER"], "Unknown provider"),
    }))
    .filter((row) => row.noaa_id);

  const uniqueById = new Map<string, CSBPlatform>();
  for (const row of mapped) {
    if (!uniqueById.has(row.noaa_id)) {
      uniqueById.set(row.noaa_id, row);
    }
  }

  return Array.from(uniqueById.values()).sort((a, b) => a.noaa_id.localeCompare(b.noaa_id));
}

async function getAllProviders(): Promise<CSBProvider[]> {
  const payload = await fetchNoaaData<unknown>({ path: "/providers" });
  const rows = pickArray(payload, ["providers", "rows", "data", "items", "results"]);

  const names = rows
    .map((row) => {
      if (typeof row === "string") {
        return row.trim();
      }
      const asObj = asRecord(row);
      if (!asObj) {
        return "";
      }
      return pickString(asObj, ["provider", "name", "id", "PROVIDER"]);
    })
    .filter(Boolean);

  return Array.from(new Set(names))
    .sort((a, b) => a.localeCompare(b))
    .map((provider) => ({ provider }));
}

async function getPlatformById(noaaId: string): Promise<CSBPlatform | null> {
  try {
    const payload = await fetchNoaaData<unknown>({
      path: `/platforms/${encodeURIComponent(noaaId)}`,
    });
    const row = asRecord(payload);
    if (!row) {
      return null;
    }
    const resolvedId = pickString(row, [
      "id",
      "unique_id",
      "external_id",
      "platform_id",
      "platformId",
      "noaa_id",
      "noaaId",
    ]);
    if (!resolvedId) {
      return null;
    }
    return {
      noaa_id: resolvedId,
      platform: pickString(row, ["name", "platform", "display_name", "platform_name"], "Unknown platform"),
      provider: pickString(row, ["provider", "PROVIDER"], "Unknown provider"),
    };
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
    const payload = await fetchNoaaData<unknown>({
      path: `/top-providers?days=${encodeURIComponent(String(timeWindowDays))}&limit=${encodeURIComponent(
        String(limit)
      )}`,
    });
    const rows = pickArray(payload, ["top_providers", "providers", "rows", "data", "items", "results"]);
    return rows
      .map(asRecord)
      .filter((row): row is Record<string, unknown> => Boolean(row))
      .map((row) => ({
        provider: pickString(row, ["provider", "name", "id", "PROVIDER"]),
        totalCount: pickNumber(row, [
          "count",
          "total_count",
          "points",
          "total_points",
          "point_count",
          "pointCount",
          "value",
        ]),
      }))
      .filter((row) => row.provider)
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
      fetchNoaaData<unknown>({
        path: `/top-platforms?days=${encodeURIComponent(String(timeWindowDays))}&limit=${encodeURIComponent(
          String(limit)
        )}`,
      }),
      getAllPlatforms().catch(() => []),
    ]);
    const platformNameToId = new Map(
      allPlatforms.map((platform) => [platform.platform.toUpperCase(), platform.noaa_id])
    );
    const rows = pickArray(payload, ["top_platforms", "platforms", "rows", "data", "items", "results"]);
    return rows
      .map(asRecord)
      .filter((row): row is Record<string, unknown> => Boolean(row))
      .map((row) => ({
        noaaId: (() => {
          const id = pickString(row, [
            "id",
            "unique_id",
            "external_id",
            "platform_id",
            "platformId",
            "noaa_id",
            "noaaId",
          ]);
          if (id) {
            return id;
          }
          const platformName = pickString(row, ["platform_name", "platform", "name"]);
          return platformNameToId.get(platformName.toUpperCase()) ?? "";
        })(),
        totalCount: pickNumber(row, [
          "count",
          "total_count",
          "points",
          "total_points",
          "point_count",
          "pointCount",
          "value",
        ]),
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
    const payload = await fetchNoaaData<unknown>({
      path: `/stats/daily/provider/${encodeURIComponent(provider)}?days=${encodeURIComponent(
        String(timeWindowDays)
      )}`,
    });

    const rows: CSBCountData[] = [];
    for (const row of parseDailyRows(payload)) {
      const date = parseDateParts(row);
      if (!date) {
        continue;
      }
      rows.push({
        ...date,
        provider: pickString(row, ["provider", "PROVIDER"], provider),
        count: pickNumber(row, [
          "count",
          "total_count",
          "points",
          "total_points",
          "point_count",
          "pointCount",
          "value",
        ]),
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
    const payload = await fetchNoaaData<unknown>({
      path: `/stats/daily/all/providers?days=${encodeURIComponent(String(timeWindowDays))}`,
    });

    const rows: CSBCountData[] = [];
    for (const row of parseDailyRows(payload)) {
      const date = parseDateParts(row);
      if (!date) {
        continue;
      }
      rows.push({
        ...date,
        provider: "All Providers",
        count: pickNumber(row, [
          "count",
          "total_count",
          "points",
          "total_points",
          "point_count",
          "pointCount",
          "value",
        ]),
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
      fetchNoaaData<unknown>({
        path: `/stats/daily/platform/${encodeURIComponent(noaaId)}?days=${encodeURIComponent(
          String(timeWindowDays)
        )}`,
      }),
      getPlatformById(noaaId),
      getPlatformInfoFromNoaa(),
    ]);

    const provider = platformById?.provider ?? platforms.find((platform) => platform.noaa_id === noaaId)?.provider;

    const rows: CSBPlatformCountData[] = [];
    for (const row of parseDailyRows(payload)) {
      const date = parseDateParts(row);
      if (!date) {
        continue;
      }
      rows.push({
        ...date,
        noaa_id: noaaId,
        provider: pickString(row, ["provider", "PROVIDER"], provider ?? "Unknown provider"),
        count: pickNumber(row, [
          "count",
          "total_count",
          "points",
          "total_points",
          "point_count",
          "pointCount",
          "value",
        ]),
      });
    }

    return sortByDateAsc(rows);
  } catch (error) {
    console.error("Error fetching platform daily counts:", error);
    return [];
  }
}
