"use client";
import Plot from "react-plotly.js";
import { CSBData, CSBPlatformData } from "@/lib/types";

export default function ContributionsPlot({
  userContributions,
  providerContributions,
}: {
  userContributions: CSBPlatformData[];
  providerContributions: CSBData[];
}) {
  const provider = providerContributions[0].provider;
  return (
    <Plot
      className="w-full h-full"
      data={[
        {
          x: providerContributions.map((d) => new Date(d.year, d.month-1, d.day)),
          y: providerContributions.map((d) => d.dataSize),
          type: "bar",
          name: `All ${provider}`,
          hovertemplate: "Date: %{x}<br>Data: %{y}"
        },
        {
          x: userContributions.map((d) => new Date(d.year, d.month-1, d.day)),
          y: userContributions.map((d) => d.dataSize),
          type: "bar",
          name: "Your Contributions",
          hovertemplate: "Date: %{x}<br>Data: %{y}"
        },
      ]}
      layout={{
        legend: {
          x: 0,
        },
        margin: {
          l: 60,
          r: 20,
          b: 60,
          t: 20,
        },
        xaxis: {
          title: "Date",
        },
        yaxis: {
          title: "Amount of Data (bytes)",
        },
      }}
      config={{ responsive: true }}
    />
  );
}
