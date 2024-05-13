import { AvailablePlatforms } from "@/lib/types";

const PLATFORM_URL =
  "https://gis.ngdc.noaa.gov/mapviewer-support/csb/platform_names.groovy";
const PLATFORM_IDS_URL =
  "https://gis.ngdc.noaa.gov/mapviewer-support/csb/platform_ids.groovy";

function getPlatforms() {
  return fetch(PLATFORM_URL, {
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((res) => res.json())
    .then((data) => data.items.map((item: any) => item.id));
}

function getIds() {
  return fetch(PLATFORM_IDS_URL, {
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((res) => res.json())
    .then((data) => data.items.map((item: any) => item.id));
}

export default async function getPlatformInfoFromNoaa(): Promise<AvailablePlatforms> {
  const [platforms, ids] = await Promise.all([getPlatforms(), getIds()]);
  return { platforms, noaa_ids: ids };
}
