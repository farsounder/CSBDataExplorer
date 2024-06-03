// This is just estimated based on some recent submissions size vs number of
// of depth points and the reported size of the data from the dcdb endpoint,
// they must be compressing it because the sizes of we have cached that we sent
// are larger than what they are reporting, but compressing would make sense.
export const bytesToDepthPoints = (bytes: number) => Math.round(bytes / 20);

export const timeWindowValid = (
  minDays: number,
  maxDays: number,
  time_window_days: number
): boolean => {
  return time_window_days >= minDays && time_window_days <= maxDays;
};