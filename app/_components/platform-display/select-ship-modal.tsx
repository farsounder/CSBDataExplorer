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
import { useMemo, useCallback, memo } from "react";
import { UserData } from "@/lib/types";
import { useToast } from "@/components/ui/use-toast";
import { CSBPlatform } from "@/lib/types";
import { ExclamationCircleIcon } from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";
import { AutoSizer, List } from "react-virtualized";

// Custom virtualized select content component
const VirtualizedSelectContent = memo(function VirtualizedSelectContent({
  items,
  onSelect,
  selectedValue,
  placeholder,
}: {
  items: string[];
  onSelect: (value: string) => void;
  selectedValue?: string;
  placeholder: string;
}) {
  const rowRenderer = useCallback(
    ({ index, key, style }: { index: number; key: string; style: React.CSSProperties }) => {
      const item = items[index];
      return (
        <SelectItem
          key={key}
          value={item}
          className={`cursor-pointer ${selectedValue === item ? "bg-accent" : ""}`}
          style={style}
        >
          {item}
        </SelectItem>
      );
    },
    [items, selectedValue]
  );

  // Find the index of the selected value to scroll to it
  const selectedIndex = useMemo(() => {
    return selectedValue ? items.indexOf(selectedValue) : -1;
  }, [items, selectedValue]);

  return (
    <SelectContent>
      <div className="h-[300px]">
        <AutoSizer>
          {({ height, width }: { height: number; width: number }) => (
            <List
              width={width}
              height={height}
              rowCount={items.length}
              rowHeight={35}
              rowRenderer={rowRenderer}
              scrollToIndex={selectedIndex >= 0 ? selectedIndex : undefined}
              scrollToAlignment="center"
            />
          )}
        </AutoSizer>
      </div>
    </SelectContent>
  );
});

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
            <span className="sm:text-xl text-gray-800">Select a NOAA Platform / Vessel</span>
          </DialogTitle>
          <DialogDescription>
            Select a platform (vessel) in the DCDB database to track its stats and see current
            tracks from submitted data.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col justity-center items-center gap-2 text-gray-600">
          <div className="text-left w-full pl-4">Select one of:</div>
          <div className="border p-4 rounded-lg w-full">
            <div className="mb-4">
              <div className="text-sm font-medium mb-2">Platform Name:</div>
              <Select
                value={selectedUserData?.csbPlatform?.platform || ""}
                onValueChange={handlePlatformChange}
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder="Platform Name: required if no unique id selected below"
                    defaultValue={selectedUserData?.csbPlatform?.platform || ""}
                  >
                    {selectedUserData?.csbPlatform?.platform || ""}
                  </SelectValue>
                </SelectTrigger>
                <VirtualizedSelectContent
                  items={uniquePlatforms}
                  onSelect={handlePlatformChange}
                  selectedValue={selectedUserData?.csbPlatform?.platform}
                  placeholder="Platform Name: required if no unique id selected below"
                />
              </Select>
            </div>
            <div className="text-center py-2 text-sm">-- or --</div>
            <div>
              <div className="text-sm font-medium mb-2">Unique ID:</div>
              <Select
                value={selectedUserData?.csbPlatform?.noaa_id || ""}
                onValueChange={handleNoaaIdChange}
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder="Unique id: required if no Platform Name (Anonymous)"
                    defaultValue={selectedUserData?.csbPlatform?.noaa_id || ""}
                  >
                    {selectedUserData?.csbPlatform?.noaa_id || ""}
                  </SelectValue>
                </SelectTrigger>
                <VirtualizedSelectContent
                  items={uniqueNoaaIds}
                  onSelect={handleNoaaIdChange}
                  selectedValue={selectedUserData?.csbPlatform?.noaa_id}
                  placeholder="Unique id: required if no Platform Name (Anonymous)"
                />
              </Select>
            </div>
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
