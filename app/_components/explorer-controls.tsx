"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Building2, ChevronDown, Info, Share2, Ship } from "lucide-react";
import type { CSBPlatform, CSBProvider, UserData } from "@/lib/types";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { TimeWindowSelect } from "./time-window-select";
import DisplayPanel from "./platform-display/platform-planel";
import { SelectProviderModal } from "./platform-display/select-provider-modal";
import { useLocalStorage } from "@/app/hooks/useLocalStorage";
import { useExplorerUI } from "./explorer-ui-provider";
import ViewNavigation from "./view-navigation";
import StartVesselView from "./platform-display/start-vessel-view";

function NodePicker({ provider, providers }: { provider: string; providers: CSBProvider[] }) {
  const [, saveProvider] = useLocalStorage<CSBProvider>("provider", undefined);
  const [draft, setDraft] = useState(provider);
  return (
    <SelectProviderModal
      availableProviders={providers}
      selectedProvider={draft}
      setSelectedProvider={(value) => {
        setDraft(value.provider);
        saveProvider(value);
      }}
      trigger={
        <>
          <Building2 size={18} aria-hidden="true" />
          <span>
            <span className="text-[#5a5a5a]">Trusted node:</span> <strong>{provider}</strong>
          </span>
          <ChevronDown size={14} aria-hidden="true" />
        </>
      }
    />
  );
}

