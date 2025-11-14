import Link from "next/link";

export function Footer() {
  return (
    <footer className="relative border-t border-white/5 py-12 mt-16">
      <div className="mx-auto max-w-7xl px-6">
        <div className="text-center mb-6">
          <h2 className="text-xl font-bold text-zinc-300 mb-2">
            NextWipeTime
          </h2>
          <p className="text-sm text-zinc-500">
            Track wipe schedules, seasons, and events for your favorite games
          </p>
        </div>

        <div className="flex justify-center gap-6 mb-8 text-sm">
          <Link
            href="/privacy"
            className="text-zinc-400 hover:text-zinc-300 transition-colors"
          >
            Privacy Policy
          </Link>
          <Link
            href="/terms"
            className="text-zinc-400 hover:text-zinc-300 transition-colors"
          >
            Terms of Service
          </Link>
          <Link
            href="/about"
            className="text-zinc-400 hover:text-zinc-300 transition-colors"
          >
            About
          </Link>
        </div>

        <div className="max-w-3xl mx-auto text-xs text-zinc-600 text-center space-y-2">
          <p>
            Game content, logos, and trademarks are property of their respective
            owners. All company, product and service names used in this website
            are for identification purposes only.
          </p>
          <p>
            NextWipeTime is not affiliated with, endorsed by, or in any way
            officially connected with Rust, Escape from Tarkov, Path of Exile,
            Fortnite, Deadlock, Diablo 4, Last Epoch, Valorant, League of
            Legends, Teamfight Tactics, Apex Legends, Call of Duty, Rocket
            League, Dead by Daylight, PUBG, or any of their subsidiaries or
            affiliates.
          </p>
          <p className="text-zinc-700">
            © 2025 NextWipeTime. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
