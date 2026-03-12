import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import GlobeView from "@/components/globe/globe-view";
import GlobeErrorBoundary from "@/components/globe/globe-error-boundary";

export const revalidate = 60;

export type GlobeEcho = {
    id: string;
    title: string;
    description: string;
    intensity: number;
    latitude: number;
    longitude: number;
    location: string;
    display_name: string;
    is_public: boolean;
    created_at: string;
    image_url: string | null;
};

export const metadata: Metadata = {
    title: "Global Pulse",
    description:
        "Watch déjà vu experiences light up in real time on a 3D interactive globe. Every pulse is a real moment logged by someone, somewhere.",
    alternates: { canonical: "/globe" },
    openGraph: {
        title: "Global Pulse — REVA",
        description:
            "Watch déjà vu experiences light up in real time on a 3D interactive globe.",
        url: "/globe",
    },
    twitter: {
        title: "Global Pulse — REVA",
        description: "Watch déjà vu experiences light up on a 3D globe in real time.",
    },
};


export default async function GlobePage() {
    const supabase = await createClient();

    const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    const { data: echoes } = await supabase
        .from("echoes")
        .select("id, title, description, intensity, latitude, longitude, location, display_name, created_at, image_url")
        .eq("is_public", true)
        .gte("created_at", since)
        .order("created_at", { ascending: false });

    return (
        <GlobeErrorBoundary>
            <GlobeView initialEchoes={(echoes as GlobeEcho[]) ?? []} />
        </GlobeErrorBoundary>
    );
}