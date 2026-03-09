"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { EchoSchema } from "./schema";

export async function createEcho(rawData: unknown) {
    const supabase = await createClient();

    const validated = EchoSchema.safeParse(rawData);

    if (!validated.success) {
        const firstErrorMessage = validated.error.issues[0]?.message || "Invalid data";

        return {
            success: false,
            message: firstErrorMessage
        };
    }

    const data = validated.data;
    const { data: { user } } = await supabase.auth.getUser();

    const { error } = await supabase
        .from("echoes")
        .insert([
            {
                ...data,
                user_id: user?.id,
                display_name: data.display_name,
            },
        ]);

    if (error) {
        console.error(error);
        return { success: false, message: "Database connection failed." };
    }

    revalidatePath("/globe");
    return { success: true };
}

export async function claimAnonEchoes(anonUserId: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    console.log("at claim anon echo");

    if (!user || user.is_anonymous) return;

    if (user.id === anonUserId) return;

    console.log("passedAnonId", anonUserId);
    console.log("login userid", user.id);

    const { data,error } = await supabase
        .from("echoes")
        .update({ user_id: user.id })
        .eq("user_id", anonUserId)
        .select("*");

    console.log("update echoes done",data);

    if (error) {
        console.error("[claimAnonEchoes] Failed to claim echoes:", error);
        return;
    }

    console.log("cleanup done");
}