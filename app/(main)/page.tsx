import Link from "next/link";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import Threads from "@/components/shared/Threads";
import {
  Globe, Zap, Ghost, ShieldCheck,
  History, Brain, Repeat, EyeOff,
  ArrowRight, MapPin, Radio
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { HeroAnimation, ScrollReveal } from "@/components/landing/client-wrappers";
import EchoStrip from "@/components/landing/echo-strip";
import { NAV_LINKS } from "@/data";

export const revalidate = 60;

const features = [
  {
    title: "Global Sync",
    desc: "A living map of the world's collective memory. Watch new echoes surface as they happen.",
    icon: <Globe className="h-7 w-7 text-primary" />,
    accent: "bg-primary/10",
  },
  {
    title: "Zero Friction",
    desc: "No account. No setup. Log the moment before it fades — in under 30 seconds.",
    icon: <Ghost className="h-7 w-7 text-secondary" />,
    accent: "bg-secondary/10",
  },
  {
    title: "Your Archive",
    desc: "Every echo is yours. Keep it private, or broadcast it to the network.",
    icon: <ShieldCheck className="h-7 w-7 text-pink-500" />,
    accent: "bg-pink-500/10",
  },
];

const sciencePoints = [
  {
    icon: <Repeat className="w-5 h-5 text-primary" />,
    bg: "bg-primary/10",
    title: "Split Perception",
    desc: "A micro-delay in neural processing causes the brain to tag live experience as memory.",
  },
  {
    icon: <Brain className="w-5 h-5 text-secondary" />,
    bg: "bg-secondary/10",
    title: "Neural Misfire",
    desc: "The Rhinal Cortex fires familiarity signals without a retrievable source — the ghost of a memory that never was.",
  },
];

const steps = [
  {
    number: "01",
    title: "Pin your location",
    desc: "Use GPS or search any place on Earth. Your echo is anchored to a real coordinate on the globe.",
    icon: <MapPin className="h-5 w-5 text-primary" />,
  },
  {
    number: "02",
    title: "Describe the moment",
    desc: "Write what you felt. Rate the intensity from a faint flicker to an overwhelming wave.",
    icon: <Radio className="h-5 w-5 text-secondary" />,
  },
  {
    number: "03",
    title: "Watch it appear",
    desc: "Your echo surfaces on the global map as a pulsing signal — visible to everyone, instantly.",
    icon: <Globe className="h-5 w-5 text-pink-500" />,
  },
];

export async function generateMetadata(): Promise<Metadata> {
    const supabase = await createClient();
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const { count } = await supabase
        .from("echoes")
        .select("*", { count: "exact", head: true })
        .eq("is_public", true)
        .gte("created_at", since);
 
    const echoCount = count ?? 0;
    const description =
        echoCount > 0
            ? `${echoCount} déjà vu experiences logged in the last 24 hours. Pin yours on the global map.`
            : "Log your déjà vu in real time and watch it pulse on a 3D globe alongside signals from people around the world.";
 
    return {
        title: "REVA — Global Déjà Vu Mapping",
        description,
        alternates: { canonical: "/" },
        openGraph: {
            title: "REVA — Did that just happen before?",
            description,
            url: "/",
            type: "website",
            images: [{ url: "https://reva-khaki.vercel.app/og-image.png", width: 1200, height: 630 }],
        },
        twitter: {
            title: "REVA — Did that just happen before?",
            description,
            images: ["https://reva-khaki.vercel.app/og-image.png"],
        },
    };
}

export default async function LandingPage() {
  const supabase = await createClient();

  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  const [{ count: recentCount }, { count: totalCount }, { data: recentEchoes }, { data: locationData }] =
    await Promise.all([
      supabase
        .from("echoes")
        .select("*", { count: "exact", head: true })
        .eq("is_public", true)
        .gte("created_at", since),

      supabase
        .from("echoes")
        .select("*", { count: "exact", head: true })
        .eq("is_public", true),

      supabase
        .from("echoes")
        .select("id, title, description, intensity, location, display_name, created_at")
        .eq("is_public", true)
        .order("created_at", { ascending: false })
        .limit(8),

      supabase
        .from("echoes")
        .select("latitude, longitude")
        .eq("is_public", true),
    ]);

  const echoCount = recentCount ?? 0;
  const allTimeTotal = totalCount ?? 0;

  const uniqueRegions = new Set(
    (locationData ?? []).map((e) =>
      `${Math.round(e.latitude / 10)},${Math.round(e.longitude / 10)}`
    )
  ).size;

  const avgIntensity = recentEchoes && recentEchoes.length > 0
    ? (recentEchoes.reduce((s, e) => s + e.intensity, 0) / recentEchoes.length).toFixed(1)
    : null;

  return (
    <main className="min-h-screen bg-background text-foreground selection:bg-primary/30 overflow-x-hidden">

      <section className="relative flex flex-col items-center justify-center py-32 px-6 md:px-20 min-h-[95vh] border-b border-border/40 overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-25 pointer-events-none">
           <Threads
            color={[0.4, 0.2, 1.0]}
            amplitude={0.4}
            distance={0.25}
            enableMouseInteraction={false}
          />
        </div>
        <div className="absolute inset-0 -z-10 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-200 h-200 rounded-full bg-primary/8 blur-[120px]" />
        </div>

        <HeroAnimation>
          <div className="mb-10 inline-flex items-center gap-3 px-4 py-2 rounded-full bg-secondary/8 backdrop-blur-md border border-secondary/15 text-secondary">
            <span className="relative flex h-2.5 w-2.5 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-secondary" />
            </span>
            <span className="text-xs font-mono tracking-widest uppercase">
              {echoCount > 0
                ? `${echoCount} echo${echoCount === 1 ? "" : "s"} in the last 24h`
                : "Be the first echo today"
              }
            </span>
          </div>

          <h1 className="text-5xl md:text-8xl font-bold mb-6 tracking-tighter leading-[0.95] text-center">
            Did that just{" "}
            <span className="text-primary italic">happen before?</span>
          </h1>

          <p className="text-lg md:text-xl mb-12 text-muted-foreground max-w-xl mx-auto leading-relaxed text-center">
            REVA maps the world's déjà vu in real time.
            Log your moment. See where others felt it too.
          </p>

          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/echoes/new">
              <Button size="lg" className="h-14 px-8 text-base rounded-full shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all hover:scale-105 gap-2">
                Log an Echo <Zap className="h-4 w-4 fill-current" />
              </Button>
            </Link>
            <Link href="/globe">
              <Button size="lg" variant="outline" className="h-14 px-8 text-base rounded-full border-border/60 gap-2 hover:border-primary/40 transition-all">
                View Global Pulse <Globe className="h-4 w-4" />
              </Button>
            </Link>
          </div>

          <div className="mt-20 flex flex-col items-center gap-2 opacity-25">
            <div className="w-px h-12 bg-linear-to-b from-transparent to-foreground" />
            <span className="text-[10px] font-mono uppercase tracking-widest">Scroll</span>
          </div>
        </HeroAnimation>
      </section>

      <section className="py-12 px-6 md:px-20 border-b border-border/40 bg-muted/20">
        <div className="max-w-5xl mx-auto">
          <ScrollReveal>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-0 md:divide-x divide-border/50">
              {[
                { value: allTimeTotal.toLocaleString(), label: "Echoes logged" },
                { value: echoCount.toLocaleString(), label: "In the last 24h" },
                { value: `${uniqueRegions}+`, label: "Regions reached" },
                { value: avgIntensity ? `${avgIntensity} / 10` : "—", label: "Avg intensity" },
              ].map((stat) => (
                <div key={stat.label} className="text-center md:px-8 space-y-1">
                  <p className="text-3xl md:text-4xl font-bold tabular-nums tracking-tighter text-foreground">
                    {stat.value}
                  </p>
                  <p className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground/50">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </ScrollReveal>
        </div>
      </section>

      <section className="py-28 px-6 md:px-20 border-b border-border/40">
        <div className="max-w-5xl mx-auto space-y-16">
          <ScrollReveal>
            <div className="text-center space-y-3">
              <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-primary">
                How it works
              </p>
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight">
                Three steps. Thirty seconds.
              </h2>
              <p className="text-muted-foreground max-w-md mx-auto">
                Capture the moment before your brain rewrites it.
              </p>
            </div>
          </ScrollReveal>

          <div className="grid md:grid-cols-3 gap-5 relative">
            <div className="hidden md:block absolute top-8 left-[calc(16.67%+1rem)] right-[calc(16.67%+1rem)] h-px bg-border/50 z-0" />

            {steps.map((step, i) => (
              <ScrollReveal key={i} delay={i * 0.1}>
                <div className="relative z-10 flex flex-col items-center text-center p-6 rounded-3xl border border-border/50 bg-card/40 space-y-4">
                  <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-background border border-border/60 shadow-sm">
                    {step.icon}
                  </div>
                  <div className="space-y-1.5">
                    <p className="text-[10px] font-mono text-muted-foreground/40 uppercase tracking-widest">
                      {step.number}
                    </p>
                    <h3 className="font-bold text-base">{step.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {step.desc}
                    </p>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>

          <div className="flex justify-center">
            <Link href="/echoes/new">
              <Button variant="outline" className="rounded-full px-8 gap-2 border-border/60 hover:border-primary/40">
                Try it now <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="py-28 px-6 md:px-20 border-b border-border/40 bg-muted/10">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <ScrollReveal direction="left">
              <div className="space-y-8">
                <div className="space-y-3">
                  <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-primary">
                    The Phenomenon
                  </p>
                  <h2 className="text-4xl md:text-5xl font-bold tracking-tight leading-tight">
                    The science of the{" "}
                    <span className="text-secondary italic">Echo.</span>
                  </h2>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  Déjà vu is not mystical — it is a memory anomaly. A brief
                  glitch in how the brain timestamps experience. REVA turns
                  these moments into data.
                </p>
                <div className="space-y-5">
                  {sciencePoints.map((pt) => (
                    <div key={pt.title} className="flex gap-4 items-start">
                      <div className={`mt-0.5 p-2 rounded-xl h-fit shrink-0 ${pt.bg}`}>
                        {pt.icon}
                      </div>
                      <div className="space-y-0.5">
                        <h4 className="font-semibold text-sm">{pt.title}</h4>
                        <p className="text-sm text-muted-foreground leading-relaxed">{pt.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </ScrollReveal>

            <ScrollReveal direction="right" delay={0.15}>
              <div className="relative aspect-square rounded-3xl overflow-hidden border border-border/50 bg-linear-to-br from-primary/10 via-background to-secondary/10 flex items-center justify-center p-10">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_70%,hsl(var(--primary)/0.12),transparent_60%)]" />
                <div className="text-center space-y-3 relative z-10">
                  <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-muted-foreground/50">
                    French · Origin
                  </p>
                  <div className="text-5xl md:text-6xl font-serif italic text-primary leading-tight">
                    "déjà vu"
                  </div>
                  <p className="text-xs font-mono tracking-widest text-muted-foreground/40 uppercase">
                    already seen
                  </p>
                </div>
                <div className="absolute top-8 right-8 opacity-10">
                  <History className="w-10 h-10" />
                </div>
                <div className="absolute bottom-8 left-8 opacity-10">
                  <EyeOff className="w-10 h-10" />
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      <section className="py-28 px-6 md:px-20 border-b border-border/40">
        <div className="max-w-5xl mx-auto space-y-16">
          <ScrollReveal>
            <div className="text-center space-y-3">
              <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-primary">
                Built for the moment
              </p>
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight">
                Decipher the glitch.
              </h2>
              <p className="text-muted-foreground max-w-md mx-auto">
                We built REVA to be invisible until you need it. No friction. No noise.
              </p>
            </div>
          </ScrollReveal>

          <div className="grid md:grid-cols-3 gap-5">
            {features.map((feature, i) => (
              <ScrollReveal key={i} delay={i * 0.1}>
                <div className="group p-6 rounded-3xl border border-border/50 bg-card/40 hover:border-primary/25 hover:bg-card/70 transition-all duration-300 h-full space-y-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${feature.accent} group-hover:scale-110 transition-transform duration-300`}>
                    {feature.icon}
                  </div>
                  <div className="space-y-1.5">
                    <h3 className="font-bold text-base">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{feature.desc}</p>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {recentEchoes && recentEchoes.length > 0 && (
        <section className="py-28 px-6 md:px-20 border-b border-border/40 bg-muted/10">
          <div className="max-w-5xl mx-auto space-y-10">
            <ScrollReveal>
              <div className="flex items-end justify-between">
                <div className="space-y-2">
                  <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-primary">
                    Live from the network
                  </p>
                  <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
                    Recent Echoes
                  </h2>
                  <p className="text-muted-foreground text-sm">
                    Real moments, logged by real people — right now.
                  </p>
                </div>
                <Link href="/echoes" className="hidden sm:flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors font-medium shrink-0">
                  View all <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </ScrollReveal>

            <EchoStrip echoes={recentEchoes} />

            <div className="flex justify-center sm:hidden">
              <Link href="/echoes">
                <Button variant="outline" className="rounded-full gap-2">
                  View all echoes <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      )}

      <section className="py-28 px-6 md:px-20">
        <div className="max-w-2xl mx-auto text-center">
          <ScrollReveal>
            <div className="space-y-6">
              <h2 className="text-4xl md:text-6xl font-bold tracking-tighter leading-tight">
                Your next echo is{" "}
                <span className="text-primary italic">already waiting.</span>
              </h2>
              <p className="text-muted-foreground text-lg">
                {echoCount > 0
                  ? `${echoCount} people logged one today. No account required.`
                  : "Be the first to log one today. No account required."
                }
              </p>
              <div className="flex flex-wrap justify-center gap-3 pt-2">
                <Link href="/echoes/new">
                  <Button size="lg" className="h-14 px-8 text-base rounded-full shadow-lg shadow-primary/20 gap-2 hover:scale-105 transition-all">
                    Start Now <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/echoes">
                  <Button size="lg" variant="ghost" className="h-14 px-8 text-base rounded-full text-muted-foreground hover:text-foreground">
                    Browse Echoes
                  </Button>
                </Link>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      <footer className="py-10 px-6 border-t border-border/30">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground/40">
            REVA © 2026 — Global Echo Mapping
          </p>
          <div className="flex items-center gap-6">
            {NAV_LINKS.map((l) => (
              <Link key={l.href} href={l.href} className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground/40 hover:text-muted-foreground transition-colors">
                {l.name}
              </Link>
            ))}
          </div>
        </div>
      </footer>
    </main>
  );
}