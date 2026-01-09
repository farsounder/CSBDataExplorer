"use client";

import { Button } from "@/components/ui/button";
import { ChartBarSquareIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { useEffect, useRef, useState } from "react";

export default function ToggleChartButton({ children }: { children: React.ReactNode }) {
  const [isVisible, setIsVisible] = useState(true);
  const [isSmallScreen, setIsSmallScreen] = useState(false);
  const didInit = useRef(false);

  useEffect(() => {
    const handleResize = () => {
      const small = window.innerWidth <= 640;
      setIsSmallScreen(small);

      // Mobile-first: hide by default on small screens, but don't fight the user after init.
      if (!didInit.current) {
        const initialVisible = !small && window.innerHeight >= 600;
        setIsVisible(initialVisible);
        didInit.current = true;
        return;
      }

      // If the viewport is very short (landscape phones), keep it hidden to preserve map space.
      if (window.innerHeight < 600) setIsVisible(false);
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
        className="absolute top-4 left-4 z-50 border-0 bg-white/60"
        onClick={() => setIsVisible(!isVisible)}
      >
        {isVisible ? (
          <XMarkIcon className="w-8 h-8 text-gray-500" />
        ) : (
          <ChartBarSquareIcon className="w-8 h-8 text-gray-500" />
        )}
      </Button>
      {isVisible ? (
        <div
          className={
            "absolute left-4 right-4 top-4 z-10 bg-white rounded-lg p-1 shadow-md " +
            "h-[45vh] max-h-[420px] min-h-[200px] " +
            "sm:left-4 sm:right-auto sm:w-96 sm:h-80 " +
            "lg:w-2/5 lg:h-1/3"
          }
        >
          {children}
        </div>
      ) : null}
    </>
  );
}
