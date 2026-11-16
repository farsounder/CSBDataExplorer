import MapWorkspace from "@/app/_components/map/map-workspace";
import ToggleStatsCard from "@/app/_components/stats/toggle-stats-card";
import { parseTimeWindowDays } from "@/lib/constants";
import { getProviderInfoFromNoaa } from "@/services/noaa-csb-api";
import { Suspense } from "react";
import StatsCardTrustedNode from "@/app/_components/stats/stats-card-provider";
import PlotContainer from "@/app/provider/[providerId]/_components/plot/plot-container";
import SocialButtonsProvider from "@/app/_components/stats/social-buttons-provider";

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ providerId: string }>;
  searchParams?: Promise<{ timeWindowDays?: string }>;
}) {
  const { providerId } = await params;
  const sp = searchParams ? await searchParams : undefined;
  const timeWindowDays = parseTimeWindowDays(sp?.timeWindowDays);
  return {
    title: `CSB Data for ID: ${providerId} | ${timeWindowDays} Days`,
    description: `CSB data collected by provider ${providerId} in the DCDB Crowd-sourced Bathymetry Database over the last ${timeWindowDays} days.`,
    openGraph: {
      title: `CSB Data for ID: ${providerId} | ${timeWindowDays} Days`,
      images: [
        {
          url: `/api/og/provider/${providerId}.png?timeWindowDays=${timeWindowDays}`,
        },
      ],
      url: `/provider/${providerId}?timeWindowDays=${timeWindowDays}`,
    },
    twitter: {
      card: "summary_large_image",
      site: `/provider/${providerId}?timeWindowDays=${timeWindowDays}`,
      images: `/api/og/provider/${providerId}.png?timeWindowDays=${timeWindowDays}`,
    },
  };
}

export default async function ProviderPage({
  params,
  searchParams,
}: {
  params: Promise<{ providerId: string }>;
  searchParams?: Promise<{ timeWindowDays?: string }>;
}) {
  const { providerId } = await params;
  const sp = searchParams ? await searchParams : undefined;
  const timeWindowDays = parseTimeWindowDays(sp?.timeWindowDays);
  if (isNaN(timeWindowDays)) {
    throw new Error("Invalid time window days");
  }

  // it's URL encoded, so we need to decode it
  const decodedProviderId = decodeURIComponent(providerId);
  const validProvider = await getProviderInfoFromNoaa();

  if (!validProvider || validProvider.length === 0) {
    throw new Error("No valid providers returned from NOAA endpoint.");
  }

  const validProviderIds = validProvider.map((provider) => provider.provider.toUpperCase());

  if (!validProviderIds.includes(decodedProviderId.toUpperCase())) {
    throw new Error("Invalid provider ID");
  }

  const providerData = validProvider.find((provider) => provider.provider === decodedProviderId);

  const captureElementId = "stats-card-provider-capture";

  return (
    <MapWorkspace
      providerId={decodedProviderId}
      sidebar={
        providerData ? (
          <>
            <Suspense
              fallback={<p className="text-sm text-muted-foreground">Loading contributions…</p>}
            >
              <PlotContainer provider={providerData} timeWindowDays={timeWindowDays} />
            </Suspense>
          </>
        ) : null
      }
    >
      {providerData && (
        <Suspense fallback={null}>
          <ToggleStatsCard
            toolbarTrigger
            triggerTitle="Share stats"
            triggerDescription=""
            title="Trusted Node Stats Summary"
            description="A summary of the data collected by this provider over the selected time window."
          >
            <StatsCardTrustedNode
              providerId={decodedProviderId}
              timeWindowDays={timeWindowDays}
              captureElementId={captureElementId}
            >
              <SocialButtonsProvider
                captureElementId={captureElementId}
                fileBase={`csb-provider-${decodedProviderId}-${timeWindowDays}`}
              />
            </StatsCardTrustedNode>
          </ToggleStatsCard>
        </Suspense>
      )}
    </MapWorkspace>
  );
}
