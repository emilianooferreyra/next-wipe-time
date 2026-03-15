import { Bell, ChartBar, Check, Clock, Crown, Shield, Zap } from "lucide-react";
import Link from "next/link";
import { Footer } from "../_components/footer";
import { Header } from "../_components/header";

const features = [
  {
    icon: Bell,
    title: "Instant Notifications",
    description: "Get notified the moment a new wipe or season is announced",
  },
  {
    icon: ChartBar,
    title: "Detailed Analytics",
    description: "View historical wipe data and prediction accuracy stats",
  },
  {
    icon: Clock,
    title: "Custom Alerts",
    description: "Set personalized reminders for your favorite games",
  },
  {
    icon: Zap,
    title: "Priority Updates",
    description: "Be the first to know about confirmed dates and changes",
  },
  {
    icon: Shield,
    title: "No Ads",
    description: "Enjoy an ad-free experience across the entire platform",
  },
];

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Basic tracking for casual gamers",
    features: [
      "Track up to 5 games",
      "Basic wipe countdowns",
      "Email notifications",
      "Community support",
    ],
    cta: "Get Started",
    href: "/",
    highlighted: false,
  },
  {
    name: "Premium",
    price: "$4.99",
    period: "per month",
    description: "Everything you need for serious tracking",
    features: [
      "Unlimited games",
      "Real-time notifications",
      "Advanced analytics",
      "Custom alert schedules",
      "Priority support",
      "No advertisements",
    ],
    cta: "Get Premium",
    href: "/login?redirect=premium",
    highlighted: true,
  },
  {
    name: "Pro",
    price: "$9.99",
    period: "per month",
    description: "For content creators and power users",
    features: [
      "Everything in Premium",
      "API access",
      "Discord bot integration",
      "Custom webhooks",
      "White-label options",
      "Dedicated support",
    ],
    cta: "Coming Soon",
    href: "#",
    highlighted: false,
  },
];

export default function PremiumPage() {
  return (
    <div className="min-h-screen bg-[#0d0d0d]">
      <Header />

      <main className="pt-28">
        <section className="relative py-20 px-4">
          <div className="absolute inset-0 bg-gradient-to-b from-yellow-500/5 via-transparent to-transparent" />
          <div className="relative max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 mb-6">
              <Crown className="w-4 h-4" />
              <span className="text-sm font-medium">Premium Features</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Never Miss a Wipe Again
            </h1>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-8">
              Get instant notifications, detailed analytics, and custom alerts
              for all your favorite games
            </p>
            <Link
              href="/login?redirect=premium"
              className="inline-flex items-center gap-2 px-8 py-4 bg-yellow-500 hover:bg-yellow-400 text-black font-semibold rounded-lg transition-colors"
            >
              <Crown className="w-5 h-5" />
              Upgrade to Premium
            </Link>
          </div>
        </section>

        <section className="py-16 px-4 border-t border-white/5">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-2xl font-bold text-white text-center mb-12">
              Premium Benefits
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature) => {
                const Icon = feature.icon;
                return (
                  <div
                    key={feature.title}
                    className="p-6 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 transition-colors"
                  >
                    <div className="w-12 h-12 rounded-lg bg-yellow-500/10 flex items-center justify-center text-yellow-500 mb-4">
                      <Icon className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-gray-400 text-sm">
                      {feature.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="py-16 px-4 border-t border-white/5">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-2xl font-bold text-white text-center mb-12">
              Choose Your Plan
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              {plans.map((plan) => (
                <div
                  key={plan.name}
                  className={`relative p-6 rounded-xl border ${plan.highlighted ? "bg-yellow-500/5 border-yellow-500/30" : "bg-white/5 border-white/5"}`}
                >
                  {plan.highlighted && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-yellow-500 text-black text-xs font-semibold rounded-full">
                      Most Popular
                    </div>
                  )}
                  <div className="text-center mb-6">
                    <h3 className="text-xl font-bold text-white mb-2">
                      {plan.name}
                    </h3>
                    <div className="flex items-baseline justify-center gap-1">
                      <span className="text-3xl font-bold text-white">
                        {plan.price}
                      </span>
                      <span className="text-gray-400">/{plan.period}</span>
                    </div>
                    <p className="text-gray-400 text-sm mt-2">
                      {plan.description}
                    </p>
                  </div>
                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature) => (
                      <li
                        key={feature}
                        className="flex items-center gap-2 text-gray-300 text-sm"
                      >
                        <Check
                          className={`w-5 h-5 ${plan.highlighted ? "text-yellow-500" : "text-green-500"}`}
                        />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Link
                    href={plan.href}
                    className={`block w-full text-center py-3 rounded-lg font-medium transition-colors ${plan.highlighted ? "bg-yellow-500 hover:bg-yellow-400 text-black" : "bg-white/10 hover:bg-white/20 text-white"}`}
                  >
                    {plan.cta}
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 px-4 border-t border-white/5">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl font-bold text-white mb-4">Questions?</h2>
            <p className="text-gray-400 mb-6">
              Contact our support team for any questions about premium features
            </p>
            <Link
              href="/support"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
            >
              Contact Support
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
