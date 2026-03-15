"use client";

import { Search, Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Games", href: "/games" },
  { label: "Events", href: "/calendar" },
];

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const pathname = usePathname();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    // passive: true prevents blocking scroll performance
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Move focus logic into handlers instead of useEffect
  const openSearch = useCallback(() => {
    setSearchOpen(true);
    // Input isn't mounted yet — wait one frame before focusing
    requestAnimationFrame(() => searchInputRef.current?.focus());
  }, []);

  const closeSearch = useCallback(() => {
    setSearchOpen(false);
    searchButtonRef.current?.focus();
  }, []);

  const isActiveLink = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-[#0a0a0a]/95 backdrop-blur-xl shadow-lg" : "bg-[#0a0a0a]"
      }`}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 group transition-transform hover:scale-105"
          >
            <div className="relative">
              <span className="text-2xl font-black tracking-tighter text-white">
                WipePunch
              </span>
              <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-white group-hover:w-full transition-all duration-300" />
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`relative px-4 py-2 text-sm font-medium transition-all duration-200 rounded-lg ${
                  isActiveLink(link.href)
                    ? "text-[#FDB913]"
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                }`}
              >
                {link.label}
                {isActiveLink(link.href) && (
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 bg-[#FDB913] rounded-full" />
                )}
              </Link>
            ))}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            {/* Search Button */}
            <button
              ref={searchButtonRef}
              type="button"
              onClick={() => (searchOpen ? closeSearch() : openSearch())}
              className="hidden sm:flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-all"
              aria-label="Search Games"
              aria-expanded={searchOpen}
            >
              <Search className="w-4 h-4" />
              <span className="hidden lg:inline">Search Games</span>
            </button>

            {/* Get App CTA */}
            <Link
              href="/premium"
              className="hidden sm:inline-flex items-center px-5 py-2 text-sm font-bold text-white bg-white/10 hover:bg-white/20 border border-white/10 rounded-full transition-all duration-300 hover:scale-105"
            >
              Get App
            </Link>

            {/* Mobile Menu Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-gray-400 hover:text-white transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-white/5 bg-[#0a0a0a] animate-fade-in">
          <nav className="px-4 py-4 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-4 py-3 text-sm font-medium rounded-lg transition-all ${
                  isActiveLink(link.href)
                    ? "text-[#FDB913] bg-[#FDB913]/10"
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                }`}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/premium"
              className="block px-4 py-3 text-sm font-bold text-center text-white bg-white/10 border border-white/10 rounded-lg mt-4"
            >
              Get App
            </Link>
          </nav>
        </div>
      )}

      {/* Search Overlay */}
      {searchOpen && (
        <div
          role="search"
          className="absolute inset-x-0 top-full bg-[#0a0a0a]/98 backdrop-blur-xl border-b border-white/5 p-6 animate-fade-in"
          onClick={(e) => e.stopPropagation()}
          onKeyDown={(e) => e.stopPropagation()}
        >
          <div className="max-w-3xl mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search for games..."
                className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#FDB913]/50 focus:ring-2 focus:ring-[#FDB913]/20 transition-all"
                onKeyDown={(e) => {
                  if (e.key === "Escape") closeSearch();
                }}
              />
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
