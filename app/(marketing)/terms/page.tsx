export default function TermsPage() {
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

      <div className="container relative py-16 sm:py-24 max-w-4xl">
        {/* Header */}
        <div className="mb-12">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-sm backdrop-blur-sm">
            <svg className="h-4 w-4 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Legal
          </div>
          
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
              Terms of Service
            </span>
          </h1>
          
          <p className="text-white/60 text-lg">
            Last updated: December 1, 2025
          </p>
        </div>

        {/* Content */}
        <div className="prose prose-invert prose-lg max-w-none">
          <div className="space-y-8 text-white/80 leading-relaxed">
            
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">1. Acceptance of Terms</h2>
              <p>
                By accessing and using Ratlist.gg (&quot;the Service&quot;, &quot;we&quot;, &quot;us&quot;, or &quot;our&quot;), you accept and agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the Service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">2. Description of Service</h2>
              <p>
                Ratlist.gg is a community-driven platform that allows users to report and view incidents related to player behavior in extraction shooter video games. The Service provides:
              </p>
              <ul className="list-disc pl-6 space-y-2 mt-3">
                <li>Player reputation lookup based on community reports</li>
                <li>Incident reporting and browsing functionality</li>
                <li>Community-generated content and opinions</li>
              </ul>
              <p className="mt-3">
                <strong>Important:</strong> Ratlist.gg is NOT affiliated with, endorsed by, or connected to any game developer or publisher. We are an independent community platform.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">3. User-Generated Content</h2>
              <p>
                All incident reports and content on the Service are <strong>user-generated opinions</strong> and should be treated as such. This content:
              </p>
              <ul className="list-disc pl-6 space-y-2 mt-3">
                <li>Represents individual perspectives and experiences</li>
                <li>Is NOT verified, validated, or endorsed by Ratlist.gg</li>
                <li>Should be used as context for decision-making, NOT as definitive proof</li>
                <li>Does not constitute official moderation or enforcement action</li>
              </ul>
              <p className="mt-3">
                You acknowledge that you use this information at your own risk and discretion.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">4. User Conduct and Prohibited Activities</h2>
              <p>When using the Service, you agree NOT to:</p>
              <ul className="list-disc pl-6 space-y-2 mt-3">
                <li><strong>Share personally identifiable information (PII)</strong> - Real names, addresses, phone numbers, emails, social media profiles, or other private information</li>
                <li><strong>Engage in harassment or abuse</strong> - Threats, doxxing, targeted harassment, or coordinated attacks</li>
                <li><strong>Post hateful content</strong> - Slurs, discriminatory language, or content based on race, gender, religion, nationality, disability, or sexual orientation</li>
                <li><strong>Submit false reports</strong> - Knowingly fabricating incidents or misrepresenting events</li>
                <li><strong>Spam or abuse the system</strong> - Excessive reporting, bot activity, or attempts to manipulate reputation scores</li>
                <li><strong>Violate laws</strong> - Illegal content, copyright infringement, or activities prohibited by applicable law</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">5. Account Registration and Security</h2>
              <p>
                To submit incidents, you must create an account using email authentication or OAuth providers (GitHub, Discord). You are responsible for:
              </p>
              <ul className="list-disc pl-6 space-y-2 mt-3">
                <li>Maintaining the confidentiality of your account credentials</li>
                <li>All activities that occur under your account</li>
                <li>Notifying us immediately of any unauthorized use</li>
              </ul>
              <p className="mt-3">
                We reserve the right to suspend or terminate accounts that violate these terms.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">6. Content Ownership and License</h2>
              <p>
                You retain ownership of content you submit. By posting content to Ratlist.gg, you grant us a worldwide, non-exclusive, royalty-free license to:
              </p>
              <ul className="list-disc pl-6 space-y-2 mt-3">
                <li>Display, reproduce, and distribute your content on the Service</li>
                <li>Use aggregated, anonymized data for analytics and improvements</li>
              </ul>
              <p className="mt-3">
                You represent that you have the right to grant this license and that your content does not violate any third-party rights.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">7. Content Moderation</h2>
              <p>
                We reserve the right, but not the obligation, to:
              </p>
              <ul className="list-disc pl-6 space-y-2 mt-3">
                <li>Review, monitor, and moderate user-generated content</li>
                <li>Remove content that violates these terms</li>
                <li>Suspend or ban users who repeatedly violate policies</li>
                <li>Investigate reports and flags submitted by the community</li>
              </ul>
              <p className="mt-3">
                Moderation decisions are made at our discretion. We are not liable for any content posted by users.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">8. Rate Limits and Usage Restrictions</h2>
              <p>
                To prevent abuse, we enforce the following limits:
              </p>
              <ul className="list-disc pl-6 space-y-2 mt-3">
                <li>30-second cooldown between incident submissions</li>
                <li>Maximum 10 incident reports per user per day</li>
                <li>One flag per user per incident</li>
              </ul>
              <p className="mt-3">
                Attempts to circumvent these limits may result in account suspension.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">9. Disclaimer of Warranties</h2>
              <p>
                THE SERVICE IS PROVIDED &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot; WITHOUT WARRANTIES OF ANY KIND. WE DISCLAIM ALL WARRANTIES, EXPRESS OR IMPLIED, INCLUDING:
              </p>
              <ul className="list-disc pl-6 space-y-2 mt-3">
                <li>Accuracy, reliability, or completeness of content</li>
                <li>Availability or uninterrupted access to the Service</li>
                <li>Fitness for a particular purpose</li>
                <li>Non-infringement of third-party rights</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">10. Limitation of Liability</h2>
              <p>
                TO THE MAXIMUM EXTENT PERMITTED BY LAW, RATLIST.GG AND ITS OPERATORS SHALL NOT BE LIABLE FOR:
              </p>
              <ul className="list-disc pl-6 space-y-2 mt-3">
                <li>Any indirect, incidental, special, or consequential damages</li>
                <li>Loss of data, profits, or business opportunities</li>
                <li>Damages arising from user-generated content</li>
                <li>Decisions made based on information from the Service</li>
              </ul>
              <p className="mt-3">
                Your use of the Service is at your own risk.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">11. Indemnification</h2>
              <p>
                You agree to indemnify and hold harmless Ratlist.gg and its operators from any claims, damages, losses, or expenses arising from:
              </p>
              <ul className="list-disc pl-6 space-y-2 mt-3">
                <li>Your use of the Service</li>
                <li>Your violation of these Terms</li>
                <li>Content you submit to the Service</li>
                <li>Your violation of any third-party rights</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">12. DMCA and Copyright</h2>
              <p>
                If you believe content on the Service infringes your copyright, please contact us with:
              </p>
              <ul className="list-disc pl-6 space-y-2 mt-3">
                <li>Description of the copyrighted work</li>
                <li>Location of the infringing content</li>
                <li>Your contact information</li>
                <li>A statement of good faith belief</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">13. Changes to Terms</h2>
              <p>
                We reserve the right to modify these Terms at any time. Changes will be effective immediately upon posting. Your continued use of the Service constitutes acceptance of modified Terms.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">14. Termination</h2>
              <p>
                We may terminate or suspend your access to the Service at any time, with or without cause or notice. Upon termination, your right to use the Service immediately ceases.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">15. Governing Law</h2>
              <p>
                These Terms are governed by and construed in accordance with applicable laws. Any disputes shall be resolved in the appropriate courts.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">16. Contact Information</h2>
              <p>
                For questions about these Terms, please contact us through our community channels or via the platform.
              </p>
            </section>

            <section className="border-t border-white/10 pt-8 mt-12">
              <p className="text-white/40 text-sm">
                By using Ratlist.gg, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.
              </p>
            </section>

          </div>
        </div>
      </div>
    </section>
  )
}
