import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { fetchEvents, type Event } from "@/lib/events-api";
import { EventCard } from "./EventCard";
import { RegisterDialog } from "./RegisterDialog";
import { CalendarX } from "lucide-react";

export function EventsSection() {
  const { data: events = [], isLoading } = useQuery({ queryKey: ["events"], queryFn: fetchEvents });
  const [selected, setSelected] = useState<Event | null>(null);
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState<string>("all");

  function filter(list: Event[]) {
    return category === "all" ? list : list.filter((e) => e.category === category);
  }

  const upcoming = useMemo(
    () => filter(events.filter((e) => e.status === "upcoming" || e.status === "postponed")),
    [events, category],
  );
  const live = useMemo(() => filter(events.filter((e) => e.status === "live")), [events, category]);
  const completed = useMemo(
    () => filter(events.filter((e) => e.status === "completed" || e.status === "cancelled")),
    [events, category],
  );

  function onRegister(e: Event) {
    setSelected(e);
    setOpen(true);
  }

  return (
    <section id="events" className="py-24 md:py-32 border-t border-border/50">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="flex flex-wrap items-end justify-between gap-6 mb-10">
          <div>
            <div className="text-xs uppercase tracking-[0.2em] text-primary-glow mb-3">Events</div>
            <h2 className="font-display text-4xl sm:text-5xl md:text-6xl font-bold leading-[1.05] max-w-3xl">
              What's happening at <span className="text-gradient">The Zone</span>.
            </h2>
          </div>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="w-full sm:w-56 bg-card/60 border-border">
              <SelectValue placeholder="All categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              <SelectItem value="mini_conference">Mini Conferences</SelectItem>
              <SelectItem value="workshop">Workshops</SelectItem>
              <SelectItem value="meetup">Meetups</SelectItem>
              <SelectItem value="Ttalks">Friday Tech Talks</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Tabs defaultValue={live.length ? "live" : "upcoming"}>
          <TabsList className="bg-card/60 border border-border">
            <TabsTrigger value="live">Live {live.length > 0 && <span className="ml-1.5 text-primary-glow">·{live.length}</span>}</TabsTrigger>
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
            <TabsTrigger value="past">Past</TabsTrigger>
          </TabsList>

          {[
            { value: "live", list: live, emptyMsg: "No events live right now." },
            { value: "upcoming", list: upcoming, emptyMsg: "No upcoming events yet — check back soon." },
            { value: "past", list: completed, emptyMsg: "Past events will appear here." },
          ].map((t) => (
            <TabsContent key={t.value} value={t.value} className="mt-8">
              {isLoading ? (
                <div className="text-muted-foreground text-sm">Loading events…</div>
              ) : t.list.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-border p-12 text-center text-muted-foreground">
                  <CalendarX className="w-8 h-8 mx-auto mb-3 opacity-60" />
                  {t.emptyMsg}
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {t.list.map((e) => (
                    <EventCard key={e.id} event={e} onRegister={onRegister} />
                  ))}
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </div>
      <RegisterDialog event={selected} open={open} onOpenChange={setOpen} />
    </section>
  );
}