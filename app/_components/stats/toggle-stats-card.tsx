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
        <div className="p-2 bg-white bg-opacity-80 rounded-lg flex items-center hover:cursor-pointer">
          <div className="p-2">
            <TableCellsIcon className="w-6 h-6 sm:w-8 sm:h-8 text-gray-500" />
          </div>
          <div>
            <div className="text-sm font-bold text-blue-800">
              See/Share Platform Stats
            </div>
            <div className="text-xs">
              Click to view a summary of the data collected by this vessel over
              the selected time window.
            </div>
          </div>
        </div>
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
