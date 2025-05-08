"use client";
import Plot from "react-plotly.js";
import { CSBData, CSBPlatformData } from "@/lib/types";

export default function ContributionsPlot({
  providerContributions,
  totalData,
}: {
  providerContributions: CSBData[];
  totalData: CSBData[];
}) {
  const provider = providerContributions[0].provider;
  return (
    <Plot
      className="w-full h-full"
      data={[
        {
          x: totalData.map((d) => new Date(d.year, d.month - 1, d.day)),
          y: totalData.map((d) => d.dataSize),
          type: "bar",
          name: `All Providers`,
          hovertemplate: "Date: %{x}<br>Data: %{y}",
        },
        {
          x: providerContributions.map((d) => new Date(d.year, d.month - 1, d.day)),
          y: providerContributions.map((d) => d.dataSize),
          type: "bar",
          name: `${provider}`,
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
        },
        yaxis: {
          title: "Data (bytes)",
        },
      }}
      config={{ responsive: true }}
    />
  );
}
