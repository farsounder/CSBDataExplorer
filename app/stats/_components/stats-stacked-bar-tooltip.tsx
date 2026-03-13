"use client";

import { formatNumber } from "@/lib/utils";

const fullDateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
  timeZone: "UTC",
});

type TooltipValue = number | string | Array<number | string>;

type TooltipItem = {
  type?: string;
  color?: string;
  fill?: string;
  name?: string | number;
  value?: TooltipValue;
  dataKey?: string | number;
  payload?: Record<string, unknown>;
};

type StatsStackedBarTooltipProps = {
  active?: boolean;
  payload?: TooltipItem[];
};

function formatTooltipDate(value: unknown) {
  if (typeof value !== "string") {
    return value == null ? "" : String(value);
  }

  const isoDatePattern = /^\d{4}-\d{2}-\d{2}$/;
  const parsedDate = isoDatePattern.test(value) ? new Date(`${value}T00:00:00Z`) : new Date(value);

  if (Number.isNaN(parsedDate.getTime())) {
    return value;
  }

  return fullDateFormatter.format(parsedDate);
}

function formatTooltipValue(value: TooltipValue | undefined) {
  if (typeof value === "number") {
    return formatNumber(value);
  }

  if (Array.isArray(value)) {
    return value.join(", ");
  }

  return value == null ? "" : String(value);
}

export default function StatsStackedBarTooltip({
  active,
  payload,
}: StatsStackedBarTooltipProps) {
  if (!active || !payload?.length) {
    return null;
  }

  const items = payload.filter((item) => item.type !== "none");

  if (items.length === 0) {
    return null;
  }

  const date = items[0]?.payload?.date;

  return (
    <div className="grid min-w-[220px] gap-1.5 rounded-lg border border-border/50 bg-background px-3 py-2 text-xs shadow-xl">
      {date ? <div className="font-medium text-foreground">{formatTooltipDate(date)}</div> : null}
      <div className="grid gap-1.5">
        {items.map((item) => {
          const key = String(item.dataKey ?? item.name ?? "");
          const indicatorColor =
            item.color ??
            (typeof item.payload?.fill === "string" ? item.payload.fill : undefined) ??
            item.fill ??
            "currentColor";

          return (
            <div key={key} className="flex items-center gap-2">
              <div className="h-2.5 w-2.5 shrink-0 rounded-[2px]" style={{ backgroundColor: indicatorColor }} />
              <div className="flex min-w-0 flex-1 items-center justify-between gap-4">
                <span className="truncate text-muted-foreground">{item.name ?? key}</span>
                <span className="font-mono font-medium tabular-nums text-foreground">
                  {formatTooltipValue(item.value)}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
