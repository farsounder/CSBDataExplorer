import MapViewer from "@/app/_components/map/mapviewer";
import { DEFAULT_PLOT_WINDOW_DAYS } from "@/lib/constants";
import { getProviderInfoFromNoaa } from "@/services/noaa";

export default async function ProviderPage({
  params,
  searchParams,
}: {
  params: { providerId: string };
  searchParams?: { timeWindowDays: string };
}) {
  const timeWindowDays = Number(searchParams?.timeWindowDays) || DEFAULT_PLOT_WINDOW_DAYS;
  if (isNaN(timeWindowDays)) {
    throw new Error("Invalid time window days");
  }

  const { providerId } = params;
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

  return (
    <div className="flex flex-col p-0 m-0 h-full relative">
      {/*platform?.provider && (
        <ToggleChartButton>
          <PlotContainer
            platformId={platformId}
            provider={platform.provider}
            timeWindowDays={timeWindowDays}
          />
        </ToggleChartButton>
      )*/}
      <MapViewer providerId={decodedProviderId} />
      <div className="absolute bottom-4 left-4 flex flex-col gap-2 w-full pr-8 max-w-lg">
        {/*platform && (
          <Suspense fallback={<div>Loading...</div>}>
            <ToggleStatsCard>
              <StatsCard platformId={platformId} timeWindowDays={timeWindowDays}>
                <SocialButtons platformId={platformId} timeWindowDays={timeWindowDays} />
              </StatsCard>
            </ToggleStatsCard>
          </Suspense>
        )*/}
        {/*platform && <VesselInfoDisplay platform={platform} />*/}
      </div>
    </div>
  );
}
