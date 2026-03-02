import { CSBData, CSBPlatform, CSBPlatformData, CSBProvider } from "@/lib/types";
import { DATA_CACHE_SECONDS } from "@/lib/constants";

const NOAA_BASE = "https://gis.ngdc.noaa.gov/arcgis/rest/services/csb/MapServer/1/query?f=json";
const NOAA_MAP_SERVER_METADATA_URL = "https://tiles.arcgis.com/tiles/C8EMgrsFcRFL6LrL/arcgis/rest/services/csb_vector_tiles/VectorTileServer";
export const NOAA_CACHE_TAG = "noaa-data";
const APP_NAME = "FarSounder CSB Viewer App";

type NoaaRequestConfig = {
  url: string;
  revalidate?: number;
};

// Types for the NOAA API responses, could use zod to validate the responses
// for now, just dig into it when it breaks
type NoaaApiPlatformResponse = {
  features: {
    attributes: {
      EXTERNAL_ID: string;
      PROVIDER: string;
      PLATFORM: string;
    };
  }[];
};

type NoaaApiProviderResponse = {
  features: {
    attributes: {
      PROVIDER: string;
    };
  }[];
};

type NoaaApiGroupedStatsResponse = {
  features?: {
    attributes: Record<string, any>;
  }[];
};

type ArcGisErrorPayload = {
  error?: {
    code?: number;
    message?: string;
    details?: string[];
  };
};

export type NoaaAvailabilityStatus = {
  availablePlatforms: CSBPlatform[];
  availableProviders: CSBProvider[];
  platformFetchFailed: boolean;
  providerFetchFailed: boolean;
  mapLayerUnavailable: boolean;
  issues: string[];
};

function getArcGisErrorMessage(payload: ArcGisErrorPayload): string | null {
  if (!payload?.error) {
    return null;
  }

  const details = payload.error.details?.filter(Boolean).join(" | ");
  const base = payload.error.message || "ArcGIS service error";
  return details ? `${base} (${details})` : base;
}

// Common fetch function with error handling
async function fetchNoaaData<T>({
  url,
  revalidate = DATA_CACHE_SECONDS,
}: NoaaRequestConfig): Promise<T> {
  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      "x-application-name": APP_NAME,
    },
    next: { revalidate, tags: [NOAA_CACHE_TAG] },
  });

  if (!response.ok) {
    console.error(`[NOAA] Response error: ${response.status} ${response.statusText} for ${url}`);
    throw new Error(
      `Failed to fetch NOAA data. Code: ${response.status}, text: ${response.statusText}`
    );
  }

  const payload = (await response.json()) as T & ArcGisErrorPayload;
  const arcGisErrorMessage = getArcGisErrorMessage(payload);
  if (arcGisErrorMessage) {
    console.error(`[NOAA] ArcGIS error payload for ${url}: ${arcGisErrorMessage}`);
    throw new Error(`NOAA ArcGIS error: ${arcGisErrorMessage}`);
  }

  return payload;
}

// Common statistics configuration
const baseStatistics = [
  {
    statisticType: "sum",
    onStatisticField: "FILE_SIZE",
    outStatisticFieldName: "total_data_size",
  },
];

// Generic function to generate stats URL
function generateStatsUrl(
  timeWindowDays: number,
  filters?: { type: "provider" | "platform"; value: string }[]
): string {
  let where = `START_DATE >= CURRENT_TIMESTAMP - INTERVAL '${timeWindowDays}' DAY`;
  if (filters) {
    where += filters
      .map((filter) => {
        const field = filter.type === "provider" ? "PROVIDER" : "EXTERNAL_ID";
        return ` AND UPPER(${field}) LIKE '${filter.value}'`;
      })
      .join("");
  }
  const groupByFields =
    "EXTRACT(MONTH from START_DATE),EXTRACT(DAY from START_DATE),EXTRACT(YEAR FROM START_DATE)";
  return `${NOAA_BASE}&where=${where}&returnGeometry=false&outStatistics=${JSON.stringify(
    baseStatistics
  )}&groupByFieldsForStatistics=${groupByFields}`;
}

function generateGroupedTotalsUrl({
  timeWindowDays,
  groupByField,
  limit,
}: {
  timeWindowDays: number;
  groupByField: "PROVIDER" | "EXTERNAL_ID";
  limit: number;
}): string {
  const where = `START_DATE >= CURRENT_TIMESTAMP - INTERVAL '${timeWindowDays}' DAY`;
  return (
    `${NOAA_BASE}` +
    `&where=${where}` +
    `&returnGeometry=false` +
    `&outFields=${groupByField}` +
    `&outStatistics=${JSON.stringify(baseStatistics)}` +
    `&groupByFieldsForStatistics=${groupByField}` +
    `&orderByFields=total_data_size DESC` +
    `&resultRecordCount=${limit}`
  );
}

async function getAllPlatforms(): Promise<CSBPlatform[]> {
  const url = `${NOAA_BASE}&where=1%3D1&outFields=EXTERNAL_ID,PROVIDER,PLATFORM&returnGeometry=false&orderByFields=EXTERNAL_ID&returnDistinctValues=true`;
  return fetchNoaaData<NoaaApiPlatformResponse>({ url }).then((data) =>
    data.features.map((item: any) => {
      return {
        platform: item.attributes.PLATFORM,
        noaa_id: item.attributes.EXTERNAL_ID,
        provider: item.attributes.PROVIDER,
      };
    })
  );
}

