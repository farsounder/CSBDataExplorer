import { currentUser } from "@clerk/nextjs/server";
import { UserData } from "@/lib/types";
import { getPlatformData, getProviderData } from "@/services/noaa";
import dynamic from "next/dynamic";

// was getting an ssr error with the plotly plot, this should force it to be
// completely client side, we need this file to be server side rendered so it
// can fetch the data
const ContributionsPlot = dynamic(() => import("./contributions-plot"), {
  ssr: false,
});

const validPlatform = (userData: UserData): boolean => {
  return !!(
    userData?.csbPlatform &&
    userData.csbPlatform?.noaa_id &&
    userData.csbPlatform?.provider
  );
};

export default async function PlotContainer({
  time_window_days,
}: {
  time_window_days: number;
}) {
  const user = await currentUser();
  // nothing to render until we have a user signed in to look up stats for
  if (!user) {
    return null;
  }

  const userData = user.unsafeMetadata as UserData;

  if (!validPlatform(userData)) {
    return null;
  }

  // if we have a valid platform, we can get the data and render the plot
  const providerData = await getProviderData({
    provider: userData.csbPlatform.provider,
    time_window_days: time_window_days,
  });

  const platformData = await getPlatformData({
    noaa_id: userData.csbPlatform.noaa_id,
    time_window_days: time_window_days,
  });

  if (!providerData || providerData.length === 0) {
    return "Failed to fetch stats data for plot";
  }

  return (
    <div className="w-full sm:w-96 h-2/5 sm:h-80 sm:absolute sm:top-4 sm:left-4 z-50 bg-white rounded-lg p-1 shadow-md">
      <ContributionsPlot
        providerContributions={providerData}
        userContributions={platformData}
      />
    </div>
  );
}
