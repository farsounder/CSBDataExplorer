"use client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useMemo, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { UserData } from "@/lib/types";
import { useToast } from "@/components/ui/use-toast";
import forceRefresh from "@/app/actions";

import { CSBPlatform } from "@/lib/types";
import { ExclamationCircleIcon } from "@heroicons/react/24/outline";

export function SelectShipModal({
  availablePlatforms,
  startingUserData,
}: {
  availablePlatforms: CSBPlatform[];
  startingUserData: UserData;
}) {
  const { user, isLoaded } = useUser();
  const { toast } = useToast();
  const [newUserData, setNewUserData] = useState<UserData>(startingUserData);

  // remove duplicates for platform list dropdown
  const uniquePlatforms = useMemo(
    () =>
      availablePlatforms
        .filter(
          (ap, index, self) =>
            index === self.findIndex((t) => t.platform === ap.platform)
        )
        .map((ap) => ap.platform)
        .sort(),
    [availablePlatforms]
  );

  // remove duplicates for noaa_id list dropdown
  const uniqueNoaaIds = useMemo(
    () =>
      availablePlatforms
        .filter(
          (ap, index, self) =>
            index === self.findIndex((t) => t.noaa_id === ap.noaa_id)
        )
        .map((ap) => ap.noaa_id)
        .sort(),
    [availablePlatforms]
  );

  const isButtonDisabled =
    !newUserData?.csbPlatform?.platform ||
    !newUserData?.csbPlatform?.noaa_id ||
    !newUserData?.platform_nickname;

  if (!user?.unsafeMetadata || !isLoaded) {
    return null;
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="secondary">Change Platform</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            <div className="sm:text-xl text-gray-800">
              Which NOAA Platform would you like to track?
            </div>
          </DialogTitle>
          <DialogDescription>
            <div className="pb-4">
              <div className="py-4">
                Select a platform (vessel) in the DCDB database to track its
                stats and see current tracks from submitted data.
              </div>
              <div className="p-2 bg-blue-100 text-blue-700 border-l-4 border-blue-500 rounded-md text-sm flex gap-4 ">
                <ExclamationCircleIcon className="w-16 h-16 inline-block" />
                <p>
                  <span className="font-semibold">Note: </span>
                  If you do not see your vessel here, contact your provider.
                  They can help you find the NOAA Platform ID for your vessel.
                </p>
              </div>
            </div>
          </DialogDescription>
          <div className="flex flex-col justity-center items-center gap-2 text-gray-600">
            <div className="flex w-full flex-col gap-1 pb-4">
              <Label htmlFor="nickname" className="pb-1 pl-1">
                Nickname
              </Label>
              <Input
                id="nickname"
                placeholder={
                  startingUserData?.platform_nickname || "Platform Nickname"
                }
                value={newUserData?.platform_nickname || ""}
                type="text"
                onChange={(e) => {
                  setNewUserData((prev) => ({
                    ...prev,
                    platform_nickname: e.target.value,
                  }));
                }}
              />
            </div>
            <div className="text-left w-full pl-4">Select one of:</div>
            <div className="border p-4 rounded-lg">
              <Select
                value={newUserData?.csbPlatform?.platform}
                onValueChange={(name: string) => {
                  // get the noaa_id from the selected platform name
                  const platform = availablePlatforms.find(
                    (ap) => ap.platform === name
                  );
                  setNewUserData((prev) => ({
                    ...prev,
                    csbPlatform: {
                      ...prev.csbPlatform,
                      platform: name,
                      noaa_id: platform?.noaa_id || "",
                      provider: platform?.provider || "",
                    },
                  }));
                }}
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={
                      startingUserData?.csbPlatform?.platform ||
                      "Only required if no NOAA ID selected below"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {uniquePlatforms.map((platform) => {
                    return (
                      <SelectItem key={platform} value={platform}>
                        {platform}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
              <div className="text-center py-2 text-sm">-- or --</div>
              <Select
                value={newUserData?.csbPlatform?.noaa_id}
                onValueChange={(id) => {
                  // get the platform name from the selected id
                  const platform = availablePlatforms.find(
                    (ap) => ap.noaa_id === id
                  );
                  setNewUserData((prev) => ({
                    ...prev,
                    csbPlatform: {
                      ...prev.csbPlatform,
                      noaa_id: id,
                      platform: platform?.platform || "",
                      provider: platform?.provider || "",
                    },
                  }));
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Only required if anonymous" />
                </SelectTrigger>
                <SelectContent>
                  {uniqueNoaaIds.map((id) => (
                    <SelectItem key={id} value={id}>
                      {id}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <DialogTrigger asChild>
              <Button
                type="submit"
                className="px-3 bg-blue-700"
                disabled={isButtonDisabled}
                onClick={() => {
                  user
                    ?.update({
                      unsafeMetadata: {
                        ...newUserData,
                      },
                    })
                    .then(() => {
                      toast({
                        title: "Success!",
                        description: "Your platform has been updated",
                      });
                    })
                    .catch((e) => {
                      toast({
                        title: "Error",
                        description:
                          "There was an error updating your platform.",
                        variant: "destructive",
                      });
                    });
                  forceRefresh();
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
