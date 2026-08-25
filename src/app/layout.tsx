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
    default: "LITTLE HOUSE • A Family of Learning | Waiton Lamkhai, Manipur",
    template: "%s | LITTLE HOUSE SCHOOL"
  },
  description: "Official portal for Little House School, Waiton Lamkhai, Imphal East, Manipur (795114). Admissions open from Play-Group to Class VI. View exam schedules, van fares, monthly report cards, and campus notices.",
  keywords: [
    "Little House",
    "Little House School",
    "Waiton Lamkhai",
    "School in Imphal East",
    "Pre-school Manipur",
    "Student Report Card",
    "Admission 2026",
    "Manipur School Portal"
  ],
  authors: [{ name: "LITTLE HOUSE Administration" }],
  icons: {
    icon: "/school-logo.png",
    shortcut: "/school-logo.png",
    apple: "/school-logo.png",
  },
  openGraph: {
    title: "LITTLE HOUSE • A Family of Learning (Waiton Lamkhai)",
    description: "Nurturing creative minds, shaping ethical character, and inspiring academic excellence in Manipur. Admissions open for Play-Group to Class VI.",
    url: "https://thelittlehouseschool.in",
    siteName: "LITTLE HOUSE SCHOOL",
    images: [
      {
        url: "/school-banner.png",
        width: 1200,
        height: 630,
        alt: "Little House School Campus Banner",
      },
      {
        url: "/school-logo.png",
        width: 512,
        height: 512,
        alt: "Little House School Crest Logo",
      }
    ],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "LITTLE HOUSE • A Family of Learning (Waiton Lamkhai)",
    description: "Official portal for Little House School, Waiton Lamkhai, Imphal East, Manipur. Admissions, report cards, and notices.",
    images: ["/school-banner.png"],
  },
  robots: {
    index: true,
    follow: true,
  }
};

import StructuredData from "@/components/StructuredData";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="preload" as="image" href="/hero-bg.webp" type="image/webp" fetchPriority="high" />
        <StructuredData />
      </head>
      <body className={`${inter.className} antialiased bg-slate-50 text-slate-900 selection:bg-sky-500 selection:text-white min-h-screen`}>
        {children}
      </body>
    </html>
  );
}
