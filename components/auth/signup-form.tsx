"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Loader2, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldGroup, FieldLabel, FieldSeparator } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import type { User as SupabaseUser } from "@supabase/supabase-js";

export function SignUpForm({ className, ...props }: React.ComponentProps<"form">) {
    const supabase = createClient();
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    // track whether the current visitor is an anonymous user
    // this determines whether we run a conversion or a fresh signup
    const [currentUser, setCurrentUser] = useState<SupabaseUser | null>(null);
    const [isCheckingSession, setIsCheckingSession] = useState(true);

    // on mount, check if there's an existing anonymous session
    // (created by echo-wizard when the user logged an echo without signing up)
    useEffect(() => {
        const checkSession = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setCurrentUser(user);
            setIsCheckingSession(false);
        };
        checkSession();
    }, [supabase]);

    const isConverting = currentUser?.is_anonymous === true;

    const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (isConverting) {
                // ── CONVERSION PATH (Email & Password) ──────────────────────────────────────────
                // user already has an anonymous session with a real UUID.
                // updateUser() upgrades that session in-place — the UUID stays
                // the same, so all their echoes (user_id FK) remain linked.
                // Supabase will send a confirmation email before the account
                // becomes permanent.
                const { error } = await supabase.auth.updateUser({
                    email,
                    password,
                });

                if (error) throw error;

                toast.success("Almost there!", {
                    description: "Check your email and confirm your address to lock in your identity.",
                    duration: 6000,
                });
            } else {
                // ── FRESH SIGNUP PATH ─────────────────────────────────────────
                // no anonymous session — standard new account creation.
                // the users trigger in Postgres will fire and create their row.
                const { data, error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        emailRedirectTo: `${window.location.origin}/callback?next=/globe`,
                    },
                });

                if (error) throw error;

                if (data.user && data.user.identities?.length === 0) {
                    throw new Error("An account with this email already exists. Please login instead.");
                }

                toast.success("Account created!", {
                    description: "Check your inbox and confirm your email to get started.",
                    duration: 6000,
                });
            }
        } catch (error: any) {
            toast.error(error.message || "Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleGoogle = async () => {
        setLoading(true);
        try {
            if (isConverting) {
                // ── CONVERSION PATH (Google) ──────────────────────────────────
                // linkIdentity() attaches a Google identity to the existing
                // anonymous user. UUID is preserved. Echoes stay linked.
                const { error } = await supabase.auth.linkIdentity({
                    provider: "google",
                    options: {
                        redirectTo: `${window.location.origin}/callback?next=/globe`,
                    },
                });
                if (error) throw error;
            } else {
                // ── FRESH SIGNUP PATH (Google) ────────────────────────────────
                // standard OAuth signup. The users trigger fires on callback.
                const { error } = await supabase.auth.signInWithOAuth({
                    provider: "google",
                    options: {
                        redirectTo: `${window.location.origin}/callback?next=/globe`,
                    },
                });
                if (error) throw error;
            }
        } catch (error: any) {
            toast.error(error.message || "Google sign-in failed.");
            setLoading(false);
        }
    };

    if (isCheckingSession) {
        return (
            <div className="flex items-center justify-center h-40">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
        );
    }

    return (
        <form onSubmit={handleSignUp} className={cn("flex flex-col gap-6", className)} {...props}>
            <FieldGroup>
                <div className="flex flex-col items-center gap-1 text-center">
                    {isConverting ? (
                        <>
                            <div className="mb-2 flex items-center justify-center gap-2 text-primary">
                                <ShieldCheck className="h-5 w-5" />
                                <span className="text-xs font-mono uppercase tracking-widest">Memory Checkpoint</span>
                            </div>
                            <h1 className="text-2xl font-bold">Secure Your Echoes</h1>
                            <p className="text-sm text-muted-foreground text-balance">
                                Create an identity to permanently save the experiences you&apos;ve already logged.
                            </p>
                        </>
                    ) : (
                        <>
                            <h1 className="text-2xl font-bold">Create an account</h1>
                            <p className="text-sm text-muted-foreground text-balance">
                                Join REVA to save your echoes and revisit them anytime.
                            </p>
                        </>
                    )}
                </div>

                <Field>
                    <FieldLabel htmlFor="email">Email</FieldLabel>
                    <Input
                        id="email"
                        type="email"
                        placeholder="m@example.com"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </Field>
                <Field>
                    <FieldLabel htmlFor="password">Password</FieldLabel>
                    <Input
                        id="password"
                        type="password"
                        placeholder="******"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </Field>
                <Field>
                    <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : isConverting ? (
                            "Secure My Echoes"
                        ) : (
                            "Create Account"
                        )}
                    </Button>
                </Field>

                <FieldSeparator>Or continue with</FieldSeparator>

                <Field>
                    <Button
                        variant="outline"
                        type="button"
                        className="w-full"
                        onClick={handleGoogle}
                        disabled={loading}
                    >
                        {loading ? (
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="size-4 mr-2">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                            </svg>
                        )}
                        Google
                    </Button>
                    <FieldDescription className="text-center pt-2">
                        Already have an account?{" "}
                        <Link href="/login" className="underline underline-offset-4 font-medium">
                            Login
                        </Link>
                    </FieldDescription>
                </Field>
            </FieldGroup>
        </form>
    );
}