"use client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { UserData } from "@/lib/types";
import { useToast } from "@/components/ui/use-toast";

import { AvailablePlatforms } from "@/lib/types";

export function SelectShipModal({
  availablePlatforms,
  startingUserData,
}: {
  availablePlatforms: AvailablePlatforms;
  startingUserData: UserData;
}) {
  const { user, isLoaded } = useUser();
  const { toast } = useToast();
  const [newUserData, setNewUserData] = useState<UserData>(startingUserData);

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
                  newUserData?.platform_nickname || "Platform Nickname"
                }
                value={newUserData?.platform_nickname || ""}
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
                  noaa_id: "",
                });
              }}
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={
                    newUserData.platform_name ||
                    "Only required if no NOAA ID selected below"
                  }
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
                  platform_name: "",
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
                  }).then(() => {
                    toast({
                      description: "Your platform has been updated",
                    });
                  }).catch((e) => {
                    toast({
                      title: "Error",
                      description: "There was an error updating your platform.",
                      variant: "destructive",
                    });
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
