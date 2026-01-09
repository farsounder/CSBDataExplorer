"use client";

import { useState } from "react";
import { SlidersHorizontal } from "lucide-react";

import type { CSBPlatform, CSBProvider } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { TimeWindowSelect } from "./time-window-select";
import DisplayPanel from "./platform-display/platform-planel";

export default function HeaderControls({
  availablePlatforms,
  availableProviders,
}: {
  availablePlatforms: CSBPlatform[];
  availableProviders: CSBProvider[];
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Desktop/tablet: show controls inline */}
      <div className="hidden md:flex justify-center items-center gap-4">
        <TimeWindowSelect />
        <DisplayPanel availablePlatforms={availablePlatforms} availableProviders={availableProviders} />
      </div>

      {/* Mobile: put controls in a bottom sheet */}
      <div className="flex md:hidden justify-center items-center">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2">
              <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
              Controls
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="p-4 pb-6">
            <SheetHeader className="pr-10">
              <SheetTitle>Controls</SheetTitle>
            </SheetHeader>
            <div className="mt-4 flex flex-col gap-4">
              <TimeWindowSelect />
              <DisplayPanel availablePlatforms={availablePlatforms} availableProviders={availableProviders} />
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}


