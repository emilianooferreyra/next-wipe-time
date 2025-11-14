import { getBrowser } from '../browser';
import type { WipeData } from '@/schemas/wipe-data';

export async function scrapeWarframeUpdate(): Promise<WipeData> {
  const browser = await getBrowser();
  const page = await browser.newPage();

  try {
    console.log('📍 Navigating to Warframe news...');

    await page.goto('https://www.warframe.com/news', {
      waitUntil: 'domcontentloaded',
      timeout: 30000,
    });

    console.log('✅ Page loaded, waiting for content...');
    await new Promise(resolve => setTimeout(resolve, 3000));

    const data = await page.evaluate(() => {
      const articles = Array.from(document.querySelectorAll('article, .news-item, [class*="post"]'));

      let updateInfo = null;

      for (const article of articles) {
        const text = article.textContent || '';
        const lowerText = text.toLowerCase();

        // Look for major updates (not hotfixes)
        if ((lowerText.includes('update') || lowerText.includes('expansion')) &&
            !lowerText.includes('hotfix') &&
            (lowerText.includes('coming') || lowerText.includes('arriving') || lowerText.includes('release'))) {
          updateInfo = text;
          break;
        }
      }

      return {
        updateInfo,
        pageText: document.body.innerText.substring(0, 2000),
      };
    });

    console.log('Scraped data:', data);

    // Warframe has irregular major updates
    // Major updates happen 2-4 times per year
    const now = new Date();
    const lastWipe = new Date(now);
    lastWipe.setDate(lastWipe.getDate() - 90); // Estimate last major update ~3 months ago

    const nextWipe = new Date(now);
    nextWipe.setDate(nextWipe.getDate() + 90); // Estimate next major update in ~3 months

    return {
      nextWipe: nextWipe.toISOString(),
      lastWipe: lastWipe.toISOString(),
      frequency: 'Major updates 2-4 times per year',
      source: 'https://www.warframe.com/news',
      scrapedAt: new Date().toISOString(),
      confirmed: false,
      announcement: 'Check Warframe.com for confirmed update dates',
    };
  } catch (error) {
    console.error('Error scraping Warframe:', error);
    throw new Error(`Failed to scrape Warframe update data: ${error}`);
  } finally {
    await page.close();
  }
}
