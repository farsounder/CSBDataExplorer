import { getProviderCountPerDayData } from "../../../../../services/noaa-csb-api";
import { timeWindowValid } from "../../_shared/utils";
import { shareImageResponse } from "../../_shared/share-image-response";
import type { NextRequest } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ providerId: string }> }
) {
  const { providerId } = await params;
  if (!providerId) {
    return new Response("no id provided", { status: 404 });
  }

  const { searchParams } = new URL(request.url);
  const timeWindowDays = Number(searchParams.get("timeWindowDays")) || 30;
  if (!timeWindowValid(0, 365, timeWindowDays)) {
    return new Response("Time window out of range, should be between 0 and 365 days", {
      status: 404,
    });
  }

  // strip out the .png if it was included
  const provider = providerId.includes(".png") ? providerId.replace(".png", "") : providerId;

  const data = await getProviderCountPerDayData({
    provider,
    timeWindowDays: timeWindowDays,
  });

  const totalCount = data.reduce((acc, d) => d.count + acc, 0);

  try {
    return shareImageResponse({
      title: "Provider Contributions",
      description: `Total points contributed via ${provider} for the last ${timeWindowDays} days`,
      dataLength: data.length,
      totalCount,
      timeWindowDays,
    });
  } catch (e: any) {
    console.log(`${e.message}`);
    return new Response(`Failed to generate the image`, {
      status: 500,
    });
  }
}
