"use client";
import { CSBPlatform, CSBProvider, UserData } from "@/lib/types";
import { SelectShipModal } from "./select-ship-modal";
import { useToast } from "@/components/ui/use-toast";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SelectProviderModal } from "./select-provider-modal";

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
      <div className="flex gap-2">
        <PlatformDisplayPanel availablePlatforms={availablePlatforms} />
        <Link href="/provider">
          <Button>Trusted Node View</Button>
        </Link>
      </div>
    );
  } else if (isProvider) {
    return (
      <div className="flex gap-2">
        <ProviderDisplayPanel availableProviders={availableProviders} />
        <Link href="/platform">
          <Button>Platform View</Button>
        </Link>
      </div>
    );
  } else {
    return (
      <div className="flex gap-2">
        <Link href="/platform">
          <Button>Platform View</Button>
        </Link>
        <Link href="/provider">
          <Button variant="secondary">Trusted Node View</Button>
        </Link>
      </div>
    );
  }
}

function ProviderDisplayPanel({
  availableProviders,
}: {
  availableProviders: CSBProvider[];
}) {
  // same as platform display panel but for providers
  const { toast } = useToast();

  const [selectedProvider, setSelectedProvider] = useState<string>();
  const pathname = usePathname();
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

  /*useEffect(() => {
    const user = localStorage.getItem("user") ?? "{}";
    const data = JSON.parse(user);
    const providerId = pathname.split("/").pop();
    if (providerId) {
      const provider = availableProviders.find(
        (ap) => ap.provider.toUpperCase() === providerId.toUpperCase()
      );
      if (provider) {
        saveUserData({
          csbProvider: provider,
        });
        return;
      }
    }
    if (data) {
      setUserData(data);
    }
  }, [pathname, availableProviders]);*/

  /*const saveUserData = (userData: UserData) => {
    // update state and save in local storage
    localStorage.setItem("user", JSON.stringify(userData));
    setUserData(userData);
  };*/

  return (
    <div className="px-8 gap-2 items-center justify-center hidden sm:flex">
      <div className="flex justify-center items-center">
        <SelectProviderModal
          availableProviders={availableProviders}
          selectedProvider={selectedProvider}
          setSelectedProvider={setSelectedProvider}
        />
      </div>
    </div>
  );
}

function PlatformDisplayPanel({
  availablePlatforms,
}: {
  availablePlatforms: CSBPlatform[];
}) {
  const { toast } = useToast();

  const [userData, setUserData] = useState<UserData>();
  const pathname = usePathname();

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

  useEffect(() => {
    const user = localStorage.getItem("user") ?? "{}";
    const data = JSON.parse(user);
    const platformId = pathname.split("/").pop();
    if (platformId) {
      const platform = availablePlatforms.find(
        (ap) => ap.noaa_id.toUpperCase() === platformId.toUpperCase()
      );
      if (platform) {
        saveUserData({
          platform_nickname: "My boat",
          ...data,
          csbPlatform: platform,
        });
        return;
      }
    }
    if (data) {
      setUserData(data);
    }
  }, [pathname, availablePlatforms]);

  const saveUserData = (userData: UserData) => {
    // update state and save in local storage
    localStorage.setItem("user", JSON.stringify(userData));
    setUserData(userData);
  };

  return (
    <div className="px-8 gap-2 items-center justify-center hidden sm:flex">
      <div className="flex justify-center items-center">
        <SelectShipModal
          availablePlatforms={availablePlatforms}
          selectedUserData={userData}
          saveUserData={saveUserData}
        />
      </div>
    </div>
  );
}
