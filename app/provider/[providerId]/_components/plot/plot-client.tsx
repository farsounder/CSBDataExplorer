"use client";

import dynamic from "next/dynamic";
import type { CSBData } from "@/lib/types";

const ContributionsPlot = dynamic(() => import("./contributions-plot"), {
  ssr: false,
});

export default function PlotClient({
  providerContributions,
  totalData,
}: {
  providerContributions: CSBData[];
  totalData: CSBData[];
}) {
  return <ContributionsPlot providerContributions={providerContributions} totalData={totalData} />;
}


