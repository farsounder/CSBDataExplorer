"use client";

import { ChartBarSquareIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { useState } from "react";

export default function ToggleChartButton({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isVisible, setIsVisible] = useState(true);

  return (
    <>
      <button
        className="absolute sm:top-5 sm:left-5 z-50"
        onClick={() => setIsVisible(!isVisible)}
      >
        {isVisible ? (
          <XMarkIcon className="w-8 h-8 text-gray-500" />
        ) : (
          <ChartBarSquareIcon className="w-8 h-8 text-gray-500 bg-white rounded-md shadow-md" />
        )}
      </button>
      {isVisible ? (
        <div className="w-full sm:w-96 h-1/2 sm:h-80 sm:absolute sm:top-4 sm:left-4 z-10 bg-white rounded-lg p-1 shadow-md lg:w-2/5 lg:h-1/3">
          {children}{" "}
        </div>
      ) : null}
    </>
  );
}
