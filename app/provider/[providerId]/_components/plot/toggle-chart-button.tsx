"use client";

import { Button } from "@/components/ui/button";
import { ChartBarSquareIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { useEffect, useState } from "react";

export default function ToggleChartButton({ children }: { children: React.ReactNode }) {
  const [isVisible, setIsVisible] = useState(true);
  const [isSmallScreen, setIsSmallScreen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsSmallScreen(window.innerWidth <= 640);
      if (window.innerHeight < 600) {
        setIsVisible(false);
      }
    };
    // Initialize on mount so SSR/first client render don't depend on `window`.
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <>
      <Button
        variant="outline"
        className="absolute sm:top-4 sm:left-4 z-50 border-0 bg-white/60"
        onClick={() => setIsVisible(!isVisible)}
        style={!isVisible && isSmallScreen ? { top: "1rem", left: "1rem" } : undefined}
      >
        {isVisible ? (
          <XMarkIcon className="w-8 h-8 text-gray-500" />
        ) : (
          <ChartBarSquareIcon className="w-8 h-8 text-gray-500" />
        )}
      </Button>
      {isVisible ? (
        <div className="w-full sm:w-96 h-1/2 sm:h-80 sm:absolute sm:top-4 sm:left-4 z-10 bg-white rounded-lg p-1 shadow-md lg:w-2/5 lg:h-1/3 min-h-[200px]">
          {children}{" "}
        </div>
      ) : null}
    </>
  );
}
