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

export type CSBCountData = {
  count: number;
  provider: string;
  year: number;
  day: number;
  month: number;
};

export type CSBPlatformCountData = {
  noaa_id: string;
} & CSBCountData;

export type StackedChartSeries = {
  key: string;
  label: string;
  color: string;
  total: number;
};

export type StackedChartRow = Record<string, number | string> & {
  date: string;
  dateLabel: string;
  total: number;
};

export type StackedChartData = {
  rows: StackedChartRow[];
  series: StackedChartSeries[];
};

export type ProviderSelectOption = {
  value: string;
  label: string;
};

export type ProviderPlatformStackedChartData = StackedChartData & {
  selectedProvider: string;
  providerOptions: ProviderSelectOption[];
};
