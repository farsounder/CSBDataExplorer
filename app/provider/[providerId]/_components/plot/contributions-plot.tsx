"use client";

import ContributionComparisonChart from "@/components/charts/contribution-comparison-chart";
import type { CSBCountData } from "@/lib/types";

export default function ContributionsPlot({
  providerContributions,
  totalData,
  timeWindowDays,
}: {
  providerContributions: CSBCountData[];
  totalData: CSBCountData[];
  timeWindowDays: number;
}) {
  return (
    <ContributionComparisonChart
      timeWindowDays={timeWindowDays}
      comparison={totalData}
      selected={providerContributions}
      comparisonLabel="All Providers"
      selectedLabel={providerContributions[0]?.provider ?? "Provider"}
    />
  );
}
