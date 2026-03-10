"use client";
import Plot from "react-plotly.js";
import { CSBCountData, CSBPlatformCountData } from "@/lib/types";
import { formatNumber } from "@/lib/utils";

export default function ContributionsPlot({
  userContributions,
  providerContributions,
  timeWindowDays,
}: {
  userContributions: CSBPlatformCountData[];
  providerContributions: CSBCountData[];
  timeWindowDays: number;
}) {
  const provider = providerContributions[0].provider;
  const providerTotal = providerContributions.reduce((acc, d) => d.count + acc, 0);
  const userTotal = userContributions.reduce((acc, d) => d.count + acc, 0);
  const endDate = new Date();
  endDate.setHours(23, 59, 59, 999);

  const startDate = new Date(endDate);
  startDate.setDate(endDate.getDate() - (timeWindowDays - 1));
  startDate.setHours(0, 0, 0, 0);

  return (
    <Plot
      className="w-full h-full"
      data={[
        {
          x: providerContributions.map((d) => new Date(d.year, d.month - 1, d.day)),
          y: providerContributions.map((d) => d.count),
          type: "bar",
          name: `All ${provider} (${formatNumber(providerTotal)})`,
          hovertemplate: "Date: %{x}<br>Points: %{y}",
        },
        {
          x: userContributions.map((d) => new Date(d.year, d.month - 1, d.day)),
          y: userContributions.map((d) => d.count),
          type: "bar",
          name: `Your Contributions (${formatNumber(userTotal)})`,
          hovertemplate: "Date: %{x}<br>Points: %{y}",
        },
      ]}
      layout={{
        legend: {
          x: 0,
        },
        showlegend: true,
        margin: {
          l: 60,
          b: 60,
          t: 20,
        },
        xaxis: {
          title: "Date",
          range: [startDate, endDate],
        },
        yaxis: {
          title: "Points",
        },
      }}
      config={{ responsive: true }}
    />
  );
}
