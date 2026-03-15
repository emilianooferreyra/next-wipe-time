"use client";

import { useWipeEvents } from "@/hooks/use-wipe-events";
import { UpcomingEventsWidget } from "./upcoming-events-widget";

export function EventsSection() {
  const { data: events, isLoading } = useWipeEvents();

  if (isLoading || !events || events.length === 0) return null;

  // Show only events within the next 30 days
  const now = new Date();
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() + 30);
  const upcoming = events.filter(
    (e) => e.startDate >= now && e.startDate <= cutoff
  );

  if (upcoming.length === 0) return null;

  return (
    <div className="w-full flex justify-center">
      <UpcomingEventsWidget events={upcoming} maxEvents={7} />
    </div>
  );
}
