"use client";

import dynamic from "next/dynamic";
import { games } from "@/components/game-tabs";
import { useGameQueries } from "@/hooks/use-game-queries";
import { Header } from "./_components/header";
import { Footer } from "./_components/footer";
import { Calendar, Zap, Users } from "lucide-react";

// Lazy load below-the-fold components for better FCP (~300ms improvement)
const GameGrid = dynamic(
  () => import("./_components/game-grid").then((mod) => ({ default: mod.GameGrid })),
  {
    loading: () => (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="h-[500px] rounded-2xl bg-[#1a1a1a] border border-white/[0.06] animate-pulse"
          />
        ))}
      </div>
    ),
    ssr: false,
  }
);

// Hoist static data outside component to prevent recreation on every render
const FEATURES = [
  "Live countdown timers",
  "Historical wipe data",
  "Multi-game dashboard",
] as const;

const STATS = [
  { number: "1M+", label: "Active Users", iconName: "Users" },
  { label: "Games Tracked", iconName: "Calendar" },
  { number: "99.9%", label: "Uptime", iconName: "Zap" },
] as const;

const SHOWCASE_GAMES = [
  {
    title: "Red Dead Redemption",
    status: "Next Wipe: TBA",
    gradient: "from-red-900/80 to-red-950/90",
  },
  {
    title: "Stardew Valley",
    status: "Season 2 Active",
    gradient: "from-blue-900/80 to-blue-950/90",
  },
  {
    title: "Fortnite",
    status: "Next Season in 15d",
    gradient: "from-orange-500/90 to-yellow-600/90",
  },
  {
    title: "Dragon Ball Z",
    status: "Tournament Live",
    gradient: "from-purple-900/80 to-purple-950/90",
  },
  {
    title: "Silent Hill 2",
    status: "Coming Soon",
    gradient: "from-gray-700/80 to-gray-900/90",
  },
] as const;

const PROFILE_GAMES = ["Spider-Man 2", "PUBG", "Red Dead"] as const;

