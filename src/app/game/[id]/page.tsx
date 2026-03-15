import type { Metadata } from "next";
import { games } from "@/components/game-tabs";
import { getBaseGameIdForVersion } from "@/lib/games-config";
import { GameDetailsClient, getGameDescription } from "./game-details-client";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const baseGameId = getBaseGameIdForVersion(id);
  const game = games.find((g) => g.id === baseGameId);

  if (!game) {
    return {
      title: "Game Not Found | WipePunch",
    };
  }

  const description = getGameDescription(baseGameId);

  return {
    title: `${game.name} — Next Wipe & Reset | WipePunch`,
    description: `Track the next wipe, season reset, or patch for ${game.name}. ${description}`,
    openGraph: {
      title: `${game.name} — Next Wipe & Reset | WipePunch`,
      description: `Live countdown timers and confirmed dates for ${game.name}.`,
      type: "website",
    },
  };
}

export default async function GameDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <GameDetailsClient gameId={id} />;
}
