import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import ts from "typescript";

// Use the project's TypeScript compiler so this runs without another test dependency.
const { outputText } = ts.transpileModule(
  readFileSync(new URL("../lib/contribution-chart-data.ts", import.meta.url), "utf8"),
  { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2020 } }
);
const { buildContributionChartData } = await import(
  `data:text/javascript;base64,${Buffer.from(outputText).toString("base64")}`
);
const point = (day, count, month = 11, year = 2026) => ({
  year,
  month,
  day,
  count,
  provider: "FarSounder",
});

test("joins by calendar date, sorts sparse input, and leaves totals unstacked", () => {
  const comparison = [point(16, 300), point(13, 100)];
  const selected = [point(15, 20), point(13, 10)];
  const before = JSON.stringify({ comparison, selected });
  assert.deepEqual(buildContributionChartData(comparison, selected), [
    { date: "2026-11-13", comparison: 100, selected: 10 },
    { date: "2026-11-14", comparison: 0, selected: 0 },
    { date: "2026-11-15", comparison: 0, selected: 20 },
    { date: "2026-11-16", comparison: 300, selected: 0 },
  ]);
  assert.equal(JSON.stringify({ comparison, selected }), before);
});

test("preserves both series totals when multiple records share a date", () => {
  const rows = buildContributionChartData(
    [point(16, 100), point(16, 200)],
    [point(16, 10), point(16, 20)]
  );
  assert.deepEqual(rows, [{ date: "2026-11-16", comparison: 300, selected: 30 }]);
});

test("completed-day window includes both boundaries and excludes today", () => {
  const rows = buildContributionChartData(
    [point(11, 999), point(12, 100), point(15, 200), point(16, 999)],
    [point(14, 10)],
    4,
    new Date("2026-11-16T18:00:00Z")
  );
  assert.equal(rows.length, 4);
  assert.equal(rows[0].date, "2026-11-12");
  assert.equal(rows[3].date, "2026-11-15");
  assert.equal(
    rows.reduce((sum, row) => sum + row.comparison, 0),
    300
  );
  assert.deepEqual(rows[1], { date: "2026-11-13", comparison: 0, selected: 0 });
});

test("empty selection keeps the comparison and explicit zero contributions", () => {
  assert.deepEqual(buildContributionChartData([point(16, 100)], []), [
    { date: "2026-11-16", comparison: 100, selected: 0 },
  ]);
  assert.deepEqual(buildContributionChartData([], [point(16, 10)]), [
    { date: "2026-11-16", comparison: 0, selected: 10 },
  ]);
  assert.deepEqual(buildContributionChartData([], []), []);
});

test("UTC dates remain stable across DST and year boundaries", () => {
  const dstRows = buildContributionChartData(
    [point(31, 100, 10), point(2, 200)],
    [],
    3,
    new Date("2026-11-03T01:00:00Z")
  );
  assert.deepEqual(
    dstRows.map((row) => row.date),
    ["2026-10-31", "2026-11-01", "2026-11-02"]
  );
  const yearRows = buildContributionChartData([point(31, 100, 12, 2025), point(1, 200, 1)], []);
  assert.deepEqual(
    yearRows.map((row) => row.date),
    ["2025-12-31", "2026-01-01"]
  );
});

test("empty and single-day windows still produce the requested calendar range", () => {
  const now = new Date("2026-11-16T18:00:00Z");
  assert.equal(buildContributionChartData([], [], 90, now).length, 90);
  assert.deepEqual(buildContributionChartData([], [], 1, now), [
    { date: "2026-11-15", comparison: 0, selected: 0 },
  ]);
});
