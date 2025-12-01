import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '../../../components/ui/accordion'

export default function FAQPage() {
  const faqs = [
    {
      question: "What is Ratlist.gg?",
      answer: "A community-run incident board and reputation lookup tool for extraction shooters. We provide a platform where players can share their experiences, track suspicious behavior, and make informed decisions about who to team up with. This is not an official moderation tool or anti-cheat system."
    },
    {
      question: "Are you affiliated with any game studio?",
      answer: "No. Ratlist.gg is completely independent and is not affiliated with, endorsed by, or sponsored by any game studio or developer. We are a community-driven platform built by players, for players."
    },
    {
      question: "How is incident content treated?",
      answer: "All incident content is user-generated opinion and should be treated as such. Reports represent individual player experiences and perspectives. Use this information as context to inform your decisions, not as definitive proof of wrongdoing. Always exercise your own judgment."
    },
    {
      question: "What are the community boundaries?",
      answer: "We maintain strict rules to keep the community safe and respectful. Absolutely no doxxing, slurs, threats, or harassment of any kind. Reports should describe in-game behavior only - never share or request real-life personal information. Violations can be flagged for review and may result in account restrictions."
    },
    {
      question: "How does the reputation system work?",
      answer: "Player reputation is calculated based on the types and number of incidents reported against them. Different categories have different weights - for example, betrayal has a higher negative impact than extract camping. Positive behaviors like clutch saves can improve reputation. The tier system (S to F) provides a quick visual indicator of a player's overall standing."
    },
    {
      question: "Can I report incidents anonymously?",
      answer: "Yes! When submitting an incident report, you can choose to make it anonymous. Your reporter identity will be hidden from public view, though it's stored for moderation purposes. We believe in protecting reporter privacy to encourage honest reporting."
    },
    {
      question: "What games are supported?",
      answer: "We currently support major extraction shooters including Escape from Tarkov, Dark and Darker, and more. We're continuously adding support for new games based on community demand. Check the Games page to see the full list of supported titles."
    },
    {
      question: "How do I report someone?",
      answer: "Click the 'Report' button in the navigation, sign in with your email or OAuth provider, then fill out the incident form with the game, player identifier, incident category, and a detailed description. You can optionally add context like the map, mode, and when it occurred."
    },
    {
      question: "Can I dispute a report against me?",
      answer: "While we don't currently have a formal dispute system, you can reach out through our support channels if you believe a report is false or violates our guidelines. We review flagged content and take appropriate action against malicious reporting."
    },
    {
      question: "Is there a rate limit on reporting?",
      answer: "Yes. To prevent spam and abuse, there's a 30-second cooldown between submissions and a daily limit of 10 reports per user. These limits help maintain the quality and credibility of the platform."
    },
    {
      question: "How is data stored and protected?",
      answer: "All data is securely stored using Supabase with industry-standard encryption. We implement Row Level Security (RLS) policies to ensure data access is properly controlled. Reporter information is protected, and we never sell or share user data with third parties."
    },
    {
      question: "Can I edit or delete my reports?",
      answer: "You can edit or delete your own incident reports within 15 minutes of submission. After that window, reports become permanent to maintain the integrity of the historical record. This policy helps prevent manipulation while allowing quick corrections."
    }
  ]

  return (
    <section className="relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-brand/5 via-transparent to-transparent" />
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `linear-gradient(to right, rgb(255 255 255 / 0.05) 1px, transparent 1px),
                           linear-gradient(to bottom, rgb(255 255 255 / 0.05) 1px, transparent 1px)`,
          backgroundSize: '4rem 4rem'
        }} />
      </div>

      <div className="container relative py-16 sm:py-24">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-sm backdrop-blur-sm">
            <svg className="h-4 w-4 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Frequently Asked Questions
          </div>
          
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
              Everything You Need to Know
            </span>
          </h1>
          
          <p className="text-white/60 text-lg max-w-2xl mx-auto">
            Get answers to common questions about Ratlist.gg, our policies, and how to use the platform effectively.
          </p>
        </div>

        {/* FAQ Accordion */}
        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, idx) => (
              <AccordionItem 
                key={idx} 
                value={`item-${idx}`}
                className="rounded-lg border border-white/10 bg-white/5 backdrop-blur-sm overflow-hidden"
              >
                <AccordionTrigger className="px-6 py-4 text-left hover:bg-white/5 transition-colors">
                  <span className="text-lg font-semibold pr-4">{faq.question}</span>
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-4 text-white/70 leading-relaxed">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 text-center">
          <div className="inline-block rounded-lg border border-white/10 bg-white/5 backdrop-blur-sm p-8 max-w-2xl">
            <h2 className="text-2xl font-bold mb-3">Still have questions?</h2>
            <p className="text-white/60 mb-6">
              We're here to help. Reach out through our community channels or check our documentation.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a 
                href="/report" 
                className="rounded-lg bg-brand hover:bg-brand/90 px-6 py-3 font-semibold text-brand-foreground transition-colors"
              >
                Get Started
              </a>
              <a 
                href="/browse" 
                className="rounded-lg border border-white/20 bg-white/5 hover:bg-white/10 px-6 py-3 font-semibold transition-colors"
              >
                Browse Reports
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
