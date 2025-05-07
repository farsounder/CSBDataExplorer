import { CSBData, CSBPlatform, CSBPlatformData, CSBProvider } from "@/lib/types";
import { DATA_CACHE_SECONDS } from "@/lib/constants";

const NOAA_BASE = "https://gis.ngdc.noaa.gov/arcgis/rest/services/csb/MapServer/1/query?f=json";
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
    next: { revalidate },
  });

  if (!response.ok) {
    throw new Error(
      `Failed to fetch NOAA data. Code: ${response.status}, text: ${response.statusText}`
    );
  }

  return response.json();
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
  identifier: { type: "provider" | "platform"; value: string },
  timeWindowDays: number
): string {
  const field = identifier.type === "provider" ? "PROVIDER" : "EXTERNAL_ID";
  const where = `UPPER(${field}) LIKE '${identifier.value}' AND START_DATE >= CURRENT_TIMESTAMP - INTERVAL '${timeWindowDays}' DAY`;

  return `${NOAA_BASE}&where=${where}&returnGeometry=false&outStatistics=${JSON.stringify(
    baseStatistics
  )}&groupByFieldsForStatistics=UPPER(PROVIDER),EXTRACT(MONTH from START_DATE),EXTRACT(DAY from START_DATE),EXTRACT(YEAR FROM START_DATE)`;
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

export async function getProviderCountPerDayData({
  provider,
  timeWindowDays,
}: {
  provider: string;
  timeWindowDays: number;
}): Promise<CSBData[]> {
  try {
    const url = generateStatsUrl(
      { type: "provider", value: provider.toUpperCase() },
      timeWindowDays
    );
    const data = await fetchNoaaData<any>({ url });

    return (
      data.features?.map((item: any) => ({
        provider: item.attributes.Expr1,
        month: item.attributes.Expr2,
        day: item.attributes.Expr3,
        year: item.attributes.Expr4,
        dataSize: item.attributes.total_data_size,
      })) ?? []
    );
  } catch (error) {
    console.error("Error fetching provider data:", error);
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
    const url = generateStatsUrl({ type: "platform", value: noaaId.toUpperCase() }, timeWindowDays);
    const data = await fetchNoaaData<any>({ url });

    return (
      data.features?.map((item: any) => ({
        provider: item.attributes.Expr1,
        noaaId,
        month: item.attributes.Expr2,
        day: item.attributes.Expr3,
        year: item.attributes.Expr4,
        dataSize: item.attributes.total_data_size,
      })) ?? []
    );
  } catch (error) {
    console.error("Error fetching platform data:", error);
    return [];
  }
}
