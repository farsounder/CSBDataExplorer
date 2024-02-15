"use client";
export default function Header() {
  return (
    <header className="flex flex-col w-full">
      <div className="border-b flex items-center justify-between">
        <div className="flex py-4 items-center px-4 gap-8">
          <h1 className="text-2xl md:text-4xl font-bold text-blue-800">CSB Data Explorer</h1>
        </div>
      </div>
    </header>
  );
}
