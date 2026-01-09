"use client";
import { CSBPlatform, CSBProvider, UserData } from "@/lib/types";
import { SelectShipModal } from "./select-ship-modal";
import { useToast } from "@/components/ui/use-toast";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { SelectProviderModal } from "./select-provider-modal";
import { useLocalStorage } from "@/app/hooks/useLocalStorage";
import { Building2, Ship } from "lucide-react";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

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
  const router = useRouter();
  const isPlatform = pathname.includes("platform");
  const isProvider = pathname.includes("provider");

  // Helps the toggle "do the right thing" when switching modes:
  // - If we have a last-selected item in localStorage, jump straight to it.
  // - Otherwise, fall back to the base pages (which themselves may redirect).
  const [providerData] = useLocalStorage<CSBProvider>("provider", undefined);
  const [userData] = useLocalStorage<UserData>("user", undefined);
  const hasProviderPreset = Boolean(providerData?.provider);
  const hasPlatformPreset = Boolean(userData?.csbPlatform?.noaa_id);

  const providerHref = hasProviderPreset ? `/provider/${providerData!.provider}` : "/provider";
  const platformHref = hasPlatformPreset
    ? `/platform/${userData.csbPlatform.noaa_id}`
    : "/platform";

  const mode: "provider" | "platform" | "none" = isPlatform ? "platform" : isProvider ? "provider" : "none";

  // If the user is on a "neutral" route (e.g. /) and hasn't selected either mode yet,
  // open a short chooser modal instead of defaulting the toggle to "Platform".
  const shouldAskForMode = mode === "none" && !hasProviderPreset && !hasPlatformPreset;
  if (shouldAskForMode) {
    return (
      <ModeSelectDialog
        onChooseProvider={() => router.push("/provider")}
        onChoosePlatform={() => router.push("/platform")}
      />
    );
  }

  return (
    <div className="flex flex-col sm:flex-row gap-3 p-4 items-center">
      {mode === "platform" && <PlatformDisplayPanel availablePlatforms={availablePlatforms} />}
      {mode === "provider" && <ProviderDisplayPanel availableProviders={availableProviders} />}

      <ModeToggle
        mode={mode === "none" ? "platform" : mode}
        onToggle={() => {
          router.push(mode === "platform" ? providerHref : platformHref);
        }}
      />
    </div>
  );
}

function ModeSelectDialog({
  onChooseProvider,
  onChoosePlatform,
}: {
  onChooseProvider: () => void;
  onChoosePlatform: () => void;
}) {
  return (
    <Dialog open>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>What would you like to explore?</DialogTitle>
          <DialogDescription>
            Choose how you want to view contributions. You can switch at any time using the toggle.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <button
            type="button"
            onClick={onChooseProvider}
            className={cn(
              "rounded-lg border p-4 text-left transition-colors",
              "hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            )}
          >
            <div className="flex items-center gap-2 font-semibold text-blue-900">
              <Building2 className="h-5 w-5" aria-hidden="true" />
              <span>Trusted Node</span>
            </div>
            <div className="mt-1 text-sm text-gray-600">See all data contributed by an organization/company.</div>
          </button>

          <button
            type="button"
            onClick={onChoosePlatform}
            className={cn(
              "rounded-lg border p-4 text-left transition-colors",
              "hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            )}
          >
            <div className="flex items-center gap-2 font-semibold text-blue-900">
              <Ship className="h-5 w-5" aria-hidden="true" />
              <span>Platform</span>
            </div>
            <div className="mt-1 text-sm text-gray-600">See data contributed by a single vessel/boat.</div>
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function ModeToggle({
  mode,
  onToggle,
}: {
  mode: "provider" | "platform";
  onToggle: () => void;
}) {
  const isPlatform = mode === "platform";

  return (
    <div className="flex flex-col items-center gap-1 select-none">
      <div className="flex items-center gap-2">
        <div
          className={cn(
            "flex items-center gap-1 text-xs whitespace-nowrap",
            !isPlatform ? "text-blue-800 font-semibold" : "text-gray-500"
          )}
        >
          <Building2 className="h-4 w-4" aria-hidden="true" />
          <span className="hidden md:inline">Trusted Node</span>
          <span className="md:hidden">Org</span>
        </div>

        <button
          type="button"
          role="switch"
          aria-checked={isPlatform}
          aria-label="Toggle between Trusted Node and Platform views"
          onClick={onToggle}
          className={cn(
            "relative inline-flex h-7 w-12 items-center rounded-full transition-colors",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2",
            isPlatform ? "bg-blue-700" : "bg-gray-300"
          )}
        >
          <span
            className={cn(
              "inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform",
              isPlatform ? "translate-x-6" : "translate-x-1"
            )}
          />
        </button>

        <div
          className={cn(
            "flex items-center gap-1 text-xs whitespace-nowrap",
            isPlatform ? "text-blue-800 font-semibold" : "text-gray-500"
          )}
        >
          <Ship className="h-4 w-4" aria-hidden="true" />
          <span className="hidden md:inline">Platform</span>
          <span className="md:hidden">Vessel</span>
        </div>
      </div>

      <div className="text-[10px] text-gray-500 whitespace-nowrap">
        {isPlatform ? "Single vessel view" : "Organization-wide view"}
      </div>
    </div>
  );
}

function ProviderDisplayPanel({ availableProviders }: { availableProviders: CSBProvider[] }) {
  const [providerData, setProviderData] = useLocalStorage<CSBProvider>("provider", undefined);
  const { toast } = useToast();

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
  const [autoOpenSelectVessel, setAutoOpenSelectVessel] = useState(false);

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
    // Avoid a "flash open" before localStorage has hydrated.
    if (typeof window === "undefined") return;

    try {
      const raw = localStorage.getItem("user");
      if (!raw) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setAutoOpenSelectVessel(true);
        return;
      }

      const parsed = JSON.parse(raw) as UserData | undefined;
      const hasVessel = Boolean(parsed?.csbPlatform?.noaa_id || parsed?.csbPlatform?.platform);
      setAutoOpenSelectVessel(!hasVessel);
    } catch {
      setAutoOpenSelectVessel(true);
    }
  }, []);

  return (
    <div className="px-4 sm:px-8 gap-2 items-center justify-center flex flex-col sm:flex-row">
      <div className="flex justify-center items-center w-full">
        <SelectShipModal
          availablePlatforms={availablePlatforms}
          selectedUserData={userData}
          saveUserData={setUserData}
          openByDefault={autoOpenSelectVessel}
        />
      </div>
    </div>
  );
}
