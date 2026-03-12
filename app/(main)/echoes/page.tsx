import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import EchoesFeed from "@/components/echoes/echoes-feed";

export const revalidate = 60;

export type EchoFeedItem = {
    id: string;
    title: string;
    description: string;
    intensity: number;
    location: string;
    latitude: number;
    longitude: number;
    display_name: string;
    image_url: string | null;
    is_public: boolean;
    created_at: string;
    user_id: string | null;
};

const PAGE_SIZE = 12;

export const metadata: Metadata = {
    title: "Echoes",
    description:
        "Browse déjà vu experiences shared from around the world. Filter by intensity, location, or time — and add your own.",
    alternates: { canonical: "/echoes" },
    openGraph: {
        title: "Echoes Feed — REVA",
        description: "Browse déjà vu experiences shared from around the world.",
        url: "/echoes",
    },
    twitter: {
        title: "Echoes Feed — REVA",
        description: "Browse déjà vu experiences shared from around the world.",
    },
};

export default async function EchoesPage() {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();

    const { data: publicEchoes } = await supabase
        .from("echoes")
        .select("id, title, description, intensity, location, latitude, longitude, display_name, image_url, is_public, created_at, user_id")
        .eq("is_public", true)
        .order("created_at", { ascending: false })
        .range(0, PAGE_SIZE - 1);

    const { data: myEchoes } = user && !user.is_anonymous
        ? await supabase
            .from("echoes")
            .select("id, title, description, intensity, location, latitude, longitude, display_name, image_url, is_public, created_at, user_id")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false })
        : { data: null };

    return (
        <EchoesFeed
            initialPublicEchoes={(publicEchoes as EchoFeedItem[]) ?? []}
            initialMyEchoes={(myEchoes as EchoFeedItem[]) ?? []}
            currentUserId={user?.id ?? null}
            isAnon={user?.is_anonymous ?? true}
            pageSize={PAGE_SIZE}
        />
    );
}