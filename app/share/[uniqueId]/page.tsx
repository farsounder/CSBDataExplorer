import SocialButtons from "@/app/_components/stats/social-buttons";
import StatsCard from "@/app/_components/stats/stats-card";
import db from "@/lib/db";
import { getPlatformInfoFromNoaa } from "@/services/noaa";
import { DEFAULT_PLOT_WINDOW_DAYS } from "@/lib/constants";

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: { uniqueId: string };
  searchParams?: { timeWindowDays: string };
}) {
  const timeWindowDays = Number(searchParams?.timeWindowDays) || DEFAULT_PLOT_WINDOW_DAYS;
  return {
    title: `My CSB Data Summary | ${timeWindowDays} days`,
    description: `CSB data collected in the DCDB Crowd-sourced Bathymetry  Database.`,
    openGraph: {
      title: `My CSB Data summary for ${timeWindowDays} days`,
      images: [
        {
          url: `/api/og/share/${params.uniqueId}.png?timeWindowDays=${timeWindowDays}`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      images: `/api/og/share/${params.uniqueId}.png?timeWindowDays=${timeWindowDays}`,
    },
  };
}

export default async function Page({
  params,
  searchParams,
}: {
  params: { uniqueId: string };
  searchParams?: { timeWindowDays: string };
}) {
  const timeWindowDays = Number(searchParams?.timeWindowDays) || DEFAULT_PLOT_WINDOW_DAYS;

  const { uniqueId } = params;

  // hit db to get platformId, check if it's valid
  const res = await db.platformIdentifier.findUnique({
    where: {
      id: uniqueId,
    },
  });
  if (!res) {
    throw new Error("Invalid unique ID");
  }
  const platformId = res.platformId;
  const validPlatforms = await getPlatformInfoFromNoaa();
  if (!validPlatforms || validPlatforms.length === 0) {
    throw new Error("No valid platforms returned from NOAA endpoint.");
  }
  const validPlatformIds = validPlatforms.map((platform) => platform.noaa_id.toUpperCase());
  if (!validPlatformIds.includes(platformId.toUpperCase())) {
    throw new Error("Invalid platform ID");
  }

  return (
    <div className="w-full px-8 md:px-16 flex justify-center items-center pt-4 md:pt-12">
      <StatsCard platformId={platformId} timeWindowDays={timeWindowDays}>
        <SocialButtons uniqueId={uniqueId} timeWindowDays={timeWindowDays} />
      </StatsCard>
    </div>
  );
}
