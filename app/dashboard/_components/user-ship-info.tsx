"use client";
import { Tooltip } from "@radix-ui/react-tooltip";
import {
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../../../components/ui/tooltip";

import { UserData } from "@/lib/types";

export default function UserShipInfo({ userData }: { userData: UserData }) {
  return (
    <div className="flex py-2 gap-4 justify-center items-center  sm:text-sm w-full z-50">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>
            {userData?.platform_nickname && (
              <div>🚢{userData?.platform_nickname}</div>
            )}
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
    </div>
  );
}
