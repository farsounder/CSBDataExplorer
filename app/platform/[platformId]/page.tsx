import MapWorkspace from "@/app/_components/map/map-workspace";
import { Suspense } from "react";
import PlotContainer from "@/app/platform/[platformId]/_components/plot/plot-container";
import { getPlatformInfoFromNoaa } from "@/services/noaa-csb-api";
import StatsCard from "@/app/_components/stats/stats-card";
import ToggleStatsCard from "@/app/_components/stats/toggle-stats-card";
import SocialButtons from "@/app/_components/stats/social-buttons-with-create";
import { parseTimeWindowDays } from "@/lib/constants";
import { PlatformNotFound } from "@/app/platform/[platformId]/_components/platform-not-found";
// Next 16 requires segment config exports like `revalidate` to be statically analyzable.
// Using an imported constant can be flagged as invalid, so keep this as a literal.
export const revalidate = 21600; // 6 hours

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ platformId: string }>;
  searchParams?: Promise<{ timeWindowDays?: string }>;
}) {
  const { platformId } = await params;
  const sp = searchParams ? await searchParams : undefined;
  const timeWindowDays = parseTimeWindowDays(sp?.timeWindowDays);
  return {
    title: `CSB Data for ID: ${platformId} | ${timeWindowDays} Days`,
    description: `CSB data collected by platform ${platformId} in the DCDB Crowd-sourced Bathymetry Database over the last ${timeWindowDays} days.`,
    openGraph: {
      title: `CSB Data for ID: ${platformId} | ${timeWindowDays} Days`,
      images: [
        {
          url: `/api/og/platform/${platformId}.png?timeWindowDays=${timeWindowDays}`,
        },
      ],
      url: `/platform/${platformId}?timeWindowDays=${timeWindowDays}`,
    },
    twitter: {
      card: "summary_large_image",
      site: `/platform/${platformId}?timeWindowDays=${timeWindowDays}`,
      images: `/api/og/platform/${platformId}.png?timeWindowDays=${timeWindowDays}`,
    },
  };
}

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ platformId: string }>;
  searchParams?: Promise<{ timeWindowDays?: string }>;
}) {
  const { platformId } = await params;
  const sp = searchParams ? await searchParams : undefined;
  const timeWindowDays = parseTimeWindowDays(sp?.timeWindowDays);
  const validPlatforms = await getPlatformInfoFromNoaa();

  if (!validPlatforms || validPlatforms.length === 0) {
    throw new Error("No valid platforms returned from NOAA endpoint.");
  }

  const validPlatformIds = validPlatforms.map((platform) => platform.noaa_id.toUpperCase());

  if (!validPlatformIds.includes(platformId.toUpperCase())) {
    return <PlatformNotFound platformId={platformId} />;
  }

  const platform = validPlatforms.find((p) => p.noaa_id.toUpperCase() === platformId.toUpperCase());

  const captureElementId = "stats-card-capture";

  return (
    <MapWorkspace
      platformId={platformId}
      sidebar={
        platform ? (
          <>
            <Suspense
              fallback={<p className="text-sm text-muted-foreground">Loading contributions…</p>}
            >
              <PlotContainer
                platformId={platformId}
                provider={platform.provider}
                timeWindowDays={timeWindowDays}
              />
            </Suspense>
            <div className="explorer-selection-info">
              <span className="explorer-eyebrow">Selected vessel</span>
              <strong>{platform.platform}</strong>
              <span>{platform.noaa_id}</span>
              <span>Trusted node: {platform.provider}</span>
            </div>
          </>
        ) : null
      }
    >
      {platform && (
        <Suspense fallback={null}>
          <ToggleStatsCard
            toolbarTrigger
            triggerTitle="Share stats"
            triggerDescription=""
            title="Platform Stats Summary"
            description="A summary of the data collected by this vessel over the selected time window."
          >
            <StatsCard
              platformId={platformId}
              timeWindowDays={timeWindowDays}
              captureElementId={captureElementId}
            >
              <SocialButtons
                platformId={platformId}
                timeWindowDays={timeWindowDays}
                captureElementId={captureElementId}
              />
            </StatsCard>
          </ToggleStatsCard>
        </Suspense>
      )}
    </MapWorkspace>
  );
}
