"use client";

import dynamic from "next/dynamic";
import type { CSBCountData } from "@/lib/types";

const ContributionsPlot = dynamic(() => import("./contributions-plot"), {
  ssr: false,
});

export default function PlotClient({
  providerContributions,
  totalData,
}: {
  providerContributions: CSBCountData[];
  totalData: CSBCountData[];
}) {
  return <ContributionsPlot providerContributions={providerContributions} totalData={totalData} />;
}


