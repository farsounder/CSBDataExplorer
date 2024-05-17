import { currentUser } from "@clerk/nextjs/server";
import MapViewer from "@/app/dashboard/map/_components/mapviewer";
import { UserData } from "@/lib/types";
import { getProviderData } from "@/services/noaa";

const validPlatform = (userData: UserData): boolean => {
  return !!(
    userData?.csbPlatform &&
    userData.csbPlatform?.noaa_id &&
    userData.csbPlatform?.provider
  );
};

async function PlotContainer() {
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
    time_window_days: 7,
  });

  console.log(providerData);

  return (
    <section className="absolute top-4 left-4 z-50">
      <div className="flex flex-col justify-center items-center h-full">
        <div className="bg-white p-4 rounded-lg shadow-lg">
          <h1 className="text-2xl font-bold">Plot</h1>
          <p className="text-gray-600 text-sm">
            This is where the plot will be rendered
          </p>
        </div>
      </div>
    </section>
  );
}
export default async function Page() {
  return (
    <div className="flex flex-col p-0 m-0 h-full relative">
      <PlotContainer />
      <MapViewer />
    </div>
  );
}
