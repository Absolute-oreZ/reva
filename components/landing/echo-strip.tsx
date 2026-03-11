"use client";

import { useRef } from "react";
import { motion } from "framer-motion";
import { MapPin, ChevronLeft, ChevronRight } from "lucide-react";

type StripEcho = {
    id: string;
    title: string;
    description: string;
    intensity: number;
    location: string;
    display_name: string;
    created_at: string;
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

function intensityColor(intensity: number) {
    if (intensity <= 3) return { dot: "bg-blue-500", text: "text-blue-400", bar: "bg-blue-500" };
    if (intensity <= 5) return { dot: "bg-violet-500", text: "text-violet-400", bar: "bg-violet-500" };
    if (intensity <= 7) return { dot: "bg-fuchsia-500", text: "text-fuchsia-400", bar: "bg-fuchsia-500" };
    if (intensity <= 9) return { dot: "bg-rose-500", text: "text-rose-400", bar: "bg-rose-500" };
    return { dot: "bg-red-500", text: "text-red-400", bar: "bg-red-500" };
}

export default function EchoStrip({ echoes }: { echoes: StripEcho[] }) {
    const scrollRef = useRef<HTMLDivElement>(null);

    const scroll = (dir: "left" | "right") => {
        if (!scrollRef.current) return;
        scrollRef.current.scrollBy({ left: dir === "right" ? 340 : -340, behavior: "smooth" });
    };

    if (echoes.length === 0) return null;

    return (
        <div className="relative">
            <button
                onClick={() => scroll("left")}
                className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 h-9 w-9 rounded-full bg-background border border-border/60 shadow-md items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
            >
                <ChevronLeft className="h-4 w-4" />
            </button>
            <button
                onClick={() => scroll("right")}
                className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 h-9 w-9 rounded-full bg-background border border-border/60 shadow-md items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
            >
                <ChevronRight className="h-4 w-4" />
            </button>

            <div className="absolute left-0 top-0 bottom-0 w-12 bg-linear-to-r from-background to-transparent z-1 pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-12 bg-linear-to-l from-background to-transparent z-1 pointer-events-none" />

            <div
                ref={scrollRef}
                className="flex gap-4 overflow-x-auto scrollbar-hide pb-2 px-2 snap-x snap-mandatory"
                style={{ scrollbarWidth: "none" }}
            >
                {echoes.map((echo, i) => {
                    const colors = intensityColor(echo.intensity);
                    return (
                        <motion.div
                            key={echo.id}
                            initial={{ opacity: 0, y: 12 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.07, duration: 0.35 }}
                            className="snap-start shrink-0 w-72 p-5 rounded-3xl border border-border/50 bg-card/60 backdrop-blur-sm hover:border-primary/25 hover:bg-card/80 transition-all duration-300 space-y-3 flex flex-col"
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <span className={`h-2 w-2 rounded-full ${colors.dot}`} />
                                    <span className={`text-xs font-bold tabular-nums font-mono ${colors.text}`}>
                                        {echo.intensity.toFixed(1)}
                                    </span>
                                </div>
                                <span className="text-[10px] font-mono text-muted-foreground/40 uppercase tracking-widest">
                                    {timeAgo(echo.created_at)}
                                </span>
                            </div>

                            <h3 className="font-bold text-sm leading-snug line-clamp-1">
                                {echo.title}
                            </h3>

                            <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3 grow">
                                {echo.description}
                            </p>

                            <div className="h-0.5 w-full bg-muted rounded-full overflow-hidden">
                                <div
                                    className={`h-full rounded-full ${colors.bar}`}
                                    style={{ width: `${(echo.intensity / 10) * 100}%` }}
                                />
                            </div>

                            <div className="flex items-center justify-between pt-1">
                                <div className="flex items-center gap-1 text-muted-foreground/50">
                                    <MapPin className="h-3 w-3 shrink-0" />
                                    <span className="text-[10px] truncate max-w-27.5">{echo.location}</span>
                                </div>
                                <span className="text-[10px] text-muted-foreground/40 font-mono truncate max-w-22.5 text-right">
                                    {echo.display_name}
                                </span>
                            </div>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
}