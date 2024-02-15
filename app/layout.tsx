import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Crowdsourced Data Explorer',
  description: 'Crowdsourced Data Explorer for FarSounder, Seakeeper\'s Society, Seabed 2030, and the IHO CSB Database hosted by DCDB at NOAA. This is a simple viewer meant to show off some of the data collected by mariners and other users like you in one place.',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
         {children}
      </body>
    </html>
  )
}
