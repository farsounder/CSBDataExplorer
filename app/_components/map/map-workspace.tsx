"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import MapViewer from "./mapviewer";
import { BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useMediaQuery } from "@/app/hooks/useMediaQuery";
import { parseTimeWindowDays } from "@/lib/constants";

export type MapOverlayVisibility = {
  "IHO CSB Data": boolean;
  "Your CSB Data": boolean;
  Observations: boolean;
};

export default function MapWorkspace({
  providerId,
  platformId,
  sidebar,
  children,
}: {
  providerId?: string;
  platformId?: string;
  sidebar: React.ReactNode;
  children?: React.ReactNode;
}) {
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const searchParams = useSearchParams();
  const timeWindowDays =
    searchParams.get("mapPeriod") === "selected"
      ? parseTimeWindowDays(searchParams.get("timeWindowDays"))
      : undefined;
  const [visibility, setVisibility] = useState<MapOverlayVisibility>({
    "IHO CSB Data": false,
    "Your CSB Data": true,
    Observations: true,
  });
  const summary = (
    <>
      {sidebar}
      <section className="space-y-2">
        <h2 className="explorer-eyebrow">On the map</h2>
        <ul className="space-y-2 text-sm text-[#3f3f3f]">
          <li className="flex items-center gap-3">
            <span
              className="h-[3px] w-7 bg-linear-to-r from-[#c994c7] to-[#67001f]"
              aria-hidden="true"
            />
            <span>Your CSB tracks{!visibility["Your CSB Data"] && " (off)"}</span>
          </li>
          <li className="flex items-center gap-3">
            <span
              className="h-[3px] w-7 bg-linear-to-r from-[#c994c7] to-[#67001f]"
              aria-hidden="true"
            />
            <span>All IHO CSB data{!visibility["IHO CSB Data"] && " (off)"}</span>
          </li>
          <li className="flex items-center gap-3">
            {/* Match the actual map's observation symbols, not the mockup's placeholder. */}
            <span className="flex w-7 justify-center" aria-hidden="true">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/observations/whale.svg" alt="" width={24} height={24} />
            </span>
            <span>Observations{visibility.Observations ? " — click for details" : " (off)"}</span>
          </li>
        </ul>
        <p className="text-xs text-[#5a5a5a]">
          Track colors indicate collection year, from light pink (older) to burgundy (newer).
        </p>
      </section>
    </>
  );
  return (
    <div className="explorer-workspace">
      <aside className="explorer-sidebar" aria-label="Contribution summary">
        {isDesktop ? summary : null}
      </aside>
      <div className="explorer-map" aria-label="Bathymetry map">
        <MapViewer
          platformId={platformId}
          providerId={providerId}
          timeWindowDays={timeWindowDays}
          onOverlayVisibilityChange={setVisibility}
        />
        {!isDesktop && (
          <Sheet>
            <SheetTrigger asChild>
              <Button className="explorer-layers-toggle absolute left-4 top-4 z-10">
                <BarChart3 size={18} aria-hidden="true" />
                Summary
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="max-h-[85dvh] overflow-y-auto bg-white p-6">
              <SheetHeader className="mb-6 pr-8">
                <SheetTitle>Contribution summary</SheetTitle>
                <SheetDescription>
                  Points collected in the selected period and the map legend.
                </SheetDescription>
              </SheetHeader>
              <div className="flex flex-col gap-4">{summary}</div>
            </SheetContent>
          </Sheet>
        )}
      </div>
      {children}
    </div>
  );
}
