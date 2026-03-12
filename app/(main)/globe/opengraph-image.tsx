import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "REVA Global Pulse — real-time déjà vu map";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OGImage() {
    return new ImageResponse(
        (
            <div
                style={{
                    background: "#0a0a0a",
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    fontFamily: "sans-serif",
                    position: "relative",
                    overflow: "hidden",
                }}
            >
                <div
                    style={{
                        position: "absolute",
                        width: 700,
                        height: 700,
                        borderRadius: "50%",
                        background: "radial-gradient(circle, rgba(124,58,237,0.25) 0%, transparent 70%)",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                    }}
                />

                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        background: "rgba(124,58,237,0.15)",
                        border: "1px solid rgba(124,58,237,0.3)",
                        borderRadius: 999,
                        padding: "8px 20px",
                        marginBottom: 32,
                        color: "#a78bfa",
                        fontSize: 14,
                        letterSpacing: "0.15em",
                        textTransform: "uppercase",
                    }}
                >
                    ● LIVE
                </div>

                <div
                    style={{
                        fontSize: 72,
                        fontWeight: 800,
                        color: "#ffffff",
                        letterSpacing: "-0.03em",
                        marginBottom: 16,
                        textAlign: "center",
                    }}
                >
                    Global Pulse
                </div>

                <div
                    style={{
                        fontSize: 24,
                        color: "rgba(255,255,255,0.45)",
                        textAlign: "center",
                        maxWidth: 600,
                        lineHeight: 1.5,
                    }}
                >
                    Watch déjà vu experiences light up in real time
                </div>

                <div
                    style={{
                        position: "absolute",
                        bottom: 40,
                        right: 48,
                        fontSize: 18,
                        fontWeight: 700,
                        color: "rgba(255,255,255,0.25)",
                        letterSpacing: "0.1em",
                    }}
                >
                    REVA
                </div>
            </div>
        ),
        size
    );
}