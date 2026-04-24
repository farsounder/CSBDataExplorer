import type { NextRequest } from "next/server";
import { getProviderCountPerDayData } from "@/services/noaa-csb-api";
import {
  parseSvgStatsCardOptions,
  renderSvgStatsCard,
  stripSvgSuffix,
  svgResponse,
} from "../../_shared/svg-stats-card";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ providerId: string }> }
) {
  const { providerId } = await params;
  if (!providerId) {
    return new Response("no id provided", { status: 404 });
  }

  const { searchParams } = new URL(request.url);
  const parsed = parseSvgStatsCardOptions(searchParams);
  if ("error" in parsed) {
    return new Response(parsed.error, { status: parsed.status });
  }

  const provider = stripSvgSuffix(decodeURIComponent(providerId));
  const data = await getProviderCountPerDayData({
    provider,
    timeWindowDays: parsed.options.timeWindowDays,
  });
  const svg = renderSvgStatsCard({
    title: "Trusted Node Stats Summary",
    subtitle: `Points contributed by ${provider} over the last ${parsed.options.timeWindowDays} days`,
    label: `Trusted Node: ${provider}`,
    timeWindowDays: parsed.options.timeWindowDays,
    data,
    options: parsed.options,
  });

  return svgResponse(svg);
}
