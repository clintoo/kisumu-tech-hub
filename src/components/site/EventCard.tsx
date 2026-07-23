import { Calendar, MapPin, Radio, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Event } from "@/lib/events-api";
import { motion } from "framer-motion";
import { toast } from "sonner";

const categoryLabel: Record<string, string> = {
  workshop: "Workshop",
  mini_conference: "Mini Conference",
  meetup: "Meetup",
};

export function EventCard({ event, onRegister }: { event: Event; onRegister: (e: Event) => void }) {
  const isLive = event.status === "live";
  const isCompleted = event.status === "completed";
  const isCancelled = event.status === "cancelled";
  const isPostponed = event.status === "postponed";
  const date = new Date(event.date_time);

  async function handleShare() {
    const url = `${window.location.origin}/events/${event.id}`;
    const shareData = { title: event.title, text: event.description, url };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(url);
        toast.success("Event link copied to clipboard");
      }
    } catch {
      /* user cancelled */
    }
  }

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className={`group relative rounded-2xl overflow-hidden border bg-card/60 backdrop-blur shadow-card transition-all hover:-translate-y-1 ${
        isLive ? "border-primary shadow-glow" : "border-border hover:border-primary/40"
      }`}
    >
      {isLive && (
        <div className="absolute inset-0 rounded-2xl pointer-events-none border border-primary/60 animate-pulse" />
      )}
      {event.image_url ? (
        <div className="aspect-[16/9] overflow-hidden bg-secondary">
          <img src={event.image_url} alt={event.title} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        </div>
      ) : (
        <div className="aspect-[16/9] bg-gradient-hero opacity-60" />
      )}
      <div className="p-6">
        <div className="flex items-center gap-2 mb-3">
          <Badge variant="secondary" className="text-[10px] uppercase tracking-wider">
            {categoryLabel[event.category]}
          </Badge>
          {isLive && (
            <Badge className="bg-primary text-primary-foreground text-[10px] uppercase tracking-wider flex items-center gap-1">
              <Radio className="w-3 h-3" /> Live
            </Badge>
          )}
          {isCompleted && (
            <Badge variant="outline" className="text-[10px] uppercase tracking-wider">Completed</Badge>
          )}
          {event.status === "upcoming" && (
            <Badge variant="outline" className="text-[10px] uppercase tracking-wider border-primary/40 text-primary-glow">Upcoming</Badge>
          )}
          {isPostponed && (
            <Badge variant="outline" className="text-[10px] uppercase tracking-wider border-yellow-500/50 text-yellow-400">Postponed</Badge>
          )}
          {isCancelled && (
            <Badge variant="outline" className="text-[10px] uppercase tracking-wider border-destructive/60 text-destructive">Cancelled</Badge>
          )}
        </div>
        <h3 className="font-display text-xl font-bold leading-tight">{event.title}</h3>
        <p className="text-sm text-muted-foreground mt-2 line-clamp-3">{event.description}</p>

        <div className="mt-4 space-y-1.5 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-primary-glow" />
            {date.toLocaleDateString(undefined, { dateStyle: "medium" })} · {date.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })}
          </div>
          {event.location && (
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-primary-glow" />
              {event.location}
            </div>
          )}
        </div>

        <div className="mt-5 flex gap-2">
          {!isCompleted && !isCancelled && (
            <Button
              onClick={() => onRegister(event)}
              variant={isLive ? "hero" : "outline"}
              className="flex-1"
            >
              {isLive ? "Join Now" : isPostponed ? "Register (Postponed)" : "Register"}
            </Button>
          )}
          <Button
            onClick={handleShare}
            variant="outline"
            size="icon"
            aria-label="Share event"
            className={isCompleted || isCancelled ? "flex-1" : ""}
          >
            <Share2 className="w-4 h-4" />
            {(isCompleted || isCancelled) && <span className="ml-2 text-sm">Share</span>}
          </Button>
        </div>
      </div>
    </motion.article>
  );
}