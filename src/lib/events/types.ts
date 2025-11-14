export type EventType =
  | 'wipe'          // Full wipe/season start
  | 'season'        // New season (for games like Fortnite)
  | 'update'        // Major update/patch
  | 'event'         // In-game event (double XP, etc)
  | 'tournament'    // Official tournament
  | 'playtest'      // Beta test / Early access
  | 'maintenance';  // Scheduled downtime

export type GameEvent = {
  id: string;
  gameId: string;
  gameName: string;
  title: string;
  type: EventType;
  startDate: Date;
  endDate?: Date;
  confirmed: boolean;
  description?: string;
  url?: string;
  accentColor: string;
};

export type EventsByDate = {
  [dateKey: string]: GameEvent[];
};
