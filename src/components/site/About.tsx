import { Code2, Users, Rocket, Calendar } from "lucide-react";
import { motion } from "framer-motion";

const items = [
  { icon: Code2, title: "Learn in public", body: "Workshops led by working developers. Build, ship, repeat." },
  { icon: Users, title: "Real community", body: "A growing network of engineers, students and tech leads in Kisumu." },
  { icon: Calendar, title: "Monthly cadence", body: "A mini-conference every month — talks, demos and hands-on tracks." },
  { icon: Rocket, title: "Open to all", body: "Bring your curiosity. Free to attend, free to contribute." },
];

export function About() {
  return (
    <section id="about" className="py-24 md:py-32 border-t border-border/50">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-start">
          <div>
            <div className="text-xs uppercase tracking-[0.2em] text-primary-glow mb-4">About</div>
            <h2 className="font-display text-4xl sm:text-5xl md:text-6xl font-bold leading-[1.05]">
              A tech community built around <span className="text-gradient">shipping things together</span>.
            </h2>
            <p className="mt-6 text-lg text-muted-foreground leading-relaxed">
              Zone01 Kisumu is a peer-learning tech community for software engineers, designers and curious builders. We run monthly mini-conferences and hands-on meetups focused on the craft of building — not the hype.
            </p>
            <p className="mt-4 text-muted-foreground leading-relaxed">
              No gatekeeping. No pay-walls. Just developers helping each other get sharper.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            {items.map((it, i) => (
              <motion.div
                key={it.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.5 }}
                className="rounded-2xl border border-border bg-card/50 backdrop-blur p-6 hover:border-primary/50 transition-colors"
              >
                <div className="w-10 h-10 rounded-lg bg-gradient-blue flex items-center justify-center mb-4 shadow-glow">
                  <it.icon className="w-5 h-5 text-primary-foreground" />
                </div>
                <h3 className="font-display font-semibold text-lg">{it.title}</h3>
                <p className="text-sm text-muted-foreground mt-2">{it.body}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}