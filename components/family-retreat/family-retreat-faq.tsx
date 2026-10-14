'use client'

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { retreatFAQClosing, retreatFAQGroups, retreatFAQIntroduction } from './family-retreat-faq-data'

export function FamilyRetreatFAQ() {
  return <section id="faqs" className="scroll-mt-24 border-t border-border bg-secondary/30 py-16 md:py-24" aria-labelledby="retreat-faq-heading">
    <div className="container mx-auto max-w-4xl px-6 lg:px-12">
      <header className="mx-auto mb-10 max-w-3xl text-center">
        <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.2em] text-[hsl(43,100%,29%)]">Sikh Family Retreat</p>
        <h2 id="retreat-faq-heading" className="mb-5 text-3xl font-bold text-foreground md:text-4xl">Frequently asked questions</h2>
        <p className="text-base leading-relaxed text-muted-foreground">{retreatFAQIntroduction}</p>
      </header>
      <nav aria-label="FAQ topics" className="mb-12 flex flex-wrap justify-center gap-2">
        {retreatFAQGroups.map((group, index) => <a key={group.heading} href={`#retreat-faq-topic-${index}`} className="rounded-full border border-border bg-background px-4 py-2 text-xs font-medium text-foreground transition-colors hover:border-amber-500/40 hover:bg-amber-500/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-500">{group.heading}</a>)}
      </nav>
      <div className="space-y-12">
        {retreatFAQGroups.map((group, groupIndex) => <section key={group.heading} id={`retreat-faq-topic-${groupIndex}`} aria-labelledby={`retreat-faq-topic-heading-${groupIndex}`} className="scroll-mt-28">
          <h3 id={`retreat-faq-topic-heading-${groupIndex}`} className="mb-5 flex items-center gap-3 text-xl font-semibold text-foreground"><span aria-hidden="true" className="text-xs font-semibold tabular-nums text-[hsl(43,100%,29%)]">0{groupIndex + 1}</span>{group.heading}</h3>
          <Accordion type="single" collapsible className="w-full">
            {group.items.map(item => <AccordionItem key={item.question} value={item.question}>
              <AccordionTrigger className="text-left text-base font-medium leading-relaxed text-foreground hover:no-underline">{item.question}</AccordionTrigger>
              <AccordionContent className="text-base leading-relaxed text-muted-foreground">
                <div className="space-y-4 pb-2">{item.paragraphs.map(paragraph => <p key={paragraph}>{paragraph}</p>)}</div>
              </AccordionContent>
            </AccordionItem>)}
          </Accordion>
        </section>)}
      </div>
      <div className="mt-12 border-t border-border pt-8">
        <h3 className="mb-4 text-xl font-semibold text-foreground">Still have a question?</h3>
        <div className="space-y-4 text-base leading-relaxed text-muted-foreground">{retreatFAQClosing.map(paragraph => <p key={paragraph}>{paragraph}</p>)}</div>
      </div>
    </div>
  </section>
}
