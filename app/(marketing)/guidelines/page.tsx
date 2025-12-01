export default function GuidelinesPage() {
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
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Community
          </div>
          
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
              Community Guidelines
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
              <h2 className="text-2xl font-bold text-white mb-4">Our Mission</h2>
              <p>
                Ratlist.gg exists to help the extraction shooter community make informed decisions about who to team up with. We believe in transparency, fairness, and the power of community-driven information.
              </p>
              <p className="mt-3">
                These guidelines help maintain a safe, respectful, and useful platform for everyone.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">Core Principles</h2>
              
              <div className="space-y-4 mt-4">
                <div className="rounded-lg border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
                  <h3 className="text-xl font-semibold text-white mb-2">🎯 Accuracy Over Drama</h3>
                  <p>Report facts about in-game behavior. This isn&apos;t a place for personal attacks or venting frustration.</p>
                </div>

                <div className="rounded-lg border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
                  <h3 className="text-xl font-semibold text-white mb-2">🛡️ Privacy First</h3>
                  <p>Never share real-world identities. Game handles only. No doxxing, ever.</p>
                </div>

                <div className="rounded-lg border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
                  <h3 className="text-xl font-semibold text-white mb-2">🤝 Respect Everyone</h3>
                  <p>No harassment, hate speech, or targeted abuse. Critique behavior, not people.</p>
                </div>

                <div className="rounded-lg border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
                  <h3 className="text-xl font-semibold text-white mb-2">⚖️ Context Matters</h3>
                  <p>Use reputation info as one data point, not absolute truth. Everyone deserves nuance.</p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">What TO Do</h2>
              
              <h3 className="text-xl font-semibold text-white mt-6 mb-3">✅ Good Incident Reports</h3>
              <ul className="list-disc pl-6 space-y-3 mt-3">
                <li>
                  <strong>Describe specific in-game behavior</strong>
                  <div className="text-white/60 text-sm mt-1">Example: &quot;Shot me from behind 5 seconds before extract, took my gear&quot;</div>
                </li>
                <li>
                  <strong>Include relevant context</strong>
                  <div className="text-white/60 text-sm mt-1">Map, mode, approximate time, what led to the incident</div>
                </li>
                <li>
                  <strong>Stay factual and objective</strong>
                  <div className="text-white/60 text-sm mt-1">Focus on what happened, not emotions or speculation</div>
                </li>
                <li>
                  <strong>Report positive experiences too</strong>
                  <div className="text-white/60 text-sm mt-1">Clutch saves, helpful teammates, and good sportsmanship deserve recognition</div>
                </li>
                <li>
                  <strong>Use proper categories</strong>
                  <div className="text-white/60 text-sm mt-1">Choose the category that best matches the behavior</div>
                </li>
              </ul>

              <h3 className="text-xl font-semibold text-white mt-6 mb-3">✅ Responsible Use</h3>
              <ul className="list-disc pl-6 space-y-2 mt-3">
                <li>Search before teaming up with strangers</li>
                <li>Consider multiple data points, not just one bad report</li>
                <li>Flag content that violates guidelines</li>
                <li>Give players the benefit of the doubt when appropriate</li>
                <li>Update or correct your reports if you made a mistake (within 15 minutes)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">What NOT To Do</h2>
              
              <h3 className="text-xl font-semibold text-white mt-6 mb-3">❌ Strictly Prohibited</h3>
              
              <div className="space-y-4 mt-4">
                <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-4">
                  <h4 className="font-semibold text-red-400 mb-2">🚫 Personal Information (Doxxing)</h4>
                  <p className="text-sm">Never share:</p>
                  <ul className="list-disc pl-6 text-sm mt-2 space-y-1 text-white/60">
                    <li>Real names, addresses, phone numbers, emails</li>
                    <li>Social media profiles or links</li>
                    <li>Photos or images of real people</li>
                    <li>Location data or IP addresses</li>
                    <li>Any other personally identifiable information</li>
                  </ul>
                  <p className="text-sm mt-3 text-red-400"><strong>Instant ban.</strong> No exceptions.</p>
                </div>

                <div className="rounded-lg border border-orange-500/20 bg-orange-500/5 p-4">
                  <h4 className="font-semibold text-orange-400 mb-2">🚫 Harassment & Abuse</h4>
                  <ul className="list-disc pl-6 text-sm space-y-1 text-white/60">
                    <li>Coordinated harassment campaigns</li>
                    <li>Threats of violence or harm</li>
                    <li>Repeated targeting of the same person</li>
                    <li>Encouraging others to harass or abuse</li>
                    <li>Off-platform harassment based on Ratlist info</li>
                  </ul>
                </div>

                <div className="rounded-lg border border-yellow-500/20 bg-yellow-500/5 p-4">
                  <h4 className="font-semibold text-yellow-400 mb-2">🚫 Hate Speech & Discrimination</h4>
                  <ul className="list-disc pl-6 text-sm space-y-1 text-white/60">
                    <li>Slurs based on race, ethnicity, religion, gender, sexuality, disability</li>
                    <li>Discriminatory language or stereotypes</li>
                    <li>Symbols or imagery associated with hate groups</li>
                    <li>Content that promotes violence or hatred</li>
                  </ul>
                </div>

                <div className="rounded-lg border border-purple-500/20 bg-purple-500/5 p-4">
                  <h4 className="font-semibold text-purple-400 mb-2">🚫 False or Malicious Reports</h4>
                  <ul className="list-disc pl-6 text-sm space-y-1 text-white/60">
                    <li>Fabricating incidents that never happened</li>
                    <li>Reporting someone as revenge or punishment</li>
                    <li>Creating multiple accounts to spam reports</li>
                    <li>Coordinating with others to manipulate reputation</li>
                  </ul>
                </div>

                <div className="rounded-lg border border-blue-500/20 bg-blue-500/5 p-4">
                  <h4 className="font-semibold text-blue-400 mb-2">🚫 Spam & Abuse of System</h4>
                  <ul className="list-disc pl-6 text-sm space-y-1 text-white/60">
                    <li>Excessive reporting beyond rate limits</li>
                    <li>Bot or automated submissions</li>
                    <li>Duplicate reports of the same incident</li>
                    <li>Irrelevant or off-topic content</li>
                    <li>Advertising, promotional content, or scams</li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">Examples of Good vs Bad Reports</h2>
              
              <div className="space-y-6 mt-4">
                <div>
                  <h3 className="text-lg font-semibold text-green-400 mb-3">✅ Good Report Example</h3>
                  <div className="rounded-lg border border-green-500/20 bg-green-500/5 p-4 text-sm">
                    <p className="font-semibold">Category: Betrayal</p>
                    <p className="mt-2 text-white/80">
                      &quot;Player agreed to extract together from Customs. We were 20 meters from extract when they shot me in the back and took my loot. This happened around 3pm EST on Factory map.&quot;
                    </p>
                    <p className="mt-3 text-green-400 text-xs">
                      ✓ Specific behavior | ✓ Context provided | ✓ Factual | ✓ No PII
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-red-400 mb-3">❌ Bad Report Example</h3>
                  <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-4 text-sm">
                    <p className="font-semibold">Category: Betrayal</p>
                    <p className="mt-2 text-white/80 line-through">
                      &quot;This guy John Smith from Discord is a total scumbag rat. His real name is [REDACTED] and he lives in [REDACTED]. Everyone report him!!!&quot;
                    </p>
                    <p className="mt-3 text-red-400 text-xs">
                      ✗ Contains PII | ✗ No specifics | ✗ Call to brigade | ✗ Harassment
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">Moderation & Enforcement</h2>
              
              <h3 className="text-xl font-semibold text-white mt-6 mb-3">How We Handle Violations</h3>
              <ul className="list-disc pl-6 space-y-2 mt-3">
                <li>
                  <strong>Community Flagging:</strong> Users can flag content that violates guidelines
                </li>
                <li>
                  <strong>Review Process:</strong> Moderators review flagged content within 24-48 hours
                </li>
                <li>
                  <strong>Graduated Responses:</strong> Warnings → Temporary suspension → Permanent ban
                </li>
                <li>
                  <strong>Immediate Action:</strong> Severe violations (doxxing, threats) result in instant permanent bans
                </li>
              </ul>

              <h3 className="text-xl font-semibold text-white mt-6 mb-3">How to Flag Content</h3>
              <p>If you see content that violates these guidelines:</p>
              <ol className="list-decimal pl-6 space-y-2 mt-3">
                <li>Click the &quot;Flag&quot; button on the incident</li>
                <li>Select the violation type</li>
                <li>Provide a brief explanation</li>
                <li>Our moderation team will review</li>
              </ol>

              <h3 className="text-xl font-semibold text-white mt-6 mb-3">Grace Period</h3>
              <p>
                You can edit or delete your own reports within <strong>15 minutes</strong> of submission. After that, reports become permanent to maintain data integrity. Use this window to correct mistakes.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">Understanding Reputation</h2>
              
              <h3 className="text-xl font-semibold text-white mt-6 mb-3">How Tiers Work</h3>
              <div className="space-y-2 mt-3">
                <p><span className="text-green-400 font-semibold">S Tier (50+):</span> Exceptional reputation, multiple positive reports</p>
                <p><span className="text-blue-400 font-semibold">A Tier (20-49):</span> Good reputation, generally trustworthy</p>
                <p><span className="text-gray-400 font-semibold">B Tier (0-19):</span> Neutral/new, limited data</p>
                <p><span className="text-yellow-400 font-semibold">C Tier (-1 to -10):</span> Some negative reports, proceed with caution</p>
                <p><span className="text-orange-400 font-semibold">D Tier (-11 to -30):</span> Multiple negative reports, high risk</p>
                <p><span className="text-red-400 font-semibold">F Tier (-31+):</span> Notorious, avoid teaming up</p>
              </div>

              <h3 className="text-xl font-semibold text-white mt-6 mb-3">Remember:</h3>
              <ul className="list-disc pl-6 space-y-2 mt-3">
                <li>Reputation is community opinion, not official verification</li>
                <li>People can change; past behavior doesn&apos;t guarantee future actions</li>
                <li>Consider the number and recency of reports</li>
                <li>One bad game doesn&apos;t make someone a &quot;rat&quot;</li>
                <li>Use this as one tool in your decision-making, not the only one</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">Questions or Concerns?</h2>
              <p>
                If you have questions about these guidelines, disagree with a moderation decision, or want to report serious violations, please reach out through our community channels.
              </p>
              <p className="mt-3">
                We&apos;re committed to maintaining a fair, safe, and useful platform for everyone.
              </p>
            </section>

            <section className="border-t border-white/10 pt-8 mt-12">
              <div className="rounded-lg border border-brand/20 bg-brand/5 p-6 backdrop-blur-sm">
                <p className="font-semibold text-white mb-2">Remember:</p>
                <p className="text-white/80">
                  Ratlist.gg works because our community chooses to use it responsibly. Your participation in maintaining these standards makes the platform valuable for everyone. Thank you for being part of the solution.
                </p>
              </div>
            </section>

          </div>
        </div>
      </div>
    </section>
  )
}
