"use client";

import {
  DialogHeader,
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { TableCellsIcon } from "@heroicons/react/24/outline";
import { useExplorerUI } from "@/app/_components/explorer-ui-provider";

export default function ToggleStatsCard({
  triggerTitle,
  triggerDescription,
  title,
  description,
  children,
  toolbarTrigger = false,
}: {
  triggerTitle: string;
  triggerDescription: string;
  title: string;
  description: string;
  children: React.ReactNode;
  toolbarTrigger?: boolean;
}) {
  const { shareOpen, setShareOpen } = useExplorerUI();
  return (
    <Dialog
      open={toolbarTrigger ? shareOpen : undefined}
      onOpenChange={toolbarTrigger ? setShareOpen : undefined}
    >
      {!toolbarTrigger && (
        <DialogTrigger asChild>
          <div className="p-2 bg-white/80 rounded-lg flex items-center hover:cursor-pointer">
            <div className="p-2">
              <TableCellsIcon className="w-6 h-6 sm:w-8 sm:h-8 text-gray-500" />
            </div>
            <div>
              <div className="text-sm font-bold text-blue-800">{triggerTitle}</div>
              <div className="text-xs">{triggerDescription}</div>
            </div>
          </div>
        </DialogTrigger>
      )}
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-blue-800 text-xl font-bold">{title}</DialogTitle>
        </DialogHeader>
        <DialogDescription className="text-gray-500">{description}</DialogDescription>
        {children}
      </DialogContent>
    </Dialog>
  );
}
