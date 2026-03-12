import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import ProfileForm from "@/components/profile/profile-form";
import ProfileStats from "@/components/profile/profile-stats";
import DangerZone from "@/components/profile/danger-zone";
import { Separator } from "@/components/ui/separator";

export const metadata: Metadata = {
    title: "Profile",
    description: "Manage your REVA account, display name, and echo history.",
    robots: {
        index: false,
        follow: false,
    },
};

export default async function ProfilePage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user || user.is_anonymous) redirect("/login");

    const { data: profile } = await supabase
        .from("users")
        .select("display_name, created_at")
        .eq("id", user.id)
        .single();

    const { data: echoes } = await supabase
        .from("echoes")
        .select("intensity, is_public")
        .eq("user_id", user.id);

    const totalEchoes = echoes?.length ?? 0;
    const publicEchoes = echoes?.filter((e) => e.is_public).length ?? 0;
    const privateEchoes = totalEchoes - publicEchoes;
    const avgIntensity = totalEchoes > 0
        ? (echoes!.reduce((sum, e) => sum + e.intensity, 0) / totalEchoes)
        : 0;
    const highestIntensity = totalEchoes > 0
        ? Math.max(...echoes!.map((e) => e.intensity))
        : 0;

    const hasPassword = user.identities?.some((i) => i.provider === "email") ?? false;

    return (
        <main className="min-h-screen bg-background pt-28 pb-20 px-4 md:px-8">
            <div className="max-w-2xl mx-auto space-y-10">

                <div className="space-y-1">
                    <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-primary">
                        Account
                    </p>
                    <h1 className="text-4xl md:text-5xl font-bold tracking-tighter">
                        Profile
                    </h1>
                    <p className="text-muted-foreground text-sm">
                        {user.email}
                    </p>
                </div>

                <ProfileStats
                    totalEchoes={totalEchoes}
                    publicEchoes={publicEchoes}
                    privateEchoes={privateEchoes}
                    avgIntensity={avgIntensity}
                    highestIntensity={highestIntensity}
                    memberSince={profile?.created_at ?? user.created_at}
                />

                <Separator />

                <div className="space-y-2">
                    <h2 className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
                        Account Settings
                    </h2>
                    <div className="rounded-3xl border border-border/60 bg-card p-6 md:p-8">
                        <ProfileForm
                            initialDisplayName={profile?.display_name ?? ""}
                            hasPassword={hasPassword}
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <h2 className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
                        Danger Zone
                    </h2>
                    <DangerZone />
                </div>
            </div>
        </main>
    );
}