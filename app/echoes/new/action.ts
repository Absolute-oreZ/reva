"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { EchoSchema } from "./schema";

export async function createEcho(rawData: unknown) {
    const SCHEMA = process.env.NEXT_PUBLIC_SUPABASE_SCHEMA!;
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