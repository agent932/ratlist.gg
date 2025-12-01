import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '../../../components/ui/accordion'

export default function FAQPage() {
  return (
    <section className="container py-12">
      <h1 className="text-3xl font-bold">FAQ & Disclaimers</h1>
      <div className="mt-6">
        <Accordion type="single" collapsible>
          <AccordionItem value="what">
            <AccordionTrigger>What is Ratlist.gg?</AccordionTrigger>
            <AccordionContent>
              A community-run incident board and reputation lookup tool for extraction shooters. It is not an
              official moderation tool.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="affiliation">
            <AccordionTrigger>Are you affiliated with any game studio?</AccordionTrigger>
            <AccordionContent>
              No. Ratlist.gg is not affiliated with or endorsed by any studio.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="content">
            <AccordionTrigger>How is incident content treated?</AccordionTrigger>
            <AccordionContent>
              All incident content is user-generated opinion. Use it as context, not proof of wrongdoing.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="safety">
            <AccordionTrigger>What are the community boundaries?</AccordionTrigger>
            <AccordionContent>
              No doxxing, slurs, or threats. Describe in-game behavior, not real-life personal info. You can flag
              content for review.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </section>
  )
}
