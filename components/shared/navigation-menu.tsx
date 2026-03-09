"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, LogIn, LogOut, ShieldCheck, UserCircle2 } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import type { User as SupabaseUser } from "@supabase/supabase-js";

const NAV_LINKS = [
    { name: "Home", href: "/" },
    { name: "Echoes", href: "/echoes" },
    { name: "Global Pulse", href: "/globe" },
];

type AuthState = "loading" | "anon" | "authenticated" | "guest";

const NavigationMenu = () => {
    const [isOpen, setIsOpen] = useState(false);
    const pathname = usePathname();
    const router = useRouter();
    const supabase = createClient();

    const [authState, setAuthState] = useState<AuthState>("loading");
    const [user, setUser] = useState<SupabaseUser | null>(null);

    useEffect(() => {
        const resolveAuthState = (u: SupabaseUser | null): AuthState => {
            if (!u) return "guest";
            if (u.is_anonymous) return "anon";
            return "authenticated";
        };

        supabase.auth.getUser().then(({ data: { user: u } }) => {
            setUser(u);
            setAuthState(resolveAuthState(u));
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            const u = session?.user ?? null;
            setUser(u);
            setAuthState(resolveAuthState(u));
        });

        return () => subscription.unsubscribe();
    }, [supabase]);

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        router.push("/");
        router.refresh();
    };

    const renderDesktopAuthAction = () => {
        switch (authState) {
            case "loading":
                return (
                    <div className="hidden md:flex h-12 w-24 rounded-full bg-muted/40 animate-pulse" />
                );

            case "guest":
                return (
                    <Link
                        href="/login"
                        className="hidden md:flex items-center gap-2 px-6 py-3 rounded-full shadow-lg shadow-primary/20 transition-all active:scale-95 group"
                    >
                        <LogIn size={18} className="group-hover:translate-x-0.5 transition-transform" />
                        <span>Login</span>
                    </Link>
                );

            case "anon":
                return (
                    <Link
                        href="/signup"
                        className="hidden md:flex items-center gap-2 px-5 py-2.5 rounded-full bg-secondary/10 border border-secondary/30 text-secondary text-sm font-medium shadow-sm transition-all hover:bg-secondary/20 active:scale-95 group"
                    >
                        <ShieldCheck size={16} className="shrink-0" />
                        <span>Save Account</span>
                    </Link>
                );

            case "authenticated":
                return (
                    <div className="hidden md:flex items-center gap-2">
                        <Link
                            href="/profile"
                            className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium transition-all hover:bg-primary/20"
                        >
                            <UserCircle2 size={16} />
                            <span className="max-w-30 truncate font-mono text-xs">
                                {user?.email?.split("@")[0] ?? "Profile"}
                            </span>
                        </Link>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={handleSignOut}
                            className="rounded-full h-9 w-9 text-muted-foreground hover:text-foreground"
                            title="Sign out"
                        >
                            <LogOut size={16} />
                        </Button>
                    </div>
                );
        }
    };

    const renderMobileAuthAction = () => {
        switch (authState) {
            case "guest":
                return (
                    <Link
                        href="/login"
                        onClick={() => setIsOpen(false)}
                        className="mt-2 py-4 w-full flex items-center justify-center bg-secondary rounded-2xl font-bold shadow-lg shadow-primary/10 transition-transform active:scale-95"
                    >
                        <LogIn size={20} className="mr-2" />
                        Login to REVA
                    </Link>
                );

            case "anon":
                return (
                    <Link
                        href="/signup"
                        onClick={() => setIsOpen(false)}
                        className="mt-2 py-4 w-full flex items-center justify-center bg-secondary/20 border border-secondary/30 text-secondary rounded-2xl font-bold transition-transform active:scale-95"
                    >
                        <ShieldCheck size={20} className="mr-2" />
                        Save Your Echoes
                    </Link>
                );

            case "authenticated":
                return (
                    <div className="mt-2 flex flex-col gap-2">
                        <Link
                            href="/profile"
                            onClick={() => setIsOpen(false)}
                            className="py-4 w-full flex items-center justify-center bg-primary/10 text-primary rounded-2xl font-semibold transition-transform active:scale-95"
                        >
                            <UserCircle2 size={20} className="mr-2" />
                            My Profile
                        </Link>
                        <button
                            onClick={() => { setIsOpen(false); handleSignOut(); }}
                            className="py-3 w-full flex items-center justify-center text-muted-foreground rounded-2xl font-medium text-sm transition-colors hover:text-foreground"
                        >
                            <LogOut size={16} className="mr-2" />
                            Sign Out
                        </button>
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <header>
            <nav className="fixed top-6 left-0 right-0 z-50 px-4">
                <div className="max-w-7xl mx-auto flex items-center justify-between relative">

                    <Link
                        href="/"
                        className="flex items-center gap-2 px-4 py-2 bg-background/90 backdrop-blur-md rounded-full shadow-lg transition-transform hover:scale-105 cursor-pointer"
                    >
                        <Image
                            src="/icons/logo.png"
                            alt="logo"
                            width={0}
                            height={0}
                            sizes="28px"
                            className="w-7 h-7"
                        />
                        <span className="font-bold text-foreground text-lg tracking-tighter">REVA</span>
                    </Link>

                    <div className="hidden md:flex items-center bg-background/80 backdrop-blur-md px-2 py-2 rounded-full shadow-lg relative">
                        <ul className="flex items-center space-x-1 relative">
                            {NAV_LINKS.map((link) => {
                                const isActive = pathname === link.href || pathname.startsWith(link.href + "/");
                                return (
                                    <li key={link.name} className="relative">
                                        <Link
                                            href={link.href}
                                            className={cn(
                                                "relative px-6 py-2 rounded-full text-sm font-medium transition-colors duration-300 z-10 block",
                                                isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
                                            )}
                                        >
                                            {link.name}
                                            {isActive && (
                                                <motion.div
                                                    layoutId="active-pill"
                                                    className="absolute inset-0 bg-primary/10 rounded-full -z-10"
                                                    transition={{ type: "spring", bounce: 0.25, duration: 0.5 }}
                                                />
                                            )}
                                        </Link>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>

                    <div className="flex items-center gap-2">
                        {renderDesktopAuthAction()}

                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => setIsOpen(!isOpen)}
                            className="md:hidden w-12 h-12 flex items-center justify-center bg-background rounded-full shadow-lg border-2 border-primary/20 text-foreground transition-transform active:scale-90"
                        >
                            {isOpen ? <X size={24} /> : <Menu size={24} />}
                        </Button>
                    </div>
                </div>

                <AnimatePresence>
                    {isOpen && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 10 }}
                            className="absolute top-20 left-4 right-4 bg-background rounded-3xl shadow-2xl border border-border p-4 flex flex-col gap-2 md:hidden overflow-hidden"
                        >
                            <div className="flex flex-col gap-1">
                                {NAV_LINKS.map((link) => {
                                    const isActive = pathname === link.href;
                                    return (
                                        <Link
                                            key={link.name}
                                            href={link.href}
                                            onClick={() => setIsOpen(false)}
                                            className={cn(
                                                "w-full py-4 text-center rounded-2xl font-semibold transition-colors",
                                                isActive
                                                    ? "bg-primary/10 text-primary"
                                                    : "text-muted-foreground hover:bg-muted"
                                            )}
                                        >
                                            {link.name}
                                        </Link>
                                    );
                                })}
                            </div>

                            {renderMobileAuthAction()}
                        </motion.div>
                    )}
                </AnimatePresence>
            </nav>
        </header>
    );
};

export default NavigationMenu;