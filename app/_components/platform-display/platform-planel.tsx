"use client";
import { CSBPlatform, CSBProvider, UserData } from "@/lib/types";
import { SelectShipModal } from "./select-ship-modal";
import { useToast } from "@/components/ui/use-toast";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SelectProviderModal } from "./select-provider-modal";
import { useLocalStorage } from "@/app/hooks/useLocalStorage";

// generic display panel to wrap the platform or provider display panels
// decide which one to show based on the pathname
export default function DisplayPanel({
  availablePlatforms,
  availableProviders,
}: {
  availablePlatforms: CSBPlatform[];
  availableProviders: CSBProvider[];
}) {
  const pathname = usePathname();
  const isPlatform = pathname.includes("platform");
  const isProvider = pathname.includes("provider");
  if (isPlatform) {
    return (
      <div className="flex flex-col sm:flex-row gap-2 p-4">
        <PlatformDisplayPanel availablePlatforms={availablePlatforms} />
        <Link href="/provider" className="w-full sm:w-auto">
          <Button className="w-full text-xs lg:text-sm">Trusted Node</Button>
        </Link>
      </div>
    );
  } else if (isProvider) {
    return (
      <div className="flex flex-col sm:flex-row gap-2 p-4">
        <ProviderDisplayPanel availableProviders={availableProviders} />
        <Link href="/platform" className="w-full sm:w-auto">
          <Button className="w-full text-xs lg:text-sm">Platform</Button>
        </Link>
      </div>
    );
  } else {
    return (
      <div className="flex flex-col sm:flex-row gap-2 p-4">
        <Link href="/platform" className="w-full sm:w-auto">
          <Button className="w-full text-xs lg:text-sm">Platform</Button>
        </Link>
        <Link href="/provider" className="w-full sm:w-auto">
          <Button variant="secondary" className="w-full text-xs lg:text-sm">
            Trusted Node
          </Button>
        </Link>
      </div>
    );
  }
}

function ProviderDisplayPanel({ availableProviders }: { availableProviders: CSBProvider[] }) {
  const [providerData, setProviderData] = useLocalStorage<CSBProvider>("provider", undefined);
  const { toast } = useToast();

  const [selectedProvider, setSelectedProvider] = useState<string>();
  useEffect(() => {
    if (!availableProviders || availableProviders.length === 0) {
      toast({
        title: "Fetch Failed - No NOAA Trusted Nodes Available from NOAA API",
        description:
          "There are no trusted nodes available to select, if you already picked a trusted node, you don't need to worry about it. If you haven't please try again later, or contact us if the problem persists.",
        variant: "default",
      });
    }
  }, [availableProviders, toast]);

  return (
    <div className="px-4 sm:px-8 gap-2 items-center justify-center flex flex-col sm:flex-row">
      <div className="flex justify-center items-center w-full">
        <SelectProviderModal
          availableProviders={availableProviders}
          selectedProvider={providerData?.provider}
          setSelectedProvider={setProviderData}
        />
      </div>
    </div>
  );
}

function PlatformDisplayPanel({ availablePlatforms }: { availablePlatforms: CSBPlatform[] }) {
  const { toast } = useToast();

  const [userData, setUserData] = useLocalStorage<UserData>("user", undefined);

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

  return (
    <div className="px-4 sm:px-8 gap-2 items-center justify-center flex flex-col sm:flex-row">
      <div className="flex justify-center items-center w-full">
        <SelectShipModal
          availablePlatforms={availablePlatforms}
          selectedUserData={userData}
          saveUserData={setUserData}
        />
      </div>
    </div>
  );
}
