"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { User, KeyRound, Check, Loader2, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
    updateDisplayName,
    updatePassword,
} from "@/app/(main)/profile/action";

type Props = {
    initialDisplayName: string;
    hasPassword: boolean; // false for OAuth-only users
};

type FieldState = "idle" | "loading" | "success";

export default function ProfileForm({ initialDisplayName, hasPassword }: Props) {
    const [displayName, setDisplayName] = useState(initialDisplayName);
    const [nameState, setNameState] = useState<FieldState>("idle");

    const handleNameSave = async () => {
        if (displayName.trim() === initialDisplayName) return;
        setNameState("loading");
        const result = await updateDisplayName(displayName);
        if (result.success) {
            setNameState("success");
            toast.success("Display name updated");
            setTimeout(() => setNameState("idle"), 2000);
        } else {
            setNameState("idle");
            toast.error(result.message ?? "Failed to update");
        }
    };



    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [passwordState, setPasswordState] = useState<FieldState>("idle");

    const handlePasswordSave = async () => {
        if (!currentPassword || !newPassword) return;
        setPasswordState("loading");
        const result = await updatePassword(currentPassword, newPassword);
        if (result.success) {
            setPasswordState("success");
            setCurrentPassword("");
            setNewPassword("");
            toast.success("Password updated");
            setTimeout(() => setPasswordState("idle"), 2000);
        } else {
            setPasswordState("idle");
            toast.error(result.message ?? "Failed to update password");
        }
    };

    return (
        <div className="space-y-8">

            <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="space-y-4"
            >
                <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-violet-500/10">
                        <User className="h-3.5 w-3.5 text-violet-400" />
                    </div>
                    <h3 className="text-sm font-semibold">Display Name</h3>
                </div>

                <div className="flex gap-2">
                    <Input
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        maxLength={32}
                        placeholder="Your display name"
                        className="rounded-xl h-10"
                        onKeyDown={(e) => e.key === "Enter" && handleNameSave()}
                    />
                    <Button
                        onClick={handleNameSave}
                        disabled={nameState === "loading" || displayName.trim() === initialDisplayName}
                        className="rounded-xl h-10 px-4 shrink-0"
                        variant={nameState === "success" ? "outline" : "default"}
                    >
                        {nameState === "loading" && <Loader2 className="h-4 w-4 animate-spin" />}
                        {nameState === "success" && <Check className="h-4 w-4 text-emerald-500" />}
                        {nameState === "idle" && "Save"}
                    </Button>
                </div>
                <p className="text-[11px] text-muted-foreground/50 font-mono">
                    {displayName.length} / 32 characters
                </p>
            </motion.div>


            <Separator />

            {hasPassword && (
                <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="space-y-4"
                >
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-amber-500/10">
                            <KeyRound className="h-3.5 w-3.5 text-amber-400" />
                        </div>
                        <h3 className="text-sm font-semibold">Password</h3>
                    </div>

                    <div className="space-y-2">
                        <div className="space-y-1">
                            <Label className="text-xs text-muted-foreground">Current password</Label>
                            <div className="relative">
                                <Input
                                    type={showCurrent ? "text" : "password"}
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="rounded-xl h-10 pr-10"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowCurrent(!showCurrent)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/50 hover:text-foreground transition-colors"
                                >
                                    {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                        </div>

                        <div className="space-y-1">
                            <Label className="text-xs text-muted-foreground">New password</Label>
                            <div className="relative">
                                <Input
                                    type={showNew ? "text" : "password"}
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    placeholder="Min. 8 characters"
                                    className="rounded-xl h-10 pr-10"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowNew(!showNew)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/50 hover:text-foreground transition-colors"
                                >
                                    {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                        </div>
                    </div>

                    {newPassword.length > 0 && (
                        <div className="space-y-1">
                            <div className="flex gap-1">
                                {[...Array(4)].map((_, i) => {
                                    const strength = Math.min(Math.floor(newPassword.length / 3), 4);
                                    const colors = ["bg-red-500", "bg-amber-500", "bg-yellow-500", "bg-emerald-500"];
                                    return (
                                        <div
                                            key={i}
                                            className={`h-1 flex-1 rounded-full transition-colors ${
                                                i < strength ? colors[strength - 1] : "bg-muted"
                                            }`}
                                        />
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    <Button
                        onClick={handlePasswordSave}
                        disabled={passwordState === "loading" || !currentPassword || !newPassword}
                        className="rounded-xl h-10 w-full"
                        variant={passwordState === "success" ? "outline" : "default"}
                    >
                        {passwordState === "loading" && <><Loader2 className="h-4 w-4 animate-spin mr-2" />Updating</>}
                        {passwordState === "success" && <><Check className="h-4 w-4 text-emerald-500 mr-2" />Updated</>}
                        {passwordState === "idle" && "Update Password"}
                    </Button>
                </motion.div>
            )}
        </div>
    );
}