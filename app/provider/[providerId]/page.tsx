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

  const { providerId } = params;
  const validProvider = await getProviderInfoFromNoaa();

  if (!validProvider || validProvider.length === 0) {
    throw new Error("No valid providers returned from NOAA endpoint.");
  }

  const validProviderIds = validProvider.map((provider) => provider.provider.toUpperCase());

  if (!validProviderIds.includes(providerId.toUpperCase())) {
    throw new Error("Invalid provider ID");
  }

  const provider = validProvider.find((provider) => provider.provider === providerId);

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
      <MapViewer providerId={providerId} />
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
