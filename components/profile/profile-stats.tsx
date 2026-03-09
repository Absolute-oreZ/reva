"use client";

import { motion } from "framer-motion";
import { Zap, Globe, Lock, TrendingUp } from "lucide-react";

type Props = {
    totalEchoes: number;
    publicEchoes: number;
    privateEchoes: number;
    avgIntensity: number;
    highestIntensity: number;
    memberSince: string;
};

const statVariants = {
    hidden: { opacity: 0, y: 12 },
    visible: (i: number) => ({
        opacity: 1,
        y: 0,
        transition: { delay: i * 0.08, duration: 0.35 },
    }),
};

export default function ProfileStats({
    totalEchoes,
    publicEchoes,
    privateEchoes,
    avgIntensity,
    highestIntensity,
    memberSince,
}: Props) {
    const stats = [
        {
            label: "Total Echoes",
            value: totalEchoes,
            suffix: "",
            icon: <Zap className="h-4 w-4" />,
            color: "text-violet-400",
            bg: "bg-violet-500/10",
        },
        {
            label: "Public",
            value: publicEchoes,
            suffix: "",
            icon: <Globe className="h-4 w-4" />,
            color: "text-emerald-400",
            bg: "bg-emerald-500/10",
        },
        {
            label: "Private",
            value: privateEchoes,
            suffix: "",
            icon: <Lock className="h-4 w-4" />,
            color: "text-amber-400",
            bg: "bg-amber-500/10",
        },
        {
            label: "Avg Intensity",
            value: avgIntensity.toFixed(1),
            suffix: "",
            icon: <TrendingUp className="h-4 w-4" />,
            color: "text-rose-400",
            bg: "bg-rose-500/10",
        },
    ];

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
                    Your Signal Profile
                </h2>
                <span className="text-[11px] font-mono text-muted-foreground/40">
                    Member since {new Date(memberSince).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {stats.map((stat, i) => (
                    <motion.div
                        key={stat.label}
                        custom={i}
                        initial="hidden"
                        animate="visible"
                        variants={statVariants}
                        className="p-4 rounded-2xl border border-border/50 bg-card space-y-3"
                    >
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${stat.bg} ${stat.color}`}>
                            {stat.icon}
                        </div>
                        <div>
                            <p className={`text-2xl font-bold tabular-nums ${stat.color}`}>
                                {stat.value}
                            </p>
                            <p className="text-[11px] font-mono text-muted-foreground/50 uppercase tracking-wider mt-0.5">
                                {stat.label}
                            </p>
                        </div>
                    </motion.div>
                ))}
            </div>

            {totalEchoes > 0 && (
                <div className="p-4 rounded-2xl border border-border/50 bg-card space-y-2">
                    <div className="flex items-center justify-between">
                        <span className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground/50">
                            Peak Intensity
                        </span>
                        <span className="text-sm font-bold text-rose-400 tabular-nums">
                            {highestIntensity.toFixed(1)} / 10
                        </span>
                    </div>
                    <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${(highestIntensity / 10) * 100}%` }}
                            transition={{ duration: 0.8, ease: "easeOut", delay: 0.3 }}
                            className="h-full rounded-full bg-linear-to-r from-violet-500 via-fuchsia-500 to-rose-500"
                        />
                    </div>
                </div>
            )}
        </div>
    );
}