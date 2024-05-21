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
import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { UserData } from "@/lib/types";
import { useToast } from "@/components/ui/use-toast";
import forceRefresh from "@/app/actions";

import { CSBPlatform } from "@/lib/types";

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

  if (!user?.unsafeMetadata || !isLoaded) {
    return null;
  }

  // remove duplicates for platform list dropdown
  const uniquePlatforms = availablePlatforms
    .filter(
      (ap, index, self) =>
        index === self.findIndex((t) => t.platform === ap.platform)
    )
    .map((ap) => ap.platform).sort();

  // remove duplicates for noaa_id list dropdown
  const uniqueNoaaIds = availablePlatforms
    .filter(
      (ap, index, self) =>
        index === self.findIndex((t) => t.noaa_id === ap.noaa_id)
    )
    .map((ap) => ap.noaa_id).sort();

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
            <DialogTrigger asChild>
              <Button
                type="submit"
                className="px-3"
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