export function HomeClient() {
  const { gameData, loading } = useGameQueries();

  return (
    <div className="relative min-h-screen font-sans bg-[#0a0a0a]">
      <Header />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 right-1/4 w-96 h-96 bg-[#FDB913]/10 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-[#FDB913]/5 rounded-full blur-[100px]" />
        </div>

        <div className="relative max-w-5xl mx-auto text-center animate-fade-in">
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-black mb-6 leading-tight text-white">
            Track game wipes and never miss a reset
          </h1>

          <p className="text-lg sm:text-xl text-gray-400 mb-10 max-w-3xl mx-auto leading-relaxed">
            Track video games you've wiped. Save those you want to play.
            <br />
            Tell your friends what's good.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <button className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-bold text-white bg-white/10 hover:bg-white/15 border border-white/10 rounded-full transition-all duration-300 hover:scale-105">
              <Zap className="w-5 h-5" />
              Get Started
            </button>
            <button className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-bold text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded-full transition-all duration-300 hover:scale-105">
              <Calendar className="w-5 h-5" />
              View Calendar
            </button>
          </div>

          {/* Stats */}
          <div className="flex flex-wrap items-center justify-center gap-8 text-sm text-gray-400">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span>Live Updates</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span>1M+ Users Worldwide</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-[#FDB913]">{games.length}+</span>
              <span>Games Tracked</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="relative mx-auto max-w-7xl px-6 pb-20">
        <div className="mb-10">
          <h2 className="text-3xl font-bold text-white mb-2">Popular games</h2>
          <p className="text-gray-400">
            Track your favorite games and never miss an update
          </p>
        </div>
        <GameGrid games={games} gameData={gameData} loading={loading} />
      </main>

      {/* What is WipePunch Section */}
      <section className="relative py-32 px-6 bg-gradient-to-b from-[#0a0a0a] via-[#141414] to-[#0a0a0a] overflow-hidden">
        {/* Animated Background Grid */}
        <div className="absolute inset-0 opacity-20">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)",
              backgroundSize: "50px 50px",
            }}
          />
        </div>

        {/* Glow Effects */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-white/5 rounded-full blur-[120px] animate-pulse" />
        <div
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-white/3 rounded-full blur-[120px] animate-pulse"
          style={{ animationDelay: "1s" }}
        />

        <div className="relative mx-auto max-w-7xl">
          {/* Header */}
          <div className="text-center mb-20">
            <div className="inline-block mb-6">
              <div className="flex items-center gap-3 px-6 py-3 bg-white/5 backdrop-blur-sm border border-white/10 rounded-full">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                <span className="text-sm font-bold text-white tracking-wider uppercase">
                  About WipePunch
                </span>
              </div>
            </div>
            <h2 className="text-5xl md:text-7xl font-black text-white mb-6 leading-tight">
              What is{" "}
              <span className="relative inline-block">
                <span className="relative z-10">WipePunch</span>
                <span className="absolute inset-0 blur-xl bg-white/20" />
              </span>
              ?
            </h2>
            <p className="text-xl md:text-2xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
              Your ultimate companion for tracking game seasons, wipes, and
              resets.{" "}
              <span className="text-white font-semibold">
                Never miss a fresh start.
              </span>
            </p>
          </div>

          {/* Feature Grid - Asymmetric Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-12">
            {/* Large Feature Card - Left */}
            <div className="lg:col-span-7 group relative bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] rounded-3xl p-10 border border-white/10 hover:border-white/20 transition-all duration-700 overflow-hidden">
              {/* Hover Glow */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

              <div className="relative z-10">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-white/10 rounded-2xl mb-6 group-hover:scale-110 transition-transform duration-500">
                  <Calendar className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-3xl md:text-4xl font-black text-white mb-4">
                  Track Everything
                </h3>
                <p className="text-lg text-gray-300 leading-relaxed mb-6">
                  Monitor wipe schedules, season timelines, and patch releases
                  across all your favorite games. Get real-time notifications so
                  you're always ready for the next reset.
                </p>
                <ul className="space-y-3">
                  {FEATURES.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-center gap-3 text-gray-400"
                    >
                      <div className="w-1.5 h-1.5 bg-white rounded-full" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Two Stacked Cards - Right */}
            <div className="lg:col-span-5 space-y-6">
              {/* Card 2 */}
              <div className="group relative bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] rounded-3xl p-8 border border-white/10 hover:border-white/20 transition-all duration-700 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

                <div className="relative z-10">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 rounded-2xl mb-4 group-hover:scale-110 transition-transform duration-500">
                    <Users className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-black text-white mb-3">
                    Join the Community
                  </h3>
                  <p className="text-gray-300 leading-relaxed">
                    Connect with over 1M+ gamers tracking their favorite titles.
                  </p>
                </div>
              </div>

              {/* Card 3 */}
              <div className="group relative bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] rounded-3xl p-8 border border-white/10 hover:border-white/20 transition-all duration-700 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

                <div className="relative z-10">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 rounded-2xl mb-4 group-hover:scale-110 transition-transform duration-500">
                    <Zap className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-black text-white mb-3">
                    Lightning Fast
                  </h3>
                  <p className="text-gray-300 leading-relaxed">
                    Instant updates and notifications delivered in real-time.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {STATS.map((stat, i) => {
              const Icon = stat.iconName === "Users" ? Users : stat.iconName === "Calendar" ? Calendar : Zap;
              const displayNumber = stat.iconName === "Calendar" ? `${games.length}+` : stat.number;
              return (
              <div
                key={stat.label}
                className="group relative bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] rounded-2xl p-8 border border-white/10 hover:border-white/20 transition-all duration-500 text-center overflow-hidden"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                <div className="relative z-10">
                  <Icon className="w-8 h-8 text-white mx-auto mb-4 group-hover:scale-110 transition-transform duration-300" />
                  <div className="text-4xl md:text-5xl font-black text-white mb-2">
                    {displayNumber}
                  </div>
                  <div className="text-sm text-gray-400 uppercase tracking-wider font-semibold">
                    {stat.label}
                  </div>
                </div>
              </div>
            );
            })}
          </div>
        </div>
      </section>

      {/* 3D Card Fan Section - Stash Style */}
      <section className="relative py-32 bg-[#0a0a0a] overflow-hidden">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-6xl font-black text-white mb-6">
              Experience the Power
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Track your gaming journey with style
            </p>
          </div>

          {/* 3D Fanned Cards - Desktop */}
          <div
            className="hidden md:block relative h-[500px]"
            style={{ perspective: "2000px" }}
          >
            <div className="relative h-full flex items-center justify-center">
              {/* Card 1 - Far Left */}
              <div
                className="absolute w-72 h-96 rounded-3xl overflow-hidden shadow-2xl cursor-pointer hover:scale-[1.08]"
                style={{
                  transform:
                    "translateX(-420px) translateZ(-180px) rotateY(22deg)",
                  transformStyle: "preserve-3d",
                  transition: "transform 1s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 1s cubic-bezier(0.34, 1.56, 0.64, 1)",
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-red-900/80 to-red-950/90 backdrop-blur-sm">
                  <div className="p-8 h-full flex flex-col justify-end">
                    <h3 className="text-3xl font-black text-white mb-2">
                      Red Dead Redemption
                    </h3>
                    <p className="text-gray-300 text-sm">Next Wipe: TBA</p>
                  </div>
                </div>
              </div>

              {/* Card 2 - Left */}
              <div
                className="absolute w-72 h-96 rounded-3xl overflow-hidden shadow-2xl cursor-pointer hover:scale-[1.08]"
                style={{
                  transform:
                    "translateX(-210px) translateZ(-90px) rotateY(12deg)",
                  transformStyle: "preserve-3d",
                  transition: "transform 1s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 1s cubic-bezier(0.34, 1.56, 0.64, 1)",
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-900/80 to-blue-950/90 backdrop-blur-sm">
                  <div className="p-8 h-full flex flex-col justify-end">
                    <h3 className="text-3xl font-black text-white mb-2">
                      Stardew Valley
                    </h3>
                    <p className="text-gray-300 text-sm">Season 2 Active</p>
                  </div>
                </div>
              </div>

              {/* Card 3 - Center */}
              <div
                className="absolute w-80 h-[440px] rounded-3xl overflow-hidden shadow-2xl cursor-pointer z-10 hover:scale-[1.08]"
                style={{
                  transform: "translateZ(50px)",
                  transformStyle: "preserve-3d",
                  transition: "transform 1s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 1s cubic-bezier(0.34, 1.56, 0.64, 1)",
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-orange-500/90 to-yellow-600/90 backdrop-blur-sm">
                  <div className="p-10 h-full flex flex-col justify-end items-center text-center">
                    <h3 className="text-4xl font-black text-white mb-3">
                      Fortnite
                    </h3>
                    <p className="text-white text-lg font-semibold">
                      Next Season in 15d
                    </p>
                  </div>
                </div>
              </div>

              {/* Card 5 - Far Right */}
              <div
                className="absolute w-72 h-96 rounded-3xl overflow-hidden shadow-2xl cursor-pointer hover:scale-[1.08]"
                style={{
                  transform:
                    "translateX(420px) translateZ(-180px) rotateY(-22deg)",
                  transformStyle: "preserve-3d",
                  transition: "transform 1s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 1s cubic-bezier(0.34, 1.56, 0.64, 1)",
                  zIndex: 1,
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-gray-700/80 to-gray-900/90 backdrop-blur-sm">
                  <div className="p-8 h-full flex flex-col justify-end items-end text-right">
                    <h3 className="text-3xl font-black text-white mb-2">
                      Silent Hill 2
                    </h3>
                    <p className="text-gray-300 text-sm">Coming Soon</p>
                  </div>
                </div>
              </div>

              {/* Card 4 - Right */}
              <div
                className="absolute w-72 h-96 rounded-3xl overflow-hidden shadow-2xl cursor-pointer hover:scale-[1.08]"
                style={{
                  transform:
                    "translateX(210px) translateZ(-90px) rotateY(-12deg)",
                  transformStyle: "preserve-3d",
                  transition: "transform 1s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 1s cubic-bezier(0.34, 1.56, 0.64, 1)",
                  zIndex: 2,
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-purple-900/80 to-purple-950/90 backdrop-blur-sm">
                  <div className="p-8 h-full flex flex-col justify-end items-end text-right">
                    <h3 className="text-3xl font-black text-white mb-2 leading-tight">
                      Dragon Ball Z
                    </h3>
                    <p className="text-gray-300 text-sm">Tournament Live</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile Carousel with Gestures */}
          <div className="md:hidden overflow-x-auto snap-x snap-mandatory scrollbar-hide px-6 -mx-6">
            <div className="flex gap-4 pb-4">
              {SHOWCASE_GAMES.map((game) => (
                <div
                  key={game.title}
                  className="flex-shrink-0 w-72 h-96 rounded-3xl overflow-hidden shadow-2xl snap-center"
                >
                  <div
                    className={`w-full h-full bg-gradient-to-br ${game.gradient} backdrop-blur-sm p-8 flex flex-col justify-end`}
                  >
                    <h3 className="text-3xl font-black text-white mb-2">
                      {game.title}
                    </h3>
                    <p className="text-gray-300 text-sm">{game.status}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Decorative Elements */}
          <div className="hidden md:flex justify-center gap-12 mt-16">
            <div className="w-16 h-16 flex items-center justify-center">
              <div className="text-5xl text-white/40">+</div>
            </div>
            <div className="w-16 h-16 flex items-center justify-center">
              <div className="w-12 h-12 border-4 border-white/40 transform rotate-45" />
            </div>
            <div className="w-16 h-16 flex items-center justify-center">
              <div className="text-5xl text-white/40">▶</div>
            </div>
            <div className="w-16 h-16 flex items-center justify-center">
              <div className="w-12 h-12 border-4 border-white/40 rounded-full" />
            </div>
          </div>
        </div>
      </section>

      {/* Feature Showcase Section */}
      <section className="relative py-32 px-6 bg-[#0f0f0f]">
        <div className="mx-auto max-w-7xl">
          {/* Left: Large Feature Card */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-32">
            <div className="relative group">
              <div className="absolute -inset-4 bg-white/5 rounded-[3rem] blur-2xl group-hover:bg-white/10 transition-all duration-700" />
              <div className="relative bg-[#1a1a1a] rounded-[2.5rem] p-12 border border-white/10 overflow-hidden">
                {/* Profile Mock */}
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-gray-600 to-gray-800" />
                  <div>
                    <h3 className="text-2xl font-black text-white">
                      Duke Nukem
                    </h3>
                    <div className="flex gap-6 mt-2">
                      <div className="text-center">
                        <div className="text-xl font-bold text-white">1023</div>
                        <div className="text-xs text-gray-400">Games</div>
                      </div>
                      <div className="text-center">
                        <div className="text-xl font-bold text-white">346</div>
                        <div className="text-xs text-gray-400">Followers</div>
                      </div>
                      <div className="text-center">
                        <div className="text-xl font-bold text-white">722</div>
                        <div className="text-xs text-gray-400">Reviews</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Game Cards Mini */}
                <div className="grid grid-cols-3 gap-4">
                  {PROFILE_GAMES.map((game) => (
                    <div
                      key={game}
                      className="aspect-[3/4] rounded-2xl bg-gradient-to-br from-gray-700 to-gray-900 flex items-end p-4"
                    >
                      <span className="text-white text-sm font-bold">
                        {game}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: Text Content */}
            <div>
              <h2 className="text-5xl md:text-6xl font-black text-white mb-6 leading-tight">
                Create & Track your Game Collection
              </h2>
              <p className="text-xl text-gray-400 mb-8 leading-relaxed">
                Log everything — completion status, platforms, play time, and
                more. Group your games into collections
              </p>
              <button className="px-8 py-4 bg-white text-black font-bold rounded-full hover:bg-gray-200 transition-all duration-300 hover:scale-105">
                Start Tracking
              </button>
            </div>
          </div>

          {/* Right: Community Stats */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left: Text Content */}
            <div className="order-2 lg:order-1">
              <h2 className="text-5xl md:text-6xl font-black text-white mb-6 leading-tight">
                Join 1M+ Gamers Worldwide
              </h2>
              <p className="text-xl text-gray-400 mb-8 leading-relaxed">
                See what your friends are playing, planning, or rating. Share
                your passion and discover new games together.
              </p>
              <div className="flex items-center gap-4">
                <button className="px-8 py-4 bg-white text-black font-bold rounded-full hover:bg-gray-200 transition-all duration-300 hover:scale-105">
                  Join Community
                </button>
                <button className="px-8 py-4 bg-white/10 text-white font-bold rounded-full border border-white/20 hover:bg-white/20 transition-all duration-300">
                  Learn More
                </button>
              </div>
            </div>

            {/* Right: Stats Card */}
            <div className="order-1 lg:order-2 relative group">
              <div className="absolute -inset-4 bg-white/5 rounded-[3rem] blur-2xl group-hover:bg-white/10 transition-all duration-700" />
              <div className="relative bg-[#1a1a1a] rounded-[2.5rem] p-12 border border-white/10">
                {/* Users Icon Cluster */}
                <div className="flex items-center justify-center mb-8">
                  <div className="relative w-32 h-32">
                    <div className="absolute top-0 left-0 w-20 h-20 rounded-full bg-gradient-to-br from-yellow-500 to-orange-500" />
                    <div className="absolute top-0 right-0 w-20 h-20 rounded-full bg-gradient-to-br from-pink-500 to-purple-500" />
                    <div className="absolute top-12 left-6 w-20 h-20 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center z-10">
                      <Users className="w-10 h-10 text-white" />
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div className="text-center">
                  <div className="text-6xl font-black text-white mb-3">1M+</div>
                  <div className="text-xl text-gray-400">Users Worldwide</div>
                </div>

                {/* Additional Info */}
                <div className="mt-8 pt-8 border-t border-white/10">
                  <h4 className="text-2xl font-black text-white mb-4">
                    Follow Friends
                  </h4>
                  <p className="text-gray-400 leading-relaxed">
                    See what your friends are playing, planning, or rating.
                    Share your passion and discover new games together.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
