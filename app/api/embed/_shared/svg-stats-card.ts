import { DATA_CACHE_SECONDS, DEFAULT_PLOT_WINDOW_DAYS } from "@/lib/constants";
import { formatNumber } from "@/lib/utils";

type ThemeName = "light" | "dark" | "ocean";

type Theme = {
  backgroundStart: string;
  backgroundEnd: string;
  card: string;
  border: string;
  title: string;
  text: string;
  muted: string;
  accent: string;
  accentDeep: string;
  accentSoft: string;
  statBackground: string;
  chartBackground: string;
};

type CountRow = {
  count: number;
};

type StatCardOptions = {
  width: number;
  height: number;
  timeWindowDays: number;
  themeName: ThemeName;
  theme: Theme;
};

type StatsSummary = {
  daysWithData: number;
  totalCount: number;
  averagePerDay: number;
};

type SvgStatsCardProps = {
  title: string;
  subtitle: string;
  label: string;
  timeWindowDays: number;
  data: CountRow[];
  options: StatCardOptions;
};

const MIN_TIME_WINDOW_DAYS = 1;
const MAX_TIME_WINDOW_DAYS = 365;
const MIN_WIDTH = 320;
const MAX_WIDTH = 1200;
const MIN_HEIGHT = 180;
const MAX_HEIGHT = 630;
const MAX_IDENTIFIER_LENGTH = 160;

const THEMES: Record<ThemeName, Theme> = {
  light: {
    backgroundStart: "#eff6ff",
    backgroundEnd: "#ffffff",
    card: "#ffffff",
    border: "#dbeafe",
    title: "#1e3a8a",
    text: "#1f2937",
    muted: "#64748b",
    accent: "#2563eb",
    accentDeep: "#1d4ed8",
    accentSoft: "#bfdbfe",
    statBackground: "#eff6ff",
    chartBackground: "#f8fafc",
  },
  dark: {
    backgroundStart: "#020617",
    backgroundEnd: "#111827",
    card: "#0f172a",
    border: "#1e3a8a",
    title: "#bfdbfe",
    text: "#e5e7eb",
    muted: "#94a3b8",
    accent: "#60a5fa",
    accentDeep: "#38bdf8",
    accentSoft: "#1d4ed8",
    statBackground: "#111827",
    chartBackground: "#020617",
  },
  ocean: {
    backgroundStart: "#ecfeff",
    backgroundEnd: "#f0fdfa",
    card: "#ffffff",
    border: "#a5f3fc",
    title: "#155e75",
    text: "#164e63",
    muted: "#0e7490",
    accent: "#0891b2",
    accentDeep: "#155e75",
    accentSoft: "#cffafe",
    statBackground: "#f0fdfa",
    chartBackground: "#ecfeff",
  },
};

export function stripSvgSuffix(value: string): string {
  return value.endsWith(".svg") ? value.slice(0, -4) : value;
}

export function parseSvgIdentifier(value: string, name: string):
  | { identifier: string }
  | { error: string; status: number } {
  let decodedValue: string;
  try {
    decodedValue = decodeURIComponent(value);
  } catch {
    return { error: `${name} is not valid URL encoding`, status: 400 };
  }

  const identifier = stripSvgSuffix(decodedValue).trim();
  if (!identifier) {
    return { error: `${name} is required`, status: 400 };
  }
  if (identifier.length > MAX_IDENTIFIER_LENGTH) {
    return {
      error: `${name} must be ${MAX_IDENTIFIER_LENGTH} characters or less`,
      status: 400,
    };
  }
  if (/[\u0000-\u001F\u007F]/.test(identifier)) {
    return { error: `${name} contains invalid characters`, status: 400 };
  }
  if (/[<>"'`]/.test(identifier)) {
    return { error: `${name} contains invalid characters`, status: 400 };
  }

  return { identifier };
}

export function parseSvgStatsCardOptions(searchParams: URLSearchParams):
  | { options: StatCardOptions }
  | { error: string; status: number } {
  const timeWindowDays = parseIntegerParam(
    searchParams,
    "timeWindowDays",
    DEFAULT_PLOT_WINDOW_DAYS
  );
  const width = parseIntegerParam(searchParams, "width", 640);
  const height = parseIntegerParam(searchParams, "height", 320);
  const themeName = (searchParams.get("theme") || "ocean").toLowerCase();

  if (!Number.isInteger(timeWindowDays)) {
    return { error: "timeWindowDays must be a whole number", status: 400 };
  }
  if (timeWindowDays < MIN_TIME_WINDOW_DAYS || timeWindowDays > MAX_TIME_WINDOW_DAYS) {
    return {
      error: `timeWindowDays must be between ${MIN_TIME_WINDOW_DAYS} and ${MAX_TIME_WINDOW_DAYS}`,
      status: 400,
    };
  }
  if (!Number.isInteger(width) || width < MIN_WIDTH || width > MAX_WIDTH) {
    return { error: `width must be between ${MIN_WIDTH} and ${MAX_WIDTH}`, status: 400 };
  }
  if (!Number.isInteger(height) || height < MIN_HEIGHT || height > MAX_HEIGHT) {
    return { error: `height must be between ${MIN_HEIGHT} and ${MAX_HEIGHT}`, status: 400 };
  }
  if (!isThemeName(themeName)) {
    return {
      error: `theme must be one of: ${Object.keys(THEMES).join(", ")}`,
      status: 400,
    };
  }

  return {
    options: {
      width,
      height,
      timeWindowDays,
      themeName,
      theme: THEMES[themeName],
    },
  };
}

export function svgResponse(svg: string): Response {
  return new Response(svg, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Cache-Control": `public, max-age=0, s-maxage=${DATA_CACHE_SECONDS}, stale-while-revalidate=${DATA_CACHE_SECONDS}`,
      "Content-Security-Policy": "default-src 'none'; script-src 'none'; object-src 'none'; base-uri 'none'",
      "Content-Type": "image/svg+xml; charset=utf-8",
      "X-Content-Type-Options": "nosniff",
    },
  });
}

