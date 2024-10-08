import db from "../../../../../lib/db";
import { getPlatformCountPerDayData } from "../../../../../services/noaa";
import { timeWindowValid } from "../../_shared/utils";
import { shareImageResponse } from "../../_shared/share-image-response";

export async function GET(
  request: Request,
  {
    params,
  }: {
    params: { random_id: string };
  }
) {
  if (!params.random_id) {
    return new Response("no id provided", { status: 404 });
  }
  // strip out the .png if it was included
  if (params.random_id.includes(".png")) {
    params.random_id = params.random_id.replace(".png", "");
  }

  const { searchParams } = new URL(request.url);
  const time_window_days = Number(searchParams.get("time_window_days")) || 30;

  // get platform id for the random_id from prisma
  const row = await db.platformIdentifier.findFirst({
    where: { id: params.random_id },
  });

  if (!row) {
    return new Response("invalid identifier", { status: 404 });
  }


  let data;
  try {
    data = await getPlatformCountPerDayData({
      noaa_id: row.platformId,
      time_window_days: time_window_days,
    });
  } catch (e: any) {
    console.log(`${e.message}`);
    return new Response(
      "Failed to fetch data from NOAA endpoint, please try again later.",
      {
        status: 500,
      }
    );
  }

  if (!timeWindowValid(0, 365, time_window_days)) {
    return new Response(
      "Time window out of range, should be between 0 and 365 days",
      { status: 404 }
    );
  }

  const noData = !data || data.length === 0;
  const provider = noData ? "No Data" : data[0].provider;
  const total_data_size = data.reduce((acc, d) => d.dataSize + acc, 0);

  try {
    return shareImageResponse({
      data_length: data.length,
      provider,
      total_data_size,
      time_window_days,
    });
  } catch (e: any) {
    console.log(`${e.message}`);
    return new Response(`Failed to generate the image`, {
      status: 500,
    });
  }
}
