"use client";

import { StackedChartData } from "@/lib/types";
import StackedBarChart from "./stacked-bar-chart";
import DailyChartTooltip from "@/components/charts/daily-chart-tooltip";

export default function ProviderDailyStackedChart({ data }: { data: StackedChartData }) {
  return (
    <StackedBarChart
      data={data}
      emptyMessage="No provider contribution data was found for this time window."
      tooltipContent={<DailyChartTooltip />}
    />
  );
}
