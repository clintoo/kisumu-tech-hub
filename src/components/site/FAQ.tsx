import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const faqs = [
  { q: "Who can join Zone01 Kisumu?", a: "Anyone interested in tech — students, self-taught builders, working engineers, designers, and the merely curious. If you want to learn and contribute, you belong here." },
  { q: "Do I need prior coding experience?", a: "No. We run beginner-friendly meetups and deeper technical mini-conferences. Pick the events that match where you are today." },
  { q: "Are events free or paid?", a: "All community meetups and mini-conferences are free. Specialised workshops may occasionally cover venue costs — always announced ahead of time." },
  { q: "How often do events happen?", a: "A mini-conference every month, plus smaller meetups and workshops throughout the month." },
  { q: "How can I contribute or speak at an event?", a: "Reach out via the newsletter signup or contact us directly — we're always looking for speakers, organisers and volunteers." },
];

export function FAQ() {
  return (
    <section id="faq" className="py-24 md:py-32 border-t border-border/50">
      <div className="mx-auto max-w-4xl px-5 sm:px-8">
        <div className="text-xs uppercase tracking-[0.2em] text-primary-glow mb-3 text-center">Community</div>
        <h2 className="font-display text-4xl sm:text-5xl md:text-6xl font-bold leading-[1.05] text-center">
          How to become <span className="text-gradient">part of it</span>.
        </h2>
        <Accordion type="single" collapsible className="mt-12">
          {faqs.map((f) => (
            <AccordionItem key={f.q} value={f.q} className="border-border">
              <AccordionTrigger className="text-left font-display text-lg hover:no-underline hover:text-primary-glow">{f.q}</AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed">{f.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}