import PlatformDisplayPanel from "./platform-planel";

export default function Header() {
  return (
    <header className="flex flex-col w-full">
      <div className="border-b flex items-center justify-between">
        <div className="flex py-4 flex-col  px-4 ">
          <h1 className="text-xl md:text-4xl font-bold text-blue-800">
            CSB Data Explorer
          </h1>
          <div className="sm:text-sm text-gray-600 italic text-xs">
            A view of the data <span className="text-blue-600 font-extrabold">YOU</span>&apos;ve collected and sent to the IHO DCDB
          </div>
        </div>
        <PlatformDisplayPanel />
      </div>
    </header>
  );
}
