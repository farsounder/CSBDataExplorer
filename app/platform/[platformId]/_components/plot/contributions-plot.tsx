"use client";

import ContributionComparisonChart from "@/components/charts/contribution-comparison-chart";
import type { CSBCountData, CSBPlatformCountData } from "@/lib/types";

export default function ContributionsPlot({
  userContributions,
  providerContributions,
  timeWindowDays,
}: {
  userContributions: CSBPlatformCountData[];
  providerContributions: CSBCountData[];
  timeWindowDays: number;
}) {
  return (
    <ContributionComparisonChart
      comparison={providerContributions}
      selected={userContributions}
      comparisonLabel={`All ${providerContributions[0]?.provider ?? "Provider"}`}
      selectedLabel="Your Contributions"
      timeWindowDays={timeWindowDays}
    />
  );
}
