export default function PrivacyPage() {
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
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            Privacy
          </div>
          
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
              Privacy Policy
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
              <h2 className="text-2xl font-bold text-white mb-4">1. Introduction</h2>
              <p>
                Ratlist.gg (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our Service.
              </p>
              <p className="mt-3">
                By using Ratlist.gg, you consent to the data practices described in this policy.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">2. Information We Collect</h2>
              
              <h3 className="text-xl font-semibold text-white mt-6 mb-3">2.1 Information You Provide</h3>
              <p>We collect information you voluntarily provide when using the Service:</p>
              <ul className="list-disc pl-6 space-y-2 mt-3">
                <li><strong>Account Information:</strong> Email address (for magic link authentication) or OAuth profile data (from GitHub or Discord)</li>
                <li><strong>Incident Reports:</strong> Game selection, player identifiers, incident descriptions, categories, and optional metadata (map, mode, region, date)</li>
                <li><strong>Flags and Feedback:</strong> Content flagging reasons and moderation-related communications</li>
              </ul>

              <h3 className="text-xl font-semibold text-white mt-6 mb-3">2.2 Automatically Collected Information</h3>
              <p>We automatically collect certain technical information:</p>
              <ul className="list-disc pl-6 space-y-2 mt-3">
                <li><strong>Usage Data:</strong> Pages visited, features used, timestamps, and interaction patterns</li>
                <li><strong>Device Information:</strong> Browser type, operating system, IP address (anonymized)</li>
                <li><strong>Analytics Data:</strong> Via Google Analytics (see section 6)</li>
                <li><strong>Authentication Tokens:</strong> Secure session cookies for logged-in users</li>
              </ul>

              <h3 className="text-xl font-semibold text-white mt-6 mb-3">2.3 Information We Do NOT Collect</h3>
              <p>We explicitly do NOT collect:</p>
              <ul className="list-disc pl-6 space-y-2 mt-3">
                <li>Personally identifiable information beyond what&apos;s necessary for authentication</li>
                <li>Payment or financial information (the Service is free)</li>
                <li>Precise geolocation data</li>
                <li>Biometric data</li>
                <li>Information from third-party games or game clients</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">3. How We Use Your Information</h2>
              <p>We use collected information for the following purposes:</p>
              
              <h3 className="text-xl font-semibold text-white mt-6 mb-3">3.1 Service Provision</h3>
              <ul className="list-disc pl-6 space-y-2 mt-3">
                <li>Authenticate users and manage accounts</li>
                <li>Display incident reports and player reputation data</li>
                <li>Process and store user-submitted content</li>
                <li>Enable search and browse functionality</li>
              </ul>

              <h3 className="text-xl font-semibold text-white mt-6 mb-3">3.2 Safety and Moderation</h3>
              <ul className="list-disc pl-6 space-y-2 mt-3">
                <li>Enforce community guidelines and terms of service</li>
                <li>Investigate reports of abuse or policy violations</li>
                <li>Prevent spam, fraud, and malicious activity</li>
                <li>Implement rate limiting and abuse prevention</li>
              </ul>

              <h3 className="text-xl font-semibold text-white mt-6 mb-3">3.3 Improvement and Analytics</h3>
              <ul className="list-disc pl-6 space-y-2 mt-3">
                <li>Analyze usage patterns to improve the Service</li>
                <li>Monitor performance and fix technical issues</li>
                <li>Understand user preferences and behavior (aggregated)</li>
              </ul>

              <h3 className="text-xl font-semibold text-white mt-6 mb-3">3.4 Legal Compliance</h3>
              <ul className="list-disc pl-6 space-y-2 mt-3">
                <li>Comply with legal obligations and lawful requests</li>
                <li>Protect our rights, property, and safety</li>
                <li>Enforce our Terms of Service</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">4. How We Share Your Information</h2>
              <p>We do NOT sell your personal information. We may share information in limited circumstances:</p>

              <h3 className="text-xl font-semibold text-white mt-6 mb-3">4.1 Public Content</h3>
              <p>
                Incident reports you submit are <strong>publicly visible</strong> on the Service. This includes:
              </p>
              <ul className="list-disc pl-6 space-y-2 mt-3">
                <li>Incident descriptions and metadata</li>
                <li>Player identifiers (in-game handles)</li>
                <li>Your reporter identity (unless you choose anonymous mode)</li>
              </ul>
              <p className="mt-3">
                <strong>Important:</strong> Do not include private information in incident reports.
              </p>

              <h3 className="text-xl font-semibold text-white mt-6 mb-3">4.2 Service Providers</h3>
              <p>We share data with trusted third-party services:</p>
              <ul className="list-disc pl-6 space-y-2 mt-3">
                <li><strong>Supabase:</strong> Database, authentication, and hosting infrastructure</li>
                <li><strong>Vercel:</strong> Application hosting and CDN</li>
                <li><strong>Google Analytics:</strong> Usage analytics (see section 6)</li>
                <li><strong>OAuth Providers:</strong> GitHub and Discord for authentication</li>
              </ul>
              <p className="mt-3">
                These providers are contractually obligated to protect your data and use it only for providing their services.
              </p>

              <h3 className="text-xl font-semibold text-white mt-6 mb-3">4.3 Legal Requirements</h3>
              <p>We may disclose information if required by law or to:</p>
              <ul className="list-disc pl-6 space-y-2 mt-3">
                <li>Comply with legal processes or government requests</li>
                <li>Enforce our Terms of Service</li>
                <li>Protect rights, safety, or property</li>
                <li>Investigate potential violations</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">5. Data Retention</h2>
              <p>We retain your information for as long as necessary to provide the Service:</p>
              <ul className="list-disc pl-6 space-y-2 mt-3">
                <li><strong>Account Data:</strong> Retained until you delete your account</li>
                <li><strong>Incident Reports:</strong> Retained indefinitely as part of public reputation history</li>
                <li><strong>Logs and Analytics:</strong> Retained for up to 24 months for security and improvement purposes</li>
                <li><strong>Deleted Accounts:</strong> Personal identifiers removed within 30 days; anonymized content may remain</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">6. Google Analytics</h2>
              <p>
                We use Google Analytics to understand how users interact with our Service. Google Analytics collects information such as:
              </p>
              <ul className="list-disc pl-6 space-y-2 mt-3">
                <li>Pages viewed and features used</li>
                <li>Time spent on pages</li>
                <li>Browser and device information</li>
                <li>Anonymized IP addresses</li>
              </ul>
              <p className="mt-3">
                Google Analytics uses cookies and similar technologies. You can opt out using the <a href="https://tools.google.com/dlpage/gaoptout" className="text-brand hover:underline" target="_blank" rel="noopener noreferrer">Google Analytics Opt-out Browser Add-on</a>.
              </p>
              <p className="mt-3">
                Learn more about Google&apos;s privacy practices at <a href="https://policies.google.com/privacy" className="text-brand hover:underline" target="_blank" rel="noopener noreferrer">Google Privacy Policy</a>.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">7. Your Privacy Rights</h2>
              <p>Depending on your jurisdiction, you may have the following rights:</p>

              <h3 className="text-xl font-semibold text-white mt-6 mb-3">7.1 Access and Portability</h3>
              <p>Request a copy of your personal data in a structured, machine-readable format.</p>

              <h3 className="text-xl font-semibold text-white mt-6 mb-3">7.2 Correction</h3>
              <p>Request correction of inaccurate personal data.</p>

              <h3 className="text-xl font-semibold text-white mt-6 mb-3">7.3 Deletion</h3>
              <p>Request deletion of your account and associated personal data. Note: publicly posted content may remain anonymized.</p>

              <h3 className="text-xl font-semibold text-white mt-6 mb-3">7.4 Objection and Restriction</h3>
              <p>Object to processing or request restriction in certain circumstances.</p>

              <p className="mt-6">
                To exercise these rights, contact us through the platform or community channels. We will respond within 30 days.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">8. Data Security</h2>
              <p>We implement industry-standard security measures to protect your information:</p>
              <ul className="list-disc pl-6 space-y-2 mt-3">
                <li><strong>Encryption:</strong> TLS/SSL encryption for data in transit</li>
                <li><strong>Database Security:</strong> Row-level security (RLS) policies in Supabase</li>
                <li><strong>Authentication:</strong> Secure passwordless authentication and OAuth</li>
                <li><strong>Access Control:</strong> Strict role-based access to backend systems</li>
                <li><strong>Monitoring:</strong> Logging and alerting for suspicious activity</li>
              </ul>
              <p className="mt-3">
                However, no method of transmission over the internet is 100% secure. We cannot guarantee absolute security.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">9. Children&apos;s Privacy</h2>
              <p>
                Ratlist.gg is not intended for users under 13 years of age. We do not knowingly collect information from children. If you believe we have collected information from a child, please contact us immediately.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">10. International Data Transfers</h2>
              <p>
                Your information may be transferred to and processed in countries other than your own. We use service providers that comply with international data protection frameworks.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">11. Changes to This Policy</h2>
              <p>
                We may update this Privacy Policy from time to time. Changes will be posted on this page with an updated &quot;Last updated&quot; date. Material changes will be communicated via the Service or email.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">12. Contact Us</h2>
              <p>
                If you have questions or concerns about this Privacy Policy or our data practices, please contact us through our community channels or platform.
              </p>
            </section>

            <section className="border-t border-white/10 pt-8 mt-12">
              <p className="text-white/40 text-sm">
                By using Ratlist.gg, you acknowledge that you have read and understood this Privacy Policy.
              </p>
            </section>

          </div>
        </div>
      </div>
    </section>
  )
}
