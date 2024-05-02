import { NextResponse } from "next/server";

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

export async function GET() {
  const [platforms, ids] = await Promise.all([getPlatforms(), getIds()]);
  return NextResponse.json({ platforms, noaa_ids: ids });
}
