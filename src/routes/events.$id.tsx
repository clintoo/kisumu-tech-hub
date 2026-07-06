import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Event } from "@/lib/events-api";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RegisterDialog } from "@/components/site/RegisterDialog";
import { Calendar, MapPin, Share2, ArrowLeft, Radio } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/events/$id")({
  loader: async ({ params }) => {
    const { data, error } = await supabase
      .from("events")
      .select("*")
      .eq("id", params.id)
      .maybeSingle();
    if (error) throw error;
    if (!data) throw notFound();
    return { event: data as Event };
  },
  head: ({ loaderData }) => {
    const ev = loaderData?.event;
    if (!ev) return { meta: [{ title: "Event — Zone01 Kisumu" }] };
    const desc = ev.description.slice(0, 155);
    return {
      meta: [
        { title: `${ev.title} — Zone01 Kisumu Events` },
        { name: "description", content: desc },
        { property: "og:title", content: ev.title },
        { property: "og:description", content: desc },
        { property: "og:type", content: "article" },
        ...(ev.image_url
          ? [
              { property: "og:image", content: ev.image_url },
              { name: "twitter:image", content: ev.image_url },
              { name: "twitter:card", content: "summary_large_image" },
            ]
          : [{ name: "twitter:card", content: "summary" }]),
      ],
    };
  },
  component: EventPage,
  errorComponent: ({ error }) => (
    <div className="min-h-screen flex items-center justify-center px-4 text-center">
      <div>
        <h1 className="font-display text-2xl font-bold">Couldn't load this event</h1>
        <p className="text-muted-foreground mt-2 text-sm">{error.message}</p>
        <Link to="/" className="mt-6 inline-block text-primary-glow underline">Back home</Link>
      </div>
    </div>
  ),
  notFoundComponent: () => (
    <div className="min-h-screen flex items-center justify-center px-4 text-center">
      <div>
        <h1 className="font-display text-3xl font-bold">Event not found</h1>
        <p className="text-muted-foreground mt-2 text-sm">It may have been removed.</p>
        <Link to="/" className="mt-6 inline-block text-primary-glow underline">Browse events</Link>
      </div>
    </div>
  ),
});

function EventPage() {
  const { event } = Route.useLoaderData();
  const [open, setOpen] = useState(false);
  const date = new Date(event.date_time);
  const isLive = event.status === "live";
  const isCompleted = event.status === "completed";
  const isCancelled = event.status === "cancelled";
  const isPostponed = event.status === "postponed";

  async function handleShare() {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: event.title, text: event.description, url });
      } else {
        await navigator.clipboard.writeText(url);
        toast.success("Link copied to clipboard");
      }
    } catch {
      /* cancelled */
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="mx-auto max-w-4xl px-5 sm:px-8">
          <Link to="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6">
            <ArrowLeft className="w-4 h-4" /> All events
          </Link>
          {event.image_url && (
            <div className="aspect-[16/9] rounded-2xl overflow-hidden border border-border mb-8">
              <img src={event.image_url} alt={event.title} className="w-full h-full object-cover" />
            </div>
          )}
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <Badge variant="secondary" className="uppercase tracking-wider text-[10px]">{event.category.replace("_", " ")}</Badge>
            {isLive && <Badge className="bg-primary text-primary-foreground text-[10px] uppercase flex items-center gap-1"><Radio className="w-3 h-3" />Live</Badge>}
            {isCompleted && <Badge variant="outline" className="text-[10px] uppercase">Completed</Badge>}
            {isPostponed && <Badge variant="outline" className="text-[10px] uppercase border-yellow-500/50 text-yellow-400">Postponed</Badge>}
            {isCancelled && <Badge variant="outline" className="text-[10px] uppercase border-destructive/60 text-destructive">Cancelled</Badge>}
          </div>
          <h1 className="font-display text-4xl sm:text-5xl font-bold leading-tight">{event.title}</h1>
          <div className="mt-6 flex flex-wrap gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2"><Calendar className="w-4 h-4 text-primary-glow" />{date.toLocaleString(undefined, { dateStyle: "full", timeStyle: "short" })}</div>
            {event.location && <div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-primary-glow" />{event.location}</div>}
          </div>
          <p className="mt-8 text-lg text-foreground/90 whitespace-pre-wrap">{event.description}</p>
          <div className="mt-10 flex flex-wrap gap-3">
            {!isCompleted && !isCancelled && (
              <Button variant="hero" size="lg" onClick={() => setOpen(true)}>
                {isLive ? "Join Now" : "Register"}
              </Button>
            )}
            <Button variant="outline" size="lg" onClick={handleShare}>
              <Share2 className="w-4 h-4 mr-2" /> Share
            </Button>
          </div>
        </div>
      </main>
      <Footer />
      <RegisterDialog event={event} open={open} onOpenChange={setOpen} />
    </div>
  );
}