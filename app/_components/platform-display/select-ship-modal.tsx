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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useMemo, memo, useCallback } from "react";
import { UserData } from "@/lib/types";
import { useToast } from "@/components/ui/use-toast";

import { CSBPlatform } from "@/lib/types";
import { useRouter } from "next/navigation";

const SelectShipModal = memo(function SelectShipModal({
  availablePlatforms,
  selectedUserData,
  saveUserData,
}: {
  availablePlatforms: CSBPlatform[];
  selectedUserData?: UserData;
  saveUserData: (userData: UserData) => void;
}) {
  const { toast } = useToast();
  const router = useRouter();

  // remove duplicates for platform list dropdown
  const uniquePlatforms = useMemo(
    () =>
      availablePlatforms
        .filter((ap, index, self) => index === self.findIndex((t) => t.platform === ap.platform))
        .map((ap) => ap.platform)
        .sort(),
    [availablePlatforms]
  );

  // remove duplicates for noaa_id list dropdown
  const uniqueNoaaIds = useMemo(
    () =>
      availablePlatforms
        .filter((ap, index, self) => index === self.findIndex((t) => t.noaa_id === ap.noaa_id))
        .map((ap) => ap.noaa_id)
        .sort(),
    [availablePlatforms]
  );

  const isButtonDisabled = useMemo(
    () => !selectedUserData?.csbPlatform?.platform || !selectedUserData?.csbPlatform?.noaa_id,
    [selectedUserData]
  );

   // Memoize the handlers
  const handlePlatformChange = useCallback(
    (name: string) => {
      const platform = availablePlatforms.find((ap) => ap.platform === name);
      saveUserData({
        ...selectedUserData,
        csbPlatform: {
          ...selectedUserData?.csbPlatform,
          platform: name,
          noaa_id: platform?.noaa_id || "",
          provider: platform?.provider || "",
        },
      } as UserData);
    },
    [availablePlatforms, selectedUserData, saveUserData]
  );

  const handleNoaaIdChange = useCallback(
    (id: string) => {
      const platform = availablePlatforms.find((ap) => ap.noaa_id === id);
      saveUserData({
        ...selectedUserData,
        csbPlatform: {
          ...selectedUserData?.csbPlatform,
          noaa_id: id,
          platform: platform?.platform || "",
          provider: platform?.provider || "",
        },
      } as UserData);
    },
    [availablePlatforms, selectedUserData, saveUserData]
  );

  const handleSave = useCallback(() => {
    if (!selectedUserData) return;
    
    saveUserData(selectedUserData);
    toast({
      title: "Success!",
      description: "Your platform has been updated",
    });
    router.push(`/platform/${selectedUserData.csbPlatform.noaa_id}`);
  }, [selectedUserData, saveUserData, toast, router]);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="secondary">Change Vessel</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            <span className="sm:text-xl text-gray-800">Select a NOAA Platform</span>
          </DialogTitle>
          <DialogDescription>
            Select a platform (vessel) in the DCDB database to track its stats and see current
            tracks from submitted data.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col justity-center items-center gap-2 text-gray-600">
          <div className="text-left w-full pl-4">Select one of:</div>
          <div className="border p-4 rounded-lg w-full">
            <Select
              value={selectedUserData?.csbPlatform?.platform}
              onValueChange={handlePlatformChange}
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={"Platform Name: required if no unique id selected below"}
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
              value={selectedUserData?.csbPlatform?.noaa_id}
              onValueChange={handleNoaaIdChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Unique id: required if no Platform Name (Anonymous)" />
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
              onClick={handleSave}
            >
              Save
            </Button>
          </DialogTrigger>
        </div>
      </DialogContent>
    </Dialog>
  );
});

export { SelectShipModal };
