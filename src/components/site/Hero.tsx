import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroBg from "@/assets/hero-bg.jpg";

export function Hero() {
  return (
    <section id="top" className="relative overflow-hidden pt-32 pb-24 md:pt-44 md:pb-36">
      <img
        src={heroBg}
        alt=""
        width={1920}
        height={1080}
        className="absolute inset-0 w-full h-full object-cover opacity-50"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/60 to-background" />
      <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 via-transparent to-primary-glow/10 mix-blend-screen" />

      <div className="relative mx-auto max-w-7xl px-5 sm:px-8">

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="mt-6 font-display font-bold leading-[0.95] tracking-tighter text-foreground text-5xl sm:text-7xl md:text-8xl lg:text-9xl max-w-5xl"
        >
          Where Kisumu's <span className="text-gradient">code meets community</span>.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.25 }}
          className="mt-8 text-lg sm:text-xl text-muted-foreground max-w-2xl"
        >
          Zone01 Kisumu Tech Events runs the city's monthly mini-conferences, workshops and meetups — where developers ship, learn and meet face to face.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-10 flex flex-wrap gap-4"
        >
          <Button asChild variant="hero" size="lg">
            <a href="#events">View Events <ArrowRight className="ml-1" /></a>
          </Button>
          <Button asChild variant="outline" size="lg" className="border-border bg-card/40 backdrop-blur">
            <a href="#newsletter">Join the Community</a>
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl"
        >
          {[
            { k: "12+", v: "Events / year" },
            { k: "500+", v: "Developers" },
            { k: "Monthly", v: "Mini-conferences" },
            { k: "Kisumu", v: "Based" },
          ].map((s) => (
            <div key={s.v} className="border-l-2 border-primary/40 pl-4">
              <div className="font-display text-2xl sm:text-3xl font-bold text-foreground">{s.k}</div>
              <div className="text-xs sm:text-sm text-muted-foreground mt-1">{s.v}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}