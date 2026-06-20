import { Link } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

const links = [
  { href: "#events", label: "Events" },
  { href: "#about", label: "About" },
  { href: "#gallery", label: "Gallery" },
  { href: "#faq", label: "Community" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed top-0 inset-x-0 z-50 backdrop-blur-xl bg-background/60 border-b border-border/50">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 h-16 flex items-center justify-between">
        <a href="#top" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-gradient-blue shadow-glow flex items-center justify-center font-bold text-primary-foreground">
            Z
          </div>
          <span className="font-display font-bold tracking-tight text-foreground">
            Zone01 <span className="text-primary-glow">Events</span>
          </span>
        </a>
        <nav className="hidden md:flex items-center gap-8">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {l.label}
            </a>
          ))}
        </nav>
        <div className="hidden md:flex items-center gap-3">
          <Button asChild variant="hero" size="sm">
            <a href="#events">View Events</a>
          </Button>
        </div>
        <button
          className="md:hidden text-foreground"
          onClick={() => setOpen(!open)}
          aria-label="Menu"
        >
          {open ? <X /> : <Menu />}
        </button>
      </div>
      {open && (
        <div className="md:hidden border-t border-border/50 bg-background/95 px-5 py-4 space-y-3">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="block text-sm text-muted-foreground"
            >
              {l.label}
            </a>
          ))}
          <Button asChild variant="hero" size="sm" className="w-full">
            <a href="#events">View Events</a>
          </Button>
        </div>
      )}
    </header>
  );
}
