import Link from "next/link";

export default function PrivacyPolicy() {
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
        <h1 className="text-4xl font-bold text-zinc-50 mb-4">Privacy Policy</h1>
        <p className="text-sm text-zinc-500 mb-8">
          Last updated: {lastUpdated}
        </p>

        <div className="space-y-8 text-zinc-400 leading-relaxed">
          <section>
            <h2 className="text-2xl font-semibold text-zinc-200 mb-4">
              1. Introduction
            </h2>
            <p>
              Welcome to NextWipeTime ("we", "our", or "us"). We are committed
              to protecting your privacy. This Privacy Policy explains how we
              collect, use, and share information about you when you use our
              website.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-zinc-200 mb-4">
              2. Information We Collect
            </h2>
            <h3 className="text-lg font-medium text-zinc-300 mb-2">
              2.1 Information You Provide
            </h3>
            <p className="mb-4">
              Currently, we do not require user accounts or collect personal
              information directly from you.
            </p>

            <h3 className="text-lg font-medium text-zinc-300 mb-2">
              2.2 Automatically Collected Information
            </h3>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Browser type and version</li>
              <li>Device information</li>
              <li>IP address (anonymized)</li>
              <li>Pages visited and time spent on pages</li>
              <li>Referring website</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-zinc-200 mb-4">
              3. How We Use Your Information
            </h2>
            <p className="mb-2">We use the collected information to:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Improve and optimize our website</li>
              <li>Analyze usage patterns and trends</li>
              <li>Prevent fraud and abuse</li>
              <li>Comply with legal obligations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-zinc-200 mb-4">
              4. Cookies and Tracking
            </h2>
            <p className="mb-4">
              We use cookies and similar tracking technologies to analyze
              website traffic and improve user experience.
            </p>
            <p className="mb-2">Types of cookies we use:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>
                <strong>Essential cookies:</strong> Required for the website to
                function
              </li>
              <li>
                <strong>Analytics cookies:</strong> Help us understand how
                visitors use our site
              </li>
              <li>
                <strong>Advertising cookies:</strong> Used to display relevant
                ads (if applicable)
              </li>
            </ul>
            <p className="mt-4">
              You can control cookies through your browser settings. Note that
              disabling cookies may affect website functionality.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-zinc-200 mb-4">
              5. Third-Party Services
            </h2>
            <p className="mb-2">
              We may use third-party services that collect information:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>
                <strong>Google Analytics:</strong> For website analytics
              </li>
              <li>
                <strong>Google AdSense:</strong> For displaying advertisements
                (if applicable)
              </li>
              <li>
                <strong>Vercel Analytics:</strong> For performance monitoring
              </li>
            </ul>
            <p className="mt-4">
              These services have their own privacy policies. We recommend
              reviewing them.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-zinc-200 mb-4">
              6. Data Sharing
            </h2>
            <p>
              We do not sell, trade, or rent your personal information to third
              parties. We may share anonymized, aggregated data for analytics
              purposes.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-zinc-200 mb-4">
              7. Data Security
            </h2>
            <p>
              We implement reasonable security measures to protect your
              information. However, no method of transmission over the internet
              is 100% secure.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-zinc-200 mb-4">
              8. Your Rights
            </h2>
            <p className="mb-2">
              Depending on your location, you may have the following rights:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Access your personal data</li>
              <li>Request correction of your data</li>
              <li>Request deletion of your data</li>
              <li>Object to processing of your data</li>
              <li>Opt-out of marketing communications</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-zinc-200 mb-4">
              9. Children's Privacy
            </h2>
            <p>
              Our service is not directed to children under 13. We do not
              knowingly collect personal information from children under 13.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-zinc-200 mb-4">
              10. Changes to This Policy
            </h2>
            <p>
              We may update this Privacy Policy from time to time. We will
              notify you of any changes by posting the new Privacy Policy on
              this page and updating the "Last updated" date.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-zinc-200 mb-4">
              11. Contact Us
            </h2>
            <p>
              If you have any questions about this Privacy Policy, please
              contact us at:
            </p>
            <p className="mt-2 text-zinc-300">
              Email: privacy@nextwipetime.com
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
