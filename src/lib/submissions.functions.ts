import { createServerFn } from "@tanstack/react-start";
import { getRequestIP, getRequestHeader } from "@tanstack/react-start/server";
import { z } from "zod";

const newsletterSchema = z.object({
  email: z.string().trim().toLowerCase().email().max(255),
});

const registrationSchema = z.object({
  event_id: z.string().uuid(),
  full_name: z.string().trim().min(2).max(100),
  email: z.string().trim().toLowerCase().email().max(255),
  phone: z.string().trim().min(7).max(30),
  github_url: z.string().trim().url().max(255).optional().or(z.literal("")),
  linkedin_url: z.string().trim().url().max(255).optional().or(z.literal("")),
});

function clientIp(): string {
  return (
    getRequestIP({ xForwardedFor: true }) ||
    getRequestHeader("cf-connecting-ip") ||
    getRequestHeader("x-real-ip") ||
    "unknown"
  );
}

async function enforceLimit(bucket: string, max: number, windowSeconds: number) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin.rpc("check_rate_limit", {
    _bucket: bucket,
    _max: max,
    _window: `${windowSeconds} seconds`,
  });
  if (error) throw new Error("Rate limit check failed");
  if (!data) throw new Error("Too many requests. Please try again in a few minutes.");
}

export const subscribeNewsletter = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => newsletterSchema.parse(input))
  .handler(async ({ data }) => {
    const ip = clientIp();
    await enforceLimit(`newsletter:ip:${ip}`, 5, 60 * 60);
    await enforceLimit(`newsletter:email:${data.email}`, 3, 24 * 60 * 60);

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("newsletter_subscribers")
      .insert({ email: data.email });
    if (error && !/duplicate|unique/i.test(error.message)) {
      throw new Error(error.message);
    }
    return { ok: true };
  });

export const registerForEvent = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => registrationSchema.parse(input))
  .handler(async ({ data }) => {
    const ip = clientIp();
    await enforceLimit(`register:ip:${ip}`, 10, 60 * 60);
    await enforceLimit(`register:email:${data.email}`, 5, 60 * 60);

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: event, error: eventErr } = await supabaseAdmin
      .from("events")
      .select("id, title, description, location, date_time, ends_at, status")
      .eq("id", data.event_id)
      .maybeSingle();
    if (eventErr) throw new Error(eventErr.message);
    if (!event) throw new Error("Event not found");
    if (event.status === "cancelled") throw new Error("This event has been cancelled.");
    if (event.status === "completed") throw new Error("This event has ended.");

    const { error } = await supabaseAdmin.from("registrations").insert({
      event_id: data.event_id,
      full_name: data.full_name,
      email: data.email,
      phone: data.phone,
      github_url: data.github_url || null,
      linkedin_url: data.linkedin_url || null,
    });
    if (error) {
      if ((error as { code?: string }).code === "23505" || /duplicate|unique/i.test(error.message)) {
        throw new Error("This email is already registered for this event.");
      }
      throw new Error(error.message);
    }

    // TODO: send confirmation email with calendar invite once sender domain is verified.
    return { ok: true };
  });