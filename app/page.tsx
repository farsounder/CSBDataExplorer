import {
  BuildingLibraryIcon,
  GlobeAmericasIcon,
  QuestionMarkCircleIcon,
  ShareIcon,
} from "@heroicons/react/24/outline";
import Card from "@/app/_components/card";
import SplashPageFooter from "./_components/splash-page-footer";

const cards = [
  {
    title: "Map View",
    description:
      "See your data, and data from other mariners on an interactive map viewer with a variety of base maps (ENCs, satellite, etc) and extra data layers.",
    icon: <GlobeAmericasIcon className="h-6 w-6 text-gray-800" />,
    link: "/dashboard/map",
  },
  {
    title: "Participating Organizations",
    description:
      "A number of organizations including: Seakeepers Society, the IHO, NOAA, and many other industry partners collaborate to collect and share CSB data with Seabed 2030 and beyond.",
    icon: <BuildingLibraryIcon className="h-6 w-6 text-gray-800" />,
    link: "https://openbathymetry.cidco.ca/technology-partners",
  },
  {
    title: "Learn More...",
    description:
      "Find out more about the IHO Data Center for Digital Bathymetry (DCDB), and the data that is available publicly.",
    icon: <ShareIcon className="h-6 w-6 text-gray-800" />,
    link: "https://www.ncei.noaa.gov/iho-data-centre-digital-bathymetry",
  },
  {
    title: "Get Involved!",
    description:
      "If you are FarSounder customer, you can share your data by installing the latest SonaSoft version and clicking 'Enable Cloud Sync' in settings. If not, check out the linked page to see if you're already working with a partner company.",
    icon: <QuestionMarkCircleIcon className="h-6 w-6 text-gray-800" />,
    link: "https://openbathymetry.cidco.ca/get-involved",
  },
];

export default function Hero() {
  return (
    <section className="w-full h-full flex flex-col  bg-white">
      <div className="container px-4 md:px-6 h-full overflow-y-scroll pt-12 md:pt-24 lg:pt-32 pb-2">
        <div className="grid gap-6 items-center">
          <div className="flex flex-col justify-center space-y-8 text-center">
            <div className="space-y-2">
              <h1 className="text-3xl p-2 font-bold tracking-tighter sm:text-5xl xl:text-6xl/none bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-blue-800">
                Crowd-sourced Bathymetry (CSB) Data Explorer
              </h1>
              <h2 className=" max-w-[600px] text-2xl md:text-xl mx-auto">
                Supporting collaboration with International Seakeepers Society,
                Seabed 2030, the IHO CSB Database hosted by DCDB at NOAA, and many others.
              </h2>
              <p className="max-w-[600px] text-gray-600 md:text-xl mx-auto">
                Explore the data collected and shared by{" "}
                <span className="font-semibold text-blue-600">YOU</span> and
                other mariners users like you
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
      <SplashPageFooter />
    </section>
  );
}
