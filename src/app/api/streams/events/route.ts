import { NextResponse } from "next/server";
import { newPage } from "@/lib/browser";

export interface StreamingEvent {
  id: string;
  name: string;
  description?: string;
  startDate: string;
  endDate?: string;
  platform: "twitch" | "kick" | "youtube";
  type: "rivals" | "tournament" | "community_event" | "subathon";
  streamerCount?: number;
  prizePool?: string;
  link: string;
  imageUrl?: string;
}

/**
 * Scrape Twitch for Twitch Rivals events
 */
async function scrapeTwitchRivalsEvents(): Promise<StreamingEvent[]> {
  const page = await newPage();
  const events: StreamingEvent[] = [];

  try {
    console.log("🔍 Scraping Twitch for Rivals events...");

    await page.goto("https://www.twitch.tv/directory/category/Twitch%20Rivals", {
      waitUntil: "domcontentloaded",
      timeout: 15000,
    });

    await new Promise((resolve) => setTimeout(resolve, 2000));

    const rivalsData = await page.evaluate(() => {
      const eventList = [];
      const channelElements = document.querySelectorAll("[class*='stream']");

      for (let i = 0; i < Math.min(10, channelElements.length); i++) {
        const el = channelElements[i];
        const titleEl = el.querySelector("[class*='title'], h3");
        const descEl = el.querySelector("[class*='description']");

        if (titleEl?.textContent?.toLowerCase().includes("rivals")) {
          eventList.push({
            title: titleEl.textContent?.trim() || "",
            desc: descEl?.textContent?.trim() || "",
          });
        }
      }

      return eventList;
    });

    // Convert to proper event format
    rivalsData.forEach((event, index) => {
      events.push({
        id: `twitch-rivals-${index}`,
        name: event.title,
        description: event.desc,
        startDate: new Date().toISOString(),
        platform: "twitch",
        type: "rivals",
        link: "https://www.twitch.tv/directory/category/Twitch%20Rivals",
      });
    });

    console.log(`✅ Found ${events.length} Twitch Rivals events`);
  } catch (error) {
    console.log("⚠️  Error scraping Twitch Rivals:", error);
  }

  return events;
}

/**
 * Scrape Kick for events
 */
async function scrapeKickEvents(): Promise<StreamingEvent[]> {
  const page = await newPage();
  const events: StreamingEvent[] = [];

  try {
    console.log("🔍 Scraping Kick for events...");

    await page.goto("https://kick.com/", {
      waitUntil: "domcontentloaded",
      timeout: 15000,
    });

    await new Promise((resolve) => setTimeout(resolve, 2000));

    const kickData = await page.evaluate(() => {
      const eventList = [];
      // Look for event banners or announcements
      const eventElements = document.querySelectorAll("[class*='event'], [class*='banner']");

      for (let i = 0; i < Math.min(10, eventElements.length); i++) {
        const el = eventElements[i];
        const titleEl = el.querySelector("[class*='title']");
        const descEl = el.querySelector("[class*='description']");

        if (titleEl) {
          eventList.push({
            title: titleEl.textContent?.trim() || "",
            desc: descEl?.textContent?.trim() || "",
          });
        }
      }

      return eventList;
    });

    // Convert to proper event format
    kickData.forEach((event, index) => {
      if (event.title.length > 5) {
        events.push({
          id: `kick-event-${index}`,
          name: event.title,
          description: event.desc,
          startDate: new Date().toISOString(),
          platform: "kick",
          type: "community_event",
          link: "https://kick.com/",
        });
      }
    });

    console.log(`✅ Found ${events.length} Kick events`);
  } catch (error) {
    console.log("⚠️  Error scraping Kick events:", error);
  }

  return events;
}

export interface StreamingEventsResponse {
  events: StreamingEvent[];
  total: number;
  platforms: string[];
  timestamp: string;
}

export async function GET(request: Request) {
  try {
    console.log("📡 Fetching streaming events...");

    const [twitchEvents, kickEvents] = await Promise.all([
      scrapeTwitchRivalsEvents(),
      scrapeKickEvents(),
    ]);

    const allEvents = [...twitchEvents, ...kickEvents];

    const response: StreamingEventsResponse = {
      events: allEvents,
      total: allEvents.length,
      platforms: Array.from(
        new Set(allEvents.map((e) => e.platform))
      ),
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(response, {
      headers: {
        "Cache-Control": "public, max-age=300", // Cache for 5 minutes
      },
    });
  } catch (error) {
    console.error("❌ Error fetching streaming events:", error);

    return NextResponse.json(
      { error: "Failed to fetch streaming events", events: [], total: 0, platforms: [], timestamp: new Date().toISOString() },
      { status: 500 }
    );
  }
}
