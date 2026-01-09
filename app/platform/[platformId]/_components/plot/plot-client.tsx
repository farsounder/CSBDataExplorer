"use client";

import dynamic from "next/dynamic";
import type { CSBData, CSBPlatformData } from "@/lib/types";

const ContributionsPlot = dynamic(() => import("./contributions-plot"), {
  ssr: false,
});

export default function PlotClient({
  userContributions,
  providerContributions,
}: {
  userContributions: CSBPlatformData[];
  providerContributions: CSBData[];
}) {
  return (
    <ContributionsPlot
      providerContributions={providerContributions}
      userContributions={userContributions}
    />
  );
}


