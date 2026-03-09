"use client";

import { useState, useCallback, useTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Search, SlidersHorizontal, Globe, BookMarked,
    Zap, Loader2, Radio, X
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import EchoCard from "@/components/echoes/echo-card";
import Link from "next/link";
import type { EchoFeedItem } from "@/app/(main)/echoes/page";

type SortKey = "newest" | "oldest" | "intensity";

type Props = {
    initialPublicEchoes: EchoFeedItem[];
    initialMyEchoes: EchoFeedItem[];
    currentUserId: string | null;
    isAnon: boolean;
    pageSize: number;
};

type EchoGridProps = {
    echoes: EchoFeedItem[];
    isOwn?: boolean;
    isFiltered?: boolean;
    onDelete?: (id: string) => void;
    onToggle?: (id: string, newVisibility: boolean) => void;
};

function EchoGrid({ echoes, isOwn = false, isFiltered = false, onDelete, onToggle }: EchoGridProps) {
    return (
        <>
            <AnimatePresence>
                {echoes.length === 0 && (
                    <motion.div
                        key="empty"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex flex-col items-center justify-center py-32 gap-4 text-center"
                    >
                        <div className="p-4 rounded-full bg-muted/30 border border-border/50">
                            <Radio className="h-8 w-8 text-muted-foreground/30" />
                        </div>
                        <div className="space-y-1">
                            <p className="font-semibold text-muted-foreground">
                                {isOwn
                                    ? "No echoes logged yet"
                                    : isFiltered
                                    ? "No echoes match your filters"
                                    : "No echoes yet"}
                            </p>
                            <p className="text-sm text-muted-foreground/50">
                                {isOwn
                                    ? "Your logged echoes will appear here."
                                    : isFiltered
                                    ? "Try adjusting your filters."
                                    : "Be the first to log an experience."}
                            </p>
                            {isOwn && (
                                <Link href="/echoes/new">
                                    <Button variant="outline" className="rounded-full mt-4">
                                        Log your first Echo
                                    </Button>
                                </Link>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {echoes.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {echoes.map((echo, i) => (
                        <EchoCard key={echo.id} echo={echo} index={i} isOwn={isOwn} onDelete={onDelete} onToggle={onToggle} />
                    ))}
                </div>
            )}
        </>
    );
}

export default function EchoesFeed({
    initialPublicEchoes,
    initialMyEchoes,
    currentUserId,
    isAnon,
    pageSize,
}: Props) {
    const supabase = createClient();

    const [publicEchoes, setPublicEchoes] = useState<EchoFeedItem[]>(initialPublicEchoes);
    const [publicOffset, setPublicOffset] = useState(pageSize);
    const [hasMorePublic, setHasMorePublic] = useState(initialPublicEchoes.length === pageSize);
    const [myEchoes, setMyEchoes] = useState<EchoFeedItem[]>(initialMyEchoes);

    const [search, setSearch] = useState("");
    const [sort, setSort] = useState<SortKey>("newest");
    const [intensityRange, setIntensityRange] = useState<[number, number]>([1, 10]);
    const [filterOpen, setFilterOpen] = useState(false);

    const [isPending, startTransition] = useTransition();

    const handleDelete = useCallback((id: string) => {
        setPublicEchoes((prev) => prev.filter((e) => e.id !== id));
        setMyEchoes((prev) => prev.filter((e) => e.id !== id));
    }, []);

    const handleToggle = useCallback((id: string, newVisibility: boolean) => {
        setMyEchoes((prev) =>
            prev.map((e) => e.id === id ? { ...e, is_public: newVisibility } : e)
        );
        if (!newVisibility) {
            setPublicEchoes((prev) => prev.filter((e) => e.id !== id));
        }
    }, []);

    const loadMore = useCallback(() => {
        startTransition(async () => {
            const { data } = await supabase
                .from("echoes")
                .select("id, title, description, intensity, location, latitude, longitude, display_name, image_url, is_public, created_at, user_id")
                .eq("is_public", true)
                .order("created_at", { ascending: false })
                .range(publicOffset, publicOffset + pageSize - 1);

            if (data) {
                setPublicEchoes((prev) => [...prev, ...(data as EchoFeedItem[])]);
                setPublicOffset((prev) => prev + pageSize);
                if (data.length < pageSize) setHasMorePublic(false);
            }
        });
    }, [supabase, publicOffset, pageSize]);

    // client side filtering + soring
    const applyFilters = (echoes: EchoFeedItem[]): EchoFeedItem[] => {
        let result = [...echoes];

        if (search.trim()) {
            const q = search.toLowerCase();
            result = result.filter(
                (e) =>
                    e.title.toLowerCase().includes(q) ||
                    e.location.toLowerCase().includes(q)
            );
        }

        result = result.filter(
            (e) => e.intensity >= intensityRange[0] && e.intensity <= intensityRange[1]
        );

        if (sort === "newest") {
            result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        } else if (sort === "oldest") {
            result.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
        } else if (sort === "intensity") {
            result.sort((a, b) => b.intensity - a.intensity);
        }

        return result;
    };

    const displayedPublic = applyFilters(publicEchoes);
    const displayedMine = applyFilters(myEchoes);

    const isFiltered =
        search.trim() !== "" ||
        sort !== "newest" ||
        intensityRange[0] > 1 ||
        intensityRange[1] < 10;

    const activeFilterCount = [
        search.trim() !== "",
        sort !== "newest",
        intensityRange[0] > 1 || intensityRange[1] < 10,
    ].filter(Boolean).length;

    const resetFilters = () => {
        setSearch("");
        setSort("newest");
        setIntensityRange([1, 10]);
    };

    const FilterControls = () => (
        <div className="space-y-6 px-3">
            <div className="space-y-2">
                <label className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
                    Sort by
                </label>
                <Select value={sort} onValueChange={(v) => setSort(v as SortKey)}>
                    <SelectTrigger className="rounded-xl h-10">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="newest">Newest first</SelectItem>
                        <SelectItem value="oldest">Oldest first</SelectItem>
                        <SelectItem value="intensity">Highest intensity</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <Separator />

            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <label className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
                        Intensity range
                    </label>
                    <div className="flex items-center gap-1 text-primary text-xs font-bold font-mono">
                        <Zap className="h-3 w-3" />
                        {intensityRange[0]} – {intensityRange[1]}
                    </div>
                </div>
                <Slider
                    min={1}
                    max={10}
                    step={1}
                    value={intensityRange}
                    onValueChange={(v) => setIntensityRange(v as [number, number])}
                    className="w-full"
                />
                <div className="flex justify-between text-[10px] font-mono text-muted-foreground/40">
                    <span>1 Faint</span>
                    <span>5 Strong</span>
                    <span>10 Max</span>
                </div>
            </div>

            {isFiltered && (
                <>
                    <Separator />
                    <button
                        onClick={resetFilters}
                        className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                    >
                        <X className="h-3 w-3" />
                        Reset all filters
                    </button>
                </>
            )}
        </div>
    );

    return (
        <main className="min-h-screen bg-background pt-28 pb-20 px-4 md:px-8">
            <div className="max-w-6xl mx-auto space-y-8">

                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div className="space-y-1">
                        <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-primary">
                            Signal Archive
                        </p>
                        <h1 className="text-4xl md:text-6xl font-bold tracking-tighter">
                            Echoes
                        </h1>
                        <p className="text-muted-foreground text-sm md:text-base">
                            Moments of déjà vu, logged across the world.
                        </p>
                    </div>
                    <Link href="/echoes/new">
                        <Button className="rounded-full px-6 h-11 shadow-lg shadow-primary/20">
                            <Zap className="h-4 w-4 mr-2 fill-current" />
                            Log an Echo
                        </Button>
                    </Link>
                </div>

                <Tabs defaultValue="global" className="space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3">

                        <TabsList className="rounded-2xl p-1 h-auto w-fit">
                            <TabsTrigger value="global" className="rounded-xl gap-2 px-5 py-2">
                                <Globe className="h-4 w-4" />
                                Global Feed
                            </TabsTrigger>
                            {!isAnon && currentUserId && (
                                <TabsTrigger value="mine" className="rounded-xl gap-2 px-5 py-2">
                                    <BookMarked className="h-4 w-4" />
                                    My Echoes
                                    {initialMyEchoes.length > 0 && (
                                        <Badge variant="secondary" className="ml-1 text-[10px] font-mono px-1.5">
                                            {initialMyEchoes.length}
                                        </Badge>
                                    )}
                                </TabsTrigger>
                            )}
                        </TabsList>

                        <div className="flex gap-2 grow">
                            <div className="relative grow">
                                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/40" />
                                <Input
                                    placeholder="Search title or location..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="pl-10 h-10 rounded-xl bg-muted/30 border-border/50"
                                />
                                {search && (
                                    <button
                                        onClick={() => setSearch("")}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/50 hover:text-foreground transition-colors"
                                    >
                                        <X className="h-3.5 w-3.5" />
                                    </button>
                                )}
                            </div>

                            <div className="hidden sm:block">
                                <Select value={sort} onValueChange={(v) => setSort(v as SortKey)}>
                                    <SelectTrigger className="w-40 h-10 rounded-xl">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="newest">Newest first</SelectItem>
                                        <SelectItem value="oldest">Oldest first</SelectItem>
                                        <SelectItem value="intensity">Highest intensity</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <Sheet open={filterOpen} onOpenChange={setFilterOpen}>
                                <SheetTrigger asChild>
                                    <Button
                                        variant={activeFilterCount > 0 ? "default" : "outline"}
                                        size="icon"
                                        className="h-10 w-10 rounded-xl shrink-0 relative"
                                    >
                                        <SlidersHorizontal className="h-4 w-4" />
                                        {activeFilterCount > 0 && (
                                            <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary text-primary-foreground text-[9px] font-bold flex items-center justify-center">
                                                {activeFilterCount}
                                            </span>
                                        )}
                                    </Button>
                                </SheetTrigger>
                                <SheetContent side="right" className="w-80">
                                    <SheetHeader className="mb-6">
                                        <SheetTitle className="font-mono text-sm uppercase tracking-widest">
                                            Filter Echoes
                                        </SheetTitle>
                                    </SheetHeader>
                                    <FilterControls />
                                </SheetContent>
                            </Sheet>
                        </div>
                    </div>

                    <AnimatePresence>
                        {isFiltered && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                className="flex flex-wrap gap-2"
                            >
                                {search && (
                                    <Badge variant="secondary" className="gap-1.5 pl-3 pr-2 py-1 rounded-full">
                                        Search: {search}
                                        <button onClick={() => setSearch("")}>
                                            <X className="h-3 w-3" />
                                        </button>
                                    </Badge>
                                )}
                                {sort !== "newest" && (
                                    <Badge variant="secondary" className="gap-1.5 pl-3 pr-2 py-1 rounded-full">
                                        {sort === "oldest" ? "Oldest first" : "Highest intensity"}
                                        <button onClick={() => setSort("newest")}>
                                            <X className="h-3 w-3" />
                                        </button>
                                    </Badge>
                                )}
                                {(intensityRange[0] > 1 || intensityRange[1] < 10) && (
                                    <Badge variant="secondary" className="gap-1.5 pl-3 pr-2 py-1 rounded-full">
                                        Intensity {intensityRange[0]}–{intensityRange[1]}
                                        <button onClick={() => setIntensityRange([1, 10])}>
                                            <X className="h-3 w-3" />
                                        </button>
                                    </Badge>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <TabsContent value="global" className="space-y-6 mt-0">
                        <p className="text-[11px] font-mono text-muted-foreground/40 uppercase tracking-widest">
                            {displayedPublic.length} {displayedPublic.length === 1 ? "echo" : "echoes"}
                            {isFiltered && " · filtered"}
                        </p>

                        <EchoGrid echoes={displayedPublic} isFiltered={isFiltered} onDelete={handleDelete} onToggle={handleToggle} />

                        {hasMorePublic && !isFiltered && (
                            <div className="flex justify-center pt-4">
                                <Button
                                    variant="outline"
                                    onClick={loadMore}
                                    disabled={isPending}
                                    className="rounded-full px-8 h-11"
                                >
                                    {isPending
                                        ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Loading</>
                                        : "Load more echoes"
                                    }
                                </Button>
                            </div>
                        )}
                    </TabsContent>

                    {!isAnon && currentUserId && (
                        <TabsContent value="mine" className="space-y-6 mt-0">
                            <p className="text-[11px] font-mono text-muted-foreground/40 uppercase tracking-widest">
                                {displayedMine.length} {displayedMine.length === 1 ? "echo" : "echoes"}
                                {isFiltered && " · filtered"}
                            </p>
                            <EchoGrid echoes={displayedMine} isOwn isFiltered={isFiltered} onDelete={handleDelete} onToggle={handleToggle} />
                        </TabsContent>
                    )}
                </Tabs>

                {isAnon && (
                    <div className="mt-8 p-5 rounded-3xl border border-primary/20 bg-primary/5 flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
                        <div className="p-3 rounded-2xl bg-primary/10 shrink-0">
                            <BookMarked className="h-5 w-5 text-primary" />
                        </div>
                        <div className="grow space-y-1">
                            <p className="font-semibold text-sm">Want to see your own echoes?</p>
                            <p className="text-xs text-muted-foreground">
                                Create a permanent account to access your personal archive.
                            </p>
                        </div>
                        <Link href="/signup" className="shrink-0">
                            <Button size="sm" className="rounded-full px-5">
                                Create Account
                            </Button>
                        </Link>
                    </div>
                )}
            </div>
        </main>
    );
}