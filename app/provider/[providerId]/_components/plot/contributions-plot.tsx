"use client";
import Plot from "react-plotly.js";
import { CSBCountData } from "@/lib/types";
import { formatNumber } from "@/lib/utils";

export default function ContributionsPlot({
  providerContributions,
  totalData,
}: {
  providerContributions: CSBCountData[];
  totalData: CSBCountData[];
}) {
  const provider = providerContributions[0].provider;
  const providerTotal = providerContributions.reduce((acc, d) => d.count + acc, 0);
  const totalTotal = totalData.reduce((acc, d) => d.count + acc, 0);
  return (
    <Plot
      className="w-full h-full"
      data={[
        {
          x: totalData.map((d) => new Date(d.year, d.month - 1, d.day)),
          y: totalData.map((d) => d.count),
          type: "bar",
          name: `All Providers (${formatNumber(totalTotal)})`,
          hovertemplate: "Date: %{x}<br>Points: %{y}",
        },
        {
          x: providerContributions.map((d) => new Date(d.year, d.month - 1, d.day)),
          y: providerContributions.map((d) => d.count),
          type: "bar",
          name: `${provider} (${formatNumber(providerTotal)})`,
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
        },
        yaxis: {
          title: "Points",
        },
      }}
      config={{ responsive: true }}
    />
  );
}
