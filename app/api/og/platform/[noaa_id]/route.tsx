import { getPlatformCountPerDayData } from "../../../../../services/noaa";
import { timeWindowValid } from "../../_shared/utils";
import { shareImageResponse } from "../../_shared/share-image-response";

export async function GET(
  request: Request,
  {
    params,
  }: {
    params: { noaa_id: string };
  }
) {
  if (!params.noaa_id) {
    return new Response("no id provided", { status: 404 });
  }
  // strip out the .png if it was included
  if (params.noaa_id.includes(".png")) {
    params.noaa_id = params.noaa_id.replace(".png", "");
  }

  const { searchParams } = new URL(request.url);
  const time_window_days = Number(searchParams.get("time_window_days")) || 30;

  const data = await getPlatformCountPerDayData({
    noaa_id: params.noaa_id,
    time_window_days: time_window_days,
  });

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
