import { getBrowser } from '../browser';
import type { WipeData } from '@/schemas/wipe-data';

export async function scrapeDestiny2Season(): Promise<WipeData> {
  const browser = await getBrowser();
  const page = await browser.newPage();

  try {
    console.log('📍 Navigating to Bungie news...');

    await page.goto('https://www.bungie.net/7/en/Seasons/SeasonOfTheWish', {
      waitUntil: 'domcontentloaded',
      timeout: 30000,
    });

    console.log('✅ Page loaded, waiting for content...');
    await new Promise(resolve => setTimeout(resolve, 3000));

    const data = await page.evaluate(() => {
      const bodyText = document.body.innerText;

      // Look for season timer or countdown
      const timerElements = Array.from(document.querySelectorAll('[class*="timer"], [class*="countdown"], [class*="season"]'));

      return {
        pageText: bodyText.substring(0, 2000),
        timerText: timerElements.map(el => el.textContent).join(' | '),
      };
    });

    console.log('Scraped data:', data);

    // Destiny 2 seasons typically last ~3 months
    const now = new Date();
    const lastWipe = new Date(now);
    lastWipe.setDate(lastWipe.getDate() - 45); // Estimate

    const nextWipe = new Date(now);
    nextWipe.setDate(nextWipe.getDate() + 45); // Estimate next season in ~45 days

    return {
      nextWipe: nextWipe.toISOString(),
      lastWipe: lastWipe.toISOString(),
      frequency: 'Every ~3 months',
      source: 'https://www.bungie.net/',
      scrapedAt: new Date().toISOString(),
      confirmed: false,
      announcement: 'Check Bungie.net for confirmed season dates',
    };
  } catch (error) {
    console.error('Error scraping Destiny 2:', error);
    throw new Error(`Failed to scrape Destiny 2 season data: ${error}`);
  } finally {
    await page.close();
  }
}
