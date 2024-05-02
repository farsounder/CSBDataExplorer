"use client";

import { SignInButton, UserButton, useUser } from "@clerk/nextjs";
import { usePathname } from "next/navigation";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { useEffect, useState } from "react";
import { Tooltip } from "@radix-ui/react-tooltip";
import { TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";

type NOAAPlatformId = string;
type UserData = {
  noaa_id: NOAAPlatformId;
  platform_name: string;
  platform_nickname: string;
};

type AvailablePlatforms = {
  platforms: string[];
  noaa_ids: NOAAPlatformId[];
};

// TODO(Heath): needs input validation for the nickname
function SelectShipModal() {
  const { user } = useUser();
  const userData = user?.unsafeMetadata as UserData;

  const [newUserData, setNewUserData] = useState<UserData>(
    userData || {
      noaa_id: "",
      platform_name: "",
      platform_nickname: "",
    }
  );

  const [availablePlatforms, setAvailablePlatforms] =
    useState<AvailablePlatforms>();

  // TODO (Heath): what is the "right" way to fetch from a client component
  // now? Or can we make this a server component?
  useEffect(() => {
    fetch("/api/noaa/platforms")
      .then((res) => res.json())
      .then((data) => {
        setAvailablePlatforms(data);
      });
  }, []);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="secondary">Change Platform</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            Which NOAA Platform would you like to track?
          </DialogTitle>
          <DialogDescription>
            Select a platform (vessel) in the DCDB database to track its stats
            and compare to other platforms in the database. Some providers and
            trusted nodes submit data annonymously, so if you don&apol;t see
            your vessel here - contact your provider and they can tell help you
            find the NOAA Platform ID for your vessel.
          </DialogDescription>
          <div className="flex flex-col justity-center items-center gap-2">
            <div className="flex gap-4 w-full">
              <Label htmlFor="nickname" className="sr-only">
                Nickname
              </Label>
              <Input
                id="nickname"
                placeholder={
                  newUserData.platform_nickname || "Platform Nickname"
                }
                value={newUserData.platform_nickname || ""}
                type="text"
                onChange={(e) => {
                  setNewUserData({
                    ...newUserData,
                    platform_nickname: e.target.value,
                  });
                }}
              />
            </div>
            <Select
              onValueChange={(name: string) => {
                setNewUserData({
                  ...newUserData,
                  platform_name: name,
                });
              }}
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={newUserData.platform_name || "Select a vessel"}
                ></SelectValue>
              </SelectTrigger>
              <SelectContent>
                {availablePlatforms?.platforms.map((platform) => (
                  <SelectItem key={platform} value={platform}>
                    {platform}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              onValueChange={(id) => {
                setNewUserData({
                  ...newUserData,
                  noaa_id: id,
                });
              }}
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={
                    newUserData.noaa_id || "Only required if anonymous"
                  }
                ></SelectValue>
              </SelectTrigger>
              <SelectContent>
                {availablePlatforms?.noaa_ids.map((id) => (
                  <SelectItem key={id} value={id}>
                    {id}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <DialogTrigger asChild>
              <Button
                type="submit"
                className="px-3"
                onClick={() => {
                  user?.update({
                    unsafeMetadata: {
                      ...newUserData,
                    },
                  });
                }}
              >
                Save
              </Button>
            </DialogTrigger>
          </div>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}

function PlatformDisplay() {
  const { user } = useUser();
  const userData = user?.unsafeMetadata as UserData;
  return (
    <div className="flex gap-4 justify-center items-center">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>
            <div>{userData.platform_nickname} 🚢</div>
          </TooltipTrigger>
          <TooltipContent>
            <div className="p-4"> Platform Name: {userData.platform_name}</div>
            {userData.noaa_id && (
              <div className="p-4"> NOAA ID: {userData.noaa_id}</div>
            )}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <SelectShipModal />
    </div>
  );
}

export default function Header() {
  const { isSignedIn, user, isLoaded } = useUser();
  const pathname = usePathname();
  return (
    <header className="flex flex-col w-full">
      <div className="border-b flex items-center justify-between">
        <div className="flex py-4 items-center px-4 gap-8">
          <h1 className="text-2xl md:text-4xl font-bold text-blue-800">
            CSB Data Explorer
          </h1>
        </div>
        <div className="px-8 flex gap-6 items-center">
          {isLoaded && isSignedIn ? (
            <>
              <PlatformDisplay />
              <UserButton afterSignOutUrl={pathname} />
            </>
          ) : (
            <SignInButton mode="modal" fallbackRedirectUrl={pathname} />
          )}
        </div>
      </div>
    </header>
  );
}
