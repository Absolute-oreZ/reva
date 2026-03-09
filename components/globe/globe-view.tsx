"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import { Radio, Zap, MapPin } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import EchoPreviewCard from "@/components/globe/echo-preview-card";
import type { GlobeEcho } from "@/app/(main)/globe/page";
import Link from "next/link";

const Globe = dynamic(() => import("react-globe.gl"), { ssr: false });

type Props = {
    initialEchoes: GlobeEcho[];
};

const ageToColor = (createdAt: string): string => {
    const ageMs = Date.now() - new Date(createdAt).getTime();
    const maxMs = 24 * 60 * 60 * 1000;
    const t = Math.min(ageMs / maxMs, 1);

    const r = Math.round(139 + (200 - 139) * t);
    const g = Math.round(92 + (190 - 92) * t);
    const b = Math.round(246 + (255 - 246) * t);
    const alpha = +(1.0 - t * 0.7).toFixed(2);

    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

const intensityToRingRadius = (intensity: number): number =>
    1.5 + (intensity / 10) * 3.5;

const intensityToAltitude = (intensity: number): number =>
    0.01 + (intensity / 10) * 0.06;

function isWebGLSupported(): boolean {
    try {
        const canvas = document.createElement("canvas");
        return !!(
            window.WebGLRenderingContext &&
            (canvas.getContext("webgl") || canvas.getContext("experimental-webgl"))
        );
    } catch {
        return false;
    }
}

export default function GlobeView({ initialEchoes }: Props) {
    const supabase = createClient();
    const globeRef = useRef<any>(null);

    const [echoes, setEchoes] = useState<GlobeEcho[]>(initialEchoes);
    const [selectedEcho, setSelectedEcho] = useState<GlobeEcho | null>(null);
    const [isGlobeReady, setIsGlobeReady] = useState(false);
    const [globeSize, setGlobeSize] = useState({ width: 0, height: 0 });

    const [webGLAvailable, setWebGLAvailable] = useState<boolean | null>(null);

    useEffect(() => {
        setWebGLAvailable(isWebGLSupported());
        setGlobeSize({ width: window.innerWidth, height: window.innerHeight });

        const onResize = () =>
            setGlobeSize({ width: window.innerWidth, height: window.innerHeight });
        window.addEventListener("resize", onResize);
        return () => window.removeEventListener("resize", onResize);
    }, []);

    useEffect(() => {
        if (!globeRef.current || !isGlobeReady) return;
        const controls = globeRef.current.controls();
        controls.autoRotate = true;
        controls.autoRotateSpeed = 0.4;
        controls.enableZoom = true;
        controls.minDistance = 180;
        controls.maxDistance = 600;
    }, [isGlobeReady]);

    const focusEcho = useCallback((echo: GlobeEcho) => {
        if (!globeRef.current) return;
        globeRef.current.pointOfView(
            { lat: echo.latitude, lng: echo.longitude, altitude: 2.0 },
            800
        );
        globeRef.current.controls().autoRotate = false;
    }, []);

    const handlePointClick = useCallback((point: any) => {
        const echo = point as GlobeEcho;
        setSelectedEcho(echo);
        focusEcho(echo);
    }, [focusEcho]);

    const handleClose = useCallback(() => {
        setSelectedEcho(null);
        if (globeRef.current) {
            globeRef.current.controls().autoRotate = true;
        }
    }, []);

    useEffect(() => {
        const channel = supabase
            .channel("public-echoes-realtime")
            .on(
                "postgres_changes",
                {
                    event: "INSERT",
                    schema: "public",
                    table: "echoes",
                    filter: "is_public=eq.true",
                },
                (payload) => {
                    setEchoes((prev) => [payload.new as GlobeEcho, ...prev]);
                }
            )
            .subscribe();


        return () => { supabase.removeChannel(channel); };
    }, [supabase]);

    const renderFallbackList = () => (
        <div className="absolute inset-0 overflow-y-auto pt-24 pb-8 px-4 space-y-3">
            <div className="flex items-center gap-2 mb-6 px-1">
                <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-violet-500" />
                </span>
                <span className="text-[10px] font-mono uppercase tracking-widest text-white/40">
                    {echoes.length} echoes in last 24h
                </span>
            </div>

            {echoes.length === 0 && (
                <div className="text-center pt-20 text-white/20 font-mono text-xs uppercase tracking-widest">
                    No echoes yet — be the first
                </div>
            )}

            {echoes.map((echo) => (
                <button
                    key={echo.id}
                    onClick={() => setSelectedEcho(echo)}
                    className="w-full text-left p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/8 transition-colors space-y-2"
                >
                    <div className="flex items-start justify-between gap-2">
                        <span className="font-semibold text-white text-sm leading-tight">
                            {echo.title}
                        </span>
                        <span className="text-violet-400 font-bold text-sm tabular-nums shrink-0">
                            {echo.intensity.toFixed(1)}
                        </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-white/30">
                        <MapPin className="h-3 w-3 shrink-0" />
                        <span className="text-xs truncate">{echo.location}</span>
                    </div>
                </button>
            ))}
        </div>
    );

    const renderGlobe = () => (
        <>
            <AnimatePresence>
                {!isGlobeReady && (
                    <motion.div
                        key="loader"
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 flex items-center justify-center z-20 bg-[#020409]"
                    >
                        <div className="flex flex-col items-center gap-4">
                            <div className="h-12 w-12 rounded-full border-2 border-violet-500/30 border-t-violet-500 animate-spin" />
                            <p className="text-[10px] font-mono uppercase tracking-widest text-white/30">
                                Initialising Globe
                            </p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <Globe
                ref={globeRef}
                onGlobeReady={() => setIsGlobeReady(true)}
                width={globeSize.width}
                height={globeSize.height}
                backgroundColor="rgba(0,0,0,0)"
                globeImageUrl="//unpkg.com/three-globe/example/img/earth-night.jpg"
                bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
                atmosphereColor="#7c3aed"
                atmosphereAltitude={0.15}

                pointsData={echoes}
                pointLat={(d: any) => (d as GlobeEcho).latitude}
                pointLng={(d: any) => (d as GlobeEcho).longitude}
                pointAltitude={(d: any) => intensityToAltitude((d as GlobeEcho).intensity)}
                pointRadius={(d: any) => {
                    const echo = d as GlobeEcho;
                    return selectedEcho?.id === echo.id ? 0.6 : 0.4;
                }}
                pointColor={(d: any) => ageToColor((d as GlobeEcho).created_at)}
                pointsMerge={false}
                onPointClick={handlePointClick}
                pointLabel={(d: any) => {
                    const echo = d as GlobeEcho;
                    return `
                        <div style="
                            background: rgba(0,0,0,0.85);
                            border: 1px solid rgba(255,255,255,0.1);
                            border-radius: 12px;
                            padding: 8px 12px;
                            font-family: monospace;
                            color: white;
                            font-size: 11px;
                            max-width: 180px;
                            pointer-events: none;
                        ">
                            <div style="font-weight: bold; margin-bottom: 2px;">${echo.title}</div>
                            <div style="color: rgba(255,255,255,0.5);">${echo.location}</div>
                        </div>
                    `;
                }}

                ringsData={echoes}
                ringLat={(d: any) => (d as GlobeEcho).latitude}
                ringLng={(d: any) => (d as GlobeEcho).longitude}
                ringMaxRadius={(d: any) => intensityToRingRadius((d as GlobeEcho).intensity)}
                ringPropagationSpeed={1.5}
                ringRepeatPeriod={1200}
                ringColor={() => "rgba(139, 92, 246, 0.25)"}
                ringAltitude={0.001}
            />
        </>
    );

    return (
        <div className="fixed inset-0 bg-[#020409] overflow-hidden">

            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-50 h-50 rounded-full bg-violet-950/20 blur-[120px]" />
            </div>

            <div className="absolute inset-0 flex items-center justify-center">
                {webGLAvailable === null && null}
                {webGLAvailable === true && renderGlobe()}
                {webGLAvailable === false && renderFallbackList()}
            </div>

            {webGLAvailable !== false && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: isGlobeReady ? 1 : 0, y: isGlobeReady ? 0 : -10 }}
                    transition={{ delay: 0.4 }}
                    className="absolute top-24 left-6 z-20 space-y-2"
                >
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/10">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75" />
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-violet-500" />
                        </span>
                        <span className="text-[10px] font-mono uppercase tracking-widest text-white/60">
                            Live
                        </span>
                    </div>
                    <div className="px-3 py-2 rounded-2xl bg-black/60 backdrop-blur-md border border-white/10 space-y-0.5">
                        <p className="text-2xl font-bold text-white tabular-nums leading-none">
                            {echoes.length}
                        </p>
                        <p className="text-[10px] font-mono uppercase tracking-widest text-white/30">
                            Echoes / 24h
                        </p>
                    </div>
                </motion.div>
            )}

            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{
                    opacity: webGLAvailable === null ? 0 : (isGlobeReady || webGLAvailable === false) ? 1 : 0,
                    y: 0,
                }}
                transition={{ delay: 0.5 }}
                className="absolute top-24 right-6 z-20"
            >
                <Link
                    href="/echoes/new"
                    className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-violet-600 hover:bg-violet-500 transition-colors shadow-lg shadow-violet-900/40 text-white text-sm font-medium"
                >
                    <Zap className="h-4 w-4 fill-current" />
                    Log Echo
                </Link>
            </motion.div>

            <AnimatePresence>
                {isGlobeReady && !selectedEcho && echoes.length > 0 && webGLAvailable && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        transition={{ delay: 1 }}
                        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20"
                    >
                        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-black/60 backdrop-blur-md border border-white/10">
                            <MapPin className="h-3 w-3 text-violet-400" />
                            <span className="text-[11px] font-mono text-white/40 uppercase tracking-widest">
                                Tap a signal to read
                            </span>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {isGlobeReady && echoes.length === 0 && webGLAvailable && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="absolute bottom-12 left-1/2 -translate-x-1/2 z-20"
                    >
                        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-black/60 backdrop-blur-md border border-white/10">
                            <Radio className="h-3 w-3 text-white/30" />
                            <span className="text-[11px] font-mono text-white/30 uppercase tracking-widest">
                                No echoes in the last 24h — be the first
                            </span>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <EchoPreviewCard echo={selectedEcho} onClose={handleClose} />
        </div>
    );
}