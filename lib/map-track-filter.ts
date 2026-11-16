const DAY_MS = 24 * 60 * 60 * 1000;

export function getTrackDateFilter(days?: number, now = new Date()): string {
  if (!days || !Number.isInteger(days) || days < 1 || days > 365) return "";
  const today = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  const start = new Date(today - days * DAY_MS).toISOString().slice(0, 10);
  const end = new Date(today).toISOString().slice(0, 10);
  // Use completed UTC days. NOAA renders whole tracks overlapping this window.
  return `START_DATE < timestamp '${end} 00:00:00' AND END_DATE >= timestamp '${start} 00:00:00'`;
}

export function getLayerFilterString(
  {
    platformId,
    providerId,
    timeWindowDays,
  }: {
    platformId?: string;
    providerId?: string;
    timeWindowDays?: number;
  },
  now = new Date()
): string {
  const value = platformId || providerId;
  const identity = value
    ? `UPPER(${platformId ? "EXTERNAL_ID" : "PROVIDER"}) = '${value.toUpperCase().replaceAll("'", "''")}'`
    : "";
  return [identity, getTrackDateFilter(timeWindowDays, now)].filter(Boolean).join(" AND ");
}

export function buildCsbTileUrl(filterString = ""): string {
  const base =
    "https://gis.ngdc.noaa.gov/arcgis/rest/services/csb/MapServer/export?dpi=96&transparent=true&format=png32&bbox={bbox-epsg-3857}&bboxSR=3857&imageSR=3857&size=256,256&f=image";
  return filterString
    ? `${base}&layerDefs=${encodeURIComponent(JSON.stringify({ 1: filterString }))}`
    : base;
}
