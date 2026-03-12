import EchoWizard from "@/components/echoes/echo-wizard";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Log an Echo",
  description:
    "Capture your déjà vu before it fades. Pin it to a location, rate the intensity, and add it to the global map — no account required.",
  alternates: { canonical: "/echoes/new" },
  openGraph: {
    title: "Log an Echo — REVA",
    description: "Capture your déjà vu before it fades. No account required.",
    url: "/echoes/new",
    images: [{ url: "https://reva-khaki.vercel.app/og-image.png", width: 1200, height: 630 }],
  },
  twitter: {
    title: "Log an Echo — REVA",
    description: "Capture your déjà vu before it fades. No account required.",
    images: ["https://reva-khaki.vercel.app/og-image.png"],
  },
};

export default function NewEchoPage() {
  return (
    <main className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-6 relative overflow-hidden">
      <EchoWizard />
    </main>
  );
}