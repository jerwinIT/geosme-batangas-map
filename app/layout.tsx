import type { Metadata, Viewport } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";

const geistSans = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-geist-sans",
});

const SITE_URL = "https://geosme-batangas.com";
const SITE_DESCRIPTION =
  "GeoSME Batangas is a research data platform built for the CABE Research Department. Researchers record SME profiles — business details, asset size, and financial technology usage — and the interactive GIS map and analytics dashboards reflect that data live across Batangas municipalities.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "GeoSME Batangas",
    template: "%s | GeoSME Batangas",
  },
  description: SITE_DESCRIPTION,
  applicationName: "GeoSME Batangas",
  keywords: [
    "GeoSME Batangas",
    "SME mapping",
    "Batangas SMEs",
    "financial technology adoption",
    "fintech density",
    "CABE Research Department",
    "GIS dashboard",
    "SME analytics",
    "DTI research",
  ],
  authors: [{ name: "CABE Research Department" }],
  icons: {
    icon: [{ url: "/geosme-global.webp", type: "image/webp" }],
    shortcut: { url: "/geosme-global.webp" },
    apple: { url: "/geosme-global.webp" },
  },
  openGraph: {
    type: "website",
    locale: "en_PH",
    title: "GeoSME Batangas",
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    siteName: "GeoSME Batangas",
    images: [
      {
        url: `${SITE_URL}/geosme-metadata.png`,
        width: 1200,
        height: 630,
        alt: "GeoSME Batangas Preview Image",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "GeoSME Batangas",
    description: SITE_DESCRIPTION,
    images: [`${SITE_URL}/geosme-metadata.png`],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: SITE_URL,
  },
  verification: {
    google: "SrshXrJNWGJIFIYvfGqW13E2dzDvm-KYCucmR40_P14",
  },
};

// themeColor/viewport moved out of `metadata` per Next.js 15+ — it now
// warns/errors if these stay in the metadata export.
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
