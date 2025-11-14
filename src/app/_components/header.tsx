import Link from "next/link";

export function Header() {
  return (
    <header className="relative border-b border-white/5 bg-[#242938]/50 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-6 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-zinc-50">
              NextWipeTime
            </h1>
            <p className="text-sm text-zinc-500 mt-1">
              Track wipes, seasons, and events
            </p>
          </div>
          <nav className="flex gap-4">
            <span className="px-4 py-2 text-zinc-50 font-medium">Home</span>
            <Link
              href="/calendar"
              className="px-4 py-2 text-zinc-400 hover:text-zinc-300 transition-colors"
            >
              Calendar
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
