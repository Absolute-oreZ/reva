"use client";

import { useState } from "react";
import { Trash2, Loader2, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    AlertDialog,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { deleteAccount } from "@/app/(main)/profile/action";

const CONFIRM_PHRASE = "delete my account";

export default function DangerZone() {
    const [confirmText, setConfirmText] = useState("");
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async () => {
        if (confirmText !== CONFIRM_PHRASE) return;
        setIsDeleting(true);
        try {
            await deleteAccount();
            // redirect happens server-side — no return value expected
        } catch {
            toast.error("Failed to delete account. Please try again.");
            setIsDeleting(false);
        }
    };

    return (
        <div className="rounded-3xl border border-destructive/30 bg-destructive/5 p-6 space-y-4">
            <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-destructive/15">
                    <TriangleAlert className="h-3.5 w-3.5 text-destructive" />
                </div>
                <h3 className="text-sm font-semibold text-destructive">Danger Zone</h3>
            </div>

            <p className="text-sm text-muted-foreground leading-relaxed">
                Permanently delete your account and all associated data. Your echoes will
                remain on the network but will be anonymised. This action cannot be undone.
            </p>

            <AlertDialog onOpenChange={(open) => { if (!open) setConfirmText(""); }}>
                <AlertDialogTrigger asChild>
                    <Button
                        variant="destructive"
                        className="rounded-xl h-10"
                        size="sm"
                    >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Account
                    </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete your account?</AlertDialogTitle>
                        <AlertDialogDescription className="space-y-3">
                            <span className="block">
                                This will permanently delete your account. Your echoes will remain
                                on the network but will no longer be linked to you.
                            </span>
                            <span className="block">
                                Type <span className="font-mono font-bold text-foreground">{CONFIRM_PHRASE}</span> to confirm.
                            </span>
                        </AlertDialogDescription>
                    </AlertDialogHeader>

                    <Input
                        value={confirmText}
                        onChange={(e) => setConfirmText(e.target.value)}
                        placeholder={CONFIRM_PHRASE}
                        className="rounded-xl font-mono text-sm"
                        onKeyDown={(e) => e.key === "Enter" && handleDelete()}
                    />

                    <AlertDialogFooter>
                        <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
                        <Button
                            variant="destructive"
                            onClick={handleDelete}
                            disabled={confirmText !== CONFIRM_PHRASE || isDeleting}
                            className="rounded-xl"
                        >
                            {isDeleting
                                ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Deleting</>
                                : "Delete Forever"
                            }
                        </Button>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}