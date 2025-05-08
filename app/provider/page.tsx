"use client";
import MapViewer from "@/app/_components/map/mapviewer";
import { useLocalStorage } from "@/app/hooks/useLocalStorage";
import { useToast } from "@/components/ui/use-toast";
import { CSBProvider } from "@/lib/types";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ProviderPage() {
  const [ providerData ] = useLocalStorage<CSBProvider>("provider", undefined);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    if (!providerData) {
      toast({
        title: "No Trusted Node Selected",
        description: "Please select a Trusted Node using the 'Change Trusted Node' button at the top of the page",
      });
      return;
    }
    toast({
      title: "Redirecting to your last selected provider",
      description: `Your last selected provider is: ${providerData.provider}`,
    });
    router.push(`/provider/${providerData.provider}`);
  }, [providerData, router, toast]);

  return (
    <div className="flex flex-col p-0 m-0 h-full relative">
      <MapViewer />
    </div>
  );
}
