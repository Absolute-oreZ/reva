import Link from "next/link";
import Threads from "@/components/shared/Threads";
import { Globe, Zap, Ghost, ShieldCheck, History, Brain, Repeat, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { HeroAnimation, ScrollReveal } from "@/components/landing/client-wrappers";

const features = [
  {
    title: "Global Sync",
    desc: "Watch the map pulse as users worldwide log experiences simultaneously.",
    icon: <Globe className="h-8 w-8 text-primary" />,
  },
  {
    title: "Frictionless Capture",
    desc: "No login required. Capture the fleeting moment before it vanishes into the mundane.",
    icon: <Ghost className="h-8 w-8 text-secondary" />,
  },
  {
    title: "Personal Archive",
    desc: "You control your echoes. Keep them private, or share them with the collective.",
    icon: <ShieldCheck className="h-8 w-8 text-pink-500" />,
  }
];

export default function LandingPage() {
  const recentCount = 12;

  return (
    <main className="min-h-screen bg-background text-foreground selection:bg-primary/30 overflow-x-hidden font-sans">
      <section className="relative flex flex-col items-center justify-center py-32 px-6 md:px-20 min-h-[90vh] border-b border-border/50 overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-40 pointer-events-none">
          <Threads
            color={[0.4, 0.2, 1.0]}
            amplitude={0.6}
            distance={0.2}
            enableMouseInteraction={true}
          />
        </div>

        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_50%_50%,var(--primary),transparent_70%)] opacity-10 pointer-events-none" />

        <HeroAnimation>
          <div className="mb-8 inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-secondary/10 backdrop-blur-md border border-secondary/20 text-secondary">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-secondary"></span>
            </span>
            <span className="text-sm font-mono tracking-wide uppercase">
              {recentCount} Echoes detected in the last 24h
            </span>
          </div>

          <h1 className="text-5xl md:text-8xl font-bold mb-8 tracking-tighter leading-tight">
            Did that just <span className="text-primary italic">happen again?</span>
          </h1>

          <p className="text-xl md:text-2xl mb-12 text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            REVA is a global sensory map. Record your moments of Déjà Vu and see the world’s collective memory pulse in real-time.
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/echoes/new">
              <Button size="lg" className="h-14 px-8 text-lg rounded-full shadow-lg hover:shadow-primary/20 transition-all hover:scale-105">
                Log an Echo <Zap className="ml-2 h-5 w-5 fill-current" />
              </Button>
            </Link>
            <Link href="/globe">
              <Button size="lg" variant="outline" className="h-14 px-8 text-lg rounded-full border-2">
                View Global Pulse
              </Button>
            </Link>
          </div>
        </HeroAnimation>
      </section>

      <section id="science" className="py-24 px-6 md:px-20 bg-secondary/5 border-b border-border/50">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <ScrollReveal direction="left">
              <div>
                <h2 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight">
                  The Science <br />of the <span className="text-secondary">Echo.</span>
                </h2>
                <p className="text-lg text-muted-foreground leading-relaxed mb-6">
                  Déjà Vu isn't magic—it's a memory anomaly. At REVA, we call these moments "Echoes."
                </p>
                <div className="space-y-6">
                  <div className="flex gap-4">
                    <div className="mt-1 bg-primary/10 p-2 rounded-lg h-fit"><Repeat className="w-5 h-5 text-primary" /></div>
                    <div>
                      <h4 className="font-bold">Split Perception</h4>
                      <p className="text-sm text-muted-foreground">A micro-delay in neural paths causes the brain to "recognize" live data as memory.</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="mt-1 bg-secondary/10 p-2 rounded-lg h-fit"><Brain className="w-5 h-5 text-secondary" /></div>
                    <div>
                      <h4 className="font-bold">Neural Misfire</h4>
                      <p className="text-sm text-muted-foreground">The Rhinal Cortex triggers a feeling of familiarity without a source memory.</p>
                    </div>
                  </div>
                </div>
              </div>
            </ScrollReveal>

            <ScrollReveal direction="right" delay={0.2}>
              <div className="relative aspect-square bg-linear-to-br from-primary/20 to-secondary/20 rounded-3xl overflow-hidden border border-border/50 flex items-center justify-center p-8">
                <div className="text-center space-y-4">
                  <div className="text-6xl font-serif italic text-primary animate-pulse">"already seen"</div>
                  <p className="text-xs font-mono tracking-widest text-muted-foreground uppercase opacity-50">Translation: Déjà Vu</p>
                </div>
                <div className="absolute top-10 right-10 animate-bounce duration-3000"><History className="w-8 h-8 opacity-20" /></div>
                <div className="absolute bottom-10 left-10 animate-bounce duration-4000"><EyeOff className="w-8 h-8 opacity-20" /></div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      <section id="features" className="py-24 px-6 md:px-20 max-w-7xl mx-auto">
        <ScrollReveal>
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4 tracking-tight">Decipher the Glitch.</h2>
            <p className="text-muted-foreground text-lg italic">We provide the map. You provide the signal.</p>
          </div>
        </ScrollReveal>

        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, i) => (
            <ScrollReveal key={i} delay={i * 0.15}>
              <Card className="bg-card/50 border-none shadow-md hover:shadow-xl transition-all group backdrop-blur-sm h-full">
                <CardContent className="pt-8 px-8 pb-10">
                  <div className="mb-6 p-3 rounded-2xl bg-background w-fit group-hover:scale-110 transition-transform">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{feature.desc}</p>
                </CardContent>
              </Card>
            </ScrollReveal>
          ))}
        </div>
      </section>

      <footer className="py-12 px-6 border-t border-border/40 text-center">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground/60">
          REVA &copy; 2026 — Global Echo Mapping
        </p>
      </footer>
    </main>
  );
}