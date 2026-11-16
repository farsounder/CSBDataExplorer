import type { CSBCountData } from "./types";

const DAY_MS = 24 * 60 * 60 * 1000;

export type ContributionChartRow = {
  date: string;
  comparison: number;
  selected: number;
};

export function buildContributionChartData(
  comparison: CSBCountData[],
  selected: CSBCountData[],
  timeWindowDays?: number,
  now = new Date()
): ContributionChartRow[] {
  const byDate = new Map<number, ContributionChartRow>();

  const addRows = (data: CSBCountData[], key: "comparison" | "selected") => {
    for (const item of data) {
      const timestamp = Date.UTC(item.year, item.month - 1, item.day);
      const row = byDate.get(timestamp) ?? {
        date: new Date(timestamp).toISOString().slice(0, 10),
        comparison: 0,
        selected: 0,
      };
      row[key] += item.count;
      byDate.set(timestamp, row);
    }
  };

  addRows(comparison, "comparison");
  addRows(selected, "selected");

  const dates = Array.from(byDate.keys()).sort((a, b) => a - b);
  const hasWindow =
    timeWindowDays !== undefined && Number.isFinite(timeWindowDays) && timeWindowDays > 0;
  const end = hasWindow
    ? Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()) - DAY_MS
    : dates[dates.length - 1];
  const start = hasWindow ? end - (Math.floor(timeWindowDays) - 1) * DAY_MS : dates[0];
  const rows: ContributionChartRow[] = [];

  // Include missing calendar days so sparse series keep their true date spacing.
  for (let timestamp = start; timestamp <= end; timestamp += DAY_MS) {
    rows.push(
      byDate.get(timestamp) ?? {
        date: new Date(timestamp).toISOString().slice(0, 10),
        comparison: 0,
        selected: 0,
      }
    );
  }

  return rows;
}
