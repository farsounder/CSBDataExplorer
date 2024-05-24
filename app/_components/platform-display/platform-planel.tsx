"use client";
import { CSBPlatform, UserData } from "@/lib/types";
import { SelectShipModal } from "./select-ship-modal";
import UserShipInfo from "./user-ship-info";
import { useToast } from "@/components/ui/use-toast";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export default function PlatformDisplayPanel({
  availablePlatforms,
}: {
  availablePlatforms: CSBPlatform[];
}) {
  const { toast } = useToast();

  const [userData, setUserData] = useState<UserData>();
  const pathname = usePathname();

  useEffect(() => {
    if (!availablePlatforms || availablePlatforms.length === 0) {
      toast({
        title: "Fetch Failed - No NOAA Platforms Available from NOAA API",
        description:
          "There are no platforms available to select, if your already picked a platform, you don't need to worry about it. If you haven't please try again later, or contact us if the problem persists.",
        variant: "default",
      });
    }
  }, [availablePlatforms, toast]);

  useEffect(() => {
    const user = localStorage.getItem("user") ?? "{}";
    const data = JSON.parse(user);
    const platformId = pathname.split("/").pop();
    if (platformId) {
      const platform = availablePlatforms.find(
        (ap) => ap.noaa_id.toUpperCase() === platformId.toUpperCase()
      );
      console.log(platform, platformId)
      if (platform) {
        saveUserData({
          platform_nickname: "My boat",
          ...data,
          csbPlatform: platform,
        });
        return;
      }
    }
    if (data) {
      setUserData(data);
    }
  }, [pathname, availablePlatforms]);

  const saveUserData = (userData: UserData) => {
    // update state and save in local storage
    localStorage.setItem("user", JSON.stringify(userData));
    setUserData(userData);
  };


  return (
    <div className="px-8 flex gap-2 items-center justify-center">
      <div className="flex justify-center items-center">
        {userData && <UserShipInfo userData={userData} />}
        <SelectShipModal
          availablePlatforms={availablePlatforms}
          selectedUserData={userData}
          saveUserData={saveUserData}
        />
      </div>
    </div>
  );
}
