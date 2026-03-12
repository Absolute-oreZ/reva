"use client";

import { Component, type ReactNode } from "react";
import { AlertTriangle, RefreshCw, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

type Props = { children: ReactNode };
type State = { hasError: boolean; message: string };

export default class GlobeErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false, message: "" };
    }

    static getDerivedStateFromError(error: Error): State {
        return {
            hasError: true,
            message: error?.message ?? "Unknown error",
        };
    }

    componentDidCatch(error: Error) {
        console.error("[GlobeErrorBoundary]", error);
    }

    handleRetry = () => {
        this.setState({ hasError: false, message: "" });
    };

    render() {
        if (!this.state.hasError) return this.props.children;

        const isWebGL =
            this.state.message.toLowerCase().includes("webgl") ||
            this.state.message.toLowerCase().includes("three") ||
            this.state.message.toLowerCase().includes("context");

        return (
            <div className="min-h-screen bg-background flex items-center justify-center px-6">
                <div className="max-w-md w-full text-center space-y-8">

                    <div className="flex justify-center">
                        <div className="p-4 rounded-full bg-destructive/10 border border-destructive/20">
                            <AlertTriangle className="h-8 w-8 text-destructive" />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <h2 className="text-2xl font-bold tracking-tight">
                            {isWebGL ? "Globe unavailable" : "Something went wrong"}
                        </h2>
                        <p className="text-muted-foreground text-sm leading-relaxed">
                            {isWebGL
                                ? "Your browser or device doesn't support the 3D globe. Try updating your browser, enabling hardware acceleration, or switching to a different device."
                                : "The globe encountered an unexpected error. This is usually temporary."}
                        </p>
                    </div>

                    {process.env.NODE_ENV === "development" && (
                        <p className="text-[10px] font-mono text-muted-foreground/40 bg-muted/30 rounded-xl px-4 py-2 break-all">
                            {this.state.message}
                        </p>
                    )}

                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        {!isWebGL && (
                            <Button
                                onClick={this.handleRetry}
                                className="rounded-full gap-2"
                            >
                                <RefreshCw className="h-4 w-4" />
                                Try again
                            </Button>
                        )}
                        <Link href="/echoes">
                            <Button
                                variant={isWebGL ? "default" : "outline"}
                                className="rounded-full gap-2 w-full sm:w-auto"
                            >
                                <List className="h-4 w-4" />
                                Browse echoes instead
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        );
    }
}