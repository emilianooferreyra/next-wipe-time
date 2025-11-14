import { getBrowser } from '../browser';
import type { WipeData } from '@/schemas/wipe-data';

export async function scrapeR6SiegeSeason(): Promise<WipeData> {
  const browser = await getBrowser();
  const page = await browser.newPage();

  try {
    console.log('📍 Navigating to Rainbow Six Siege news...');

    await page.goto('https://www.ubisoft.com/en-us/game/rainbow-six/siege/news-updates', {
      waitUntil: 'domcontentloaded',
      timeout: 30000,
    });

    console.log('✅ Page loaded, waiting for content...');
    await new Promise(resolve => setTimeout(resolve, 3000));

    const data = await page.evaluate(() => {
      const articles = Array.from(document.querySelectorAll('article, .news-item, [class*="news"]'));

      let seasonInfo = null;

      for (const article of articles) {
        const text = article.textContent || '';
        const lowerText = text.toLowerCase();

        if (lowerText.includes('season') && (lowerText.includes('release') || lowerText.includes('launch'))) {
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

    // R6 Siege seasons typically last ~3 months
    const now = new Date();
    const lastWipe = new Date(now);
    lastWipe.setDate(lastWipe.getDate() - 45);

    const nextWipe = new Date(now);
    nextWipe.setDate(nextWipe.getDate() + 45);

    return {
      nextWipe: nextWipe.toISOString(),
      lastWipe: lastWipe.toISOString(),
      frequency: 'Every ~3 months (4 seasons per year)',
      source: 'https://www.ubisoft.com/en-us/game/rainbow-six/siege',
      scrapedAt: new Date().toISOString(),
      confirmed: false,
      announcement: 'Check Ubisoft news for confirmed season dates',
    };
  } catch (error) {
    console.error('Error scraping R6 Siege:', error);
    throw new Error(`Failed to scrape R6 Siege season data: ${error}`);
  } finally {
    await page.close();
  }
}
