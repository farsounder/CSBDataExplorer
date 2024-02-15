"use client"
export default function Loading() {
  return (
    <div className="w-full h-full flex flex-col justify-center items-center">
      <div className="w-24 h-24 border-4 border-blue-800 rounded-full animate-spin"></div>
      <h1 className="text-2xl font-semibold text-gray-800 mt-4">Loading...</h1>
    </div>
  )
}