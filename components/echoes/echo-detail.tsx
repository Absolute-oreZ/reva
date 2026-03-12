"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
    ArrowLeft, MapPin, Zap, Clock, User,
    Globe, Lock, Share2, Copy, Check, Image as ImageIcon,
    ExternalLink
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

type Echo = {
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

type NearbyEcho = {
    id: string;
    title: string;
    intensity: number;
    location: string;
    created_at: string;
    display_name: string;
};

type Props = {
    echo: Echo;
    nearby: NearbyEcho[];
    isOwner: boolean;
};

function timeAgo(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    if (days < 30) return `${days}d ago`;
    return new Date(dateStr).toLocaleDateString("en-US", {
        month: "long", day: "numeric", year: "numeric"
    });
}

function intensityMeta(intensity: number) {
    if (intensity <= 3) return { label: "Faint",   color: "text-blue-400",    bar: "bg-blue-500",    bg: "bg-blue-500/10",    border: "border-blue-500/20" };
    if (intensity <= 5) return { label: "Mild",    color: "text-violet-400",  bar: "bg-violet-500",  bg: "bg-violet-500/10",  border: "border-violet-500/20" };
    if (intensity <= 7) return { label: "Strong",  color: "text-fuchsia-400", bar: "bg-fuchsia-500", bg: "bg-fuchsia-500/10", border: "border-fuchsia-500/20" };
    if (intensity <= 9) return { label: "Intense", color: "text-rose-400",    bar: "bg-rose-500",    bg: "bg-rose-500/10",    border: "border-rose-500/20" };
    return               { label: "Maximum", color: "text-red-400",     bar: "bg-red-500",     bg: "bg-red-500/10",     border: "border-red-500/20" };
}

export default function EchoDetail({ echo, nearby, isOwner }: Props) {
    const router = useRouter();
    const [imgError, setImgError] = useState(false);
    const [copied, setCopied] = useState(false);

    const meta = intensityMeta(echo.intensity);

    const handleShare = async () => {
        const url = window.location.href;
        try {
            if (navigator.share) {
                await navigator.share({ title: echo.title, text: echo.description, url });
            } else {
                await navigator.clipboard.writeText(url);
                setCopied(true);
                toast.success("Link copied to clipboard");
                setTimeout(() => setCopied(false), 2000);
            }
        } catch {
            await navigator.clipboard.writeText(url);
            setCopied(true);
            toast.success("Link copied to clipboard");
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const mapsUrl = `https://www.google.com/maps?q=${echo.latitude},${echo.longitude}`;

    return (
        <main className="min-h-screen bg-background text-foreground pt-24 pb-20 px-4 md:px-8">
            <div className="max-w-3xl mx-auto space-y-8">

                <motion.div
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.25 }}
                >
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.back()}
                        className="rounded-full gap-2 text-muted-foreground hover:text-foreground -ml-2"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back
                    </Button>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="rounded-3xl border border-border/60 bg-card/60 overflow-hidden"
                >
                    {echo.image_url && !imgError ? (
                        <div className="h-64 md:h-80 w-full overflow-hidden bg-muted">
                            <img
                                src={echo.image_url}
                                alt={echo.title}
                                className="h-full w-full object-cover"
                                onError={() => setImgError(true)}
                            />
                        </div>
                    ) : (
                        <div className="h-32 w-full bg-linear-to-br from-primary/8 via-background to-secondary/8 flex items-center justify-center border-b border-border/40">
                            <ImageIcon className="h-8 w-8 text-muted-foreground/15" />
                        </div>
                    )}

                    <div className="p-6 md:p-8 space-y-6">

                        <div className="flex flex-wrap items-center gap-2">
                            <Badge
                                variant="outline"
                                className={`gap-1.5 font-mono text-xs ${meta.color} ${meta.bg} ${meta.border}`}
                            >
                                <Zap className="h-3 w-3" />
                                {echo.intensity.toFixed(1)} — {meta.label}
                            </Badge>
                            <Badge variant="outline" className="gap-1.5 text-xs text-muted-foreground">
                                {echo.is_public
                                    ? <><Globe className="h-3 w-3" /> Public</>
                                    : <><Lock className="h-3 w-3" /> Private</>
                                }
                            </Badge>
                        </div>

                        <div className="space-y-1">
                            <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-primary">
                                Echo
                            </p>
                            <h1 className="text-3xl md:text-4xl font-bold tracking-tight leading-tight">
                                {echo.title}
                            </h1>
                        </div>

                        <p className="text-muted-foreground leading-relaxed text-base whitespace-pre-wrap">
                            {echo.description}
                        </p>

                        <div className="space-y-1.5">
                            <div className="flex items-center justify-between text-xs text-muted-foreground/50 font-mono">
                                <span>Intensity</span>
                                <span>{echo.intensity.toFixed(1)} / 10</span>
                            </div>
                            <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${(echo.intensity / 10) * 100}%` }}
                                    transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
                                    className={`h-full rounded-full ${meta.bar}`}
                                />
                            </div>
                        </div>

                        <Separator />

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                            <div className="flex items-start gap-2.5">
                                <div className="mt-0.5 p-1.5 rounded-lg bg-muted/50">
                                    <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                                </div>
                                <div className="space-y-0.5">
                                    <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground/40">Location</p>
                                    <p className="font-medium text-sm leading-snug">{echo.location}</p>
                                    <a
                                        href={mapsUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1 text-[10px] text-primary hover:underline font-mono"
                                    >
                                        View on map <ExternalLink className="h-2.5 w-2.5" />
                                    </a>
                                </div>
                            </div>

                            <div className="flex items-start gap-2.5">
                                <div className="mt-0.5 p-1.5 rounded-lg bg-muted/50">
                                    <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                                </div>
                                <div className="space-y-0.5">
                                    <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground/40">Logged</p>
                                    <p className="font-medium text-sm">{timeAgo(echo.created_at)}</p>
                                    <p className="text-[10px] text-muted-foreground/40 font-mono">
                                        {new Date(echo.created_at).toLocaleDateString("en-US", {
                                            month: "short", day: "numeric", year: "numeric"
                                        })}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-2.5">
                                <div className="mt-0.5 p-1.5 rounded-lg bg-muted/50">
                                    <User className="h-3.5 w-3.5 text-muted-foreground" />
                                </div>
                                <div className="space-y-0.5">
                                    <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground/40">Logged by</p>
                                    <p className="font-medium text-sm">{echo.display_name}</p>
                                    {isOwner && (
                                        <p className="text-[10px] text-primary font-mono">You</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        <Separator />

                        <div className="flex flex-wrap gap-3">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleShare}
                                className="rounded-full gap-2"
                            >
                                {copied
                                    ? <><Check className="h-4 w-4 text-emerald-500" /> Copied</>
                                    : <><Share2 className="h-4 w-4" /> Share</>
                                }
                            </Button>
                            <Link href="/globe">
                                <Button variant="outline" size="sm" className="rounded-full gap-2">
                                    <Globe className="h-4 w-4" />
                                    View on Globe
                                </Button>
                            </Link>
                            {isOwner && (
                                <Link href="/echoes">
                                    <Button variant="outline" size="sm" className="rounded-full gap-2 text-muted-foreground">
                                        Manage in My Echoes
                                    </Button>
                                </Link>
                            )}
                        </div>
                    </div>
                </motion.div>

                {nearby.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.15 }}
                        className="space-y-4"
                    >
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-primary">
                                    Same Region
                                </p>
                                <h2 className="font-bold text-lg tracking-tight">Nearby Echoes</h2>
                            </div>
                            <Link href="/echoes" className="text-xs text-muted-foreground hover:text-primary transition-colors font-mono">
                                View all →
                            </Link>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {nearby.map((n) => {
                                const nm = intensityMeta(n.intensity);
                                return (
                                    <Link key={n.id} href={`/echoes/${n.id}`}>
                                        <div className="group p-4 rounded-2xl border border-border/50 bg-card/40 hover:border-primary/25 hover:bg-card/70 transition-all duration-200 space-y-2">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-1.5">
                                                    <span className={`h-2 w-2 rounded-full ${nm.bar}`} />
                                                    <span className={`text-xs font-mono font-bold ${nm.color}`}>
                                                        {n.intensity.toFixed(1)}
                                                    </span>
                                                </div>
                                                <span className="text-[10px] font-mono text-muted-foreground/40">
                                                    {timeAgo(n.created_at)}
                                                </span>
                                            </div>
                                            <p className="font-semibold text-sm line-clamp-1 group-hover:text-primary transition-colors">
                                                {n.title}
                                            </p>
                                            <div className="flex items-center gap-1 text-muted-foreground/50">
                                                <MapPin className="h-3 w-3 shrink-0" />
                                                <span className="text-[11px] truncate">{n.location}</span>
                                            </div>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    </motion.div>
                )}

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="rounded-3xl border border-border/40 bg-muted/20 p-6 text-center space-y-3"
                >
                    <p className="text-sm text-muted-foreground">
                        Did reading this trigger your own déjà vu?
                    </p>
                    <Link href="/echoes/new">
                        <Button className="rounded-full gap-2 shadow-lg shadow-primary/20">
                            <Zap className="h-4 w-4 fill-current" />
                            Log your Echo
                        </Button>
                    </Link>
                </motion.div>

            </div>
        </main>
    );
}