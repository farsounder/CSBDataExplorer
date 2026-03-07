"use client";

import dynamic from "next/dynamic";
import type { CSBCountData, CSBPlatformCountData } from "@/lib/types";

const ContributionsPlot = dynamic(() => import("./contributions-plot"), {
  ssr: false,
});

export default function PlotClient({
  userContributions,
  providerContributions,
  timeWindowDays,
}: {
  userContributions: CSBPlatformCountData[];
  providerContributions: CSBCountData[];
  timeWindowDays: number;
}) {
  return (
    <ContributionsPlot
      providerContributions={providerContributions}
      userContributions={userContributions}
      timeWindowDays={timeWindowDays}
    />
  );
}


