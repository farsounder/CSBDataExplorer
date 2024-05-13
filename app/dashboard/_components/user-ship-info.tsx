"use client";
import { Tooltip } from "@radix-ui/react-tooltip";
import {
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../../../components/ui/tooltip";

import { UserData } from "@/lib/types";


export default function UserShipInfo(
  { userData }: { userData: UserData }
) {
  return (
    <div className="flex gap-4 justify-center items-center">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>
            <div>🚢{userData.platform_nickname}</div>
          </TooltipTrigger>
          <TooltipContent>
            {userData.platform_name && (
              <div className="p-4">
                {" "} Platform Name: {userData.platform_name}
              </div>
            )}
            {userData.noaa_id && (
              <div className="p-4"> NOAA ID: {userData.noaa_id}</div>
            )}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}