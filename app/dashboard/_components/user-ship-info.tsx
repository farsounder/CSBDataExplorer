"use client";
import { Tooltip } from "@radix-ui/react-tooltip";
import {
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../../../components/ui/tooltip";

import { UserData } from "@/lib/types";
import { ShareIcon } from "@heroicons/react/24/outline";
import { ShipIcon } from "lucide-react";
import Link from "next/link";

function ShipCard({ userData }: { userData: UserData }) {
  return (
    <div className="flex flex-col items-center">
      <ShipIcon className="w-4 h-4 sm:w-8 sm:h-8 text-blue-800" />
      <div className="text-xs sm:text-sm text-gray-400">
        {userData?.platform_nickname}
      </div>
    </div>
  );
}

function ShareCard({ userData }: { userData: UserData }) {
  const noaa_id = userData?.csbPlatform?.noaa_id;
  if (!noaa_id) {
    return null;
  }
  return (
    <Link href={`/api/og/${noaa_id}`} target="_blank" >
      <div className="flex flex-col items-center">
        <ShareIcon className="w-4 h-4 sm:w-8 sm:h-8 text-blue-800" />
        <div className="text-xs sm:text-sm text-gray-400">Share</div>
      </div>
    </Link>
  );
}
export default function UserShipInfo({ userData }: { userData: UserData }) {
  return (
    <div className="flex py-2 gap-2 justify-center items-center sm:text-sm w-full z-50">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>
            {userData?.platform_nickname && <ShipCard userData={userData} />}
          </TooltipTrigger>
          <TooltipContent>
            {userData?.csbPlatform?.platform && (
              <div className="px-4">
                {" "}
                Platform Name: {userData.csbPlatform.platform}
              </div>
            )}
            {userData?.csbPlatform?.noaa_id && (
              <div className="px-4">
                {" "}
                NOAA ID: {userData.csbPlatform.noaa_id}
              </div>
            )}
            {userData?.csbPlatform?.provider && (
              <div className="px-4">
                {" "}
                Provider: {userData.csbPlatform.provider}
              </div>
            )}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>
            {userData?.platform_nickname && <ShareCard userData={userData} />}
          </TooltipTrigger>
          <TooltipContent>
            Click to share the stats for this platform!
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}
