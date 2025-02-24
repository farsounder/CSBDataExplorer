export const timeWindowValid = (
  minDays: number,
  maxDays: number,
  time_window_days: number
): boolean => {
  return time_window_days >= minDays && time_window_days <= maxDays;
};
