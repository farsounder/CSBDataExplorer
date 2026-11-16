"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useLocalStorage } from "@/app/hooks/useLocalStorage";
import type { CSBPlatform, CSBProvider, UserData } from "@/lib/types";

// A first-time vessel selection also needs a node, so it obeys the same scope
// as the picker on an existing provider or vessel page.
export default function StartVesselView({
  platforms,
  providers,
}: {
  platforms: CSBPlatform[];
  providers: CSBProvider[];
}) {
  const [user, saveUser, hydrated] = useLocalStorage<UserData>("user", undefined);
  const [savedProvider, saveProvider] = useLocalStorage<CSBProvider>("provider", undefined);
  const [node, setNode] = useState<string | null>(null);
  const [vesselId, setVesselId] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();
  const provider =
    node ??
    (providers.some((p) => p.provider === savedProvider?.provider)
      ? savedProvider?.provider
      : "") ??
    "";
  const vessels = platforms.filter((p) => p.provider === provider);
  const vessel = vessels.find((p) => p.noaa_id === vesselId);

  return (
    <Dialog open={hydrated && !user?.csbPlatform.noaa_id}>
      <DialogContent hideClose>
        <DialogHeader>
          <DialogTitle>Choose a trusted node and vessel</DialogTitle>
          <DialogDescription>
            Pick a trusted node first, then choose one of its vessels to explore.
          </DialogDescription>
        </DialogHeader>
        <label htmlFor="start-node" className="text-sm font-medium">
          Trusted node
        </label>
        <select
          id="start-node"
          className="explorer-native-select w-full"
          value={provider}
          onChange={(event) => {
            setNode(event.target.value);
            setVesselId("");
          }}
        >
          <option value="">Pick a trusted node</option>
          {providers.map((p) => (
            <option key={p.provider} value={p.provider}>
              {p.provider}
            </option>
          ))}
        </select>
        <label htmlFor="start-vessel" className="text-sm font-medium">
          Vessel / unique ID
        </label>
        <select
          id="start-vessel"
          className="explorer-native-select w-full"
          value={vesselId}
          disabled={!provider}
          onChange={(event) => setVesselId(event.target.value)}
        >
          <option value="">Pick a vessel</option>
          {vessels.map((p) => (
            <option key={p.noaa_id} value={p.noaa_id}>
              {p.platform} ({p.noaa_id})
            </option>
          ))}
        </select>
        <div className="flex flex-wrap justify-between gap-3 pt-2">
          <Button
            variant="outline"
            onClick={() => router.push(`/provider?${searchParams.toString()}`)}
          >
            Explore a trusted node instead
          </Button>
          <Button
            className="explorer-share-button"
            disabled={!vessel}
            onClick={() => {
              if (!vessel) return;
              saveProvider({ provider });
              saveUser({ csbPlatform: vessel, platform_nickname: "" });
              router.push(
                `/platform/${encodeURIComponent(vessel.noaa_id)}?${searchParams.toString()}`
              );
            }}
          >
            Explore vessel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
