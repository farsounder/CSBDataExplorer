import { CSBPlatform } from "@/lib/types";
import { platform } from "os";

const PLATFORM_URL =
  "https://gis.ngdc.noaa.gov/mapviewer-support/csb/platform_names.groovy";
const PLATFORM_IDS_URL =
  "https://gis.ngdc.noaa.gov/mapviewer-support/csb/platform_ids.groovy";
const NOAA_REST_URL =
  "https://gis.ngdc.noaa.gov/arcgis/rest/services/csb/MapServer/1/query?where=1%3D1&outFields=EXTERNAL_ID,PROVIDER,PLATFORM&returnGeometry=false&orderByFields=EXTERNAL_ID&returnDistinctValues=true&f=json";

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

export default async function getPlatformInfoFromNoaa(): Promise<
  CSBPlatform[]
> {
  try {
    return await getAllPlatforms();
  } catch (error) {
    console.error(error);
    return [];
  }
}
