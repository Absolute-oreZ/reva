"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function updateDisplayName(
    displayName: string
): Promise<{ success: boolean; message?: string }> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { success: false, message: "Not authenticated" };

    const trimmed = displayName.trim();
    if (!trimmed || trimmed.length < 2) return { success: false, message: "Display name must be at least 2 characters" };
    if (trimmed.length > 32) return { success: false, message: "Display name must be 32 characters or less" };

    const { error } = await supabase
        .from("users")
        .update({ display_name: trimmed })
        .eq("id", user.id);

    if (error) {
        console.error("[updateDisplayName]", error);
        return { success: false, message: "Failed to update display name" };
    }

    return { success: true };
}

export async function updatePassword(
    currentPassword: string,
    newPassword: string
): Promise<{ success: boolean; message?: string }> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user || !user.email) return { success: false, message: "Not authenticated" };

    const { error: verifyError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: currentPassword,
    });

    if (verifyError) return { success: false, message: "Current password is incorrect" };

    if (newPassword.length < 8) return { success: false, message: "New password must be at least 8 characters" };

    const { error } = await supabase.auth.updateUser({ password: newPassword });

    if (error) {
        console.error("[updatePassword]", error);
        return { success: false, message: error.message };
    }

    return { success: true };
}

export async function deleteAccount(): Promise<{ success: boolean; message?: string }> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { success: false, message: "Not authenticated" };

    // sign out first so the session cookie is cleared before the user row is gone
    await supabase.auth.signOut();

    const { createClient: createAdmin } = await import("@supabase/supabase-js");
    const admin = createAdmin(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { error } = await admin.auth.admin.deleteUser(user.id);

    if (error) {
        console.error("[deleteAccount]", error);
        return { success: false, message: "Failed to delete account" };
    }

    redirect("/");
}