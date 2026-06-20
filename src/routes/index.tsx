import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/site/Navbar";
import { Hero } from "@/components/site/Hero";
import { About } from "@/components/site/About";
import { EventsSection } from "@/components/site/EventsSection";
import { Gallery } from "@/components/site/Gallery";
import { FAQ } from "@/components/site/FAQ";
import { Newsletter } from "@/components/site/Newsletter";
import { Footer } from "@/components/site/Footer";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Zone01 Kisumu Tech Events — Mini-Conferences & Meetups" },
      { name: "description", content: "Monthly tech mini-conferences, workshops and meetups for Kisumu's developer community." },
      { property: "og:title", content: "Zone01 Kisumu Tech Events" },
      { property: "og:description", content: "Monthly tech mini-conferences, workshops and meetups in Kisumu." },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <Hero />
        <About />
        <EventsSection />
        <Gallery />
        <FAQ />
        <Newsletter />
      </main>
      <Footer />
    </div>
  );
}
