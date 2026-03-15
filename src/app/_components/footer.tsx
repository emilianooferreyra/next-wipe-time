import Image from "next/image";
import Link from "next/link";
// Tree-shakeable imports with proper types
import { Facebook, Instagram, Youtube, Globe, ChevronDown } from "lucide-react";

export function Footer() {
  const currentYear = typeof window !== 'undefined' ? new Date().getFullYear() : 2026;

  return (
    <footer className="bg-[#2a2a2a] text-white py-32" suppressHydrationWarning>
      <div className="mx-auto max-w-6xl px-6">
        {/* Fila 1 - Navegación */}
        <div className="flex justify-between items-center mb-6">
          <nav className="flex gap-8">
            {[
              "Empleo",
              "Información",
              "Asistencia",
              "Contacto",
              "Prensa",
              "API",
              "Mapa del sitio",
            ].map((link) => (
              <a
                key={link}
                href="/"
                className="hover:text-gray-300 transition text-sm"
              >
                {link}
              </a>
            ))}
          </nav>
          <button className="flex items-center gap-2 text-gray-300 text-sm">
            <Globe className="w-4 h-4" />
            Español (EU)
            <ChevronDown className="w-4 h-4" />
          </button>
        </div>

        {/* Fila 2 - Logo, Legal, Social */}
        <div className="flex justify-between items-center">
          {/* Logo y App Stores */}
          <div className="w-64">
            <Link href="/" className="inline-block mb-4">
              <span className="text-3xl font-black tracking-tight text-white">
                WipePunch
              </span>
            </Link>

            {/* App Store Buttons */}
            <div className="flex items-center gap-3 mb-4">
              <a href="/" className="block transition-all hover:opacity-80">
                <Image
                  src="/googlep.webp"
                  alt="Get it on Google Play"
                  width={135}
                  height={40}
                  className="rounded-lg"
                />
              </a>
              <a href="/" className="block transition-all hover:opacity-80">
                <Image
                  src="/applep.webp"
                  alt="Download on the App Store"
                  width={120}
                  height={40}
                  className="rounded-lg"
                />
              </a>
            </div>
          </div>

          {/* Legal */}
          <div className="text-sm text-gray-400 max-w-xl">
            <p>© {currentYear} WipePunch.</p>
            <nav className="flex gap-4 mt-3">
              {["Privacidad", "Legal", "Términos", "Política de cookies"].map(
                (link) => (
                  <Link
                    key={link}
                    href="/"
                    className="hover:text-white transition"
                  >
                    {link}
                  </Link>
                )
              )}
            </nav>
          </div>

          {/* Social */}
          <div className="flex gap-3">
            <a
              href="/"
              className="w-10 h-10 rounded-full bg-black flex items-center justify-center hover:bg-gray-800 transition"
              aria-label="Facebook"
            >
              <Facebook className="w-5 h-5" />
            </a>
            <a
              href="/"
              className="w-10 h-10 rounded-full bg-black flex items-center justify-center hover:bg-gray-800 transition"
              aria-label="Instagram"
            >
              <Instagram className="w-5 h-5" />
            </a>
            <a
              href="/"
              className="w-10 h-10 rounded-full bg-black flex items-center justify-center hover:bg-gray-800 transition"
              aria-label="X (Twitter)"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </a>
            <a
              href="/"
              className="w-10 h-10 rounded-full bg-black flex items-center justify-center hover:bg-gray-800 transition"
              aria-label="TikTok"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
              </svg>
            </a>
            <a
              href="/"
              className="w-10 h-10 rounded-full bg-black flex items-center justify-center hover:bg-gray-800 transition"
              aria-label="YouTube"
            >
              <Youtube className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
