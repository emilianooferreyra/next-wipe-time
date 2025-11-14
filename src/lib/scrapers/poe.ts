import { getBrowser } from '../browser';
import type { WipeData } from '@/schemas/wipe-data';

export async function scrapePoeWipe(): Promise<WipeData> {
  const browser = await getBrowser();
  const page = await browser.newPage();

  try {
    console.log('📍 Step 1: Checking Path of Exile ladders for active events...');

    // First, check the ladders page for currently active events
    await page.goto('https://www.pathofexile.com/ladders', {
      waitUntil: 'domcontentloaded',
      timeout: 30000,
    });

    console.log('✅ Ladders loaded, extracting active events...');
    await new Promise(resolve => setTimeout(resolve, 2000));

    const ladderData = await page.evaluate(() => {
      // Look for league/event selector or active league info
      const leagueSelector = document.querySelector('select[name="league"], .league-select, [class*="league"]');
      const options = leagueSelector ? Array.from(leagueSelector.querySelectorAll('option')) : [];

      let activeEvents = [];
      for (const option of options) {
        const text = (option as HTMLOptionElement).text || '';
        const value = (option as HTMLOptionElement).value || '';

        // Skip standard/hardcore permanent leagues
        if (text.toLowerCase().includes('standard') ||
            text.toLowerCase().includes('hardcore') ||
            text.toLowerCase().includes('ruthless')) {
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
      const pageTitle = document.title || '';
      const headings = Array.from(document.querySelectorAll('h1, h2, h3'));
      let currentEventFromHeading = null;

      for (const heading of headings) {
        const text = heading.textContent || '';
        if (text.includes('League') || text.includes('Event')) {
          currentEventFromHeading = text.trim();
          break;
        }
      }

      return {
        activeEvents,
        pageTitle,
        currentEventFromHeading,
        pageText: document.body.innerText.substring(0, 1500),
      };
    });

    console.log('📊 Scraped active events from ladders:', ladderData);

    // Now check the news/announcements page for official dates
    console.log('📍 Step 2: Checking Path of Exile news for announcements...');

    await page.goto('https://www.pathofexile.com/forum/view-forum/news', {
      waitUntil: 'domcontentloaded',
      timeout: 30000,
    });

    console.log('✅ News loaded, extracting announcements...');
    await new Promise(resolve => setTimeout(resolve, 3000));

    const newsData = await page.evaluate(() => {
      // Look for league announcements in news
      const posts = Array.from(document.querySelectorAll('.title, .announcement, .newsPost, [class*="post"]'));

      let foundLeague = {
        name: null as string | null,
        dateText: null as string | null,
        isAnnounced: false,
        type: null as 'league' | 'event' | 'patch' | null,
      };

      for (const post of posts) {
        const text = post.textContent || '';
        const lowerText = text.toLowerCase();

        // Priority 1: League announcements (highest priority)
        if (lowerText.includes('league') &&
            (lowerText.includes('announce') || lowerText.includes('launch') ||
             lowerText.includes('start') || lowerText.includes('coming'))) {

          foundLeague.name = text.trim();
          foundLeague.isAnnounced = true;
          foundLeague.type = 'league';

          // Try to extract date from the announcement text
          const dateMatch = text.match(/(?:starts?|begins?|launches?|coming)[:\s]+(\w+\s+\d+(?:st|nd|rd|th)?,?\s*\d{4})/i);
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
        if (!foundLeague.isAnnounced &&
            (lowerText.includes('patch notes') || lowerText.includes('patch') && lowerText.includes('notes'))) {

          foundLeague.name = text.trim();
          foundLeague.isAnnounced = true;
          foundLeague.type = 'patch';

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
        if (!foundLeague.isAnnounced &&
            (lowerText.includes('event') || lowerText.includes('race') || lowerText.includes('boss kill')) &&
            (lowerText.includes('announce') || lowerText.includes('start') || lowerText.includes('live'))) {

          foundLeague.name = text.trim();
          foundLeague.isAnnounced = true;
          foundLeague.type = 'event';

          // Try to extract date
          const dateMatch = text.match(/(?:starts?|begins?|launches?)[:\s]+(\w+\s+\d+(?:st|nd|rd|th)?,?\s*\d{4})/i);
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
        pageText: document.body.innerText.substring(0, 2000),
      };
    });

    console.log('📊 Scraped PoE news:', newsData);

    // Initialize with default values (will be updated if we find better data)
    const now = new Date();
    let lastWipe: Date = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
    let nextWipe: Date = new Date(now.getFullYear(), now.getMonth() + 1, now.getDate());
    let confirmed = false;
    let announcement = '';
    let eventType: 'league' | 'event' | 'patch' = 'league';
    let eventName = '';

    // Check if there's an active event from ladders
    if (ladderData.activeEvents && ladderData.activeEvents.length > 0) {
      // Get the most recent/first active event
      const activeEvent = ladderData.activeEvents[0];

      // Determine if it's a special event or league
      const isSpecialEvent = activeEvent.name.toLowerCase().includes('event') ||
                            activeEvent.name.toLowerCase().includes('race') ||
                            activeEvent.name.toLowerCase().includes('boss kill');

      if (isSpecialEvent) {
        eventType = 'event';
        eventName = activeEvent.name;
        announcement = `Active Event: ${activeEvent.name}`;
        confirmed = true;

        console.log('✅ Found active special event:', activeEvent.name);

        // For active events, set dates
        const now = new Date();
        lastWipe = new Date(now);
        lastWipe.setDate(lastWipe.getDate() - 7); // Assume started a week ago
        nextWipe = new Date(now);
        nextWipe.setDate(nextWipe.getDate() + 7); // Assume ends in a week
      } else {
        // It's a league
        eventType = 'league';
        eventName = activeEvent.name;
      }
    }

    // If we didn't find an active special event, check news for league/event/patch dates
    if (eventType === 'league' || !announcement) {
      // Try to parse the found date from news
      if (newsData.dateText || newsData.type) {
        const parsedDate = newsData.dateText ? new Date(newsData.dateText) : null;
        const now = new Date();

        if (parsedDate && !isNaN(parsedDate.getTime())) {
          if (parsedDate > now) {
            // Found future league/event/patch date
            nextWipe = parsedDate;
            lastWipe = new Date(nextWipe);
            lastWipe.setMonth(lastWipe.getMonth() - 3);
            confirmed = true;

            if (newsData.type === 'event') {
              eventType = 'event';
              eventName = newsData.leagueName || '';
              announcement = newsData.leagueName || `Event starts ${newsData.dateText}`;
            } else if (newsData.type === 'patch') {
              eventType = 'patch';
              eventName = newsData.leagueName || '';
              announcement = newsData.leagueName || `Patch available ${newsData.dateText}`;
            } else {
              eventType = 'league';
              eventName = newsData.leagueName || '';
              announcement = newsData.leagueName || `Next league starts ${newsData.dateText}`;
            }

            console.log(`✅ Found confirmed next ${eventType} date:`, nextWipe.toISOString());
          } else {
            // Date is in past, this was the last league/event/patch
            lastWipe = parsedDate;
            nextWipe = new Date(lastWipe);
            nextWipe.setMonth(nextWipe.getMonth() + 3);
            confirmed = false;
            announcement = 'Next league date not yet announced';
            console.log('✅ Found last event date, estimating next:', nextWipe.toISOString());
          }
        } else if (newsData.type === 'patch' && newsData.leagueName) {
          // Found a patch but no date - show it as recent patch
          eventType = 'patch';
          eventName = newsData.leagueName;
          announcement = `Latest: ${newsData.leagueName}`;
          confirmed = true;

          console.log('✅ Found recent patch:', newsData.leagueName);

          // Set dates for UI
          const now = new Date();
          lastWipe = new Date(now);
          lastWipe.setDate(lastWipe.getDate() - 1);
          nextWipe = new Date(now);
          nextWipe.setMonth(nextWipe.getMonth() + 3); // Estimate next league
        } else {
          // Couldn't parse date, use estimates
          console.log('⚠️ Could not parse date, using estimates');
          const now = new Date();
          lastWipe = new Date(now);
          lastWipe.setMonth(lastWipe.getMonth() - 3);
          nextWipe = new Date(now);
          nextWipe.setMonth(nextWipe.getMonth() + 1);
          confirmed = false;
          announcement = newsData.leagueName || 'Check official announcements for next league date';
        }
      } else if (!announcement) {
        // No date found in news and no active event, use rough estimates
        console.log('⚠️ No date found in news, using estimates');
        const now = new Date();
        lastWipe = new Date(now);
        lastWipe.setMonth(lastWipe.getMonth() - 3);
        nextWipe = new Date(now);
        nextWipe.setMonth(nextWipe.getMonth() + 1);
        confirmed = false;
        announcement = 'Next league date not yet announced - check official sources';
      }
    }

    console.log('📅 Event Type:', eventType);
    console.log('📅 Event Name:', eventName);
    console.log('📅 Next event:', nextWipe.toISOString());
    console.log('📅 Last event:', lastWipe.toISOString());
    console.log('✅ Confirmed:', confirmed);

    return {
      nextWipe: nextWipe.toISOString(),
      lastWipe: lastWipe.toISOString(),
      frequency: eventType === 'event' ? 'Special events vary' : 'Every 3 months (13 weeks)',
      source: 'https://www.pathofexile.com/ladders & news',
      scrapedAt: new Date().toISOString(),
      confirmed,
      announcement,
      eventType,
      eventName: eventName || undefined,
    };
  } catch (error) {
    console.error('❌ Error scraping PoE:', error);
    throw new Error(`Failed to scrape PoE league data: ${error}`);
  } finally {
    await page.close();
  }
}
