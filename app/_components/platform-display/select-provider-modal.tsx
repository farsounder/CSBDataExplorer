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
import { useMemo } from "react";
import { CSBProvider } from "@/lib/types";
import { useToast } from "@/components/ui/use-toast";

import { ExclamationCircleIcon } from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";

export function SelectProviderModal({
  availableProviders,
  selectedProvider,
  setSelectedProvider,
}: {
  availableProviders: CSBProvider[];
  selectedProvider?: string;
  setSelectedProvider: (provider: string) => void;
}) {
  const { toast } = useToast();
  const router = useRouter();

  // remove duplicates for provider list dropdown
  const uniqueProviders = useMemo(
    () =>
      availableProviders
        .filter((ap, index, self) => index === self.findIndex((t) => t.provider === ap.provider))
        .map((ap) => ap.provider)
        .sort(),
    [availableProviders]
  );

  const isButtonDisabled = !selectedProvider;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="secondary">Change Trusted Node</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            <span className="sm:text-xl text-gray-800">
              Select a NOAA Trusted Node
            </span>
          </DialogTitle>
          <DialogDescription>
            Select a NOAA Trusted Node to track its stats relative to other NOAA Trusted Nodes.
          </DialogDescription>
        </DialogHeader>
          <div className="flex flex-col justity-center items-center gap-2 text-gray-600">
            <div className="text-left w-full pl-4">Select one of:</div>
            <div className="border p-4 rounded-lg w-full">
            <Select
              value={selectedProvider}
              onValueChange={(name: string) => {
                // get the noaa_id from the selected platform name
                const provider = availableProviders.find((ap) => ap.provider === name);
                setSelectedProvider(provider?.provider || "");
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder={"Provider Name"} />
              </SelectTrigger>
              <SelectContent>
                {uniqueProviders.map((provider) => {
                  return (
                    <SelectItem key={provider} value={provider}>
                      {provider}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
            </div>
            <DialogTrigger asChild>
              <Button
                type="submit"
                className="px-3 bg-blue-700"
                disabled={isButtonDisabled}
                onClick={() => {
                  if (!selectedProvider) {
                    return;
                  }
                  setSelectedProvider(selectedProvider);
                  toast({
                    title: "Success!",
                    description: "Your Trusted Node has been updated",
                  });
                  router.push(`/provider/${selectedProvider}`);
                }}
              >
                Save
              </Button>
            </DialogTrigger>
          </div>
      </DialogContent>
    </Dialog>
  );
}
