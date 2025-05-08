"use client";
import MapViewer from "@/app/_components/map/mapviewer";
import { useLocalStorage } from "@/app/hooks/useLocalStorage";
import { useToast } from "@/components/ui/use-toast";
import { CSBProvider } from "@/lib/types";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const defaultProvider = {
  provider: "FarSounder",
};

export default function ProviderPage() {
  const [providerData] = useLocalStorage<CSBProvider>("provider", defaultProvider);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    if (providerData) {
      toast({
        title: "Redirecting to your default provider",
        description: `Your default provider is: ${providerData.provider}`,
      });
      router.push(`/provider/${providerData.provider}`);
    }
  }, [providerData, router, toast]);

  return (
    <div className="flex flex-col p-0 m-0 h-full relative">
      <MapViewer />
    </div>
  );
}
