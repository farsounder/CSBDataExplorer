import MapViewer from "@/app/_components/map/mapviewer";
//import RedirectIfId from "@/app/_components/redirect-if-id";

export default async function Page() {
  return (
    <div className="flex flex-col p-0 m-0 flex-1 min-h-0 relative">
      <div className="flex-1 min-h-0">
        <MapViewer />
      </div>
    </div>
  );
}
