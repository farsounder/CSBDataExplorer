"use client";

import dynamic from "next/dynamic";
import type { CSBCountData } from "@/lib/types";

const ContributionsPlot = dynamic(() => import("./contributions-plot"), {
  ssr: false,
  loading: () => <p className="text-sm text-muted-foreground">Loading daily contributions…</p>,
});

export default function PlotClient({
  providerContributions,
  totalData,
  timeWindowDays,
}: {
  providerContributions: CSBCountData[];
  totalData: CSBCountData[];
  timeWindowDays: number;
}) {
  return (
    <ContributionsPlot
      providerContributions={providerContributions}
      totalData={totalData}
      timeWindowDays={timeWindowDays}
    />
  );
}
