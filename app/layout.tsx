import "./globals.css";
import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import { Toaster } from "@/components/ui/toaster";
import Header from "./_components/header";
import Footer from "./_components/footer";

const inter = Inter({ subsets: ["latin"] });

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
const title = "Crowdsourced Data Explorer";
const description =
  "Crowdsourced Data Explorer for FarSounder, Seakeepers Society, Seabed 2030, and other contributors to the IHO CSB Database hosted by DCDB at NOAA. This is a simple viewer meant to show off some of the data collected by mariners and other users like you in one place.";
const ogImageUrl = `${baseUrl}/social.png`;

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: title,
  description: description,
  authors: [
    {
      name: "FarSounder Team",
      url: "https://farsounder.com",
    },
  ],
  openGraph: {
    title: title,
    type: "website",
    description: description,
    url: baseUrl,
    images: [
      {
        url: ogImageUrl,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    description: description,
    creator: "@FarSounder",
    site: baseUrl,
    images: ogImageUrl,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1.0,
  minimumScale: 1.0,
  maximumScale: 1.0,
  userScalable: false,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <section className="flex flex-col w-full h-full overflow-hidden">
          <Header />
          <div className="flex h-full">
            <div className="m-0 p-0 w-full h-full">{children}</div>
          </div>
          <Footer />
        </section>
        <Toaster />
        <Analytics />
      </body>
    </html>
  );
}
