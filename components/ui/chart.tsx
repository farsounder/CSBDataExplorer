"use client";

import * as React from "react";
import * as RechartsPrimitive from "recharts";
import { cn, formatNumber } from "@/lib/utils";

export type ChartConfig = {
  [key: string]: {
    label?: React.ReactNode;
    color?: string;
  };
};

type ChartContextProps = {
  config: ChartConfig;
};

const ChartContext = React.createContext<ChartContextProps | null>(null);

function useChart() {
  const context = React.useContext(ChartContext);

  if (!context) {
    throw new Error("useChart must be used within a <ChartContainer />");
  }

  return context;
}

function ChartStyle({ id, config }: { id: string; config: ChartConfig }) {
  const colorEntries = Object.entries(config).filter(([, value]) => value.color);

  if (colorEntries.length === 0) {
    return null;
  }

  const cssVars = colorEntries
    .map(([key, value]) => `  --color-${key}: ${value.color};`)
    .join("\n");

  return (
    <style
      dangerouslySetInnerHTML={{
        __html: `[data-chart="${id}"] {\n${cssVars}\n}`,
      }}
    />
  );
}

export const ChartContainer = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & {
    config: ChartConfig;
    children: React.ReactNode;
  }
>(({ id, className, children, config, ...props }, ref) => {
  const uniqueId = React.useId().replace(/:/g, "");
  const chartId = `chart-${id ?? uniqueId}`;

  return (
    <ChartContext.Provider value={{ config }}>
      <div
        ref={ref}
        data-chart={chartId}
        className={cn(
          "flex aspect-auto justify-center text-xs [&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground [&_.recharts-cartesian-grid_line]:stroke-border [&_.recharts-legend-item-text]:text-foreground [&_.recharts-tooltip-cursor]:stroke-border",
          className
        )}
        {...props}
      >
        <ChartStyle id={chartId} config={config} />
        <RechartsPrimitive.ResponsiveContainer>{children}</RechartsPrimitive.ResponsiveContainer>
      </div>
    </ChartContext.Provider>
  );
});
ChartContainer.displayName = "ChartContainer";

type ChartTooltipContentProps = React.ComponentProps<typeof RechartsPrimitive.Tooltip> &
  React.ComponentProps<"div"> & {
    hideLabel?: boolean;
    formatter?: (value: number, name: string) => React.ReactNode;
    labelFormatter?: (value: string | number) => React.ReactNode;
  };

export const ChartTooltipContent = React.forwardRef<HTMLDivElement, ChartTooltipContentProps>(
  ({ active, payload, className, hideLabel = false, formatter, labelFormatter }, ref) => {
    const { config } = useChart();

    if (!active || !payload || payload.length === 0) {
      return null;
    }

    const label = payload[0]?.payload?.date;

    return (
      <div
        ref={ref}
        className={cn("min-w-[220px] rounded-lg border bg-background p-3 text-sm shadow-md", className)}
      >
        {!hideLabel && label ? (
          <div className="mb-2 font-medium text-foreground">
            {labelFormatter ? labelFormatter(label) : label}
          </div>
        ) : null}
        <div className="space-y-1.5">
          {payload.map((item) => {
            const key = String(item.dataKey ?? "");
            const chartItem = config[key];
            const numericValue = Number(item.value ?? 0);

            return (
              <div key={key} className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <span
                    className="h-2.5 w-2.5 shrink-0 rounded-[2px]"
                    style={{
                      backgroundColor: chartItem?.color ?? item.color ?? item.fill ?? "currentColor",
                    }}
                  />
                  <span className="text-muted-foreground">{chartItem?.label ?? item.name ?? key}</span>
                </div>
                <span className="font-medium text-foreground">
                  {formatter ? formatter(numericValue, key) : formatNumber(numericValue)}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }
);
ChartTooltipContent.displayName = "ChartTooltipContent";
