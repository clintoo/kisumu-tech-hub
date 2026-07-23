import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Pencil, Trash2, Plus, LogOut, Calendar, Users, Image as ImageIcon, Upload, Share2 } from "lucide-react";
import { fetchEvents, fetchGallery, type Event, type GalleryImage } from "@/lib/events-api";

const STATUS_OPTIONS: Array<{ value: Event["status"]; label: string }> = [
  { value: "upcoming", label: "Upcoming" },
  { value: "live", label: "Live" },
  { value: "completed", label: "Completed" },
  { value: "postponed", label: "Postponed" },
  { value: "cancelled", label: "Cancelled" },
];

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [{ title: "Admin — Zone01 Kisumu Events" }, { name: "robots", content: "noindex" }],
  }),
  component: AdminPage,
});

function AdminPage() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { user, isAdmin, loading } = useAuth();
  const { data: events = [] } = useQuery({ queryKey: ["events"], queryFn: fetchEvents });
  const { data: galleryImages = [] } = useQuery({ queryKey: ["gallery"], queryFn: fetchGallery });
  const [editing, setEditing] = useState<Event | null>(null);
  const [open, setOpen] = useState(false);
  const [editingGallery, setEditingGallery] = useState<GalleryImage | null>(null);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const {
    data: adminDebug,
    isLoading: adminDebugLoading,
    error: adminDebugError,
    refetch: refetchAdminDebug,
  } = useQuery({
    queryKey: ["admin-debug", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const [roleRes, eventsRes, galleryRes, registrationsRes] = await Promise.all([
        supabase.from("user_roles").select("role").eq("user_id", user!.id).maybeSingle(),
        supabase.from("events").select("id", { head: true, count: "exact" }),
        supabase.from("gallery_images").select("id", { head: true, count: "exact" }),
        supabase.from("registrations").select("id", { head: true, count: "exact" }),
      ]);

      return {
        userId: user!.id,
        email: user!.email ?? null,
        role: roleRes.data?.role ?? null,
        roleError: roleRes.error?.message ?? null,
        checks: {
          events: eventsRes.error
            ? `error: ${eventsRes.error.message}`
            : `ok (${eventsRes.count ?? 0})`,
          gallery: galleryRes.error
            ? `error: ${galleryRes.error.message}`
            : `ok (${galleryRes.count ?? 0})`,
          registrations: registrationsRes.error
            ? `error: ${registrationsRes.error.message}`
            : `ok (${registrationsRes.count ?? 0})`,
        },
      };
    },
  });

  useEffect(() => {
    if (!loading && user && !isAdmin) {
      toast.error("You don't have admin access.");
    }
  }, [loading, user, isAdmin]);

  async function handleSignOut() {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/", replace: true });
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this event?")) return;
    const { error } = await supabase.from("events").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Deleted");
    qc.invalidateQueries({ queryKey: ["events"] });
  }

  async function setEventStatus(ev: Event, next: Event["status"]) {
    if (next === ev.status) return;
    const { error } = await supabase.from("events").update({ status: next }).eq("id", ev.id);
    if (error) return toast.error(error.message);
    toast.success(`Status set to ${next}`);
    qc.invalidateQueries({ queryKey: ["events"] });
  }

  async function shareEvent(ev: Event) {
    const url = `${window.location.origin}/events/${ev.id}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: ev.title, url });
      } else {
        await navigator.clipboard.writeText(url);
        toast.success("Link copied");
      }
    } catch { /* cancelled */ }
  }

  async function handleDeleteGalleryImage(id: string) {
    if (!confirm("Delete this gallery image?")) return;
    const { error } = await supabase.from("gallery_images").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Gallery image deleted");
    qc.invalidateQueries({ queryKey: ["gallery"] });
  }

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center text-muted-foreground">
        Loading…
      </div>
    );

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center px-5">
        <Card className="p-8 text-center max-w-md">
          <h1 className="font-display text-2xl font-bold">No admin access</h1>
          <p className="text-muted-foreground mt-2 text-sm">
            Your account does not have admin permissions.
          </p>
          <Button className="mt-6" variant="hero" onClick={handleSignOut}>
            Sign out
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/40 backdrop-blur sticky top-0 z-40">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="w-8 h-8 rounded-lg bg-gradient-blue flex items-center justify-center font-bold text-primary-foreground"
            >
              Z
            </Link>
            <span className="font-display font-bold">Admin Dashboard</span>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">
              View site
            </Link>
            <Button variant="ghost" size="sm" onClick={handleSignOut}>
              <LogOut className="w-4 h-4" /> Sign out
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-5 sm:px-8 py-10">
        <AdminDiagnosticsPanel
          isAdmin={isAdmin}
          loading={adminDebugLoading}
          errorMessage={adminDebugError instanceof Error ? adminDebugError.message : null}
          debug={adminDebug}
          onRefresh={() => refetchAdminDebug()}
        />

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-3xl sm:text-4xl font-bold">Events</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Create, edit and manage event listings.
            </p>
          </div>
          <Button
            variant="hero"
            onClick={() => {
              setEditing(null);
              setOpen(true);
            }}
          >
            <Plus className="w-4 h-4" /> New Event
          </Button>
        </div>

        <div className="grid gap-3">
          {events.length === 0 && (
            <Card className="p-10 text-center text-muted-foreground">
              <Calendar className="w-8 h-8 mx-auto mb-3 opacity-60" />
              No events yet. Click "New Event" to create your first one.
            </Card>
          )}
          {events.map((e) => (
            <Card
              key={e.id}
              className="p-5 flex flex-col sm:flex-row sm:items-center gap-4 hover:border-primary/40 transition-colors"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-display font-semibold">{e.title}</h3>
                  <Badge
                    variant={e.status === "live" ? "default" : "outline"}
                    className={e.status === "live" ? "bg-primary text-primary-foreground" : ""}
                  >
                    {e.status}
                  </Badge>
                  <Badge variant="secondary" className="text-[10px]">
                    {e.category}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {new Date(e.date_time).toLocaleString()} {e.location && `· ${e.location}`}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Select value={e.status} onValueChange={(v) => setEventStatus(e, v as Event["status"])}>
                  <SelectTrigger className="h-9 w-[140px]"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map((o) => (
                      <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button size="sm" variant="ghost" onClick={() => shareEvent(e)} aria-label="Share">
                  <Share2 className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setEditing(e);
                    setOpen(true);
                  }}
                >
                  <Pencil className="w-4 h-4" />
                </Button>
                <Button size="sm" variant="ghost" onClick={() => handleDelete(e.id)}>
                  <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
              </div>
            </Card>
          ))}
        </div>

        <section className="mt-16">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="font-display text-2xl sm:text-3xl font-bold flex items-center gap-2">
                <ImageIcon className="w-6 h-6" /> Gallery
              </h2>
              <p className="text-muted-foreground text-sm mt-1">
                Add and update photos shown on the website gallery section.
              </p>
            </div>
            <Button
              variant="hero"
              onClick={() => {
                setEditingGallery(null);
                setGalleryOpen(true);
              }}
            >
              <Plus className="w-4 h-4" /> New Photo
            </Button>
          </div>

          <div className="grid gap-3">
            {galleryImages.length === 0 && (
              <Card className="p-8 text-center text-muted-foreground">
                No gallery images yet. Click "New Photo" to add your first image.
              </Card>
            )}

            {galleryImages.map((img) => (
              <Card key={img.id} className="p-4 flex flex-col sm:flex-row sm:items-center gap-4">
                <img
                  src={img.image_url}
                  alt={img.caption ?? "Gallery image"}
                  className="w-full sm:w-28 h-28 object-cover rounded-lg border border-border"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{img.caption?.trim() || "Untitled image"}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {img.event_date
                      ? `Event date: ${new Date(img.event_date).toLocaleDateString()}`
                      : "No event date"}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1 truncate">{img.image_url}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setEditingGallery(img);
                      setGalleryOpen(true);
                    }}
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDeleteGalleryImage(img.id)}
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </section>

        <RegistrationsPanel />
      </main>

      <EventDialog
        open={open}
        onOpenChange={setOpen}
        event={editing}
        onSaved={() => qc.invalidateQueries({ queryKey: ["events"] })}
      />
      <GalleryDialog
        open={galleryOpen}
        onOpenChange={setGalleryOpen}
        image={editingGallery}
        onSaved={() => qc.invalidateQueries({ queryKey: ["gallery"] })}
      />
    </div>
  );
}

function AdminDiagnosticsPanel({
  isAdmin,
  loading,
  errorMessage,
  debug,
  onRefresh,
}: {
  isAdmin: boolean;
  loading: boolean;
  errorMessage: string | null;
  debug:
    | {
        userId: string;
        email: string | null;
        role: string | null;
        roleError: string | null;
        checks: {
          events: string;
          gallery: string;
          registrations: string;
        };
      }
    | undefined;
  onRefresh: () => void;
}) {
  return (
    <Card className="p-5 mb-8 border-dashed">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-xl font-semibold">Admin diagnostics</h2>
          <p className="text-xs text-muted-foreground mt-1">
            Use this panel to confirm your account role and table access checks.
          </p>
        </div>
        <Button size="sm" variant="outline" onClick={onRefresh}>
          Refresh checks
        </Button>
      </div>

      {loading && <p className="text-sm text-muted-foreground mt-4">Checking permissions...</p>}

      {errorMessage && <p className="text-sm text-destructive mt-4">{errorMessage}</p>}

      {!loading && !errorMessage && debug && (
        <div className="mt-4 grid gap-2 text-sm">
          <p>
            <span className="text-muted-foreground">Email:</span> {debug.email ?? "-"}
          </p>
          <p>
            <span className="text-muted-foreground">User ID:</span> {debug.userId}
          </p>
          <p>
            <span className="text-muted-foreground">isAdmin (client):</span> {String(isAdmin)}
          </p>
          <p>
            <span className="text-muted-foreground">Role row:</span> {debug.role ?? "none"}
          </p>
          {debug.roleError && (
            <p className="text-destructive">
              <span className="text-muted-foreground">Role query error:</span> {debug.roleError}
            </p>
          )}
          <p>
            <span className="text-muted-foreground">Events access:</span> {debug.checks.events}
          </p>
          <p>
            <span className="text-muted-foreground">Gallery access:</span> {debug.checks.gallery}
          </p>
          <p>
            <span className="text-muted-foreground">Registrations access:</span>{" "}
            {debug.checks.registrations}
          </p>
        </div>
      )}
    </Card>
  );
}

function EventDialog({
  open,
  onOpenChange,
  event,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  event: Event | null;
  onSaved: () => void;
}) {
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string>(event?.image_url ?? "");

  // Reset image when opening for a different event
  useEffect(() => {
    setImageUrl(event?.image_url ?? "");
  }, [event, open]);

  async function handleFileUpload(file: File) {
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be under 5 MB");
      return;
    }
    setUploading(true);
    const ext = file.name.split(".").pop() || "jpg";
    const path = `${crypto.randomUUID()}.${ext}`;
    const { error: upErr } = await supabase.storage
      .from("event-images")
      .upload(path, file, { cacheControl: "3600", upsert: false, contentType: file.type });
    if (upErr) {
      setUploading(false);
      toast.error(upErr.message);
      return;
    }
    // Private bucket: create a very long-lived signed URL (~10 years)
    const { data: signed, error: sErr } = await supabase.storage
      .from("event-images")
      .createSignedUrl(path, 60 * 60 * 24 * 365 * 10);
    setUploading(false);
    if (sErr || !signed?.signedUrl) {
      toast.error(sErr?.message ?? "Could not get image URL");
      return;
    }
    setImageUrl(signed.signedUrl);
    toast.success("Image uploaded");
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const payload = {
      title: String(fd.get("title")).trim(),
      description: String(fd.get("description")).trim(),
      date_time: new Date(String(fd.get("date_time"))).toISOString(),
      ends_at: fd.get("ends_at") ? new Date(String(fd.get("ends_at"))).toISOString() : null,
      location: String(fd.get("location") || "").trim() || null,
      category: String(fd.get("category")) as "workshop" | "mini_conference" | "meetup",
      status: String(fd.get("status")) as Event["status"],
      image_url: imageUrl.trim() || null,
      registration_url: String(fd.get("registration_url") || "").trim() || null,
    };
    if (!payload.title || !payload.description) {
      toast.error("Title and description are required");
      return;
    }
    setSaving(true);
    const { error } = event
      ? await supabase.from("events").update(payload).eq("id", event.id)
      : await supabase.from("events").insert(payload);
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success(event ? "Updated" : "Created");
    onSaved();
    onOpenChange(false);
  }

  const defaultDt = event ? new Date(event.date_time).toISOString().slice(0, 16) : "";
  const defaultEnds = event?.ends_at ? new Date(event.ends_at).toISOString().slice(0, 16) : "";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display">{event ? "Edit event" : "New event"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-3">
          <div>
            <Label htmlFor="title">Title</Label>
            <Input id="title" name="title" defaultValue={event?.title} required maxLength={200} />
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              defaultValue={event?.description}
              required
              rows={4}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="date_time">Date & time</Label>
              <Input
                id="date_time"
                name="date_time"
                type="datetime-local"
                defaultValue={defaultDt}
                required
              />
            </div>
            <div>
              <Label htmlFor="ends_at">Ends at (optional)</Label>
              <Input
                id="ends_at"
                name="ends_at"
                type="datetime-local"
                defaultValue={defaultEnds}
              />
            </div>
          </div>
          <div>
            <Label htmlFor="location">Location</Label>
            <Input id="location" name="location" defaultValue={event?.location ?? ""} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="category">Category</Label>
              <Select name="category" defaultValue={event?.category ?? "meetup"}>
                <SelectTrigger id="category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="meetup">Meetup</SelectItem>
                  <SelectItem value="workshop">Workshop</SelectItem>
                  <SelectItem value="mini_conference">Mini Conference</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="status">Status</Label>
              <Select name="status" defaultValue={event?.status ?? "upcoming"}>
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-[10px] text-muted-foreground mt-1">
                Status auto-updates from time. Set Postponed / Cancelled manually.
              </p>
            </div>
          </div>
          <div>
            <Label>Event image / poster</Label>
            <div className="mt-2 flex items-center gap-3">
              <label className="inline-flex items-center gap-2 px-3 py-2 border border-border rounded-md cursor-pointer hover:border-primary/40 text-sm">
                <Upload className="w-4 h-4" />
                {uploading ? "Uploading..." : "Upload image"}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  disabled={uploading}
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleFileUpload(f);
                    e.target.value = "";
                  }}
                />
              </label>
              {imageUrl && (
                <>
                  <img src={imageUrl} alt="Preview" className="h-14 w-24 object-cover rounded border border-border" />
                  <Button type="button" size="sm" variant="ghost" onClick={() => setImageUrl("")}>
                    Remove
                  </Button>
                </>
              )}
            </div>
            <Input
              className="mt-2"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="Or paste image URL"
            />
          </div>
          <div>
            <Label htmlFor="registration_url">External registration URL (optional)</Label>
            <Input
              id="registration_url"
              name="registration_url"
              defaultValue={event?.registration_url ?? ""}
              placeholder="https://..."
            />
          </div>
          <Button type="submit" variant="hero" className="w-full" disabled={saving}>
            {saving ? "Saving..." : event ? "Save changes" : "Create event"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function GalleryDialog({
  open,
  onOpenChange,
  image,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  image: GalleryImage | null;
  onSaved: () => void;
}) {
  const [saving, setSaving] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const imageUrl = String(fd.get("image_url") || "").trim();
    const caption = String(fd.get("caption") || "").trim() || null;
    const eventDate = String(fd.get("event_date") || "").trim() || null;

    if (!imageUrl) {
      toast.error("Image URL is required");
      return;
    }

    setSaving(true);
    const { error } = image
      ? await supabase
          .from("gallery_images")
          .update({ image_url: imageUrl, caption, event_date: eventDate })
          .eq("id", image.id)
      : await supabase
          .from("gallery_images")
          .insert({ image_url: imageUrl, caption, event_date: eventDate });
    setSaving(false);

    if (error) return toast.error(error.message);
    toast.success(image ? "Gallery image updated" : "Gallery image added");
    onSaved();
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display">
            {image ? "Edit gallery image" : "Add gallery image"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-3">
          <div>
            <Label htmlFor="gallery_image_url">Image URL</Label>
            <Input
              id="gallery_image_url"
              name="image_url"
              defaultValue={image?.image_url ?? ""}
              placeholder="https://..."
              required
            />
          </div>
          <div>
            <Label htmlFor="gallery_caption">Caption</Label>
            <Input
              id="gallery_caption"
              name="caption"
              defaultValue={image?.caption ?? ""}
              placeholder="Optional caption"
            />
          </div>
          <div>
            <Label htmlFor="gallery_event_date">Event date</Label>
            <Input
              id="gallery_event_date"
              name="event_date"
              type="date"
              defaultValue={image?.event_date ?? ""}
            />
          </div>

          <Button type="submit" variant="hero" className="w-full" disabled={saving}>
            {saving ? "Saving..." : image ? "Save changes" : "Add image"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function RegistrationsPanel() {
  const {
    data: regs = [],
    isError,
    error,
  } = useQuery({
    queryKey: ["registrations"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("registrations")
        .select("id, full_name, email, phone, created_at, event_id, events(title)")
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return data ?? [];
    },
  });

  if (isError) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return (
      <section className="mt-16">
        <h2 className="font-display text-2xl font-bold flex items-center gap-2">
          <Users className="w-5 h-5" /> Recent registrations
        </h2>
        <Card className="mt-4 p-5 text-sm text-destructive">
          Unable to load registrations: {message}
        </Card>
      </section>
    );
  }

  return (
    <section className="mt-16">
      <h2 className="font-display text-2xl font-bold flex items-center gap-2">
        <Users className="w-5 h-5" /> Recent registrations
      </h2>
      <div className="mt-4 rounded-2xl border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-card/60 text-left text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3 hidden md:table-cell">Event</th>
              <th className="px-4 py-3 hidden md:table-cell">When</th>
            </tr>
          </thead>
          <tbody>
            {regs.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">
                  No registrations yet.
                </td>
              </tr>
            )}
            {regs.map((r: any) => (
              <tr key={r.id} className="border-t border-border">
                <td className="px-4 py-3">{r.full_name}</td>
                <td className="px-4 py-3 text-muted-foreground">{r.email}</td>
                <td className="px-4 py-3 hidden md:table-cell text-muted-foreground">
                  {r.events?.title ?? "—"}
                </td>
                <td className="px-4 py-3 hidden md:table-cell text-muted-foreground">
                  {new Date(r.created_at).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
