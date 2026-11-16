export const DEFAULT_PLOT_WINDOW_DAYS = 30;

export function parseTimeWindowDays(value?: string | null): number {
  const days = Number(value);
  return Number.isInteger(days) && days >= 1 && days <= 365 ? days : DEFAULT_PLOT_WINDOW_DAYS;
}

export const DATA_CACHE_SECONDS = 3600 * 6; // 6 hours