export default function ExplorerControls({
  availablePlatforms,
  availableProviders,
}: {
  availablePlatforms: CSBPlatform[];
  availableProviders: CSBProvider[];
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { setShareOpen } = useExplorerUI();
  const [userData, saveUserData] = useLocalStorage<UserData>("user", undefined);
  const [vesselPickerOpen, setVesselPickerOpen] = useState(false);
  const [draftVessel, setDraftVessel] = useState("");
  const [isPending, startTransition] = useTransition();
  const platformId = pathname.startsWith("/platform/")
    ? decodeURIComponent(pathname.slice(10))
    : undefined;
  const platform = availablePlatforms.find(
    (item) => item.noaa_id.toUpperCase() === platformId?.toUpperCase()
  );
  const provider = pathname.startsWith("/provider/")
    ? decodeURIComponent(pathname.slice(10))
    : platform?.provider;
  const isStats = pathname.startsWith("/stats");
  const isMapDetail = Boolean(provider);
  const vessels = availablePlatforms.filter((item) => item.provider === provider);
  const matchPeriod = searchParams.get("mapPeriod") === "selected";

  const navigate = (path: string) =>
    startTransition(() => {
      setShareOpen(false);
      router.push(`${path}?${searchParams.toString()}`);
    });
  const chooseVessel = () => {
    setDraftVessel(
      platform?.noaa_id ??
        (userData && userData.csbPlatform.provider === provider ? userData.csbPlatform.noaa_id : "")
    );
    setVesselPickerOpen(true);
  };

  return (
    <>
      <div className="explorer-header">
        <Link href="/" className="explorer-title">
          <h1>CSB Data Explorer</h1>
          <p>Crowdsourced bathymetry your vessels collected and sent to the IHO DCDB</p>
        </Link>
        <ViewNavigation />
        {provider ? (
          <NodePicker key={provider} provider={provider} providers={availableProviders} />
        ) : null}
        {isStats || pathname.startsWith("/share/") ? <TimeWindowSelect compact /> : null}
        {!isMapDetail && !isStats && !pathname.startsWith("/share/") ? (
          pathname === "/platform" ? (
            <StartVesselView platforms={availablePlatforms} providers={availableProviders} />
          ) : (
            <DisplayPanel
              availablePlatforms={availablePlatforms}
              availableProviders={availableProviders}
            />
          )
        ) : null}
      </div>
      {isMapDetail && (
        <div
          className="explorer-toolbar"
          aria-label="Map comparison controls"
          aria-busy={isPending}
        >
          <div className="explorer-comparison-controls">
            <span className="font-semibold">Compare</span>
            <div role="group" aria-label="Comparison" className="explorer-mode-switch">
              <button
                type="button"
                aria-pressed={!platform}
                disabled={isPending}
                onClick={() => navigate(`/provider/${encodeURIComponent(provider!)}`)}
              >
                {provider} vs. all providers
              </button>
              <button
                type="button"
                aria-pressed={Boolean(platform)}
                disabled={isPending}
                onClick={() => {
                  if (platform) return;
                  if (
                    userData &&
                    userData.csbPlatform.provider === provider &&
                    vessels.some((v) => v.noaa_id === userData.csbPlatform.noaa_id)
                  ) {
                    navigate(`/platform/${encodeURIComponent(userData.csbPlatform.noaa_id)}`);
                  } else chooseVessel();
                }}
              >
                A vessel vs. {provider}
              </button>
            </div>
            <button
              className="explorer-select-button"
              type="button"
              disabled={!platform || isPending}
              onClick={chooseVessel}
              title={
                platform
                  ? `${platform.platform} (${platform.noaa_id})`
                  : "Choose the vessel comparison to pick a vessel"
              }
            >
              <Ship size={16} aria-hidden="true" />
              <span className="truncate">{platform?.platform ?? "Pick a vessel"}</span>
              <ChevronDown size={14} aria-hidden="true" />
            </button>
            <span className="font-semibold">for</span>
            <TimeWindowSelect compact />
          </div>
          <div className="explorer-map-period">
            <Info size={16} className="shrink-0" aria-hidden="true" />
            <span>{matchPeriod ? "Map follows this period" : "Map shows all-time tracks"}</span>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={matchPeriod}
                disabled={isPending}
                onChange={(event) => {
                  const params = new URLSearchParams(searchParams.toString());
                  if (event.target.checked) params.set("mapPeriod", "selected");
                  else params.delete("mapPeriod");
                  startTransition(() => router.push(`${pathname}?${params.toString()}`));
                }}
              />
              Limit map to this period
            </label>
          </div>
          <Button className="explorer-share-button" onClick={() => setShareOpen(true)}>
            <Share2 size={16} aria-hidden="true" />
            Share stats
          </Button>
        </div>
      )}
      <Dialog open={vesselPickerOpen} onOpenChange={setVesselPickerOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Select a vessel from {provider}</DialogTitle>
            <DialogDescription>
              Compare a vessel’s contributions with its trusted node. Change the trusted node to
              explore other vessels.
            </DialogDescription>
          </DialogHeader>
          <label htmlFor="explorer-vessel" className="text-sm font-medium">
            Vessel / unique ID
          </label>
          <select
            id="explorer-vessel"
            className="explorer-native-select w-full"
            value={draftVessel}
            onChange={(event) => setDraftVessel(event.target.value)}
          >
            <option value="">Pick a vessel</option>
            {vessels.map((vessel) => (
              <option key={vessel.noaa_id} value={vessel.noaa_id}>
                {vessel.platform} ({vessel.noaa_id})
              </option>
            ))}
          </select>
          {vessels.length === 0 && (
            <p className="text-sm text-muted-foreground">
              No vessels are available for this trusted node.
            </p>
          )}
          <Button
            className="explorer-share-button justify-self-end"
            disabled={!vessels.some((v) => v.noaa_id === draftVessel)}
            onClick={() => {
              const vessel = vessels.find((v) => v.noaa_id === draftVessel);
              if (!vessel) return;
              saveUserData({
                ...userData,
                csbPlatform: vessel,
                platform_nickname: userData?.platform_nickname ?? "",
              });
              setVesselPickerOpen(false);
              navigate(`/platform/${encodeURIComponent(vessel.noaa_id)}`);
            }}
          >
            Save
          </Button>
        </DialogContent>
      </Dialog>
    </>
  );
}
