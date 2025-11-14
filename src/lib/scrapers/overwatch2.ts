import { getBrowser } from '../browser';
import type { WipeData } from '@/schemas/wipe-data';

export async function scrapeOverwatch2Season(): Promise<WipeData> {
  const browser = await getBrowser();
  const page = await browser.newPage();

  try {
    console.log('📍 Navigating to Overwatch 2 news...');

    // Navigate to Overwatch official site
    await page.goto('https://overwatch.blizzard.com/en-us/news/', {
      waitUntil: 'domcontentloaded',
      timeout: 30000,
    });

    console.log('✅ Page loaded, waiting for content...');
    await new Promise(resolve => setTimeout(resolve, 3000));

    const data = await page.evaluate(() => {
      // Look for season announcements
      const articles = Array.from(document.querySelectorAll('article, .article, [class*="news"], [class*="post"]'));

      let seasonInfo = null;

      for (const article of articles) {
        const text = article.textContent || '';
        const lowerText = text.toLowerCase();

        // Look for season announcements
        if (lowerText.includes('season') && (lowerText.includes('begins') || lowerText.includes('starts') || lowerText.includes('coming'))) {
          seasonInfo = text;
          break;
        }
      }

      return {
        seasonInfo,
        pageText: document.body.innerText.substring(0, 2000),
      };
    });

    console.log('Scraped data:', data);

    // OW2 seasons typically last ~9 weeks
    const now = new Date();
    const lastWipe = new Date(now);
    lastWipe.setDate(lastWipe.getDate() - 30); // Estimate last season started ~30 days ago

    const nextWipe = new Date(now);
    nextWipe.setDate(nextWipe.getDate() + 35); // Estimate next season in ~35 days

    return {
      nextWipe: nextWipe.toISOString(),
      lastWipe: lastWipe.toISOString(),
      frequency: 'Every ~9 weeks',
      source: 'https://overwatch.blizzard.com/en-us/news/',
      scrapedAt: new Date().toISOString(),
      confirmed: false,
      announcement: 'Check official Overwatch news for confirmed dates',
    };
  } catch (error) {
    console.error('Error scraping Overwatch 2:', error);
    throw new Error(`Failed to scrape Overwatch 2 season data: ${error}`);
  } finally {
    await page.close();
  }
}
