import db from "../../../../../lib/db";
import { getPlatformCountPerDayData } from "../../../../../services/noaa";
import { timeWindowValid } from "../../_shared/utils";
import { shareImageResponse } from "../../_shared/share-image-response";
import type { NextRequest } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ randomId: string }> }
) {
  const { randomId } = await params;
  if (!randomId) {
    return new Response("no id provided", { status: 404 });
  }

  // strip out the .png if it was included
  const identifier = randomId.includes(".png") ? randomId.replace(".png", "") : randomId;

  const { searchParams } = new URL(request.url);
  const timeWindowDays = Number(searchParams.get("timeWindowDays")) || 30;

  if (!timeWindowValid(0, 365, timeWindowDays)) {
    return new Response("Time window out of range, should be between 0 and 365 days", {
      status: 404,
    });
  }

  // get platform id for the random_id from prisma
  const row = await db.platformIdentifier.findFirst({
    where: { id: identifier },
  });

  if (!row) {
    return new Response("invalid identifier", { status: 404 });
  }

  let data;
  try {
    data = await getPlatformCountPerDayData({
      noaaId: row.platformId,
      timeWindowDays: timeWindowDays,
    });
  } catch (e: any) {
    console.log(`${e.message}`);
    return new Response("Failed to fetch data from NOAA endpoint, please try again later.", {
      status: 500,
    });
  }

  const noData = !data || data.length === 0;
  const provider = noData ? "No Data" : data[0].provider;
  const totalDataSize = data.reduce((acc, d) => d.dataSize + acc, 0);

  try {
    return shareImageResponse({
      title: "Platform Contributions",
      description: `Total data contributed via ${provider} for the last ${timeWindowDays} days on my platform`,
      dataLength: data.length,
      provider,
      totalDataSize,
      timeWindowDays,
    });
  } catch (e: any) {
    console.log(`${e.message}`);
    return new Response(`Failed to generate the image`, {
      status: 500,
    });
  }
}
