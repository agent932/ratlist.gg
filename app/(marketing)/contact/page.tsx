export default function ContactPage() {
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
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            Get in Touch
          </div>
          
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
              Contact Us
            </span>
          </h1>
          
          <p className="text-white/60 text-lg">
            Have questions, concerns, or feedback? We&apos;re here to help.
          </p>
        </div>

        {/* Contact Options */}
        <div className="space-y-6 mb-12">
          
          {/* General Inquiries */}
          <div className="rounded-lg border border-white/10 bg-white/5 backdrop-blur-sm p-6">
            <div className="flex items-start gap-4">
              <div className="rounded-lg bg-brand/10 p-3">
                <svg className="h-6 w-6 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-white mb-2">General Questions</h3>
                <p className="text-white/60 mb-3">
                  Questions about how Ratlist.gg works? Check out our <a href="/faq" className="text-brand hover:underline">FAQ page</a> for answers to common questions.
                </p>
              </div>
            </div>
          </div>

          {/* Report Issues */}
          <div className="rounded-lg border border-white/10 bg-white/5 backdrop-blur-sm p-6">
            <div className="flex items-start gap-4">
              <div className="rounded-lg bg-orange-500/10 p-3">
                <svg className="h-6 w-6 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-white mb-2">Report Content Violations</h3>
                <p className="text-white/60 mb-3">
                  Found content that violates our <a href="/guidelines" className="text-brand hover:underline">Community Guidelines</a>? Use the flag button on any incident to report it for moderation review.
                </p>
                <p className="text-sm text-white/50">
                  For urgent safety concerns (doxxing, threats), please flag the content immediately.
                </p>
              </div>
            </div>
          </div>

          {/* Technical Issues */}
          <div className="rounded-lg border border-white/10 bg-white/5 backdrop-blur-sm p-6">
            <div className="flex items-start gap-4">
              <div className="rounded-lg bg-blue-500/10 p-3">
                <svg className="h-6 w-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-white mb-2">Technical Support</h3>
                <p className="text-white/60 mb-3">
                  Experiencing bugs, errors, or technical issues with the platform? Email us at{' '}
                  <a href="mailto:ratlistgg@gmail.com" className="text-brand hover:underline">
                    ratlistgg@gmail.com
                  </a>
                  {' '}with details about the issue.
                </p>
                <p className="text-sm text-white/50">
                  Please include your browser, device type, and steps to reproduce the issue.
                </p>
              </div>
            </div>
          </div>

          {/* Privacy & Legal */}
          <div className="rounded-lg border border-white/10 bg-white/5 backdrop-blur-sm p-6">
            <div className="flex items-start gap-4">
              <div className="rounded-lg bg-purple-500/10 p-3">
                <svg className="h-6 w-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-white mb-2">Privacy & Legal Inquiries</h3>
                <p className="text-white/60 mb-3">
                  Questions about data privacy, account deletion, or legal matters? Review our <a href="/privacy" className="text-brand hover:underline">Privacy Policy</a> and <a href="/terms" className="text-brand hover:underline">Terms of Service</a>.
                </p>
                <p className="text-sm text-white/50 mb-2">
                  For formal legal requests or data deletion, contact{' '}
                  <a href="mailto:ratlistgg@gmail.com" className="text-brand hover:underline">
                    ratlistgg@gmail.com
                  </a>
                  {' '}with your account details.
                </p>
              </div>
            </div>
          </div>

          {/* Partnerships & Press */}
          <div className="rounded-lg border border-white/10 bg-white/5 backdrop-blur-sm p-6">
            <div className="flex items-start gap-4">
              <div className="rounded-lg bg-green-500/10 p-3">
                <svg className="h-6 w-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-white mb-2">Business & Media</h3>
                <p className="text-white/60 mb-3">
                  Interested in partnerships, collaborations, or press inquiries? Contact us at{' '}
                  <a href="mailto:ratlistgg@gmail.com" className="text-brand hover:underline">
                    ratlistgg@gmail.com
                  </a>
                  .
                </p>
              </div>
            </div>
          </div>

        </div>

        {/* Important Notes */}
        <div className="rounded-lg border border-yellow-500/20 bg-yellow-500/5 p-6 backdrop-blur-sm">
          <div className="flex items-start gap-3">
            <svg className="h-5 w-5 text-yellow-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h4 className="font-semibold text-yellow-400 mb-2">Important Information</h4>
              <ul className="space-y-2 text-sm text-white/70">
                <li className="flex items-start gap-2">
                  <span className="text-yellow-400 mt-0.5">•</span>
                  <span><strong>Ratlist.gg is community-run and not affiliated with any game developer or publisher.</strong> We cannot assist with in-game issues, bans, or account problems.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-yellow-400 mt-0.5">•</span>
                  <span>For urgent content moderation issues (doxxing, threats, harassment), use the flag feature on the incident itself for fastest response.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-yellow-400 mt-0.5">•</span>
                  <span>Response times may vary. We&apos;re a community-driven platform run by volunteers.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Community Channels */}
        <div className="mt-12 text-center">
          <h3 className="text-xl font-semibold text-white mb-4">Get in Touch</h3>
          <p className="text-white/60 mb-6">
            For all inquiries, reach out to our team
          </p>
          <div className="flex justify-center">
            <a 
              href="mailto:ratlistgg@gmail.com"
              className="inline-flex items-center gap-2 rounded-lg bg-brand hover:bg-brand/90 px-8 py-4 font-semibold text-brand-foreground transition-colors text-lg"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              ratlistgg@gmail.com
            </a>
          </div>
        </div>

      </div>
    </section>
  )
}
