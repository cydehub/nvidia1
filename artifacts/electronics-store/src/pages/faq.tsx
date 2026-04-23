import { useListFaqs } from "@workspace/api-client-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { SEO } from "@/components/seo";

export default function FAQ() {
  const { data: faqs, isLoading } = useListFaqs({ query: { queryKey: ["/api/faqs"] } });
  
  const activeFaqs = faqs?.filter(f => f.isActive).sort((a, b) => a.sortOrder - b.sortOrder) || [];

  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <SEO title="Frequently Asked Questions" />
      
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight mb-4">Frequently Asked Questions</h1>
        <p className="text-muted-foreground">Find answers to common questions about ordering, delivery, and our products.</p>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1,2,3,4,5].map(i => (
            <div key={i} className="h-16 bg-muted animate-pulse rounded-lg w-full" />
          ))}
        </div>
      ) : activeFaqs.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-muted-foreground">No FAQs available at the moment.</p>
        </div>
      ) : (
        <Accordion type="single" collapsible className="w-full border bg-card rounded-xl px-6">
          {activeFaqs.map(faq => (
            <AccordionItem key={faq.id} value={`faq-${faq.id}`} className="border-b last:border-0 py-2">
              <AccordionTrigger className="text-left font-semibold text-base hover:no-underline hover:text-primary transition-colors">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed pb-4">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      )}
    </div>
  );
}