async function getAllProviders(): Promise<CSBProvider[]> {
  const url = `${NOAA_BASE}&where=1%3D1&outFields=PROVIDER&returnGeometry=false&orderByFields=PROVIDER&returnDistinctValues=true`;
  return fetchNoaaData<NoaaApiProviderResponse>({ url }).then((data) =>
    data.features.map((item: any) => ({ provider: item.attributes.PROVIDER }))
  );
}

export async function getNoaaAvailabilityStatus(): Promise<NoaaAvailabilityStatus> {
  const [platformsResult, providersResult, mapLayerResult] = await Promise.allSettled([
    getAllPlatforms(),
    getAllProviders(),
    fetchNoaaData<Record<string, unknown>>({ url: NOAA_MAP_SERVER_METADATA_URL }),
  ]);

  const availablePlatforms = platformsResult.status === "fulfilled" ? platformsResult.value : [];
  const availableProviders = providersResult.status === "fulfilled" ? providersResult.value : [];
  const platformFetchFailed = platformsResult.status === "rejected";
  const providerFetchFailed = providersResult.status === "rejected";
  const mapLayerUnavailable = mapLayerResult.status === "rejected";

  const issues: string[] = [];
  if (platformFetchFailed) {
    issues.push("platform list is unavailable");
  }
  if (providerFetchFailed) {
    issues.push("provider list is unavailable");
  }
  if (mapLayerUnavailable) {
    issues.push("CSB map layer is unavailable");
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
    console.error(error);
    return [];
  }
}

export async function getProviderInfoFromNoaa(): Promise<CSBProvider[]> {
  try {
    return await getAllProviders();
  } catch (error) {
    console.error(error);
    return [];
  }
}

export async function getTopProvidersByDataSize({
  timeWindowDays,
  limit,
}: {
  timeWindowDays: number;
  limit: number;
}): Promise<{ provider: string; totalDataSize: number }[]> {
  try {
    const url = generateGroupedTotalsUrl({ timeWindowDays, groupByField: "PROVIDER", limit });
    const data = await fetchNoaaData<NoaaApiGroupedStatsResponse>({ url });
    const rows =
      data.features?.map((item) => ({
        provider: String(item.attributes.PROVIDER),
        totalDataSize: Number(item.attributes.total_data_size ?? 0),
      })) ?? [];

    return rows
      .filter((r) => r.provider && !Number.isNaN(r.totalDataSize))
      .sort((a, b) => b.totalDataSize - a.totalDataSize)
      .slice(0, limit);
  } catch (error) {
    console.error("Error fetching top providers:", error);
    return [];
  }
}

export async function getTopPlatformsByDataSize({
  timeWindowDays,
  limit,
}: {
  timeWindowDays: number;
  limit: number;
}): Promise<{ noaaId: string; totalDataSize: number }[]> {
  try {
    const url = generateGroupedTotalsUrl({ timeWindowDays, groupByField: "EXTERNAL_ID", limit });
    const data = await fetchNoaaData<NoaaApiGroupedStatsResponse>({ url });
    const rows =
      data.features?.map((item) => ({
        noaaId: String(item.attributes.EXTERNAL_ID),
        totalDataSize: Number(item.attributes.total_data_size ?? 0),
      })) ?? [];

    return rows
      .filter((r) => r.noaaId && !Number.isNaN(r.totalDataSize))
      .sort((a, b) => b.totalDataSize - a.totalDataSize)
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
}): Promise<CSBData[]> {
  try {
    const url = generateStatsUrl(timeWindowDays, [
      { type: "provider", value: provider.toUpperCase() },
    ]);
    const data = await fetchNoaaData<any>({ url });

    return (
      data.features?.map((item: any) => ({
        month: item.attributes.Expr1,
        day: item.attributes.Expr2,
        year: item.attributes.Expr3,
        provider: provider,
        dataSize: item.attributes.total_data_size,
      })) ?? []
    );
  } catch (error) {
    console.error("Error fetching provider data:", error);
    return [];
  }
}

export async function getTotalPerDayAllProviders({
  timeWindowDays,
}: {
  timeWindowDays: number;
}): Promise<CSBData[]> {
  // Return the total data size per day, across all providers
  try {
    const url = generateStatsUrl(timeWindowDays, []);
    const data = await fetchNoaaData<any>({ url });

    return (
      data.features?.map((item: any) => ({
        month: item.attributes.Expr1,
        day: item.attributes.Expr2,
        year: item.attributes.Expr3,
        dataSize: item.attributes.total_data_size,
      })) ?? []
    );
  } catch (error) {
    console.error("Error fetching total per day data:", error);
    return [];
  }
}

export async function getPlatformCountPerDayData({
  noaaId,
  timeWindowDays,
}: {
  noaaId: string;
  timeWindowDays: number;
}): Promise<CSBPlatformData[]> {
  try {
    const url = generateStatsUrl(timeWindowDays, [
      { type: "platform", value: noaaId.toUpperCase() },
    ]);
    const data = await fetchNoaaData<any>({ url });

    // Get the provider from the noaaId
    const platforms = await getPlatformInfoFromNoaa();
    const platform = platforms.find((p) => p.noaa_id === noaaId);

    return (
      data.features?.map((item: any) => ({
        noaaId,
        month: item.attributes.Expr1,
        day: item.attributes.Expr2,
        year: item.attributes.Expr3,
        dataSize: item.attributes.total_data_size,
        provider: platform?.provider,
      })) ?? []
    );
  } catch (error) {
    console.error("Error fetching platform data:", error);
    return [];
  }
}
