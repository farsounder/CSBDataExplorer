export const timeWindowValid = (
  minDays: number,
  maxDays: number,
  timeWindowDays: number
): boolean => {
  return timeWindowDays >= minDays && timeWindowDays <= maxDays;
};
