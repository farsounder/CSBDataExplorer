import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
 
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// format number great then a million to 1.2M, etc
export const formatNumber = (num: number): string => {
  if (num > 1000000000) {
    return `${(num / 1000000000).toFixed(1)}B`;
  }
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  }
  return `${num}`;
};

// This is just estimated based on some recent submissions size vs number of
// of depth points and the reported size of the data from the dcdb endpoint,
// they must be compressing it because the sizes of we have cached that we sent
// are larger than what they are reporting, but compressing would make sense.
export const bytesToDepthPoints = (bytes: number) => Math.round(bytes / 20);