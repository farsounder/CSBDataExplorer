export type UserData = {
  csbPlatform: CSBPlatform;
  platform_nickname: string;
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
  month: number;
};

export type CSBPlatformData = {
  noaa_id: string;
} & CSBData;

export type CSBProvider = {
  provider: string;
};

export type CSBProviderData = {
  provider: string;
} & CSBData;
