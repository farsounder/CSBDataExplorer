import "./globals.css";
import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({ subsets: ["latin"] });

const baseUrl = "https://mycsb.farsounder.com";
const title = "Crowdsourced Data Explorer";
const description =
  "Crowdsourced Data Explorer for FarSounder, Seakeepers Society, Seabed 2030, and other contributors to the IHO CSB Database hosted by DCDB at NOAA. This is a simple viewer meant to show off some of the data collected by mariners and other users like you in one place.";
const ogImageUrl = `${baseUrl}/social.png`;

export const metadata: Metadata = {
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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={inter.className}>
          {children}
          <Toaster />
        </body>
      </html>
    </ClerkProvider>
  );
}
