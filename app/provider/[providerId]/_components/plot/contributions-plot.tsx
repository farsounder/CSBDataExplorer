"use client";
import Plot from "react-plotly.js";
import { CSBData, CSBPlatformData } from "@/lib/types";

export default function ContributionsPlot({
  providerContributions,
}: {
  providerContributions: CSBData[];
}) {
  const provider = providerContributions[0].provider;
  return (
    <Plot
      className="w-full h-full"
      data={[
        {
          x: providerContributions.map((d) => new Date(d.year, d.month - 1, d.day)),
          y: providerContributions.map((d) => d.dataSize),
          type: "bar",
          name: `All ${provider}`,
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
