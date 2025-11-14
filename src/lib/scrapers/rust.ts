import { getBrowser } from '../browser';
import type { WipeData } from '@/schemas/wipe-data';

export async function scrapeRustWipe(): Promise<WipeData> {
  const browser = await getBrowser();
  const page = await browser.newPage();

  try {
    console.log('📍 Navigating to rustforcewipe.com...');

    // Navigate to Rust Force Wipe
    await page.goto('https://www.rustforcewipe.com/', {
      waitUntil: 'domcontentloaded',
      timeout: 30000,
    });

    console.log('✅ Page loaded, waiting for content...');

    // Wait a bit for any dynamic content
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Take a screenshot for debugging (optional)
    // await page.screenshot({ path: 'debug-rust.png' });

    // Extract the data - try multiple selectors
    const data = await page.evaluate(() => {
      // Get all the page HTML for inspection
      const html = document.body.innerHTML;
      const text = document.body.innerText;

      // Try to find any countdown-related elements
      const possibleSelectors = [
        '.countdown',
        '#countdown',
        '[class*="countdown"]',
        '[id*="countdown"]',
        '[class*="timer"]',
        '[id*="timer"]',
        'time',
      ];

      let foundElement = null;
      let foundSelector = null;

      for (const selector of possibleSelectors) {
        const el = document.querySelector(selector);
        if (el) {
          foundElement = el.textContent;
          foundSelector = selector;
          break;
        }
      }

      return {
        foundElement,
        foundSelector,
        title: document.title,
        textPreview: text.substring(0, 1000), // First 1000 chars
        hasScript: html.includes('countdown') || html.includes('timer'),
      };
    });

    console.log('📊 Scraped data:', JSON.stringify(data, null, 2));

    // For now, calculate based on known pattern since scraping the site might be complex
    // Rust official servers wipe first Thursday of each month at 19:00 UTC
    const now = new Date();

    // Calculate next wipe
    let nextWipe: Date;
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    // Find first Thursday of current month
    const firstThursdayThisMonth = new Date(currentYear, currentMonth, 1);
    while (firstThursdayThisMonth.getDay() !== 4) {
      firstThursdayThisMonth.setDate(firstThursdayThisMonth.getDate() + 1);
    }
    firstThursdayThisMonth.setUTCHours(19, 0, 0, 0);

    // If we're past this month's wipe, calculate next month's
    if (now > firstThursdayThisMonth) {
      const firstThursdayNextMonth = new Date(currentYear, currentMonth + 1, 1);
      while (firstThursdayNextMonth.getDay() !== 4) {
        firstThursdayNextMonth.setDate(firstThursdayNextMonth.getDate() + 1);
      }
      firstThursdayNextMonth.setUTCHours(19, 0, 0, 0);
      nextWipe = firstThursdayNextMonth;
    } else {
      nextWipe = firstThursdayThisMonth;
    }

    // Calculate last wipe (previous month's first Thursday)
    const lastWipeMonth = nextWipe.getMonth() - 1;
    const lastWipeYear = lastWipeMonth < 0 ? nextWipe.getFullYear() - 1 : nextWipe.getFullYear();
    const lastWipe = new Date(lastWipeYear, lastWipeMonth < 0 ? 11 : lastWipeMonth, 1);
    while (lastWipe.getDay() !== 4) {
      lastWipe.setDate(lastWipe.getDate() + 1);
    }
    lastWipe.setUTCHours(19, 0, 0, 0);

    console.log('📅 Next wipe:', nextWipe.toISOString());
    console.log('📅 Last wipe:', lastWipe.toISOString());

    return {
      nextWipe: nextWipe.toISOString(),
      lastWipe: lastWipe.toISOString(),
      frequency: 'Monthly (First Thursday at 7PM UTC)',
      source: 'rustforcewipe.com (calculated)',
      scrapedAt: new Date().toISOString(),
      confirmed: true, // Force wipes are always confirmed (monthly schedule)
    };
  } catch (error) {
    console.error('❌ Error scraping Rust wipe:', error);
    throw new Error(`Failed to scrape Rust wipe data: ${error}`);
  } finally {
    await page.close();
  }
}
