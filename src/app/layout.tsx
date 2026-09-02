import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ 
  subsets: ["latin"],
  display: 'swap',
  variable: '--font-inter',
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
  themeColor: "#0284c7",
};

export const metadata: Metadata = {
  metadataBase: new URL('https://thelittlehouseschool.in'),
  title: {
    default: "LITTLE HOUSE SCHOOL | Waiton Lamkhai, Imphal East, Manipur",
    template: "%s | LITTLE HOUSE SCHOOL"
  },
  description: "Official portal for Little House School, Waiton Lamkhai, Imphal East, Manipur (795114). Admissions open from Play-Group to Class VI. View exam schedules, van fares, monthly report cards, and campus notices.",
  keywords: [
    "Little House School",
    "Little House",
    "Little House Waiton",
    "School in Imphal East",
    "Pre-school Manipur",
    "Student Report Card",
    "Admission 2026",
    "Manipur School Portal"
  ],
  authors: [{ name: "LITTLE HOUSE Administration" }],
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '48x48', type: 'image/x-icon' },
      { url: '/icon-48.png', sizes: '48x48', type: 'image/png' },
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon.png', sizes: '512x512', type: 'image/png' },
      { url: '/school-logo.png', sizes: '512x512', type: 'image/png' },
    ],
    shortcut: '/favicon.ico',
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
      { url: '/school-logo.png', sizes: '512x512', type: 'image/png' },
    ],
  },
  manifest: '/site.webmanifest',
  openGraph: {
    title: "LITTLE HOUSE SCHOOL | Waiton Lamkhai, Imphal East, Manipur",
    description: "Official portal for Little House School, Waiton Lamkhai, Imphal East, Manipur. Admissions open for Play-Group to Class VI.",
    url: "https://thelittlehouseschool.in",
    siteName: "LITTLE HOUSE SCHOOL",
    images: [
      {
        url: "https://thelittlehouseschool.in/school-logo.png",
        width: 512,
        height: 512,
        alt: "LITTLE HOUSE SCHOOL Official Crest Logo",
      },
      {
        url: "https://thelittlehouseschool.in/school-banner.png",
        width: 1200,
        height: 630,
        alt: "Little House School Campus Banner",
      }
    ],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "LITTLE HOUSE SCHOOL | Waiton Lamkhai, Imphal East, Manipur",
    description: "Official portal for Little House School, Waiton Lamkhai, Imphal East, Manipur. Admissions, report cards, and notices.",
    images: ["https://thelittlehouseschool.in/school-logo.png"],
  },
  robots: {
    index: true,
    follow: true,
  }
};

import StructuredData from "@/components/StructuredData";
import AnalyticsTracker from "@/components/AnalyticsTracker";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="48x48" />
        <link rel="icon" href="/icon-48.png" sizes="48x48" type="image/png" />
        <link rel="icon" href="/icon-192.png" sizes="192x192" type="image/png" />
        <link rel="icon" href="/icon.png" sizes="512x512" type="image/png" />
        <link rel="shortcut icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" sizes="180x180" />
        <link rel="manifest" href="/site.webmanifest" />
        <link rel="preload" as="image" href="/hero-bg.webp" type="image/webp" fetchPriority="high" />
        <StructuredData />
      </head>
      <body className={`${inter.className} antialiased bg-slate-50 text-slate-900 selection:bg-sky-500 selection:text-white min-h-screen`}>
        <AnalyticsTracker />
        {children}
      </body>
    </html>
  );
}
