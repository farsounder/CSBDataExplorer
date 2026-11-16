import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import ts from "typescript";

const { outputText } = ts.transpileModule(
  readFileSync(new URL("../lib/map-track-filter.ts", import.meta.url), "utf8"),
  { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2020 } }
);
const { getTrackDateFilter, getLayerFilterString, buildCsbTileUrl } = await import(
  `data:text/javascript;base64,${Buffer.from(outputText).toString("base64")}`
);
const now = new Date("2026-11-16T18:00:00Z");

test("disabled time filter preserves the all-time provider and vessel queries", () => {
  assert.equal(
    getLayerFilterString({ providerId: "FarSounder" }, now),
    "UPPER(PROVIDER) = 'FARSOUNDER'"
  );
  assert.equal(
    getLayerFilterString({ platformId: "ship-1", providerId: "FarSounder" }, now),
    "UPPER(EXTERNAL_ID) = 'SHIP-1'"
  );
  assert.equal(getLayerFilterString({}, now), "");
});

test("includes tracks overlapping the selected completed UTC days, excluding today", () => {
  assert.equal(
    getTrackDateFilter(7, now),
    "START_DATE < timestamp '2026-11-16 00:00:00' AND END_DATE >= timestamp '2026-11-09 00:00:00'"
  );
  assert.equal(
    getTrackDateFilter(1, now),
    "START_DATE < timestamp '2026-11-16 00:00:00' AND END_DATE >= timestamp '2026-11-15 00:00:00'"
  );
});

test("handles year rollover and DST without changing the date boundaries", () => {
  assert.equal(
    getTrackDateFilter(7, new Date("2026-01-02T01:00:00Z")),
    "START_DATE < timestamp '2026-01-02 00:00:00' AND END_DATE >= timestamp '2025-12-26 00:00:00'"
  );
  assert.equal(
    getTrackDateFilter(3, new Date("2026-11-02T01:00:00Z")),
    "START_DATE < timestamp '2026-11-02 00:00:00' AND END_DATE >= timestamp '2026-10-30 00:00:00'"
  );
});

test("encodes filters for the existing NOAA layer and preserves the bbox template", () => {
  const filter = getLayerFilterString({ providerId: "O'Brien_%", timeWindowDays: 7 }, now);
  assert.ok(filter.startsWith("UPPER(PROVIDER) = 'O''BRIEN_%' AND START_DATE"));
  const url = new URL(buildCsbTileUrl(filter));
  assert.deepEqual(JSON.parse(url.searchParams.get("layerDefs")), { 1: filter });
  assert.equal(url.searchParams.get("bbox"), "{bbox-epsg-3857}");
  assert.equal(new URL(buildCsbTileUrl()).searchParams.has("layerDefs"), false);
});

test("all-provider overlay gets the date filter without a vessel restriction", () => {
  assert.equal(getLayerFilterString({ timeWindowDays: 30 }, now), getTrackDateFilter(30, now));
});

test("out-of-range and invalid periods cannot create invalid date queries", () => {
  for (const days of [undefined, 0, -1, 7.5, 366, NaN, Infinity]) {
    assert.equal(getTrackDateFilter(days, now), "");
  }
  assert.ok(getTrackDateFilter(365, now).includes("2025-11-16"));
});
