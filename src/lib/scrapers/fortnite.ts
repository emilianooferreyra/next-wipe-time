import { getBrowser } from '../browser';
import type { WipeData } from '@/schemas/wipe-data';

export async function scrapeFortniteWipe(): Promise<WipeData> {
  const browser = await getBrowser();
  const page = await browser.newPage();

  // Try multiple strategies for bypassing Cloudflare
  const strategies: Array<{
    name: string;
    userAgent: string;
    headers: Record<string, string>;
  }> = [
    {
      name: 'Strategy 1 - Chrome Windows',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
      headers: {
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br, zstd',
        'Cache-Control': 'max-age=0',
        'Sec-Ch-Ua': '"Google Chrome";v="131", "Chromium";v="131", "Not_A Brand";v="24"',
        'Sec-Ch-Ua-Mobile': '?0',
        'Sec-Ch-Ua-Platform': '"Windows"',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        'Sec-Fetch-User': '?1',
        'Upgrade-Insecure-Requests': '1',
      }
    },
    {
      name: 'Strategy 2 - Firefox Mac',
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:131.0) Gecko/20100101 Firefox/131.0',
      headers: {
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate, br',
        'DNT': '1',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        'Sec-Fetch-User': '?1',
      }
    },
    {
      name: 'Strategy 3 - Safari Mac',
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15',
      headers: {
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
      }
    }
  ];

  let lastError: Error | null = null;

  for (const strategy of strategies) {
    try {
      console.log(`📍 Trying ${strategy.name}...`);

      // Set user agent and headers
      await page.setExtraHTTPHeaders(strategy.headers);

      // Use the non-deprecated overload by setting userAgent via CDP
      const client = await page.createCDPSession();
      await client.send('Network.setUserAgentOverride', {
        userAgent: strategy.userAgent,
        userAgentMetadata: {
          brands: [
            { brand: 'Google Chrome', version: '131' },
            { brand: 'Chromium', version: '131' },
            { brand: 'Not_A Brand', version: '24' }
          ],
          fullVersion: '131.0.0.0',
          platform: 'Windows',
          platformVersion: '10.0.0',
          architecture: 'x86',
          model: '',
          mobile: false,
        }
      });

      console.log('📍 Navigating to fortnite.gg...');

      await page.goto('https://fortnite.gg/season-countdown', {
        waitUntil: 'networkidle2',
        timeout: 60000,
      });

      console.log('✅ Page loaded, waiting for content...');

      // Wait for Cloudflare check to complete
      await new Promise(resolve => setTimeout(resolve, 5000));

      // Check if we're stuck on Cloudflare challenge
      const pageContent = await page.content();
      if (pageContent.includes('Checking your browser') || pageContent.includes('cf-browser-verification')) {
        console.log('⏳ Still on Cloudflare challenge, waiting longer...');
        await new Promise(resolve => setTimeout(resolve, 10000));
      }

      console.log('✅ Extracting data...');

      // Take screenshot for debugging
      try {
        await page.screenshot({ path: 'fortnite-debug.png', fullPage: false });
        console.log('📸 Screenshot saved to fortnite-debug.png');
      } catch (e) {
        console.warn('Could not save screenshot:', e);
      }

      // Extract season information and countdown data
      const seasonInfo = await page.evaluate(() => {
        const text = document.body.innerText;
        const html = document.documentElement.outerHTML;

        // Try to find background/banner image
        let bgImage = '';
        const bannerImg = document.querySelector('img[src*="season"], img[src*="chapter"]') as HTMLImageElement;
        if (bannerImg?.src) bgImage = bannerImg.src;

        // Try to extract countdown data from multiple sources
        let countdownData: { timestamp?: number; endDate?: string; source: string } | null = null;

        // PRIORITY 1: Look for data-target attribute (PRIMARY METHOD from user's code)
        const countdownElement = document.querySelector('#big-countdown[data-target]') ||
                                document.querySelector('[data-target]') ||
                                document.querySelector('[id*="countdown"][data-target]');

        if (countdownElement) {
          const dataTarget = countdownElement.getAttribute('data-target');
          if (dataTarget) {
            // data-target should be a timestamp in milliseconds
            const timestamp = parseInt(dataTarget);
            if (!isNaN(timestamp) && timestamp > 0) {
              countdownData = { timestamp, source: 'data-target' };
              console.log('✅ Found data-target:', timestamp);
            }
          }
        }

        // 2. Look for JSON-LD structured data
        if (!countdownData) {
          const jsonLdScripts = document.querySelectorAll('script[type="application/ld+json"]');
          for (const script of jsonLdScripts) {
            try {
              const data = JSON.parse(script.textContent || '');
              if (data.endDate) {
                countdownData = { endDate: data.endDate, source: 'json-ld' };
                break;
              }
            } catch (e) {}
          }
        }

        // 3. Look for data in script tags
        if (!countdownData) {
          const scripts = Array.from(document.querySelectorAll('script'));
          for (const script of scripts) {
            const content = script.textContent || '';

            // Look for date/time patterns
            if (content.includes('countdown') || content.includes('endDate') || content.includes('seasonEnd')) {
              // Try to extract ISO date or timestamp
              const isoMatch = content.match(/["'](\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}[^"']*)["']/);
              if (isoMatch) {
                countdownData = { endDate: isoMatch[1], source: 'script-iso' };
                break;
              }

              // Try to extract timestamp (milliseconds)
              const timestampMatch = content.match(/(?:endTime|endDate|countdown|target)["'\s:=]+(\d{13})/);
              if (timestampMatch) {
                countdownData = { timestamp: parseInt(timestampMatch[1]), source: 'script-timestamp' };
                break;
              }
            }
          }
        }

        // 4. Look for meta tags with date info
        if (!countdownData) {
          const metaDate = document.querySelector('meta[property*="end"], meta[name*="end"]');
          if (metaDate) {
            const content = metaDate.getAttribute('content');
            if (content) {
              const date = new Date(content);
              if (!isNaN(date.getTime())) {
                countdownData = { endDate: date.toISOString(), source: 'meta' };
              }
            }
          }
        }

        // 5. Look for other data attributes
        if (!countdownData) {
          const dataElement = document.querySelector('[data-end-date], [data-countdown], [data-end-time], [data-time]');
          if (dataElement) {
            const endDate = dataElement.getAttribute('data-end-date') ||
                           dataElement.getAttribute('data-countdown') ||
                           dataElement.getAttribute('data-end-time') ||
                           dataElement.getAttribute('data-time');
            if (endDate) {
              // Try parsing as timestamp first
              const timestamp = parseInt(endDate);
              if (!isNaN(timestamp) && timestamp > 1000000000000) {
                countdownData = { timestamp, source: 'data-attr-timestamp' };
              } else {
                countdownData = { endDate, source: 'data-attr' };
              }
            }
          }
        }

        // 6. Try to find countdown elements in DOM (fallback)
        const countdownElements = {
          days: document.querySelector('[class*="day" i]:not([class*="birthday"])')?.textContent?.trim(),
          hours: document.querySelector('[class*="hour" i]')?.textContent?.trim(),
          minutes: document.querySelector('[class*="minute" i]')?.textContent?.trim(),
          seconds: document.querySelector('[class*="second" i]')?.textContent?.trim(),
        };

        return {
          textPreview: text.substring(0, 1500),
          htmlPreview: html.substring(0, 2000),
          backgroundImage: bgImage,
          countdownData,
          countdownElements,
        };
      });

      console.log('📊 Scraped Fortnite data:', JSON.stringify(seasonInfo, null, 2));
      console.log('📄 Text preview:', seasonInfo.textPreview);
      console.log('🔍 HTML preview:', seasonInfo.htmlPreview?.substring(0, 500));

      // Try to calculate end date from scraped data
      let nextWipe: Date | null = null;
      let lastWipe: Date | null = null;

      if (seasonInfo.countdownData?.timestamp) {
        nextWipe = new Date(seasonInfo.countdownData.timestamp);
        console.log('✅ Found timestamp from', seasonInfo.countdownData.source, ':', nextWipe.toISOString());
      } else if (seasonInfo.countdownData?.endDate) {
        nextWipe = new Date(seasonInfo.countdownData.endDate);
        console.log('✅ Found end date from', seasonInfo.countdownData.source, ':', nextWipe.toISOString());
      } else if (seasonInfo.countdownElements?.days || seasonInfo.countdownElements?.hours) {
        // Calculate from countdown display (fallback)
        const daysStr = seasonInfo.countdownElements.days || '0';
        const hoursStr = seasonInfo.countdownElements.hours || '0';
        const minutesStr = seasonInfo.countdownElements.minutes || '0';
        const secondsStr = seasonInfo.countdownElements.seconds || '0';

        const days = parseInt(daysStr.replace(/\D/g, '') || '0');
        const hours = parseInt(hoursStr.replace(/\D/g, '') || '0');
        const minutes = parseInt(minutesStr.replace(/\D/g, '') || '0');
        const seconds = parseInt(secondsStr.replace(/\D/g, '') || '0');

        if (!isNaN(days) || !isNaN(hours)) {
          // Calculate total milliseconds from now
          const now = Date.now();
          const totalMilliseconds =
            (days * 24 * 60 * 60 * 1000) +
            (hours * 60 * 60 * 1000) +
            (minutes * 60 * 1000) +
            (seconds * 1000);

          nextWipe = new Date(now + totalMilliseconds);
          console.log('✅ Calculated from countdown elements (D:H:M:S):', days, hours, minutes, seconds);
          console.log('✅ Next wipe calculated:', nextWipe.toISOString());
        }
      }

      if (!nextWipe) {
        throw new Error(`Could not extract Fortnite season end date using ${strategy.name}. The page structure may have changed.`);
      }

      // Calculate last wipe (assuming ~70 days per season)
      lastWipe = new Date(nextWipe);
      lastWipe.setDate(lastWipe.getDate() - 70);

      // If we didn't get background, try fortnite.com
      let backgroundImage = seasonInfo.backgroundImage;
      if (!backgroundImage) {
        try {
          console.log('🖼️  Fetching Fortnite background from official site...');
          await page.goto('https://www.fortnite.com/', {
            waitUntil: 'domcontentloaded',
            timeout: 30000,
          });

          await new Promise(resolve => setTimeout(resolve, 2000));

          backgroundImage = await page.evaluate(() => {
            // Try to find hero images
            const heroImg = document.querySelector('.hero img, .banner img, [class*="hero"] img') as HTMLImageElement;
            if (heroImg?.src) return heroImg.src;

            const bgSection = document.querySelector('[style*="background-image"]') as HTMLElement;
            if (bgSection) {
              const match = bgSection.style.backgroundImage.match(/url\(['"]?(.*?)['"]?\)/);
              if (match) return match[1];
            }

            // Fallback to any large image
            const imgs = Array.from(document.querySelectorAll('img'));
            const largeImg = imgs.find(img =>
              img.width > 1000 &&
              (img.src.includes('season') || img.src.includes('chapter') || img.src.includes('hero'))
            );
            if (largeImg?.src) return largeImg.src;

            return '';
          });

          console.log('✅ Background image found:', backgroundImage);
        } catch (error) {
          console.warn('⚠️  Failed to fetch background image:', error);
        }
      }

      console.log('📅 Next season:', nextWipe.toISOString());
      console.log('📅 Last season:', lastWipe.toISOString());

      await page.close();

      return {
        nextWipe: nextWipe.toISOString(),
        lastWipe: lastWipe.toISOString(),
        frequency: 'Seasonal (60-90 days)',
        source: `fortnite.gg (${seasonInfo.countdownData?.source || 'calculated'})`,
        scrapedAt: new Date().toISOString(),
        confirmed: seasonInfo.countdownData?.source === 'data-target', // Confirmed if from data-target
      };
    } catch (error) {
      console.error(`❌ ${strategy.name} failed:`, error);
      lastError = error as Error;
      // Continue to next strategy
    }
  }

  // All strategies failed
  await page.close();
  throw new Error(`All scraping strategies failed. Last error: ${lastError?.message || 'Unknown error'}`);
}
