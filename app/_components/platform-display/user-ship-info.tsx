"use client";
import { Tooltip } from "@radix-ui/react-tooltip";
import {
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../../../components/ui/tooltip";

import { UserData } from "@/lib/types";
import { ChartPieIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

function ShareCard({
  userData,
  time_window_days,
}: {
  userData: UserData;
  time_window_days: number;
}) {
  const noaa_id = userData?.csbPlatform?.noaa_id;
  if (!noaa_id) {
    return null;
  }
  return (
    <Link
      href={`/api/og/platform/${noaa_id}?time_window_days=${time_window_days}`}
      target="_blank"
    >
      <div className="flex flex-col items-center">
        <ChartPieIcon className="w-4 h-4 sm:w-8 sm:h-8 text-blue-800" />
        <div className="text-xs sm:text-sm text-gray-400">
          {time_window_days} Day Stats Summary
        </div>
      </div>
    </Link>
  );
}
export default function UserShipInfo({ userData }: { userData: UserData }) {
  const searchParams = useSearchParams();
  const time_window_days = Number(searchParams.get("time_window_days")) || 30;

  return (
    <div className="flex py-2 gap-2 justify-center items-center sm:text-sm w-full z-50">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>
            {userData && (
              <ShareCard
                userData={userData}
                time_window_days={time_window_days}
              />
            )}
          </TooltipTrigger>
          <TooltipContent>
            A sharable stats summary of the data collected by this platform over
            the last 30 days.
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}
