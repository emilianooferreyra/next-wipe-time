import Link from "next/link";

export default function TermsOfService() {
  const lastUpdated = "November 13, 2025";

  return (
    <div className="min-h-screen bg-[#1a1f2e] text-zinc-300">
      <header className="border-b border-white/5 bg-[#242938]/50 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-6 py-6">
          <Link
            href="/"
            className="text-2xl font-bold tracking-tight text-zinc-50 hover:text-zinc-300 transition-colors"
          >
            NextWipeTime
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-12">
        <h1 className="text-4xl font-bold text-zinc-50 mb-4">
          Terms of Service
        </h1>
        <p className="text-sm text-zinc-500 mb-8">
          Last updated: {lastUpdated}
        </p>

        <div className="space-y-8 text-zinc-400 leading-relaxed">
          <section>
            <h2 className="text-2xl font-semibold text-zinc-200 mb-4">
              1. Acceptance of Terms
            </h2>
            <p>
              By accessing and using NextWipeTime ("the Service"), you accept
              and agree to be bound by these Terms of Service. If you do not
              agree to these terms, please do not use our Service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-zinc-200 mb-4">
              2. Description of Service
            </h2>
            <p>
              NextWipeTime provides information about game wipe schedules,
              seasons, and events for various video games. We aggregate data
              from official sources, community forums, and public announcements.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-zinc-200 mb-4">
              3. No Warranty
            </h2>
            <p className="mb-4">
              <strong>
                The information provided is for informational purposes only.
              </strong>
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>
                We do not guarantee the accuracy, completeness, or timeliness of
                information
              </li>
              <li>Game schedules may change without notice</li>
              <li>
                We are not responsible for decisions made based on our
                information
              </li>
              <li>
                The Service is provided "AS IS" without warranties of any kind
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-zinc-200 mb-4">
              4. Intellectual Property
            </h2>
            <p className="mb-4">
              <strong>Game Content:</strong>
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4 mb-4">
              <li>
                All game names, logos, and trademarks are property of their
                respective owners
              </li>
              <li>
                Game content is used under fair use for informational purposes
              </li>
              <li>We do not claim ownership of any game content</li>
            </ul>
            <p className="mb-4">
              <strong>Our Content:</strong>
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>
                The NextWipeTime website design and original content are our
                property
              </li>
              <li>
                You may not copy, reproduce, or redistribute our proprietary
                content
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-zinc-200 mb-4">
              5. User Conduct
            </h2>
            <p className="mb-2">You agree not to:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Use the Service for any unlawful purpose</li>
              <li>Attempt to gain unauthorized access to our systems</li>
              <li>Interfere with the proper functioning of the Service</li>
              <li>Use automated systems (bots, scrapers) without permission</li>
              <li>Impersonate any person or entity</li>
              <li>Transmit any viruses or malicious code</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-zinc-200 mb-4">
              6. Limitation of Liability
            </h2>
            <p className="mb-4">To the fullest extent permitted by law:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>
                We are not liable for any indirect, incidental, or consequential
                damages
              </li>
              <li>
                We are not liable for any loss of profits, data, or
                opportunities
              </li>
              <li>Our total liability shall not exceed $100 USD</li>
              <li>We are not responsible for third-party content or links</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-zinc-200 mb-4">
              7. Third-Party Links
            </h2>
            <p>
              Our Service may contain links to third-party websites or services.
              We are not responsible for the content, privacy policies, or
              practices of third-party sites.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-zinc-200 mb-4">
              8. Advertising
            </h2>
            <p>
              We may display advertisements on our Service. Advertisers are
              responsible for ensuring their ads comply with applicable laws. We
              are not responsible for advertiser content.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-zinc-200 mb-4">
              9. Modifications to Service
            </h2>
            <p>
              We reserve the right to modify, suspend, or discontinue the
              Service at any time without notice. We are not liable for any
              modification, suspension, or discontinuation.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-zinc-200 mb-4">
              10. Changes to Terms
            </h2>
            <p>
              We may update these Terms of Service at any time. Continued use of
              the Service after changes constitutes acceptance of the new terms.
              We will update the "Last updated" date.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-zinc-200 mb-4">
              11. Governing Law
            </h2>
            <p>
              These Terms are governed by the laws of [Your Jurisdiction]. Any
              disputes shall be resolved in the courts of [Your Jurisdiction].
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-zinc-200 mb-4">
              12. Severability
            </h2>
            <p>
              If any provision of these Terms is found to be unenforceable, the
              remaining provisions will remain in full force and effect.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-zinc-200 mb-4">
              13. Contact Information
            </h2>
            <p>
              For questions about these Terms of Service, please contact us at:
            </p>
            <p className="mt-2 text-zinc-300">Email: legal@nextwipetime.com</p>
          </section>

          <section className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-yellow-400 mb-3">
              ⚠️ Important Disclaimer
            </h2>
            <p className="text-yellow-200/80">
              NextWipeTime is an independent fan-made website and is NOT
              affiliated with, endorsed by, or officially connected to any of
              the games listed on this site. All game names, logos, and content
              are property of their respective owners. We provide this
              information for community purposes under fair use guidelines.
            </p>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t border-white/5">
          <Link
            href="/"
            className="inline-flex items-center text-[#FA5D29] hover:text-[#FA5D29]/80 transition-colors"
          >
            ← Back to Home
          </Link>
        </div>
      </main>

      <footer className="border-t border-white/5 py-8 mt-16">
        <div className="mx-auto max-w-7xl px-6 text-center text-sm text-zinc-600">
          © 2025 NextWipeTime. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
