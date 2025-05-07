import MapViewer from "@/app/_components/map/mapviewer";
import RedirectIfPlatform from "@/app/_components/redirect-if-platform";

export default async function PlatformPage() {
  // TODO: Switch the localstorage redirect to use cookies and a server side
  // redirect
  return (
    <div className="flex flex-col p-0 m-0 h-full relative">
      <RedirectIfPlatform />
      <MapViewer />
    </div>
  );
}
