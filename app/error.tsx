"use client"; // Error components must be Client Components
import { Button } from "@/components/ui/button";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="h-full bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md text-center">
        <ExclamationTriangleIcon className="w-16 h-16 mx-auto text-red-500" />
        <h2 className="mt-4 text-2xl font-semibold text-gray-700">
          Something went wrong!
        </h2>
        <p className="mt-2 text-gray-500">
          We're sorry for the inconvenience. Please try again.
        </p>
        <Button
          className="mt-6 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-500"
          onClick={reset}
        >
          Try again
        </Button>
      </div>
    </div>
  );
}
