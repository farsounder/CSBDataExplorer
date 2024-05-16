"use client";
import { CSBPlatform, UserData } from "@/lib/types";
import { SelectShipModal } from "./select-ship-modal";
import UserShipInfo from "./user-ship-info";
import { SignInButton, UserButton, useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useEffect } from "react";

export default function PlatformDisplayPanel({
  availablePlatforms,
}: {
  availablePlatforms: CSBPlatform[];
}) {
  const { user } = useUser();
  const { toast } = useToast();
  const userData = user?.unsafeMetadata as UserData;

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

  if (!user || !userData) {
    return (
      <div className="px-4">
        <SignInButton mode="modal" fallbackRedirectUrl="/dashboard">
          <Button variant="secondary">Sign In</Button>
        </SignInButton>
      </div>
    );
  }
  return (
    <div className="px-8 flex gap-6 items-center">
      <div className="flex gap-4 justify-center items-center">
        <UserShipInfo userData={userData} />
        <SelectShipModal
          availablePlatforms={availablePlatforms}
          startingUserData={userData}
        />
      </div>
      <UserButton afterSignOutUrl="/dashboard" />
    </div>
  );
}
