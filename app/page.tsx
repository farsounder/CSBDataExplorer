import {
  BuildingLibraryIcon,
  GlobeAmericasIcon,
  QuestionMarkCircleIcon,
  ShareIcon,
} from "@heroicons/react/24/outline";
import Card from "@/app/_components/card";

const cards = [
  {
    title: "Map View",
    description: "See your data, and data from other mariners on an interactive map viewer with a variety of base maps (ENCs, satellite, etc) and extra data layers.",
    icon: <GlobeAmericasIcon className="h-6 w-6 text-gray-800" />,
    link: "/dashboard/map",
  },
  {
    title: "Participating Organizations",
    description: "A blurby blurb about the Seakeepers Society and how they are involved in the project, with IHO, NOAA, and Seabed 2030.",
    icon: <BuildingLibraryIcon className="h-6 w-6 text-gray-800" />,
    link: "/",
  },
  {
    title: "Importance of CSB Data",
    description: "Information about CSB and other crowdsourced data, why is it important, etc.",
    icon: <ShareIcon className="h-6 w-6 text-gray-800" />,
    link: "/",
  },
  {
    title: "Get Involved!",
    description: "This page will have some information about the different ways to get involved in CSB",
    icon: <QuestionMarkCircleIcon className="h-6 w-6 text-gray-800" />,
    link: "/",
  }
]

export default function Hero() {
  return (
    <section className="w-full h-full  overflow-auto py-12 md:py-24 lg:py-32 bg-white">
      <div className="container px-4 md:px-6">
        <div className="grid gap-6 items-center">
          <div className="flex flex-col justify-center space-y-8 text-center">
            <div className="space-y-2">
              <h1 className="text-3xl p-2 font-bold tracking-tighter sm:text-5xl xl:text-6xl/none bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-blue-800">
                Crowd-sourced Bathymetry (CSB) Data Explorer
              </h1>
              <h2 className=" max-w-[600px] text-2xl md:text-xl mx-auto">
                Supporting collaboration with International Seakeepers Society,
                Seabed 2030, and the IHO CSB Database hosted by DCDB at NOAA.
              </h2>
              <p className="max-w-[600px] text-gray-600 md:text-xl mx-auto">
                Explore the data collected and shared by{" "}
                <span className="font-semibold">YOU</span> and other mariners 
                users like you
              </p>
            </div>
            <div className="w-full max-w-full space-y-4 mx-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                {cards.map((card) => (
                  <Card {...card} key={card.title} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
