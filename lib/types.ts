export type UserData = {
  csbPlatform: CSBPlatform
  platform_nickname: string
};

export type CSBPlatform = {
  platform: string;
  noaa_id: string;
  provider: string;
};

export type CSBData = {
  dataSize: number;
  provider: string;
  year: number;
  day: number;
  month: number
};