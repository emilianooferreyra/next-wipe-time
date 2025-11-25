import { newPage } from "../browser";
import type { WipeData } from "@/schemas/wipe-data";

// Helper function to construct WipeData object consistently
function createWipeData(
  nextWipe: Date,
  lastWipe: Date,
  confirmed: boolean,
  announcement: string,
  eventType: "league" | "event" | "patch" = "league",
  eventName?: string,
  patchNotes?: string,
  source: string = "https://www.pathofexile.com/forum/view-forum/news (Estimated)",
  frequency: string = "Every 3 months (13 weeks)"
): WipeData {
  return {
    nextWipe: nextWipe.toISOString(),
    lastWipe: lastWipe.toISOString(),
    frequency,
    source,
    scrapedAt: new Date().toISOString(),
    confirmed,
    announcement,
    eventType,
    eventName,
    patchNotes,
  };
}

export async function scrapePoeWipe() {
  const page = await newPage();

  try {
    console.log(
      "📍 Step 1: Checking Path of Exile ladders for active events..."
    );

    // First, check the ladders page for currently active events
    await page.goto("https://www.pathofexile.com/ladders", {
      waitUntil: "domcontentloaded",
      timeout: 30000,
    });

    console.log("✅ Ladders loaded, extracting active events...");
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const ladderData = await page.evaluate(() => {
      // Look for league/event selector or active league info
      const leagueSelector = document.querySelector(
        'select[name="league"], .league-select, [class*="league"]'
      );
      const options = leagueSelector
        ? Array.from(leagueSelector.querySelectorAll("option"))
        : [];

      let activeEvents = [];
      for (const option of options) {
        const text = (option as HTMLOptionElement).text || "";
        const value = (option as HTMLOptionElement).value || "";

        // Skip standard/hardcore permanent leagues
        if (
          text.toLowerCase().includes("standard") ||
          text.toLowerCase().includes("hardcore") ||
          text.toLowerCase().includes("ruthless")
        ) {
          continue;
        }

        // Capture events and leagues
        if (value && text) {
          activeEvents.push({
            name: text.trim(),
            id: value.trim(),
          });
        }
      }

      // Also check page title and headings for current league/event
      const pageTitle = document.title || "";
      const headings = Array.from(document.querySelectorAll("h1, h2, h3"));
      let currentEventFromHeading = null;

      for (const heading of headings) {
        const text = heading.textContent || "";
        if (text.includes("League") || text.includes("Event")) {
          currentEventFromHeading = text.trim();
          break;
        }
      }

      return {
        activeEvents,
        pageTitle,
        currentEventFromHeading,
        pageText: (document.body.textContent || "").substring(0, 1500),
      };
    });

    console.log("📊 Scraped active events from ladders:", ladderData);

    // Now check the news/announcements page for official dates
    console.log("📍 Step 2: Checking Path of Exile news for announcements...");

    await page.goto("https://www.pathofexile.com/forum/view-forum/news", {
      waitUntil: "domcontentloaded",
      timeout: 30000,
    });

    console.log("✅ News loaded, extracting announcements...");
    await new Promise((resolve) => setTimeout(resolve, 3000));

    const newsData = await page.evaluate(() => {
      // Look for league announcements in news
      const posts = Array.from(
        document.querySelectorAll(
          '.title, .announcement, .newsPost, [class*="post"]'
        )
      );

      let foundLeague = {
        name: null as string | null,
        dateText: null as string | null,
        isAnnounced: false,
        type: null as "league" | "event" | "patch" | null,
        link: null as string | null, // Added to capture the link to the news post
      };

      for (const post of posts) {
        const text = post.textContent || "";
        const lowerText = text.toLowerCase();

        // Try to get the link of the post
        const linkElement = post.querySelector("a");
        if (linkElement && linkElement.href) {
          foundLeague.link = linkElement.href;
        }

        // Priority 1: League announcements (highest priority)
        if (
          lowerText.includes("league") &&
          (lowerText.includes("announce") ||
            lowerText.includes("launch") ||
            lowerText.includes("start") ||
            lowerText.includes("coming"))
        ) {
          foundLeague.name = text.trim();
          foundLeague.isAnnounced = true;
          foundLeague.type = "league";

          // Try to extract date from the announcement text
          const dateMatch = text.match(
            /(?:starts?|begins?|launches?|coming)[:\s]+(\w+\s+\d+(?:st|nd|rd|th)?,?\s*\d{4})/i
          );
          if (dateMatch) {
            foundLeague.dateText = dateMatch[1];
          }

          // Also check for formats like "December 6, 2024"
          const altDateMatch = text.match(/(\w+\s+\d+,\s*\d{4})/i);
          if (altDateMatch && !foundLeague.dateText) {
            foundLeague.dateText = altDateMatch[1];
          }

          break; // Found league announcement, stop searching
        }

        // Priority 2: Patch Notes
        if (
          !foundLeague.isAnnounced &&
          (lowerText.includes("patch notes") ||
            (lowerText.includes("patch") && lowerText.includes("notes")))
        ) {
          foundLeague.name = text.trim();
          foundLeague.isAnnounced = true;
          foundLeague.type = "patch";

          // Try to extract version number
          const versionMatch = text.match(/(\d+\.\d+\.\d+[a-z]?)/i);
          if (versionMatch) {
            foundLeague.name = `Patch ${versionMatch[1]}`;
          }

          // Try to extract date
          const dateMatch = text.match(/(\w+\s+\d+,\s*\d{4})/i);
          if (dateMatch) {
            foundLeague.dateText = dateMatch[1];
          }
        }

        // Priority 3: Special events
        if (
          !foundLeague.isAnnounced &&
          (lowerText.includes("event") ||
            lowerText.includes("race") ||
            lowerText.includes("boss kill")) &&
          (lowerText.includes("announce") ||
            lowerText.includes("start") ||
            lowerText.includes("live"))
        ) {
          foundLeague.name = text.trim();
          foundLeague.isAnnounced = true;
          foundLeague.type = "event";

          // Try to extract date
          const dateMatch = text.match(
            /(?:starts?|begins?|launches?)[:\s]+(\w+\s+\d+(?:st|nd|rd|th)?,?\s*\d{4})/i
          );
          if (dateMatch) {
            foundLeague.dateText = dateMatch[1];
          }

          const altDateMatch = text.match(/(\w+\s+\d+,\s*\d{4})/i);
          if (altDateMatch && !foundLeague.dateText) {
            foundLeague.dateText = altDateMatch[1];
          }
        }
      }

      return {
        leagueName: foundLeague.name,
        dateText: foundLeague.dateText,
        isAnnounced: foundLeague.isAnnounced,
        type: foundLeague.type,
        pageText: (document.body.textContent || "").substring(0, 2000),
      };
    });

    console.log("📊 Scraped PoE news:", newsData);

    // Initialize with default values (will be updated if we find better data)
    const now = new Date();
    let lastWipe: Date = new Date(
      now.getFullYear(),
      now.getMonth() - 3,
      now.getDate()
    );
    let nextWipe: Date = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      now.getDate()
    );
    let confirmed = false;
    let announcement = "";
    let eventType: "league" | "event" | "patch" = "league";
    let eventName = "";

    // Check if there's an active event from ladders
    if (ladderData.activeEvents && ladderData.activeEvents.length > 0) {
      // Get the most recent/first active event
      const activeEvent = ladderData.activeEvents[0];

      // Determine if it's a special event or league
      const isSpecialEvent =
        activeEvent.name.toLowerCase().includes("event") ||
        activeEvent.name.toLowerCase().includes("race") ||
        activeEvent.name.toLowerCase().includes("boss kill");

      if (isSpecialEvent) {
        eventType = "event";
        eventName = activeEvent.name;
        announcement = `Active Event: ${activeEvent.name}`;
        confirmed = true;

        console.log("✅ Found active special event:", activeEvent.name);

        // For active events, set dates
        const now = new Date();
        lastWipe = new Date(now);
        lastWipe.setDate(lastWipe.getDate() - 7); // Assume started a week ago
        nextWipe = new Date(now);
        nextWipe.setDate(nextWipe.getDate() + 7); // Assume ends in a week
      } else {
        // It's a league
        eventType = "league";
        eventName = activeEvent.name;
      }
    }

    // If we didn't find an active special event, check news for league/event/patch dates
    if (eventType === "league" || !announcement) {
      // Try to parse the found date from news
      if (newsData.dateText || newsData.type) {
        const parsedDate = newsData.dateText
          ? new Date(newsData.dateText)
          : null;
        const now = new Date();

        if (parsedDate && !isNaN(parsedDate.getTime())) {
          if (parsedDate > now) {
            // Found future league/event/patch date
            nextWipe = parsedDate;
            lastWipe = new Date(nextWipe);
            lastWipe.setMonth(lastWipe.getMonth() - 3);
            confirmed = true;

            if (newsData.type === "event") {
              eventType = "event";
              eventName = newsData.leagueName || "";
              announcement =
                newsData.leagueName || `Event starts ${newsData.dateText}`;
            } else if (newsData.type === "patch") {
              eventType = "patch";
              eventName = newsData.leagueName || "";
              announcement =
                newsData.leagueName || `Patch available ${newsData.dateText}`;
            } else {
              eventType = "league";
              eventName = newsData.leagueName || "";
              announcement =
                newsData.leagueName ||
                `Next league starts ${newsData.dateText}`;
            }

            console.log(
              `✅ Found confirmed next ${eventType} date:`,
              nextWipe.toISOString()
            );

            return createWipeData(
              nextWipe,
              lastWipe,
              confirmed,
              announcement,
              eventType,
              eventName,
              undefined, // newsData.link is not guaranteed to exist on newsData's type
              "https://www.pathofexile.com/forum/view-forum/news (Official)",
              eventType === "event"
                ? "Special events vary"
                : "Every 3 months (13 weeks)"
            );
          }
        }
      }
    }
  } catch (error) {
    console.log(error);
  }

  // Fallback: Return default wipe data if scraping fails
  const now = new Date();
  const lastWipe = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
  const nextWipe = new Date(now.getFullYear(), now.getMonth() + 1, now.getDate());

  return createWipeData(
    nextWipe,
    lastWipe,
    false,
    "PoE schedule data unavailable",
    "league"
  );
}
