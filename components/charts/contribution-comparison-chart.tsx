"use client";

import { useMemo, useState } from "react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { ChartContainer, ChartTooltip } from "@/components/ui/chart";
import DailyChartTooltip from "@/components/charts/daily-chart-tooltip";
import { CHART_COLORS } from "@/lib/chart-colors";
import { buildContributionChartData } from "@/lib/contribution-chart-data";
import type { CSBCountData } from "@/lib/types";
import { formatNumber } from "@/lib/utils";

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  timeZone: "UTC",
});

export default function ContributionComparisonChart({
  comparison,
  selected,
  comparisonLabel,
  selectedLabel,
  timeWindowDays,
}: {
  comparison: CSBCountData[];
  selected: CSBCountData[];
  comparisonLabel: string;
  selectedLabel: string;
  timeWindowDays?: number;
}) {
  const rows = useMemo(
    () => buildContributionChartData(comparison, selected, timeWindowDays),
    [comparison, selected, timeWindowDays]
  );
  const [hidden, setHidden] = useState({ comparison: false, selected: false });
  const selectedTotal = selected.reduce((sum, row) => sum + row.count, 0);
  const comparisonTotal = comparison.reduce((sum, row) => sum + row.count, 0);
  const share = comparisonTotal > 0 ? (selectedTotal / comparisonTotal) * 100 : 0;
  const period = timeWindowDays ? `last ${timeWindowDays} days` : "selected period";
  const series = [
    {
      key: "comparison" as const,
      label: comparisonLabel,
      color: CHART_COLORS[1],
      data: comparison,
    },
    { key: "selected" as const, label: selectedLabel, color: CHART_COLORS[0], data: selected },
  ];
  const config = Object.fromEntries(series.map(({ key, label, color }) => [key, { label, color }]));

  return (
    <div className="flex min-w-0 flex-col gap-4">
      <section className="space-y-2" aria-label="Contribution totals">
        <h2 className="explorer-eyebrow">
          {selectedLabel} · {period}
        </h2>
        <p className="explorer-total">
          <strong>{formatNumber(selectedTotal)}</strong> <span>depth points</span>
        </p>
        <p className="text-sm leading-snug text-[#3f3f3f]">
          {comparison.length ? (
            <>
              {share.toFixed(1)}% of the {formatNumber(comparisonTotal)} points sent by{" "}
              {comparisonLabel === "All Providers"
                ? "all providers"
                : comparisonLabel.replace(/^All /, "")}
            </>
          ) : (
            "Comparison data is unavailable for this period."
          )}
        </p>
        <div
          className="h-2 bg-[#e4eef8]"
          role="img"
          aria-label={`${selectedLabel}: ${share.toFixed(1)} percent of ${comparisonLabel}`}
        >
          <div className="h-full bg-[#155196]" style={{ width: `${Math.min(100, share)}%` }} />
        </div>
      </section>
      <section className="space-y-2">
        <p className="text-xs text-[#5a5a5a]">Completed UTC days, ending yesterday</p>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="explorer-eyebrow">Points per day</h2>
          <label className="flex items-center gap-1.5 text-xs text-[#3f3f3f]">
            <input
              type="checkbox"
              checked={!hidden.comparison}
              onChange={(event) =>
                setHidden((previous) => ({ ...previous, comparison: !event.target.checked }))
              }
            />
            Compare{" "}
            {comparisonLabel === "All Providers"
              ? "all providers"
              : comparisonLabel.replace(/^All /, "")}
          </label>
        </div>
        <ChartContainer
          config={config}
          className="h-[180px] w-full aspect-auto"
          aria-label={`Daily points: ${comparisonLabel} and ${selectedLabel}`}
        >
          <BarChart
            accessibilityLayer
            data={rows}
            barGap="10%"
            margin={{ top: 8, right: 12, left: 0, bottom: 0 }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickFormatter={(value: string) =>
                dateFormatter.format(new Date(`${value}T00:00:00Z`))
              }
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
              allowDecimals={false}
              tickCount={3}
              tickFormatter={formatNumber}
            />
            <ChartTooltip
              cursor={{ fill: "rgba(148, 163, 184, 0.12)" }}
              content={<DailyChartTooltip />}
            />
            {series.map(({ key, label }) => (
              <Bar
                key={key}
                dataKey={key}
                name={label}
                fill={`var(--color-${key})`}
                radius={[4, 4, 0, 0]}
                hide={hidden[key]}
                isAnimationActive={false}
              />
            ))}
          </BarChart>
        </ChartContainer>
        <div className="grid gap-1 rounded-sm border border-gray-200 bg-gray-50 p-1.5 text-xs">
          {series.map(({ key, label, color, data }) => (
            <button
              key={key}
              type="button"
              aria-pressed={!hidden[key]}
              aria-label={`Show ${label}`}
              onClick={() => setHidden((previous) => ({ ...previous, [key]: !previous[key] }))}
              className="flex min-w-0 items-center justify-between gap-3 rounded-md bg-white px-2 py-1 text-left shadow-xs focus-visible:outline-2 focus-visible:outline-ring"
            >
              <span
                className={`flex min-w-0 items-center gap-2 ${hidden[key] ? "opacity-40" : ""}`}
              >
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-[2px]"
                  style={{ backgroundColor: color }}
                />
                <span className="truncate text-gray-700" title={label}>
                  {label}
                </span>
              </span>
              <span className="shrink-0 font-medium tabular-nums text-gray-900">
                {formatNumber(data.reduce((sum, row) => sum + row.count, 0))}
              </span>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
