import { CSBData, CSBPlatform, CSBPlatformData } from "@/lib/types";

const NOAA_BASE =
  "https://gis.ngdc.noaa.gov/arcgis/rest/services/csb/MapServer/1/query?f=json";

const NOAA_REST_URL = `${NOAA_BASE}&where=1%3D1&outFields=EXTERNAL_ID,PROVIDER,PLATFORM&returnGeometry=false&orderByFields=EXTERNAL_ID&returnDistinctValues=true`;

async function getAllPlatforms(): Promise<CSBPlatform[]> {
  return fetch(NOAA_REST_URL, {
    headers: {
      "Content-Type": "application/json",
      "x-application-name": "FarSounder CSB Viewer App",
    },
  })
    .then((res) => {
      if (!res.ok) {
        console.log(res);
        throw new Error(
          `Failed to fetch NOAA data. Code: ${res.status}, text: ${res.statusText}`
        );
      }
      return res.json();
    })
    .then((data) =>
      data.features.map((item: any) => {
        return {
          platform: item.attributes.PLATFORM,
          noaa_id: item.attributes.EXTERNAL_ID,
          provider: item.attributes.PROVIDER,
        };
      })
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


// TODO (Heath): dry out these
// just wrapped this up because it's a bit of a mess
const getStatsUrl = (provider: string, time_window_days: number): string => {
  const outStatistics = [
    {
      statisticType: "sum",
      onStatisticField: "FILE_SIZE",
      outStatisticFieldName: "total_data_size",
    },
  ];

  const where = `UPPER(PROVIDER) LIKE '${provider}' AND ARRIVAL_DATE >= CURRENT_TIMESTAMP - INTERVAL '${time_window_days}' DAY`;
  return `${NOAA_BASE}&where=${where}&returnGeometry=false&outStatistics=${JSON.stringify(
    outStatistics
  )}&groupByFieldsForStatistics=UPPER(PROVIDER),EXTRACT(MONTH from ARRIVAL_DATE),EXTRACT(DAY from ARRIVAL_DATE),EXTRACT(YEAR FROM ARRIVAL_DATE)`;
};

// just wrapped this up because it's a bit of a mess
const getPlatformStatsUrl = (
  noaa_id: string,
  time_window_days: number
): string => {
  const outStatistics = [
    {
      statisticType: "sum",
      onStatisticField: "FILE_SIZE",
      outStatisticFieldName: "total_data_size",
    },
  ];
  const where = `UPPER(EXTERNAL_ID) LIKE '${noaa_id}' AND ARRIVAL_DATE >= CURRENT_TIMESTAMP - INTERVAL '${time_window_days}' DAY`;
  return `${NOAA_BASE}&where=${where}&returnGeometry=false&outStatistics=${JSON.stringify(
    outStatistics
  )}&groupByFieldsForStatistics=UPPER(PROVIDER),EXTRACT(MONTH from ARRIVAL_DATE),EXTRACT(DAY from ARRIVAL_DATE),EXTRACT(YEAR FROM ARRIVAL_DATE)`;
};


export async function getProviderData({
  provider,
  time_window_days,
}: {
  provider: string;
  time_window_days: number;
}): Promise<CSBData[]> {
  const url = getStatsUrl(provider.toUpperCase(), time_window_days);
  return fetch(url, {
    headers: {
      "Content-Type": "application/json",
      "x-application-name": "FarSounder CSB Viewer App",
    },
  })
    .then((res) => {
      if (!res.ok) {
        throw new Error(
          `Failed to fetch NOAA data. Code: ${res.status}, text: ${res.statusText}`
        );
      }
      return res.json();
    })
    .then((data) =>
      data.features?.map((item: any) => {
        return {
          provider: item.attributes.EXPR1,
          month: item.attributes.EXPR2,
          day: item.attributes.EXPR3,
          year: item.attributes.EXPR4,
          dataSize: item.attributes.TOTAL_DATA_SIZE,
        };
      })
    );
}

export async function getPlatformData({
  noaa_id,
  time_window_days,
}: {
  noaa_id: string;
  time_window_days: number;
}): Promise<CSBPlatformData[]> {
  const url = getPlatformStatsUrl(
    noaa_id.toUpperCase(),
    time_window_days
  );
  return fetch(url, {
    headers: {
      "Content-Type": "application/json",
      "x-application-name": "FarSounder CSB Viewer App",
    },
  })
    .then((res) => {
      if (!res.ok) {
        throw new Error(
          `Failed to fetch NOAA data. Code: ${res.status}, text: ${res.statusText}`
        );
      }
      return res.json();
    })
    .then((data) =>
      data.features?.map((item: any) => {
        return {
          provider: item.attributes.EXPR1,
          noaa_id: noaa_id,
          month: item.attributes.EXPR2,
          day: item.attributes.EXPR3,
          year: item.attributes.EXPR4,
          dataSize: item.attributes.TOTAL_DATA_SIZE,
        };
      })
    );
}
