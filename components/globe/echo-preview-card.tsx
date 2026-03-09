"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, MapPin, Zap, Clock, User } from "lucide-react";
import { GlobeEcho } from "@/app/(main)/globe/page";

type Props = {
    echo: GlobeEcho | null;
    onClose: () => void;
};

function timeAgo(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
}

function intensityColor(intensity: number): string {
    if (intensity <= 3) return "bg-blue-500";
    if (intensity <= 6) return "bg-violet-500";
    if (intensity <= 8) return "bg-fuchsia-500";
    return "bg-rose-500";
}

export default function EchoPreviewCard({ echo, onClose }: Props) {
    return (
        <AnimatePresence>
            {echo && (
                <>
                    <motion.div
                        key="backdrop"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-30 md:hidden"
                        onClick={onClose}
                    />

                    <motion.div
                        key="card"
                        initial={{ opacity: 0, x: 40, y: 0 }}
                        animate={{ opacity: 1, x: 0, y: 0 }}
                        exit={{ opacity: 0, x: 40 }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        className={[
                            "fixed z-40 bg-black/80 backdrop-blur-xl border border-white/10",
                            "shadow-2xl shadow-black/60",
                            "md:top-24 md:right-6 md:bottom-auto md:w-80 md:rounded-3xl",
                            "bottom-0 left-0 right-0 rounded-t-3xl md:left-auto",
                        ].join(" ")}
                    >
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 p-1.5 rounded-full bg-white/5 hover:bg-white/10 transition-colors text-white/60 hover:text-white"
                        >
                            <X className="h-4 w-4" />
                        </button>

                        <div className="p-6 space-y-5">
                            {echo.image_url && (
                                <div className="h-32 w-full rounded-2xl overflow-hidden border border-white/10">
                                    <img
                                        src={echo.image_url}
                                        alt={echo.title}
                                        className="h-full w-full object-cover"
                                    />
                                </div>
                            )}

                            <div className="space-y-1">
                                <h3 className="text-white font-bold text-lg leading-tight tracking-tight pr-6">
                                    {echo.title}
                                </h3>
                                <div className="flex items-center gap-1.5 text-white/40">
                                    <Clock className="h-3 w-3" />
                                    <span className="text-[11px] font-mono">{timeAgo(echo.created_at)}</span>
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-mono uppercase tracking-widest text-white/30">
                                        Intensity
                                    </span>
                                    <div className="flex items-center gap-1 text-white/70">
                                        <Zap className="h-3 w-3" />
                                        <span className="text-sm font-bold tabular-nums">
                                            {echo.intensity.toFixed(1)}
                                        </span>
                                    </div>
                                </div>
                                <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${(echo.intensity / 10) * 100}%` }}
                                        transition={{ duration: 0.6, ease: "easeOut" }}
                                        className={`h-full rounded-full ${intensityColor(echo.intensity)}`}
                                    />
                                </div>
                            </div>

                            <p className="text-white/60 text-sm leading-relaxed line-clamp-4">
                                {echo.description}
                            </p>

                            <div className="pt-2 border-t border-white/10 space-y-2">
                                <div className="flex items-center gap-2 text-white/40">
                                    <User className="h-3 w-3 shrink-0" />
                                    <span className="text-xs truncate">{echo.display_name}</span>
                                </div>
                                <div className="flex items-center gap-2 text-white/40">
                                    <MapPin className="h-3 w-3 shrink-0" />
                                    <span className="text-xs truncate">{echo.location}</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}