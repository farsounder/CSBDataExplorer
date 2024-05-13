"use client";
import { AvailablePlatforms, UserData } from "@/lib/types";
import { SelectShipModal } from "./select-ship-modal";
import UserShipInfo from "./user-ship-info";
import { SignInButton, UserButton, useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";

export default function PlatformDisplayPanel({
  availablePlatforms,
}: {
  availablePlatforms: AvailablePlatforms;
}) {
  const { user } = useUser();
  const userData = user?.unsafeMetadata as UserData;
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
