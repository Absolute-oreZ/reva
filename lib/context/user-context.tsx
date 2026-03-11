"use client";

import {
    createContext,
    useContext,
    useEffect,
    useState,
    useCallback,
    type ReactNode
} from "react"
import { createClient } from "@/lib/supabase/client";
import type { User as SupabaseUser } from "@supabase/supabase-js";

export type AuthState = "loading" | "guest" | "anon" | "authenticated";

type UserContextValue = {
    user: SupabaseUser | null;
    displayName: string | null;
    authState: AuthState;
    refreshDisplayName: () => Promise<void>;
};

const UserContext = createContext<UserContextValue>({
    user: null,
    displayName: null,
    authState: "loading",
    refreshDisplayName: async () => { }
});

export function UserProvider({ children }: { children: ReactNode }) {
    const supabase = createClient();

    const [user, setUser] = useState<SupabaseUser | null>(null);
    const [displayName, setDisplayName] = useState<string | null>(null);
    const [authState, setAuthState] = useState<AuthState>("loading");

    const resolveAuthState = (u: SupabaseUser | null): AuthState => {
        if (!u) return "guest";
        if (u.is_anonymous) return "anon";
        return "authenticated";
    }

    const fetchDisplayName = useCallback(async (userId: string) => {
        const { data } = await supabase
            .from("users")
            .select("display_name")
            .eq("id", userId)
            .single();
        setDisplayName(data?.display_name ?? null);
    }, [supabase]);

    const refreshDisplayName = useCallback(async () => {
        const { data: { user: u } } = await supabase.auth.getUser();
        if (u && !u.is_anonymous) await fetchDisplayName(u.id);
    }, [supabase, fetchDisplayName])

    useEffect(() => {
        supabase.auth.getUser().then(({ data: { user: u } }) => {
            setUser(u);
            setAuthState(resolveAuthState(u));
            if (u && !u.is_anonymous) {
                fetchDisplayName(u.id)
            } else {
                setDisplayName(null);
            }
        });

        // reactive, fires on login, logout, token refresh, anon -> permenant conversion
        const { data: { subscription } } = supabase
            .auth
            .onAuthStateChange((_event, session) => {
                const u = session?.user ?? null;
                setUser(u);
                setAuthState(resolveAuthState(u));
                if (u && !u.is_anonymous) {
                    fetchDisplayName(u.id);
                } else {
                    setDisplayName(null);
                }
            })

        return () => subscription.unsubscribe();
    }, [supabase, fetchDisplayName])

    return (
        <UserContext.Provider value={{ user, displayName, authState, refreshDisplayName }}>
            {children}
        </UserContext.Provider>
    )
}

export function useUser(): UserContextValue {
    const ctx = useContext(UserContext);
    if (!ctx) throw new Error("useUser must be used within a UserProvider");
    return ctx;
}
