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
    <div className="flex gap-4 justify-center items-center">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>
            {userData?.platform_nickname && (
              <div>🚢{userData?.platform_nickname}</div>
            )}
          </TooltipTrigger>
          <TooltipContent>
            {userData?.csbPlatform?.platform && (
              <div className="p-4">
                {" "}
                Platform Name: {userData.csbPlatform.platform}
              </div>
            )}
            {userData?.csbPlatform?.noaa_id && (
              <div className="p-4">
                {" "}
                NOAA ID: {userData.csbPlatform.noaa_id}
              </div>
            )}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}
