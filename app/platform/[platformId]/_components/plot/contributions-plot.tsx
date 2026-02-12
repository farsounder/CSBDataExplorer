"use client";
import Plot from "react-plotly.js";
import { CSBData, CSBPlatformData } from "@/lib/types";
import { formatNumber } from "@/lib/utils";

export default function ContributionsPlot({
  userContributions,
  providerContributions,
  timeWindowDays,
}: {
  userContributions: CSBPlatformData[];
  providerContributions: CSBData[];
  timeWindowDays: number;
}) {
  const provider = providerContributions[0].provider;
  const providerTotal = providerContributions.reduce((acc, d) => d.dataSize + acc, 0);
  const userTotal = userContributions.reduce((acc, d) => d.dataSize + acc, 0);
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(endDate.getDate() - timeWindowDays);

  return (
    <Plot
      className="w-full h-full"
      data={[
        {
          x: providerContributions.map((d) => new Date(d.year, d.month - 1, d.day)),
          y: providerContributions.map((d) => d.dataSize),
          type: "bar",
          name: `All ${provider} (${formatNumber(providerTotal)})`,
          hovertemplate: "Date: %{x}<br>Data: %{y}",
        },
        {
          x: userContributions.map((d) => new Date(d.year, d.month - 1, d.day)),
          y: userContributions.map((d) => d.dataSize),
          type: "bar",
          name: `Your Contributions (${formatNumber(userTotal)})`,
          hovertemplate: "Date: %{x}<br>Data: %{y}",
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
          title: "Data (bytes)",
        },
      }}
      config={{ responsive: true }}
    />
  );
}
