import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import EchoDetail from "@/components/echoes/echo-detail";

type Props = {
    params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { id } = await params;
    const supabase = await createClient();

    const { data: echo } = await supabase
        .from("echoes")
        .select("title, description, location, intensity, display_name")
        .eq("id", id)
        .eq("is_public", true)
        .single();

    if (!echo) {
        return { title: "Echo not found" };
    }

    const description = `${echo.description.slice(0, 120)}${echo.description.length > 120 ? "…" : ""} — logged in ${echo.location} · intensity ${echo.intensity}/10`;

    return {
        title: echo.title,
        description,
        openGraph: {
            title: `"${echo.title}" — REVA Echo`,
            description,
            url: `/echoes/${id}`,
            type: "article",
            images: [{ url: "/og-image.png", width: 1200, height: 630 }],
        },
        twitter: {
            card: "summary_large_image",
            title: `"${echo.title}" — REVA Echo`,
            description,
        },
    };
}

export default async function EchoDetailPage({ params }: Props) {
    const { id } = await params;
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();

    const { data: echo } = await supabase
        .from("echoes")
        .select("id, title, description, intensity, location, latitude, longitude, display_name, image_url, is_public, created_at, user_id")
        .eq("id", id)
        .or(`is_public.eq.true${user ? `,user_id.eq.${user.id}` : ""}`)
        .single();

    if (!echo) notFound();

    // Fetch nearby echoes — same rough region, excluding this one
    const latDelta = 10;
    const lngDelta = 10;

    const { data: nearby } = await supabase
        .from("echoes")
        .select("id, title, intensity, location, created_at, display_name")
        .eq("is_public", true)
        .neq("id", id)
        .gte("latitude", echo.latitude - latDelta)
        .lte("latitude", echo.latitude + latDelta)
        .gte("longitude", echo.longitude - lngDelta)
        .lte("longitude", echo.longitude + lngDelta)
        .order("created_at", { ascending: false })
        .limit(4);

    return (
        <EchoDetail
            echo={echo}
            nearby={nearby ?? []}
            isOwner={user?.id === echo.user_id}
        />
    );
}