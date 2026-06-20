import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchGallery } from "@/lib/events-api";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Camera } from "lucide-react";

export function Gallery() {
  const {
    data: images = [],
    isLoading,
    isError,
  } = useQuery({ queryKey: ["gallery"], queryFn: fetchGallery });
  const [active, setActive] = useState<string | null>(null);

  return (
    <section id="gallery" className="py-24 md:py-32 border-t border-border/50">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="text-xs uppercase tracking-[0.2em] text-primary-glow mb-3 flex items-center gap-2">
          <Camera className="w-4 h-4" /> Gallery
        </div>
        <h2 className="font-display text-4xl sm:text-5xl md:text-6xl font-bold leading-[1.05] max-w-3xl">
          Moments from <span className="text-gradient">past events</span>.
        </h2>

        {isLoading && <p className="mt-8 text-sm text-muted-foreground">Loading gallery...</p>}

        {isError && (
          <p className="mt-8 text-sm text-destructive">Unable to load gallery images right now.</p>
        )}

        {!isLoading && !isError && images.length === 0 && (
          <div className="mt-8 rounded-xl border border-dashed border-border p-8 text-sm text-muted-foreground">
            No gallery images yet. They will appear here as soon as an admin adds photos.
          </div>
        )}

        {!isLoading && !isError && images.length > 0 && (
          <div className="mt-12 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
            {images.map((img) => (
              <button
                key={img.id}
                onClick={() => setActive(img.image_url)}
                className="group relative aspect-square overflow-hidden rounded-xl border border-border bg-card"
              >
                <img
                  src={img.image_url}
                  alt={img.caption ?? "Event"}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                {img.caption && (
                  <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-background to-transparent text-xs text-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                    {img.caption}
                  </div>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      <Dialog open={!!active} onOpenChange={(v) => !v && setActive(null)}>
        <DialogContent className="max-w-5xl p-2 bg-background border-border">
          {active && <img src={active} alt="Event" className="w-full h-auto rounded-lg" />}
        </DialogContent>
      </Dialog>
    </section>
  );
}
