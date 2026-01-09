"use client";
import MapViewer from "@/app/_components/map/mapviewer";
import { useLocalStorage } from "@/app/hooks/useLocalStorage";
import { CSBProvider, UserData } from "@/lib/types";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

export default function Page() {
  const router = useRouter();
  const didRedirectRef = useRef(false);

  const [userData, , userHydrated] = useLocalStorage<UserData>("user", undefined);
  const [providerData, , providerHydrated] = useLocalStorage<CSBProvider>("provider", undefined);

  useEffect(() => {
    if (didRedirectRef.current) return;
    if (!userHydrated || !providerHydrated) return;

    const platformId = userData?.csbPlatform?.noaa_id;
    const providerId = providerData?.provider;

    // Prefer Platform if both exist (matches your "default to vessel view" expectation).
    if (platformId) {
      didRedirectRef.current = true;
      router.push(`/platform/${platformId}`);
      return;
    }

    if (providerId) {
      didRedirectRef.current = true;
      router.push(`/provider/${providerId}`);
    }
  }, [providerData?.provider, providerHydrated, router, userData?.csbPlatform?.noaa_id, userHydrated]);

  return (
    <div className="flex flex-col p-0 m-0 flex-1 min-h-0 relative">
      <div className="flex-1 min-h-0">
        <MapViewer />
      </div>
    </div>
  );
}
