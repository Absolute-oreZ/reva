import type { Metadata, Viewport } from "next";
import { DM_Sans, Space_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

const fontSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-sans",
});

const fontSerif = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-serif",
});

const fontMono = Space_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: {
    default: "REVA — Global Déjà Vu Mapping",
    template: "%s | REVA",
  },
  description:
    "Log your déjà vu in real time and watch it pulse on a 3D globe alongside signals from people around the world.",
  applicationName: "REVA",
  keywords: ["déjà vu", "global map", "echo", "memory anomaly", "real-time", "reva"],
  authors: [{ name: "REVA" }],
  creator: "REVA",

  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://reva.app"
  ),

  openGraph: {
    type: "website",
    siteName: "REVA",
    title: "REVA — Global Déjà Vu Mapping",
    description:
      "Log your déjà vu in real time and watch it pulse on a 3D globe alongside signals from people around the world.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "REVA — Global Déjà Vu Mapping",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "REVA — Global Déjà Vu Mapping",
    description:
      "Log your déjà vu in real time and watch it pulse on a 3D globe alongside signals from people around the world.",
    images: ["/og-image.png"],
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

  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/icons/icon-16.png", sizes: "16x16", type: "image/png" },
      { url: "/icons/icon-32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180" }],
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
  ],
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${fontSans.variable} ${fontSerif.variable} ${fontMono.variable} antialiased`}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}