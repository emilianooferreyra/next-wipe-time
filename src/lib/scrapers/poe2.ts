import { getBrowser } from '../browser';
import type { WipeData } from '@/schemas/wipe-data';

export async function scrapePoe2League(): Promise<WipeData> {
  const browser = await getBrowser();
  const page = await browser.newPage();

  try {
    console.log('📍 Navigating to Path of Exile 2 patch notes...');

    // Check PoE2 announcements forum
    await page.goto('https://www.pathofexile.com/forum/view-forum/2212', {
      waitUntil: 'domcontentloaded',
      timeout: 30000,
    });

    console.log('✅ Page loaded, waiting for content...');
    await new Promise(resolve => setTimeout(resolve, 3000));

    const data = await page.evaluate(() => {
      // Look for ALL important announcements
      const posts = Array.from(document.querySelectorAll('.title, .announcement, [class*="post"]'));

      let foundEvent = {
        type: 'patch' as 'league' | 'patch' | 'update' | 'event',
        title: null as string | null,
        dateText: null as string | null,
        isLeague: false,
        isPatch: false,
        isEvent: false,
      };

      for (const post of posts) {
        const text = post.textContent || '';
        const lowerText = text.toLowerCase();

        // Priority 1: LEAGUE announcement (most important)
        if (lowerText.includes('league') && (lowerText.includes('announce') || lowerText.includes('launch') || lowerText.includes('start'))) {
          foundEvent.type = 'league';
          foundEvent.title = text.trim();
          foundEvent.isLeague = true;

          // Try to extract date
          const dateMatch = text.match(/(?:starts?|begins?|launches?|coming)[:\s]+(\w+\s+\d+(?:st|nd|rd|th)?,?\s*\d{4})/i);
          if (dateMatch) {
            foundEvent.dateText = dateMatch[1];
          }
          const altDateMatch = text.match(/(\w+\s+\d+,\s*\d{4})/i);
          if (altDateMatch && !foundEvent.dateText) {
            foundEvent.dateText = altDateMatch[1];
          }

          break; // League is top priority, stop searching
        }

        // Priority 2: Major UPDATE/EXPANSION
        if (!foundEvent.isLeague && (lowerText.includes('expansion') || lowerText.includes('major update'))) {
          foundEvent.type = 'update';
          foundEvent.title = text.trim();
          foundEvent.isEvent = true;

          // Try to extract date
          const dateMatch = text.match(/(\w+\s+\d+,\s*\d{4})/i);
          if (dateMatch) {
            foundEvent.dateText = dateMatch[1];
          }
        }

        // Priority 3: PATCH NOTES (if no league/update found)
        if (!foundEvent.isLeague && !foundEvent.isEvent && (lowerText.includes('patch notes') || lowerText.includes('hotfix'))) {
          const versionMatch = text.match(/(\d+\.\d+\.\d+[a-z]?)/i);
          if (versionMatch) {
            foundEvent.type = 'patch';
            foundEvent.title = `Patch ${versionMatch[1]}`;
            foundEvent.isPatch = true;

            // Try to extract date
            const dateMatch = text.match(/(\w+\s+\d+,\s*\d{4})/i);
            if (dateMatch) {
              foundEvent.dateText = dateMatch[1];
            }
          }
        }

        // Priority 4: EVENTS (races, leagues, special events)
        if (!foundEvent.isLeague && !foundEvent.isEvent && !foundEvent.isPatch &&
            (lowerText.includes('event') || lowerText.includes('race') || lowerText.includes('competition'))) {
          foundEvent.type = 'event';
          foundEvent.title = text.trim();
          foundEvent.isEvent = true;

          // Try to extract date
          const dateMatch = text.match(/(\w+\s+\d+,\s*\d{4})/i);
          if (dateMatch) {
            foundEvent.dateText = dateMatch[1];
          }
        }
      }

      return {
        eventType: foundEvent.type,
        eventTitle: foundEvent.title,
        dateText: foundEvent.dateText,
        pageText: document.body.innerText.substring(0, 2000),
      };
    });

    console.log('Scraped data:', data);

    const now = new Date();
    let lastEvent: Date;
    let nextEvent: Date;
    let frequency = '';
    let announcement = '';
    let confirmed = false;

    // If we found a date, try to parse it
    if (data.dateText) {
      const parsedDate = new Date(data.dateText);
      if (!isNaN(parsedDate.getTime())) {
        if (parsedDate > now) {
          // Future date found - this is confirmed
          nextEvent = parsedDate;
          lastEvent = new Date(nextEvent);
          confirmed = true;

          switch (data.eventType) {
            case 'league':
              lastEvent.setDate(lastEvent.getDate() - 90);
              frequency = 'Leagues every ~13 weeks';
              announcement = data.eventTitle || `League starts ${data.dateText}`;
              break;
            case 'update':
              lastEvent.setDate(lastEvent.getDate() - 30);
              frequency = 'Major updates periodically';
              announcement = data.eventTitle || `Update coming ${data.dateText}`;
              break;
            case 'event':
              lastEvent.setDate(lastEvent.getDate() - 14);
              frequency = 'Special events vary';
              announcement = data.eventTitle || `Event starts ${data.dateText}`;
              break;
            case 'patch':
            default:
              lastEvent.setDate(lastEvent.getDate() - 7);
              frequency = 'Patches every 1-2 weeks (Early Access)';
              announcement = data.eventTitle || `Patch available ${data.dateText}`;
              break;
          }

          console.log(`✅ Found confirmed ${data.eventType} date:`, nextEvent.toISOString());
        } else {
          // Date is in past - this was the last event, estimate next
          lastEvent = parsedDate;
          nextEvent = new Date(lastEvent);
          confirmed = false;

          switch (data.eventType) {
            case 'league':
              nextEvent.setDate(nextEvent.getDate() + 90);
              frequency = 'Leagues every ~13 weeks';
              announcement = 'Next league date not yet announced';
              break;
            case 'update':
              nextEvent.setDate(nextEvent.getDate() + 30);
              frequency = 'Major updates periodically';
              announcement = 'Next update date not yet announced';
              break;
            case 'event':
              nextEvent.setDate(nextEvent.getDate() + 14);
              frequency = 'Special events vary';
              announcement = 'Check announcements for upcoming events';
              break;
            case 'patch':
            default:
              nextEvent.setDate(nextEvent.getDate() + 7);
              frequency = 'Patches every 1-2 weeks (Early Access)';
              announcement = data.eventTitle || 'Latest patch available - next patch coming soon';
              break;
          }

          console.log(`✅ Found last ${data.eventType}, estimating next:`, nextEvent.toISOString());
        }
      } else {
        // Couldn't parse date, use estimates
        console.log('⚠️ Could not parse date, using estimates');
        lastEvent = new Date(now);
        nextEvent = new Date(now);
        confirmed = false;

        switch (data.eventType) {
          case 'league':
            lastEvent.setDate(lastEvent.getDate() - 90);
            nextEvent.setDate(nextEvent.getDate() + 90);
            frequency = 'Leagues every ~13 weeks';
            announcement = data.eventTitle || 'League announcement - check official site';
            break;
          case 'update':
            lastEvent.setDate(lastEvent.getDate() - 30);
            nextEvent.setDate(nextEvent.getDate() + 30);
            frequency = 'Major updates periodically';
            announcement = data.eventTitle || 'Major update coming';
            break;
          case 'event':
            lastEvent.setDate(lastEvent.getDate() - 14);
            nextEvent.setDate(nextEvent.getDate() + 14);
            frequency = 'Special events vary';
            announcement = data.eventTitle || 'Special event - check announcements';
            break;
          case 'patch':
          default:
            lastEvent.setDate(lastEvent.getDate() - 7);
            nextEvent.setDate(nextEvent.getDate() + 7);
            frequency = 'Patches every 1-2 weeks (Early Access)';
            announcement = data.eventTitle || 'Regular patches and hotfixes';
            break;
        }
      }
    } else {
      // No date found, use pure estimates
      console.log('⚠️ No date found, using estimates');
      lastEvent = new Date(now);
      nextEvent = new Date(now);
      confirmed = false;

      switch (data.eventType) {
        case 'league':
          lastEvent.setDate(lastEvent.getDate() - 90);
          nextEvent.setDate(nextEvent.getDate() + 90);
          frequency = 'Leagues every ~13 weeks';
          announcement = data.eventTitle || 'League announcement - check official site';
          break;
        case 'update':
          lastEvent.setDate(lastEvent.getDate() - 30);
          nextEvent.setDate(nextEvent.getDate() + 30);
          frequency = 'Major updates periodically';
          announcement = data.eventTitle || 'Major update coming';
          break;
        case 'event':
          lastEvent.setDate(lastEvent.getDate() - 14);
          nextEvent.setDate(nextEvent.getDate() + 14);
          frequency = 'Special events vary';
          announcement = data.eventTitle || 'Special event - check announcements';
          break;
        case 'patch':
        default:
          lastEvent.setDate(lastEvent.getDate() - 7);
          nextEvent.setDate(nextEvent.getDate() + 7);
          frequency = 'Patches every 1-2 weeks (Early Access)';
          announcement = data.eventTitle || 'Regular patches and hotfixes';
          break;
      }
    }

    console.log('📅 Event Type:', data.eventType);
    console.log('📅 Next event:', nextEvent.toISOString());
    console.log('📅 Last event:', lastEvent.toISOString());
    console.log('✅ Confirmed:', confirmed);

    return {
      nextWipe: nextEvent.toISOString(),
      lastWipe: lastEvent.toISOString(),
      frequency,
      source: 'https://www.pathofexile.com/forum/view-forum/2212',
      scrapedAt: new Date().toISOString(),
      confirmed,
      announcement,
      eventType: data.eventType,
      eventName: data.eventTitle || undefined,
    };
  } catch (error) {
    console.error('Error scraping PoE2:', error);
    throw new Error(`Failed to scrape PoE2 patch data: ${error}`);
  } finally {
    await page.close();
  }
}
