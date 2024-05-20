import { currentUser } from "@clerk/nextjs/server";
import { UserData } from "@/lib/types";
import { getPlatformData, getProviderData } from "@/services/noaa";
import dynamic from "next/dynamic";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";

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

const ErrorMessage = () => {
  return (
    <div className="flex flex-col justify-center items-center h-full px-8 text-center">
      <ExclamationTriangleIcon className="w-16 h-16 text-gray-500" />
      <h3 className="text-lg text-gray-600">No data available</h3>
      <p className="text-sm text-gray-500">
        Reload to try again, or contact us to report the issue
      </p>
    </div>
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

  const showPlot = providerData && providerData.length > 0;

  return (
    <div className="w-full sm:w-96 h-1/2 sm:h-80 sm:absolute sm:top-4 sm:left-4 z-10 bg-white rounded-lg p-1 shadow-md lg:w-2/5 lg:h-1/3">
      {showPlot ? (
        <ContributionsPlot
          providerContributions={providerData}
          userContributions={platformData}
        />
      ) : (
        <ErrorMessage />
      )}
    </div>
  );
}
