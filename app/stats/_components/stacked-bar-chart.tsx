"use client";

import { Bar, BarChart, CartesianGrid, Tooltip, XAxis, YAxis } from "recharts";
import { ChartConfig, ChartContainer, ChartTooltipContent } from "@/components/ui/chart";
import { StackedChartData } from "@/lib/types";
import { formatNumber } from "@/lib/utils";

const fullDateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
  timeZone: "UTC",
});

function formatTooltipDate(value: string | number) {
  if (typeof value !== "string") {
    return String(value);
  }

  return fullDateFormatter.format(new Date(`${value}T00:00:00Z`));
}

export default function StackedBarChart({
  data,
  emptyMessage,
}: {
  data: StackedChartData;
  emptyMessage: string;
}) {
  if (data.series.length === 0) {
    return (
      <div className="flex min-h-[360px] items-center justify-center rounded-lg border border-dashed border-gray-300 bg-gray-50 px-6 text-center text-sm text-gray-500">
        {emptyMessage}
      </div>
    );
  }

  const chartConfig = data.series.reduce<ChartConfig>((config, series) => {
    config[series.key] = {
      label: series.label,
      color: series.color,
    };
    return config;
  }, {});

  return (
    <div className="space-y-4">
      <ChartContainer config={chartConfig} className="h-[360px] w-full">
        <BarChart data={data.rows} margin={{ top: 12, right: 16, left: 8, bottom: 0 }}>
          <CartesianGrid vertical={false} />
          <XAxis
            dataKey="dateLabel"
            tickLine={false}
            axisLine={false}
            minTickGap={24}
            tickMargin={8}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            width={56}
            tickMargin={8}
            tickFormatter={(value: number) => formatNumber(value)}
          />
          <Tooltip
            cursor={{ fill: "rgba(148, 163, 184, 0.12)" }}
            content={
              <ChartTooltipContent
                labelFormatter={formatTooltipDate}
                formatter={(value) => formatNumber(value)}
              />
            }
          />
          {data.series.map((series, index) => (
            <Bar
              key={series.key}
              dataKey={series.key}
              name={series.label}
              stackId="daily"
              fill={`var(--color-${series.key})`}
              radius={index === data.series.length - 1 ? [4, 4, 0, 0] : 0}
            />
          ))}
        </BarChart>
      </ChartContainer>

      <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
        <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">Legend</div>
        <div className="grid max-h-28 gap-2 overflow-y-auto pr-1 sm:grid-cols-2 xl:grid-cols-3">
          {data.series.map((series) => (
            <div
              key={series.key}
              className="flex items-center justify-between gap-3 rounded-md bg-white px-3 py-2 text-sm shadow-sm"
            >
              <div className="flex min-w-0 items-center gap-2">
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-[2px]"
                  style={{ backgroundColor: series.color }}
                />
                <span className="truncate text-gray-700">{series.label}</span>
              </div>
              <span className="shrink-0 font-medium text-gray-900">{formatNumber(series.total)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
