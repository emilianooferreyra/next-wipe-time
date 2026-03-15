import type { Metadata } from "next";
import { HomeClient } from "./home-client";

export const metadata: Metadata = {
  title: "WipePunch — Track Game Wipes & Season Resets",
  description:
    "Track video game wipes, season resets, and patch schedules across Rust, Path of Exile, Fortnite, and more. Never miss a fresh start.",
  openGraph: {
    title: "WipePunch — Track Game Wipes & Season Resets",
    description:
      "Live countdown timers for wipes, seasons, and resets across your favorite games.",
    type: "website",
  },
};

export default function Home() {
  return <HomeClient />;
}
