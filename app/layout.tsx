import type { Metadata } from "next";
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
  title: "REVA",
  description: "REVA (Real-time Echo & Visual Archive) is a digital cartography of human memory anomalies. It treats Déjà Vu not as a random occurrence, but as a \"signal\"—a collective pulse that can be mapped, analyzed, and visualized. By combining a high-performance sensory map with a minimalist, friction-free reporting interface, REVA allows users to archive their \"Echoes\" and witness the world's neural misfires as they happen.",
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