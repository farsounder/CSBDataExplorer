import SocialButtons from "@/components/stats/social-buttons";
import StatsCard from "@/components/stats/stats-card";
import db from "@/lib/db";
import { getPlatformInfoFromNoaa } from "@/services/noaa";

const DEFAULT_PLOT_WINDOW_DAYS = 30;

export default async function Page({
  params,
  searchParams,
}: {
  params: { unique_id: string };
  searchParams?: { time_window_days: string };
}) {
  const time_window_days =
    Number(searchParams?.time_window_days) || DEFAULT_PLOT_WINDOW_DAYS;

  const { unique_id } = params;

  // hit db to get platformId, check if it's valid
  const res = await db.platformIdentifier.findUnique({
    where: {
      id: unique_id,
    },
  });
  if (!res) {
    throw new Error("Invalid unique ID");
  }
  const platform_id = res.platformId;
  const validPlatforms = await getPlatformInfoFromNoaa();
  if (!validPlatforms || validPlatforms.length === 0) {
    throw new Error("No valid platforms returned from NOAA endpoint.");
  }
  const validPlatformIds = validPlatforms.map((platform) =>
    platform.noaa_id.toUpperCase()
  );
  if (!validPlatformIds.includes(platform_id.toUpperCase())) {
    throw new Error("Invalid platform ID");
  }

  return (
    <div className="w-full px-8 md:px-16 flex justify-center items-center pt-4 md:pt-12">
      <StatsCard platformId={platform_id} timeWindowDays={time_window_days}>
        <SocialButtons uniqueId={unique_id} timeWindowDays={time_window_days} />
      </StatsCard>
    </div>
  );
}
