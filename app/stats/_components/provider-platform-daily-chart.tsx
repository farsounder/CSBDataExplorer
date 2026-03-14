"use client";

import { StackedChartData } from "@/lib/types";
import StackedBarChart from "./stacked-bar-chart";
import StatsStackedBarTooltip from "./stats-stacked-bar-tooltip";

export default function ProviderPlatformDailyChart({ data }: { data: StackedChartData }) {
  return (
    <StackedBarChart
      data={data}
      emptyMessage="No platform contribution data was found for the selected provider in this time window."
      tooltipContent={<StatsStackedBarTooltip />}
    />
  );
}
