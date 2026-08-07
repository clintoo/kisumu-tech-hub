import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const statusSchema = z.object({
  event_id: z.string().uuid(),
  status: z.enum(["upcoming", "live", "completed", "postponed", "cancelled"]),
});

export const setEventStatus = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => statusSchema.parse(input))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    // Update event status
    const { error: updateErr } = await supabaseAdmin
      .from("events")
      .update({ status: data.status })
      .eq("id", data.event_id);
    if (updateErr) throw new Error(updateErr.message);

    // If marking completed, remove registrations (attendees) for that event
    if (data.status === "completed") {
      const { error: delErr } = await supabaseAdmin.from("registrations").delete().eq("event_id", data.event_id);
      if (delErr) throw new Error(delErr.message);
    }

    return { ok: true };
  });

// Reconcile past events: mark events with ends_at in the past as `completed` and
// delete their registrations. This can be called from a cron job or manually.
export const reconcilePastEvents = createServerFn({ method: "POST" }).handler(async () => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

  // Find events that ended in the past and are not completed or cancelled
  const nowIso = new Date().toISOString();
  const { data: events, error: eventsErr } = await supabaseAdmin
    .from("events")
    .select("id, ends_at, status")
    .lt("ends_at", nowIso)
    .not("status", "in", "{completed,cancelled}");
  if (eventsErr) throw new Error(eventsErr.message);
  if (!events || events.length === 0) return { ok: true, processed: 0 };

  const ids = events.map((e: any) => e.id);

  // Mark events completed
  const { error: updErr } = await supabaseAdmin.from("events").update({ status: "completed" }).in("id", ids);
  if (updErr) throw new Error(updErr.message);

  // Delete registrations for those events
  const { error: delErr } = await supabaseAdmin.from("registrations").delete().in("event_id", ids);
  if (delErr) throw new Error(delErr.message);

  return { ok: true, processed: ids.length };
});
