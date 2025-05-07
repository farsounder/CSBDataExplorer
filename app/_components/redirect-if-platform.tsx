"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";

export default function RedirectIfPlatform() {
  const { toast } = useToast();

  const router = useRouter();
  useEffect(() => {
    const user = localStorage.getItem("user");
    if (user) {
      const platform_id = JSON.parse(user)?.csbPlatform?.noaa_id;
      if (platform_id) {
        toast({
          title: "Welcome back!",
          description: "Loading the platform you last selected: " + platform_id,
        });
        router.push(`/platform/${platform_id}`);
      }
    }
  }, [router, toast]);
  return null;
}
