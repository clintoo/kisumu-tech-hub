import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import type { Event } from "@/lib/events-api";
import { useServerFn } from "@tanstack/react-start";
import { registerForEvent } from "@/lib/submissions.functions";
import { CheckCircle2 } from "lucide-react";

const schema = z.object({
  full_name: z.string().trim().min(2, "Name is too short").max(100),
  email: z.string().trim().email("Invalid email").max(255),
  phone: z.string().trim().min(7, "Phone is too short").max(30),
  github_url: z.string().trim().url().max(255).optional().or(z.literal("")),
  linkedin_url: z.string().trim().url().max(255).optional().or(z.literal("")),
});

export function RegisterDialog({ event, open, onOpenChange }: { event: Event | null; open: boolean; onOpenChange: (v: boolean) => void }) {
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const submit = useServerFn(registerForEvent);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!event) return;
    const fd = new FormData(e.currentTarget);
    const raw = Object.fromEntries(fd) as Record<string, string>;
    const parsed = schema.safeParse(raw);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Invalid input");
      return;
    }
    setSubmitting(true);
    try {
      await submit({
        data: {
          event_id: event.id,
          full_name: parsed.data.full_name,
          email: parsed.data.email,
          phone: parsed.data.phone,
          github_url: parsed.data.github_url || "",
          linkedin_url: parsed.data.linkedin_url || "",
        },
      });
      setDone(true);
      toast.success("You're registered! Check your email for confirmation.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setSubmitting(false);
    }
  }

  function handleOpen(v: boolean) {
    if (!v) setDone(false);
    onOpenChange(v);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogContent className="sm:max-w-md">
        {done ? (
          <div className="py-8 text-center">
            <CheckCircle2 className="w-14 h-14 text-primary mx-auto mb-4" />
            <h3 className="font-display text-2xl font-bold">You're in!</h3>
            <p className="text-muted-foreground mt-2 text-sm">We'll email you with details before {event?.title}.</p>
            <Button className="mt-6" variant="hero" onClick={() => handleOpen(false)}>Close</Button>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="font-display">Register for {event?.title}</DialogTitle>
              <DialogDescription>Reserve your spot — it's free.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="full_name">Full name</Label>
                <Input id="full_name" name="full_name" required maxLength={100} />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" required maxLength={255} />
              </div>
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" name="phone" required maxLength={30} placeholder="+254..." />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="github_url">GitHub (optional)</Label>
                  <Input id="github_url" name="github_url" placeholder="https://github.com/..." />
                </div>
                <div>
                  <Label htmlFor="linkedin_url">LinkedIn (optional)</Label>
                  <Input id="linkedin_url" name="linkedin_url" placeholder="https://linkedin.com/in/..." />
                </div>
              </div>
              <Button type="submit" variant="hero" className="w-full" disabled={submitting}>
                {submitting ? "Registering..." : "Confirm Registration"}
              </Button>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}