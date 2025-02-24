import Image from "next/image";
import FSLogo from "@/components/icons/fslogo";
import Seabed2030Logo from "@/components/icons/seabed";
import SeakeepersLogo from "@/components/icons/seakeepers";
import IconTriggeredModal from "./footer-blurbs/icon-triggered-modal";
import { FacebookIcon, InstagramIcon, LinkedinIcon, YoutubeIcon } from "lucide-react";
import XSocialIcon from "@/components/icons/xicon";

const SponsorDetails = [
  {
    name: "FarSounder",
    icon: <FSLogo />,
    title: "FarSounder, Inc.",
    description:
      "FarSounder designs and manufactures 3D Forward Looking Sonar systems for commercial, recreational, and government vessels to improve navigational safety and situational awareness in real-time. FarSounder is proud to be a Trusted Node for the DCDB, allowing customers to contribute and share their bathymetric data. If you're a current customer, you can start to contribute your data by simply installing the latest software update and 'opting in' to share your data!",
    link: "https://www.farsounder.com/",
    socialLinks: [
      {
        name: "LinkedIn",
        link: "https://www.linkedin.com/company/farsounder/",
        icon: <LinkedinIcon className="w-6 h-6 " />,
      },
      {
        name: "Facebook",
        link: "https://www.facebook.com/FarSounder",
        icon: <FacebookIcon className="w-6 h-6" />,
      },
      {
        name: "Instagram",
        link: "https://www.instagram.com/farsounder/",
        icon: <InstagramIcon className="w-6 h-6" />,
      },
      {
        name: "YouTube",
        link: "https://www.youtube.com/channel/UCrTmZvKjLmNGPuGXJSyVtXQ",
        icon: <YoutubeIcon className="w-6 h-6" />,
      },
    ],
  },
  {
    name: "Seakeepers",
    icon: <SeakeepersLogo />,
    title: "International SeaKeepers Society",
    description:
      "The International SeaKeepers Society promotes oceanographic research, conservation, and education. SeaKeepers enables the yachting community to take full advantage of their unique potential to advance marine sciences and to raise awareness about global ocean issues. The SeaKeepers organization is a Trusted Node for the DCDB.",
    link: "https://www.seakeepers.org/",
    socialLinks: [
      {
        name: "LinkedIn",
        link: "https://www.linkedin.com/company/the-international-seakeepers-society/",
        icon: <LinkedinIcon className="w-6 h-6" />,
      },
      {
        name: "Facebook",
        link: "https://www.facebook.com/SeaKeepers",
        icon: <FacebookIcon className="w-6 h-6 " />,
      },
      {
        name: "Instagram",
        link: "https://www.instagram.com/seakeepers/",
        icon: <InstagramIcon className="w-6 h-6 " />,
      },
      {
        name: "YouTube",
        link: "https://www.youtube.com/user/SeaKeepers",
        icon: <YoutubeIcon className="w-6 h-6 " />,
      },
      {
        name: "X",
        link: "https://www.x.com/seakeepers",
        icon: <XSocialIcon className="w-4 h-4" />,
      },
    ],
  },
  {
    name: "Seabed2030",
    icon: <Seabed2030Logo width="80px" />,
    title: "The Nippon Foundation-GEBCO Seabed 2030 Project",
    description:
      "Seabed 2030 is a collaborative project between The Nippon Foundation and GEBCO to inspire the complete mapping of the world’s ocean by 2030, and to compile all bathymetric data into the freely available GEBCO Ocean Map.",
    link: "https://seabed2030.org/",
    socialLinks: [
      {
        name: "LinkedIn",
        link: "https://www.linkedin.com/company/seabed2030/",
        icon: <LinkedinIcon className="w-6 h-6" />,
      },
      {
        name: "Facebook",
        link: "https://www.facebook.com/seabed2030",
        icon: <FacebookIcon className="w-6 h-6" />,
      },
      {
        name: "X",
        link: "https://www.x.com/seabed2030",
        icon: <XSocialIcon className="w-4 h-4" />,
      },
    ],
  },
  {
    name: "DCDB/IHO",
    icon: <Image src="/iho-csb-logo.png" width={128} height={64} alt="IHO logo" />,
    title: "The DCDB and IHO CSB Database",
    description:
      "The Data Center for Digital Bathymetry (DCDB) is co-located at NOAA's National Centers for Environmental Information (NCEI) and was established to steward the global collection of bathymetric data. The DCDB hosted International Hydrographic Organization's (IHO) Crowdsourced Bathymetry (CSB) Database makes available depth measurements collected and contributed by vessels, using standard navigation equipment, while engaging in routine maritime operations.",
    link: "https://www.ngdc.noaa.gov/iho/",
    socialLinks: [
      {
        name: "Facebook",
        link: "https://www.facebook.com/NOAANCEI/",
        icon: <FacebookIcon className="w-6 h-6" />,
      },
      {
        name: "X",
        link: "https://twitter.com/NOAANCEI",
        icon: <XSocialIcon className="w-4 h-4" />,
      },
      {
        name: "Instagram",
        link: "https://www.instagram.com/noaadata/",
        icon: <InstagramIcon className="w-6 h-6" />,
      },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="flex flex-col w-full border-t-1 border-t-gray-200 pb-1">
      <div className="w-full text-center p-2 md:hidden text-xs text-gray-800">
        Made possible by the following organizations:
      </div>
      <div className="md:hidden text-xs flex justify-center">
        {SponsorDetails.map((sponsor) => (
          <div key={sponsor.name} className="hover:cursor-pointer text-xs text-gray-800">
            <IconTriggeredModal
              title={sponsor.title}
              icon={sponsor.icon}
              trigger={<div className="text-xs">{sponsor.name}</div>}
              description={sponsor.description}
              link={sponsor.link}
              socialLinks={sponsor.socialLinks}
            />
          </div>
        ))}
      </div>
      <div className="border-b hidden md:flex justify-between w-full">
        {SponsorDetails.map((sponsor) => (
          <div key={sponsor.name} className="flex py-4 items-center px-4 gap-8">
            <IconTriggeredModal
              title={sponsor.title}
              icon={sponsor.icon}
              description={sponsor.description}
              link={sponsor.link}
              socialLinks={sponsor.socialLinks}
            />
          </div>
        ))}
      </div>
    </footer>
  );
}
