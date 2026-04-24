import type { NextRequest } from "next/server";
import { getPlatformCountPerDayData } from "@/services/noaa-csb-api";
import {
  parseSvgStatsCardOptions,
  renderSvgStatsCard,
  stripSvgSuffix,
  svgResponse,
} from "../../_shared/svg-stats-card";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ platformId: string }> }
) {
  const { platformId } = await params;
  if (!platformId) {
    return new Response("no id provided", { status: 404 });
  }

  const { searchParams } = new URL(request.url);
  const parsed = parseSvgStatsCardOptions(searchParams);
  if ("error" in parsed) {
    return new Response(parsed.error, { status: parsed.status });
  }

  const noaaId = stripSvgSuffix(platformId);
  const data = await getPlatformCountPerDayData({
    noaaId,
    timeWindowDays: parsed.options.timeWindowDays,
  });
  const provider = data.length > 0 ? data[0].provider : "No Data";
  const svg = renderSvgStatsCard({
    title: "Platform Stats Summary",
    subtitle: `Points contributed via ${provider} over the last ${parsed.options.timeWindowDays} days`,
    label: `Unique ID: ${noaaId}`,
    timeWindowDays: parsed.options.timeWindowDays,
    data,
    options: parsed.options,
  });

  return svgResponse(svg);
}
