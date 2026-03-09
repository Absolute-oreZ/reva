"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function deleteEcho(echoId: string): Promise<{ success: boolean; message?: string }> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { success: false, message: "Not authenticated" };

    const { error } = await supabase
        .from("echoes")
        .delete()
        .eq("id", echoId)
        .eq("user_id", user.id);

    if (error) {
        console.error("[deleteEcho]", error);
        return { success: false, message: "Failed to delete echo" };
    }

    revalidatePath("/echoes");
    return { success: true };
}

export async function toggleEchoVisibility(
    echoId: string,
    currentVisibility: boolean
): Promise<{ success: boolean; newVisibility?: boolean; message?: string }> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { success: false, message: "Not authenticated" };

    const newVisibility = !currentVisibility;

    const { error } = await supabase
        .from("echoes")
        .update({ is_public: newVisibility })
        .eq("id", echoId)
        .eq("user_id", user.id);

    if (error) {
        console.error("[toggleEchoVisibility]", error);
        return { success: false, message: "Failed to update visibility" };
    }

    revalidatePath("/echoes");
    revalidatePath("/globe");
    return { success: true, newVisibility };
}