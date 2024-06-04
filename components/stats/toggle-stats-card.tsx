"use client";

import { Button } from "@/components/ui/button";
import {
  DialogHeader,
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { TableCellsIcon } from "@heroicons/react/24/outline";

export default function ToggleStatsCard({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="z-50 border-0 bg-white/80 flex flex-col py-6">
          <div>
            <TableCellsIcon className="w-6 h-6 text-gray-500" />
          </div>
          <div className="text-xs text-gray-500">See/Share Stats</div>
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-blue-800 text-xl font-bold">
            Platform Stats Summary
          </DialogTitle>
        </DialogHeader>
        <DialogDescription className="text-gray-500">
          A simple summary of the data collected by this vessel over the
          selected time window.
        </DialogDescription>
        {children}
      </DialogContent>
    </Dialog>
  );
}
