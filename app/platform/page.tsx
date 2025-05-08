"use client";
import MapViewer from "@/app/_components/map/mapviewer";
import { useLocalStorage } from "@/app/hooks/useLocalStorage";
import { UserData } from "@/lib/types";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";
import { useEffect } from "react";

export default function PlatformPage() {
  const [ userData ] = useLocalStorage<UserData>("user", undefined);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    if (userData?.csbPlatform?.platform) {
      toast({
        title: "Redirecting to " + userData.csbPlatform.platform,
        description: `You are being redirected to the last platform you were on: (${userData.csbPlatform.platform} - ${userData.csbPlatform.noaa_id})`,
      });
      router.push("/platform/" + userData.csbPlatform.noaa_id);
    }
  }, [userData, toast, router]);

  return (
    <div className="flex flex-col p-0 m-0 h-full relative">
      <MapViewer />
    </div>
  );
}
