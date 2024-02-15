"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import GeoIcon from "@/components/icons/geoicon";
import { usePathname } from "next/navigation";
import { useRef, useState } from "react";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";

export function Sidebar() {
  const [navHidden, setNavHidden] = useState(true);
  const sideBarRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const currentPath = pathname.split("/")[2];
  const selectedStyle = {
    backgroundColor: "rgba(0, 0, 255, 0.02)",
    borderLeft: "2px solid #2563EB",
    borderRight: "2px solid #2563EB",
  };

  const handleToggleNav = () => {
    // toggle the hidden state of the side bar
    if (sideBarRef.current) {
      sideBarRef.current.classList.toggle("hidden");
      setNavHidden(!navHidden);
    }
  };

  const navSheetHiddenStyle = {
    left: 10,
  };

  return (
    <aside className="h-full">
      <Button
        onClick={() => handleToggleNav()}
        className="md:hidden bg-white/60 absolute top-20 left-48 z-50"
        style={navHidden ? navSheetHiddenStyle : {}}
        variant="outline"
      >
        {navHidden ? (
          <Bars3Icon className="h-6 w-6" />
        ) : (
          <XMarkIcon className="h-6 w-6" />
        )}
      </Button>
      <div
        className="pb-12 border-r h-full w-64 md:block hidden"
        ref={sideBarRef}
      >
        <div className="space-y-4 py-4">
          <div className="py-2">
            <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
              Data
            </h2>
            <div
              className="space-y-1"
              style={currentPath === "map" ? selectedStyle : {}}
            >
              <Link href="/dashboard/map">
                <Button variant="ghost" className="w-full justify-start">
                  <GeoIcon />
                  <div className="px-2">Map</div>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
