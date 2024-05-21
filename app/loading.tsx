"use client";

import ThreeDotsIcon from "@/components/icons/three-dots";

export default function Loading() {
  return (
    <div className="w-full h-full flex flex-col justify-center items-center">
      <ThreeDotsIcon className="w-24 h-24" fill="#1E40AF" />
      <h1 className="text-2xl font-semibold text-blue-800 mt-4">Loading...</h1>
    </div>
  );
}
