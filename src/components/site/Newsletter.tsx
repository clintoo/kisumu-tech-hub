import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useServerFn } from "@tanstack/react-start";
import { subscribeNewsletter } from "@/lib/submissions.functions";
import { Mail } from "lucide-react";

const schema = z.object({ email: z.string().trim().email().max(255) });

export function Newsletter() {
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const submit = useServerFn(subscribeNewsletter);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const parsed = schema.safeParse({ email: fd.get("email") });
    if (!parsed.success) {
      toast.error("Please enter a valid email");
      return;
    }
    setSubmitting(true);
    try {
      await submit({ data: { email: parsed.data.email } });
      setDone(true);
      toast.success("Subscribed!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section id="newsletter" className="py-24 md:py-32 border-t border-border/50">
      <div className="mx-auto max-w-4xl px-5 sm:px-8">
        <div className="rounded-3xl bg-gradient-hero border border-primary/30 p-10 md:p-16 text-center shadow-glow relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,oklch(0.72_0.22_258/0.3),transparent_60%)]" />
          <div className="relative">
            <Mail className="w-10 h-10 text-primary-foreground mx-auto mb-4" />
            <h2 className="font-display text-3xl sm:text-5xl font-bold text-primary-foreground">Stay in the loop.</h2>
            <p className="mt-4 text-primary-foreground/80 max-w-xl mx-auto">
              Get updates on upcoming mini-conferences and tech meetups. One email when it matters.
            </p>
            {done ? (
              <p className="mt-8 text-primary-foreground font-medium">✓ You're subscribed.</p>
            ) : (
              <form onSubmit={onSubmit} className="mt-8 flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                <Input
                  name="email"
                  type="email"
                  required
                  placeholder="you@email.com"
                  className="bg-background/20 border-primary-foreground/30 text-primary-foreground placeholder:text-primary-foreground/60"
                />
                <Button type="submit" disabled={submitting} className="bg-background text-foreground hover:bg-background/90">
                  {submitting ? "..." : "Subscribe"}
                </Button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}