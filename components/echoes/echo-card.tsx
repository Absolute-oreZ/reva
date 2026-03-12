"use client";

import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";
import { MapPin, Zap, Clock, User, Lock, Globe, Image as ImageIcon, Trash2, Loader2, Trash2Icon } from "lucide-react";
import { EchoFeedItem } from "@/app/(main)/echoes/page";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogMedia,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { deleteEcho, toggleEchoVisibility } from "@/app/(main)/echoes/action";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

type Props = {
    echo: EchoFeedItem;
    index: number;
    isOwn?: boolean;
    onDelete?: (id: string) => void;
    onToggle?: (id: string, newVisibility: boolean) => void;
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
    return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function intensityMeta(intensity: number): { label: string; color: string; bar: string } {
    if (intensity <= 3) return { label: "Faint", color: "text-blue-400", bar: "bg-blue-500" };
    if (intensity <= 5) return { label: "Mild", color: "text-violet-400", bar: "bg-violet-500" };
    if (intensity <= 7) return { label: "Strong", color: "text-fuchsia-400", bar: "bg-fuchsia-500" };
    if (intensity <= 9) return { label: "Intense", color: "text-rose-400", bar: "bg-rose-500" };
    return { label: "Maximum", color: "text-red-400", bar: "bg-red-500" };
}

export default function EchoCard({ echo, index, isOwn = false, onDelete, onToggle }: Props) {
    const meta = intensityMeta(echo.intensity);

    const [isPublic, setIsPublic] = useState(echo.is_public);
    const [imgError, setImgError] = useState(false);
    const [isToggling, setIsToggling] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleToggle = async () => {
        if (isToggling) return;
        const prev = isPublic;
        const next = !isPublic;

        setIsPublic(next);
        setIsToggling(true);

        try {
            const result = await toggleEchoVisibility(echo.id, prev);

            if (!result.success) {
                setIsPublic(prev);
                toast.error(result.message ?? "Failed to update visibility");
                return;
            }

            onToggle?.(echo.id, next);
            toast.success(next ? "Echo is now public" : "Echo is now private");

            const supabaseBroadcast = createClient();
            await supabaseBroadcast
                .channel("echo-visibility")
                .send({
                    type: "broadcast",
                    event: "visibility_change",
                    payload: { id: echo.id, is_public: next },
                });
        } catch {
            setIsPublic(prev);
            toast.error("Something went wrong");
        } finally {
            setIsToggling(false);
        }
    };

    const handleDelete = async () => {
        setIsDeleting(true);
        try {
            const result = await deleteEcho(echo.id);

            if (!result.success) {
                toast.error(result.message ?? "Failed to delete echo");
                return;
            }

            onDelete?.(echo.id);
            toast.success("Echo deleted");
        } catch {
            toast.error("Something went wrong");
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <motion.article
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: Math.min(index * 0.05, 0.4) }}
            className="group relative flex flex-col bg-card border border-border/60 rounded-3xl overflow-hidden hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300"
        >
            {echo.image_url && !imgError ? (
                <div className="h-40 w-full overflow-hidden bg-muted shrink-0">
                    <img
                        src={echo.image_url}
                        alt={echo.title}
                        className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={() => setImgError(true)}
                    />
                </div>
            ) : (
                <div className="h-24 w-full shrink-0 bg-linear-to-br from-primary/5 to-secondary/5 flex items-center justify-center border-b border-border/40">
                    <ImageIcon className="h-6 w-6 text-muted-foreground/20" />
                </div>
            )}

            <div className="flex flex-col gap-3 p-5 grow">

                <div className="flex items-start justify-between gap-3">
                    <Link href={`/echoes/${echo.id}`}>
                        <h3 className="font-bold text-base leading-snug tracking-tight line-clamp-2 group-hover:text-primary transition-colors">
                            {echo.title}
                        </h3>
                    </Link>

                    {isOwn && (
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button title="Delete echo" className="shrink-0 p-1.5 rounded-lg bg-transparent text-muted-foreground/40 hover:text-destructive hover:bg-destructive/10 transition-colors">
                                    {isDeleting
                                        ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                        : <Trash2 className="h-3.5 w-3.5" />
                                    }</Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent size="sm">
                                <AlertDialogHeader>
                                    <AlertDialogMedia className="bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-destructive">
                                        <Trash2Icon />
                                    </AlertDialogMedia>
                                    <AlertDialogTitle>Delete this echo?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        "{echo.title}" will be permanently removed from the network.
                                        This cannot be undone.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel variant="outline">Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={handleDelete} variant="destructive">Delete</AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    )}
                </div>

                <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3 grow">
                    {echo.description}
                </p>

                <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground/50">
                            Intensity
                        </span>
                        <div className={`flex items-center gap-1 ${meta.color}`}>
                            <Zap className="h-3 w-3" />
                            <span className="text-xs font-bold tabular-nums">
                                {echo.intensity.toFixed(1)}
                            </span>
                            <span className="text-[10px] font-mono opacity-60">
                                · {meta.label}
                            </span>
                        </div>
                    </div>
                    <div className="h-1 w-full bg-muted rounded-full overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${(echo.intensity / 10) * 100}%` }}
                            transition={{ duration: 0.6, ease: "easeOut", delay: Math.min(index * 0.05, 0.4) }}
                            className={`h-full rounded-full ${meta.bar}`}
                        />
                    </div>
                </div>

                <div className="pt-2 border-t border-border/50 space-y-2">
                    <div className="grid grid-cols-2 gap-x-3 gap-y-1.5">
                        <div className="flex items-center gap-1.5 text-muted-foreground/60 col-span-2">
                            <User className="h-3 w-3 shrink-0" />
                            <span className="text-xs truncate">{echo.display_name}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-muted-foreground/60">
                            <MapPin className="h-3 w-3 shrink-0" />
                            <span className="text-xs truncate">{echo.location}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-muted-foreground/40 justify-end">
                            <Clock className="h-3 w-3 shrink-0" />
                            <span className="text-xs">{timeAgo(echo.created_at)}</span>
                        </div>
                    </div>

                    {isOwn && (
                        <div className="flex items-center justify-between pt-1">
                            <div className="flex items-center gap-1.5 text-muted-foreground/50">
                                {isPublic
                                    ? <Globe className="h-3 w-3" />
                                    : <Lock className="h-3 w-3" />
                                }
                                <span className="text-[11px] font-mono">
                                    {isPublic ? "Public" : "Private"}
                                </span>
                            </div>
                            <Switch
                                checked={isPublic}
                                onCheckedChange={handleToggle}
                                disabled={isToggling}
                                className="scale-75 origin-right"
                            />
                        </div>
                    )}
                </div>
            </div>
        </motion.article>
    );
}