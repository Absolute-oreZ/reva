"use client";

import { useState, memo, useEffect, useCallback, useRef } from "react";
import { uniqueNamesGenerator, adjectives, animals } from 'unique-names-generator';
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import {
    MapPin,
    ChevronRight,
    ChevronLeft,
    Zap,
    Sparkles,
    Info,
    Navigation,
    Loader2,
    Search,
    Check,
    ShieldCheck,
    Globe,
    Radio,
    User,
    Dices,
    History,
    Loader2Icon,
    OctagonXIcon,
    AlertCircle,
    LogIn,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";
import Threads from "@/components/shared/Threads";
import Link from "next/link";
import { createEcho } from "@/app/(main)/echoes/new/action";
import { EchoInput } from "@/app/(main)/echoes/new/schema";
import { createClient } from "@/lib/supabase/client";
import type { User as SupabaseUser } from "@supabase/supabase-js";

const STEPS = [
    { id: "anchor", label: "Location", sub: "Set Origin" },
    { id: "signal", label: "Message", sub: "Write Echo" },
    { id: "archive", label: "Publish", sub: "Finalize" },
    { id: "success", label: "Complete", sub: "Transmission Sent" },
];

const STORAGE_KEY = "echo_wizard_progress";
const TIMESTAMP_KEY = "echo_wizard_timestamp";
const EXPIRATION_MS = 30 * 60 * 1000;

const BackgroundSignal = memo(({ intensity }: { intensity: number }) => {
    return (
        <div className="fixed inset-0 z-0 opacity-30 pointer-events-none">
            <Threads
                color={[0.4, 0.2, 1.0]}
                amplitude={intensity * 0.12}
                distance={0.2}
                enableMouseInteraction={true}
            />
        </div>
    );
}, (prev, next) => prev.intensity === next.intensity);

BackgroundSignal.displayName = "BackgroundSignal";

export default function EchoWizard() {
    const router = useRouter();
    const supabase = createClient();
    const [step, setStep] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLocating, setIsLocating] = useState(false);
    const [isSearching, setIsSearching] = useState(false);
    const [anchorMode, setAnchorMode] = useState<"manual" | "gps">("manual");
    const [isUploading, setIsUploading] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isIdentityReady, setIsIdentityReady] = useState(false);
    const [user, setUser] = useState<SupabaseUser | undefined | null>(null);

    const hasCheckedForDraft = useRef(false);

    const [formData, setFormData] = useState<EchoInput>({
        title: "",
        description: "",
        intensity: 5.0,
        location: "",
        latitude: 0,
        longitude: 0,
        is_public: true,
        display_name: "Anonymous Observer",
    });

    const clearDraft = useCallback(() => {
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem(TIMESTAMP_KEY);
    }, []);

    const handleRestore = useCallback(() => {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            const { formData: savedForm, step: savedStep } = JSON.parse(saved);
            setFormData(savedForm);
            setStep(savedStep);
            if (savedForm.image_url) {
                setPreviewUrl(savedForm.image_url);
            }

            toast.success("Progress restored", {
                description: "You're back where you left off.",
                duration: 3000,
            });
        }
    }, []);

    useEffect(() => {
        const ensureIdentity = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            let currentUser = session?.user ?? null;

            if (!session) {
                const { data } = await supabase.auth.signInAnonymously();
                currentUser = data.user;
            }

            setUser(currentUser);
            setIsIdentityReady(true);
        };
        ensureIdentity();
    }, [supabase]);

    useEffect(() => {
        if (hasCheckedForDraft.current) return;
        const savedData = localStorage.getItem(STORAGE_KEY);
        const savedTime = localStorage.getItem(TIMESTAMP_KEY);
        if (savedData && savedTime) {
            const isExpired = Date.now() - parseInt(savedTime) > EXPIRATION_MS;
            if (!isExpired) {
                const timer = setTimeout(() => {
                    toast("Resume your Echo?", {
                        description: "We found an unsent transmission draft.",
                        icon: <History className="h-4 w-4 text-primary" />,
                        action: {
                            label: "Restore",
                            onClick: () => handleRestore(),
                        },
                        cancel: {
                            label: "Discard",
                            onClick: () => clearDraft(),
                        },
                        duration: 8000,
                    });
                }, 800);

                return () => clearTimeout(timer);
            } else {
                clearDraft();
            }
        }
        hasCheckedForDraft.current = true;
    }, [clearDraft, handleRestore]);

    useEffect(() => {
        const hasData =
            formData.description.length > 5 ||
            (formData.location.length > 0 && formData.latitude !== 0) ||
            formData.title !== "";

        if (hasData && !isSubmitting && step < STEPS.length - 1) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify({ formData, step }));
            localStorage.setItem(TIMESTAMP_KEY, Date.now().toString());
        }
    }, [formData, step, isSubmitting]);

    const isStepValid = () => {
        if (step === 0) return formData.latitude !== 0;
        if (step === 1) return formData.description.trim().length >= 10 && !isUploading;
        return true;
    };

    const nextStep = () => {
        if (!isStepValid()) return;
        if (step === 1 && formData.title.trim() === "") {
            const timeSeed = Date.now().toString().slice(-6);
            const randomSeed = Math.floor(100 + Math.random() * 900);
            setFormData(prev => ({ ...prev, title: `Echo#${timeSeed}${randomSeed}` }));
        }
        setStep((s) => Math.min(s + 1, STEPS.length - 1));
    };

    const prevStep = () => setStep((s) => Math.max(s - 1, 0));

    const handleManualSearch = async () => {
        if (!formData.location || formData.location.length < 2) return;
        setIsSearching(true);
        try {
            const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(formData.location)}&limit=1`);
            const data = await res.json();
            if (data?.[0]) {
                setFormData(prev => ({
                    ...prev,
                    latitude: parseFloat(data[0].lat),
                    longitude: parseFloat(data[0].lon),
                    location: data[0].display_name
                }));
            } else {
                alert("Location not found.");
            }
        } catch (err) { console.error(err); }
        finally { setIsSearching(false); }
    };

    const handleGPS = () => {
        setIsLocating(true);
        navigator.geolocation.getCurrentPosition(
            async (pos) => {
                const { latitude: lat, longitude: lon } = pos.coords;
                try {
                    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}`);
                    const data = await res.json();
                    const displayName = data.display_name || `${lat.toFixed(4)}, ${lon.toFixed(4)}`;
                    setFormData(prev => ({ ...prev, latitude: lat, longitude: lon, location: displayName }));
                } catch (err) {
                    setFormData(prev => ({ ...prev, latitude: lat, longitude: lon, location: `${lat.toFixed(4)}, ${lon.toFixed(4)}` }));
                }
                setAnchorMode("gps");
                setIsLocating(false);
            },
            () => {
                alert("GPS Sync failed.");
                setIsLocating(false);
            }
        );
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setIsUploading(true);

        if (formData.image_url) {
            const oldPath = formData.image_url.split('/').pop();
            if (oldPath) {
                await supabase.storage.from('echo-images').remove([`uploads/${oldPath}`]);
            }
        }

        const fileExt = file.name.split('.').pop();
        const fileName = `${crypto.randomUUID()}.${fileExt}`;
        const filePath = `uploads/${fileName}`;

        const { error } = await supabase.storage
            .from('echo-images')
            .upload(filePath, file);

        if (error) {
            toast.error("Upload failed");
            setIsUploading(false);
            return;
        }

        const { data: { publicUrl } } = supabase.storage
            .from('echo-images')
            .getPublicUrl(filePath);

        setFormData({ ...formData, image_url: publicUrl });
        setPreviewUrl(URL.createObjectURL(file));
        setIsUploading(false);
    };

    const handleRemoveImage = async () => {
        setPreviewUrl(null);
        setFormData(prev => ({ ...prev, image_url: "" }));
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        const result = await createEcho(formData);
        if (result.success) {
            clearDraft();
            setStep(3);
        } else {
            toast.error("Error", { description: result.message });
        }
        setIsSubmitting(false);
    };

    const generateAnonymousName = () => {
        const randomName = uniqueNamesGenerator({ dictionaries: [adjectives, animals], separator: ' ', style: 'capital' });
        setFormData(prev => ({ ...prev, display_name: `Anonymous ${randomName}` }));
    };

    useEffect(() => {
        if (formData.display_name === "Anonymous Observer") generateAnonymousName();
    }, []);

    const handlePreAuthRedirect = (destination: "/login" | "/signup") => {
        if (user?.id) {
            localStorage.setItem("anon_claim_id", user.id);
        }
        clearDraft();
        router.push(destination);
    };

    return (
        <div className="z-10 w-full max-w-5xl flex flex-col md:flex-row gap-6 md:gap-12 px-4 md:px-6 py-4 md:py-0">
            <BackgroundSignal intensity={formData.intensity} />

            <aside className="md:w-48 shrink-0">
                <nav className="flex md:flex-col justify-center md:justify-start gap-4 md:gap-10 sticky top-4 md:top-24">
                    {STEPS.map((s, i) => (
                        <div key={s.id} className="group flex items-start gap-2 md:gap-4 transition-all">
                            <div className="flex flex-col items-center gap-2">
                                <div className={`h-7 w-7 md:h-8 md:w-8 rounded-full border-2 flex items-center justify-center transition-all duration-500 font-mono text-[10px] md:text-xs ${i <= step ? "bg-primary border-primary text-primary-foreground shadow-[0_0_15px_rgba(var(--primary),0.5)]" : "bg-background border-border text-muted-foreground"}`}>
                                    {i < step ? <Check className="h-3 w-3 md:h-4 md:w-4" /> : `0${i + 1}`}
                                </div>
                                {i !== STEPS.length - 1 && <div className={`hidden md:block w-0.5 h-12 transition-colors duration-500 ${i < step ? "bg-primary" : "bg-border"}`} />}
                            </div>
                            <div className="hidden md:block pt-1">
                                <p className={`text-[10px] uppercase font-mono tracking-tighter transition-colors ${i <= step ? "text-foreground" : "text-muted-foreground"}`}>{s.label}</p>
                                <p className="text-[10px] text-muted-foreground/60 font-mono italic">{s.sub}</p>
                            </div>
                        </div>
                    ))}
                </nav>
            </aside>

            <main className="grow max-w-2xl">
                <AnimatePresence mode="wait">
                    {step === 0 && (
                        <motion.div key="step0" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6 md:space-y-8">
                            <div className="space-y-1 md:space-y-2">
                                <h2 className="text-3xl md:text-5xl font-bold tracking-tighter">Where did it happen?</h2>
                                <p className="text-sm md:text-base text-muted-foreground">Pin your memory to a specific coordinate on the map.</p>
                            </div>
                            <div className="grid grid-cols-2 gap-3 md:gap-4">
                                <Button variant={anchorMode === "manual" ? "default" : "outline"} onClick={() => setAnchorMode("manual")} className="h-20 md:h-28 rounded-2xl md:rounded-3xl flex flex-col gap-1 md:gap-2 transition-all border-border/50 text-xs">
                                    <Search className="h-4 w-4 md:h-5 md:w-5" /><span className="text-[9px] md:text-[10px] uppercase font-mono">Search Address</span>
                                </Button>
                                <Button variant={anchorMode === "gps" ? "default" : "outline"} onClick={handleGPS} disabled={isLocating} className="h-20 md:h-28 rounded-2xl md:rounded-3xl flex flex-col gap-1 md:gap-2 transition-all border-border/50 text-xs">
                                    {isLocating ? <Loader2 className="h-4 w-4 md:h-5 md:w-5 animate-spin" /> : <Navigation className="h-4 w-4 md:h-5 md:w-5" />}
                                    <span className="text-[9px] md:text-[10px] uppercase font-mono">Use Current GPS</span>
                                </Button>
                            </div>
                            <div className="space-y-4">
                                <div className="relative">
                                    <MapPin className="absolute left-3 md:left-4 top-3 md:top-4 h-4 w-4 md:h-5 md:w-5 text-primary" />
                                    <Input placeholder={anchorMode === "gps" ? "Acquiring satellites..." : "Enter a city, street, or landmark..."} className="h-11 md:h-14 pl-10 md:pl-12 pr-14 md:pr-16 rounded-xl md:rounded-2xl bg-secondary/5 border-border text-sm md:text-lg" value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value, latitude: 0 })} onKeyDown={(e) => e.key === 'Enter' && handleManualSearch()} />
                                    {anchorMode === "manual" && (
                                        <Button size="sm" onClick={handleManualSearch} disabled={isSearching || !formData.location} className="absolute right-1.5 md:right-2 top-1.5 md:top-2 h-8 w-8 md:h-10 md:w-10 rounded-lg md:rounded-xl p-0">
                                            {isSearching ? <Loader2 className="h-3 w-3 md:h-4 md:w-4 animate-spin" /> : <Check className="h-3 w-3 md:h-4 md:w-4" />}
                                        </Button>
                                    )}
                                </div>
                                <div className="h-5 flex items-center px-2">
                                    {formData.latitude === 0 && (
                                        <p className="text-[9px] md:text-[10px] font-mono text-destructive flex items-center gap-2 animate-pulse">
                                            <AlertCircle className="h-3 w-3" /> Please select a valid location to continue
                                        </p>
                                    )}
                                </div>
                                <div className="p-3 md:p-4 rounded-xl md:rounded-2xl bg-primary/5 border border-primary/10 flex gap-2 md:gap-3 items-start">
                                    <Info className="h-4 w-4 md:h-5 md:w-5 text-primary shrink-0 mt-0.5" />
                                    <p className="text-[10px] md:text-[11px] text-muted-foreground leading-relaxed">
                                        Your location will be used to visualize this memory on our <Link href="/globe" className="hover:underline text-indigo-500">global interactive globe.</Link>
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {step === 1 && (
                        <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4 md:space-y-6">
                            <div className="space-y-1 md:space-y-2">
                                <h2 className="text-3xl md:text-5xl font-bold tracking-tighter">Capture the Moment</h2>
                                <p className="text-sm md:text-base text-muted-foreground italic">What did you feel? Describe the experience in detail.</p>
                            </div>

                            <div className="flex gap-3 md:gap-4 mt-6">
                                <div className="flex flex-col gap-2 shrink-0">
                                    <label className="text-[10px] md:text-xs font-mono text-muted-foreground uppercase tracking-widest px-1">
                                        Photo
                                    </label>
                                    <div className="relative h-12 w-12 shrink-0">
                                        {previewUrl ? (
                                            <div className="group relative h-full w-full rounded-xl overflow-hidden border border-primary/30 shadow-sm shadow-primary/10">
                                                <img src={previewUrl} alt="Preview" className="h-full w-full object-cover" />
                                                <button
                                                    onClick={handleRemoveImage}
                                                    className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                                                >
                                                    <OctagonXIcon className="h-4 w-4 text-white" />
                                                </button>
                                            </div>
                                        ) : (
                                            <label className="flex flex-col items-center justify-center h-full w-full bg-secondary/5 rounded-lg cursor-pointer hover:bg-secondary/10 transition-all border border-dashed border-border group hover:border-primary/40">
                                                {isUploading ? (
                                                    <Loader2Icon className="h-4 w-4 animate-spin text-primary" />
                                                ) : (
                                                    <>
                                                        <Sparkles className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                                                        <span className="text-[7px] md:text-[8px] font-mono uppercase tracking-tighter text-muted-foreground/40 group-hover:text-primary transition-colors mt-0.5">
                                                            Optional
                                                        </span>
                                                    </>
                                                )}
                                                <input
                                                    type="file"
                                                    className="hidden"
                                                    accept="image/*"
                                                    onChange={handleImageUpload}
                                                    disabled={isUploading}
                                                />
                                            </label>
                                        )}
                                    </div>
                                </div>

                                <div className="grow flex flex-col gap-2">
                                    <div className="flex justify-between items-end px-1">
                                        <label className="text-[10px] md:text-xs font-mono text-muted-foreground uppercase tracking-widest">
                                            Echo Title
                                        </label>
                                        <span className="text-[9px] font-mono text-muted-foreground opacity-50 italic">Auto-gen if blank</span>
                                    </div>
                                    <Input
                                        placeholder="Enter a title..."
                                        className={`h-12 px-4 text-lg font-bold rounded-xl transition-all ${formData.title.length > 0 ? 'bg-primary/5 border-primary/50' : 'bg-secondary/5 border-border'}`}
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2 mt-4">
                                <div className="flex justify-between items-end px-1">
                                    <label className="text-[10px] md:text-xs font-mono text-muted-foreground uppercase tracking-widest">Memory Narrative</label>
                                    <span className={`text-[9px] font-mono ${formData.description.length < 10 ? 'text-destructive' : 'text-primary'}`}>
                                        {formData.description.length}/10 min
                                    </span>
                                </div>
                                <Textarea
                                    placeholder="I remember when..."
                                    className={`h-32 p-4 rounded-2xl leading-relaxed resize-none text-base transition-all ${formData.description.length >= 10 ? 'bg-primary/5 border-primary/50' : 'bg-secondary/5 border-border'}`}
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>

                            <div className="pt-2 space-y-3">
                                <div className="flex justify-between items-center px-1">
                                    <label className="text-[9px] md:text-[10px] font-mono text-muted-foreground uppercase tracking-widest opacity-70">Familiarity Intensity</label>
                                    <span className="text-xl md:text-2xl font-bold text-primary tabular-nums tracking-tighter">{formData.intensity.toFixed(1)}</span>
                                </div>
                                <Slider
                                    value={[formData.intensity]}
                                    min={1}
                                    max={10}
                                    step={0.1}
                                    onValueChange={(val) => setFormData({ ...formData, intensity: val[0] })}
                                />
                            </div>
                        </motion.div>
                    )}

                    {step === 2 && (
                        <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6 md:space-y-8">
                            <div className="space-y-1 md:space-y-2">
                                <h2 className="text-3xl md:text-5xl font-bold tracking-tighter">Ready to Share?</h2>
                                <p className="text-sm md:text-base text-muted-foreground">Review your transmission before sending it to the network.</p>
                            </div>

                            <div className="p-3 md:p-5 rounded-3xl md:rounded-[2.5rem] bg-card border border-border space-y-4 md:space-y-6 shadow-2xl shadow-primary/5 relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-4 opacity-10"><Sparkles className="h-16 w-16 md:h-24 md:w-24" /></div>

                                <div className="flex items-center gap-4 relative z-10">
                                    {previewUrl && (
                                        <div className="h-16 w-16 md:h-20 md:w-20 shrink-0 rounded-2xl overflow-hidden border-2 border-primary/20 shadow-lg">
                                            <img src={previewUrl} alt="Visual Fragment" className="h-full w-full object-cover" />
                                        </div>
                                    )}
                                    <div className="space-y-1 md:space-y-2 overflow-hidden">
                                        <div className="flex items-center gap-2 text-primary">
                                            <Radio className="h-4 w-4 md:h-5 md:w-5 shrink-0" />
                                            <h3 className="text-xl md:text-3xl font-bold truncate">{formData.title}</h3>
                                        </div>
                                        <div className="flex items-center gap-2 px-1">
                                            <MapPin className="h-3 w-3 text-muted-foreground shrink-0" />
                                            <p className="text-xs md:text-sm text-muted-foreground italic line-clamp-1">{formData.location}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-3 md:space-y-4 relative z-10">
                                    <div className="flex items-center justify-between p-2 md:p-4 rounded-2xl md:rounded-3xl bg-secondary/5 border border-border">
                                        <div className="flex items-center gap-3 md:gap-4">
                                            {formData.is_public ? <Globe className="text-primary h-5 w-5 md:h-6 md:w-6" /> : <ShieldCheck className="text-muted-foreground h-5 w-5 md:h-6 md:w-6" />}
                                            <span className="font-bold text-sm md:text-base">{formData.is_public ? "Public" : "Private"} Network</span>
                                        </div>
                                        <Button
                                            variant={formData.is_public ? "default" : "outline"}
                                            size="sm"
                                            className="rounded-full px-4 md:px-6 h-8 md:h-9 text-[10px] md:text-xs"
                                            onClick={() => setFormData({ ...formData, is_public: !formData.is_public })}
                                        >
                                            {formData.is_public ? "Public" : "Private"}
                                        </Button>
                                    </div>

                                    <AnimatePresence mode="wait">
                                        <motion.p
                                            key={formData.is_public ? "pub-text" : "priv-text"}
                                            initial={{ opacity: 0, y: 5 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -5 }}
                                            className="text-[10px] md:text-xs leading-relaxed text-muted-foreground px-2 italic flex items-center gap-2"
                                        >
                                            <Zap className="h-3 w-3 shrink-0" />
                                            {formData.is_public ? "Visible to everyone on the global globe." : "Stored only for you. This echo will not be broadcast."}
                                        </motion.p>
                                    </AnimatePresence>
                                </div>

                                <div className="relative group">
                                    <div className="absolute left-0 top-1/2 -translate-y-1/2"><User className="h-5 w-5 text-primary/70 group-focus-within:text-primary transition-colors" /></div>
                                    <Input
                                        placeholder="Signed by..."
                                        className="bg-transparent border-x-0 border-t-0 border-b rounded-none pl-8 pr-10 text-base md:text-lg h-10 focus-visible:ring-0 focus-visible:border-primary transition-all"
                                        value={formData.display_name}
                                        onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
                                    />
                                    <button
                                        onClick={generateAnonymousName}
                                        className="absolute right-0 top-1/2 -translate-y-1/2 p-2 hover:text-primary transition-colors text-muted-foreground"
                                        title="Randomize Identity"
                                    >
                                        <Dices className="h-5 w-5" />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {step === 3 && (
                        <motion.div key="step3" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center space-y-8 py-12">
                            <div className="relative inline-block">
                                <div className="absolute inset-0 animate-ping bg-primary/20 rounded-full" />
                                <div className="relative bg-primary p-6 rounded-full shadow-2xl shadow-primary/40">
                                    <Zap className="h-12 w-12 text-primary-foreground" />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <h2 className="text-4xl font-bold tracking-tighter">Echo Transmitted</h2>
                                <p className="text-muted-foreground max-w-xs mx-auto italic">Your memory has been etched into the network.</p>
                            </div>

                            {user?.is_anonymous ? (
                                <div className="p-6 rounded-[2.5rem] bg-card border border-primary/20 max-w-sm mx-auto space-y-6 shadow-2xl shadow-primary/5">
                                    <div className="flex items-center gap-3 text-left">
                                        <ShieldCheck className="h-10 w-10 text-primary shrink-0" />
                                        <div>
                                            <h4 className="font-bold text-sm">Memory Checkpoint</h4>
                                            <p className="text-xs text-muted-foreground">Secure this experience forever. Logged-in users never lose their echoes.</p>
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-3">
                                        <Button
                                            onClick={() => handlePreAuthRedirect("/signup")}
                                            className="w-full rounded-full bg-primary shadow-lg shadow-primary/20 hover:scale-105 transition-transform h-12"
                                        >
                                            Create Permanent Identity
                                        </Button>

                                        <Button
                                            variant="outline"
                                            onClick={() => handlePreAuthRedirect("/login")}
                                            className="w-full rounded-full h-12 border-primary/20"
                                        >
                                            <LogIn className="h-4 w-4 mr-2" />
                                            Sign In to Existing Account
                                        </Button>

                                        <Link
                                            href="/globe"
                                            className="text-xs text-muted-foreground hover:text-primary hover:bg-accent px-2 py-1 rounded-md transition-colors"
                                        >
                                            Maybe later, return to Globe
                                        </Link>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-col gap-4 items-center">
                                    <Link href="/globe" className="rounded-full px-8 py-2 text-primary-foreground bg-primary">
                                        Return to Globe
                                    </Link>
                                    <Link href="/profile" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                                        View your Archive
                                    </Link>
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>

                {step < STEPS.length - 1 && (
                    <div className="mt-4 md:mt-8 flex items-center justify-between border-t border-border/50 pt-6 md:pt-8">
                        <Button
                            variant="ghost"
                            onClick={prevStep}
                            disabled={step === 0 || isSubmitting}
                            className="text-muted-foreground hover:text-foreground transition-colors"
                        >
                            <ChevronLeft className="mr-2 h-4 w-4" /> Back
                        </Button>

                        {step < STEPS.length - 2 ? (
                            <Button
                                onClick={nextStep}
                                disabled={!isStepValid()}
                                className="rounded-full px-8 md:px-12 h-10 md:h-12 text-sm md:text-base transition-all duration-500 shadow-xl shadow-primary/10 hover:shadow-primary/20"
                            >
                                Next Step <ChevronRight className="ml-1 h-4 w-4" />
                            </Button>
                        ) : (
                            <Button
                                onClick={handleSubmit}
                                disabled={isSubmitting || !isIdentityReady}
                                className="rounded-full px-8 md:px-12 h-10 md:h-12 text-sm md:text-base transition-all duration-500 bg-primary shadow-xl shadow-primary/20 hover:shadow-primary/30"
                            >
                                {!isIdentityReady || isSubmitting ? (
                                    <><Loader2 className="h-5 w-5 animate-spin" /> Transmitting</>
                                ) : (
                                    <>Upload to Globe <Zap className="ml-2 h-4 w-4" /></>
                                )}
                            </Button>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
}