export function renderSvgStatsCard({
  title,
  subtitle,
  label,
  timeWindowDays,
  data,
  options,
}: SvgStatsCardProps): string {
  const { width, height, theme } = options;
  const summary = summarizeStats(data);
  const padding = clamp(Math.round(width * 0.04), 20, 42);
  const contentX = Math.round(padding * 1.7);
  const contentWidth = width - contentX * 2;
  const titleSize = clamp(Math.round(width * 0.043), 21, 42);
  const subtitleSize = clamp(Math.round(width * 0.02), 12, 16);
  const statValueSize = clamp(Math.round(width * 0.048), 22, 42);
  const statLabelSize = clamp(Math.round(width * 0.018), 10, 14);
  const titleY = padding + titleSize + 8;
  const subtitleY = titleY + subtitleSize * 1.8;
  const statTop = Math.max(subtitleY + 22, Math.round(height * 0.32));
  const statHeight = clamp(Math.round(height * 0.25), 66, 92);
  const chartTop = statTop + statHeight + Math.max(14, Math.round(height * 0.045));
  const footerTop = chartTop - 8;
  const footerHeight = height - padding - footerTop - 8;
  const footerY = height - padding - 14;
  const chartHeight = Math.max(36, height - padding - chartTop - 28);

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-labelledby="title desc">
  <title id="title">${escapeXml(title)}</title>
  <desc id="desc">${escapeXml(subtitle)}</desc>
  <defs>
    <linearGradient id="embedBackground" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${theme.backgroundStart}"/>
      <stop offset="100%" stop-color="${theme.backgroundEnd}"/>
    </linearGradient>
    <linearGradient id="statFill" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${theme.statBackground}"/>
      <stop offset="100%" stop-color="${theme.card}"/>
    </linearGradient>
    <filter id="softShadow" x="-12%" y="-12%" width="124%" height="124%">
      <feDropShadow dx="0" dy="10" stdDeviation="12" flood-color="${theme.accentDeep}" flood-opacity="0.12"/>
    </filter>
  </defs>
  <rect width="${width}" height="${height}" rx="28" fill="url(#embedBackground)"/>
  <rect x="${padding}" y="${padding}" width="${width - padding * 2}" height="${height - padding * 2}" rx="24" fill="${theme.card}" stroke="${theme.border}" stroke-width="2" filter="url(#softShadow)"/>
  <text x="${contentX}" y="${titleY}" fill="${theme.title}" font-family="Inter, Segoe UI, Arial, sans-serif" font-size="${titleSize}" font-weight="800" letter-spacing="-0.03em">${escapeXml(title)}</text>
  <text x="${contentX}" y="${subtitleY}" fill="${theme.muted}" font-family="Inter, Segoe UI, Arial, sans-serif" font-size="${subtitleSize}">${escapeXml(subtitle)}</text>
  ${renderStats({
    width,
    contentX,
    contentWidth,
    statTop,
    statHeight,
    statValueSize,
    statLabelSize,
    summary,
    timeWindowDays,
    theme,
  })}
  <rect x="${contentX}" y="${footerTop}" width="${contentWidth}" height="${footerHeight}" rx="14" fill="${theme.chartBackground}" opacity="0.38"/>
  <line x1="${contentX + 12}" y1="${footerTop}" x2="${width - contentX - 12}" y2="${footerTop}" stroke="${theme.border}" stroke-width="1" opacity="0.55"/>
  ${renderSparkline({ data, width, contentX, contentWidth, chartTop, chartHeight, theme })}
  <text x="${contentX + 12}" y="${footerY}" fill="${theme.muted}" font-family="Inter, Segoe UI, Arial, sans-serif" font-size="${statLabelSize}" font-weight="600">${escapeXml(label)}</text>
  <text x="${width - contentX - 12}" y="${footerY}" fill="${theme.muted}" font-family="Inter, Segoe UI, Arial, sans-serif" font-size="${statLabelSize}" text-anchor="end">mycsb.farsounder.com</text>
</svg>`;
}

function parseIntegerParam(
  searchParams: URLSearchParams,
  name: string,
  fallback: number
): number {
  const value = searchParams.get(name);
  return value === null || value === "" ? fallback : Number(value);
}

function isThemeName(value: string): value is ThemeName {
  return value in THEMES;
}

function summarizeStats(data: CountRow[]): StatsSummary {
  const totalCount = data.reduce((acc, row) => acc + row.count, 0);
  return {
    daysWithData: data.length,
    totalCount,
    averagePerDay: Math.round(totalCount / Math.max(data.length, 1)),
  };
}

function renderStats({
  width,
  contentX,
  contentWidth,
  statTop,
  statHeight,
  statValueSize,
  statLabelSize,
  summary,
  timeWindowDays,
  theme,
}: {
  width: number;
  contentX: number;
  contentWidth: number;
  statTop: number;
  statHeight: number;
  statValueSize: number;
  statLabelSize: number;
  summary: StatsSummary;
  timeWindowDays: number;
  theme: Theme;
}): string {
  const gap = clamp(Math.round(width * 0.018), 10, 18);
  const cardWidth = Math.floor((contentWidth - gap * 2) / 3);
  const stats = [
    {
      value: formatNumber(summary.daysWithData),
      label: `of ${timeWindowDays} days with data`,
    },
    {
      value: formatNumber(summary.totalCount),
      label: "total points submitted",
    },
    {
      value: formatNumber(summary.averagePerDay),
      label: "avg points per day",
    },
  ];

  return stats
    .map((stat, index) => {
      const x = contentX + index * (cardWidth + gap);
      return `<g>
    <rect x="${x}" y="${statTop}" width="${cardWidth}" height="${statHeight}" rx="18" fill="url(#statFill)" stroke="${theme.border}"/>
    <line x1="${x + 18}" y1="${statTop}" x2="${x + cardWidth - 18}" y2="${statTop}" stroke="${theme.accent}" stroke-width="2" stroke-linecap="round" opacity="0.65"/>
    <text x="${x + cardWidth / 2}" y="${statTop + statValueSize * 1.24}" fill="${theme.title}" font-family="Inter, Segoe UI, Arial, sans-serif" font-size="${statValueSize}" font-weight="800" letter-spacing="-0.03em" text-anchor="middle">${escapeXml(stat.value)}</text>
    <text x="${x + cardWidth / 2}" y="${statTop + statValueSize * 1.24 + statLabelSize * 1.9}" fill="${theme.muted}" font-family="Inter, Segoe UI, Arial, sans-serif" font-size="${statLabelSize}" text-anchor="middle">${escapeXml(stat.label)}</text>
  </g>`;
    })
    .join("\n  ");
}

function renderSparkline({
  data,
  width,
  contentX,
  contentWidth,
  chartTop,
  chartHeight,
  theme,
}: {
  data: CountRow[];
  width: number;
  contentX: number;
  contentWidth: number;
  chartTop: number;
  chartHeight: number;
  theme: Theme;
}): string {
  const chartX = contentX;
  const chartWidth = contentWidth;
  const baselineY = chartTop + chartHeight;

  if (data.length === 0) {
    return `<g>
    <rect x="${chartX}" y="${chartTop}" width="${chartWidth}" height="${chartHeight}" rx="16" fill="${theme.chartBackground}" opacity="0.72"/>
    <text x="${width / 2}" y="${chartTop + chartHeight / 2 + 5}" fill="${theme.muted}" font-family="Inter, Segoe UI, Arial, sans-serif" font-size="14" text-anchor="middle">No data in this time window</text>
  </g>`;
  }

  const maxCount = Math.max(...data.map((row) => row.count), 1);
  const slotWidth = chartWidth / data.length;
  const barWidth = Math.max(0.8, slotWidth * 0.62);

  const bars = data
    .map((row, index) => {
      const barHeight = Math.max(2, (row.count / maxCount) * (chartHeight - 10));
      const x = chartX + index * slotWidth + (slotWidth - barWidth) / 2;
      const y = baselineY - barHeight;
      return `<rect x="${x.toFixed(2)}" y="${y.toFixed(2)}" width="${barWidth.toFixed(2)}" height="${barHeight.toFixed(2)}" rx="2" fill="${theme.accent}" opacity="${barOpacity(index, data.length)}"/>`;
    })
    .join("\n  ");

  return `<g>
    <line x1="${chartX}" y1="${baselineY}" x2="${chartX + chartWidth}" y2="${baselineY}" stroke="${theme.accentSoft}" stroke-width="2"/>
    ${bars}
  </g>`;
}

function barOpacity(index: number, length: number): string {
  if (length <= 1) {
    return "1";
  }
  return (0.35 + (index / (length - 1)) * 0.65).toFixed(2);
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}
