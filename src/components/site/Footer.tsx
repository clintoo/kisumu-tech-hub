import { Github, Linkedin, Twitter, Mail } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border/50 py-12 mt-8">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-blue flex items-center justify-center font-bold text-primary-foreground">
              Z
            </div>
            <span className="font-display font-bold text-foreground">z01k-events</span>
          </div>
          <p className="text-sm text-muted-foreground max-w-md">
            Monthly mini-conferences, workshops & meetups.
          </p>
        </div>
        <div className="flex items-center gap-5">
          <a
            href="mailto:events@zone01kisumu.ke"
            className="text-muted-foreground hover:text-primary-glow"
            aria-label="Email"
          >
            <Mail className="w-5 h-5" />
          </a>
          <a
            href="https://linkedin.com"
            target="_blank"
            rel="noreferrer"
            className="text-muted-foreground hover:text-primary-glow"
            aria-label="LinkedIn"
          >
            <Linkedin className="w-5 h-5" />
          </a>
          <a
            href="https://twitter.com"
            target="_blank"
            rel="noreferrer"
            className="text-muted-foreground hover:text-primary-glow"
            aria-label="Twitter"
          >
            <Twitter className="w-5 h-5" />
          </a>
        </div>
      </div>
      <div className="mx-auto max-w-7xl px-5 sm:px-8 mt-8 pt-6 border-t border-border/30 text-xs text-muted-foreground/70 flex flex-wrap justify-between gap-2">
        <span>© {new Date().getFullYear()} z01k-events. All rights reserved.</span>
        <span>Proudly built by dev.wengi</span>
      </div>
    </footer>
  );
}
