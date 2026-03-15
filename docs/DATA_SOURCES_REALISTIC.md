# NextWipeTime - Estrategia de Fuentes REALISTA (Sin Reddit API)

**Fecha:** 2026-02-09
**Actualización:** Reddit API ya no es viable (caro/restrictivo desde 2023)

---

## ⚠️ Realidad de las APIs en 2026

### ❌ **APIs que NO son viables:**

1. **Reddit API**
   - Cambió políticas en Junio 2023
   - Pricing: $0.24 por 1,000 requests (carísimo)
   - Mató apps como Apollo, RIF, Bacon Reader
   - **CONCLUSIÓN: NO usar**

2. **Twitter API Free Tier**
   - Eliminado en Marzo 2023
   - Pricing actual: $100/mes mínimo (Basic tier)
   - Free tier ya NO existe
   - **CONCLUSIÓN: NO usar** (muy caro para lo que ofrece)

3. **Facebook/Instagram APIs**
   - Restrictivos, requieren review
   - No útil para gaming data

---

## ✅ **Estrategia REALISTA de Fuentes**

---

## 1. Fuentes Principales (Lo que SÍ funciona)

### **A. Calculated Schedules (FREE, INSTANT)** ⭐⭐⭐⭐⭐

**Juegos aplicables:**
- Rust: Primer jueves cada mes, 19:00 UTC
- CoD: Seasons predecibles cada ~2 meses
- Cualquier juego con pattern fijo

**Implementation:**
```typescript
// Ya lo tienes implementado perfectamente
export const rustConfig: GameScraperConfig = {
  id: "rust",
  strategy: "calculated",
  schedule: {
    type: "monthly",
    dayOfWeek: 4,  // Thursday
    weekOfMonth: 1,
    time: "19:00",
    timezone: "UTC"
  }
};
```

**Costo:** $0
**Confiabilidad:** 100%
**Maintenance:** Bajo (solo si el juego cambia su schedule)

---

### **B. Sitios Oficiales con Firecrawl** ⭐⭐⭐⭐

**Esta es tu mejor opción para mayoría de juegos.**

#### Lista de Sitios Oficiales (Funcionan bien)

```typescript
const officialSources = {
  rust: "https://rust.facepunch.com/blog",
  tarkov: "https://www.escapefromtarkov.com/news",
  poe: "https://www.pathofexile.com/news",
  poe2: "https://www.pathofexile.com/poe2",
  fortnite: "https://www.fortnite.com/news",
  valorant: "https://playvalorant.com/en-us/news/",
  lol: "https://www.leagueoflegends.com/en-us/news/",
  diablo4: "https://news.blizzard.com/en-us/diablo4",
  apex: "https://www.ea.com/games/apex-legends/news",
  destiny2: "https://www.bungie.net/7/en/News",
  overwatch2: "https://overwatch.blizzard.com/en-us/news/",
  warframe: "https://www.warframe.com/news",
  dbd: "https://deadbydaylight.com/news",
  rocketleague: "https://www.rocketleague.com/news/",
  r6siege: "https://www.ubisoft.com/en-us/game/rainbow-six/siege/news-updates",
  cod: "https://www.callofduty.com/blog",
  pubg: "https://pubg.com/news"
};
```

#### Firecrawl Implementation

```typescript
// lib/scrapers/official-site-scraper.ts

import { Firecrawl } from '@mendable/firecrawl-js';

const app = new Firecrawl({ apiKey: process.env.FIRECRAWL_API_KEY });

export async function scrapeOfficialSite(gameId: string) {
  const url = officialSources[gameId];
  if (!url) throw new Error(`No official source for ${gameId}`);

  try {
    const result = await app.scrapeUrl(url, {
      formats: ['markdown', 'json'],
      onlyMainContent: true,
      waitFor: 3000,
      // Cache for 1 hour
      maxAge: 3600000,
      jsonOptions: {
        prompt: `Extract information about the next game update, wipe, season, or patch. Include:
        - Title/name of the update
        - Release/launch date (if mentioned)
        - Any countdown or "coming soon" language
        - Official announcement text`
      }
    });

    return {
      title: result.json?.title,
      date: result.json?.date,
      content: result.markdown,
      source: url,
      scrapedAt: new Date().toISOString()
    };

  } catch (error) {
    console.error(`Failed to scrape ${gameId}:`, error);
    throw error;
  }
}
```

**Pros:**
- ✅ Información oficial y confiable
- ✅ Firecrawl maneja JS rendering
- ✅ Caching reduce costos
- ✅ JSON mode extrae data estructurada

**Cons:**
- ❌ Cuesta credits (1-5 per scrape)
- ❌ Sitios pueden cambiar estructura
- ❌ Rate limits de Firecrawl

**Costo estimado:**
- 18 juegos × 4 scrapes/día (cada 6h) = 72 scrapes/día
- 72 × 30 = 2,160 credits/mes
- **Hobby tier (3,000 credits) = SUFICIENTE** ✅

---

### **C. Steam Web API (FREE)** ⭐⭐⭐⭐

**Para juegos en Steam:** Rust, Tarkov, PUBG, Warframe, Dead by Daylight, etc.

#### Setup

1. Get API key: https://steamcommunity.com/dev/apikey
2. Es **GRATIS** y generoso con rate limits

#### Implementation

```typescript
// lib/scrapers/steam-api.ts

const STEAM_API_KEY = process.env.STEAM_API_KEY;

// Map game IDs to Steam App IDs
const STEAM_APP_IDS = {
  rust: '252490',
  pubg: '578080',
  warframe: '230410',
  dbd: '381210',
  // etc...
};

export async function getSteamNews(gameId: string, count = 5) {
  const appId = STEAM_APP_IDS[gameId];
  if (!appId) return null;

  const response = await fetch(
    `https://api.steampowered.com/ISteamNews/GetNewsForApp/v2/?` +
    `appid=${appId}&count=${count}&maxlength=300&format=json`
  );

  const data = await response.json();

  return data.appnews.newsitems.map((item: any) => ({
    title: item.title,
    url: item.url,
    contents: item.contents,
    date: new Date(item.date * 1000).toISOString(),
    author: item.author
  }));
}

// Usage
const rustNews = await getSteamNews('rust');
console.log(rustNews[0].title); // Latest news
```

**Pros:**
- ✅ **100% GRATIS**
- ✅ JSON estructurado
- ✅ Confiable (API oficial de Valve)
- ✅ No se rompe (formato estable)

**Cons:**
- ❌ Solo para juegos en Steam
- ❌ News genéricos (no siempre sobre wipes)
- ❌ Necesitas filtrar por keywords

**Strategy:**
```typescript
export async function getWipeNewsFromSteam(gameId: string) {
  const news = await getSteamNews(gameId, 20);

  // Filter for wipe-related news
  const wipeNews = news.filter(item =>
    /wipe|reset|season|patch|update/i.test(item.title) ||
    /wipe|reset|season/i.test(item.contents)
  );

  return wipeNews[0]; // Most recent
}
```

---

### **D. RSS Feeds (FREE, SIMPLE)** ⭐⭐⭐⭐

**Muchos sitios oficiales tienen RSS feeds.**

#### Known RSS Feeds

```typescript
const rssFeeds = {
  rust: 'https://rust.facepunch.com/rss/blog',
  tarkov: 'https://www.escapefromtarkov.com/rss',
  warframe: 'https://www.warframe.com/news/rss',
  // Steam games
  rustSteam: 'https://store.steampowered.com/feeds/news/app/252490/', // Rust
  // etc...
};
```

#### Implementation

```bash
npm install rss-parser
```

```typescript
// lib/scrapers/rss-scraper.ts

import Parser from 'rss-parser';

const parser = new Parser();

export async function scrapeRSS(feedUrl: string) {
  try {
    const feed = await parser.parseURL(feedUrl);

    return feed.items.map(item => ({
      title: item.title,
      link: item.link,
      pubDate: item.pubDate,
      content: item.contentSnippet || item.content,
      guid: item.guid
    }));

  } catch (error) {
    console.error('RSS parse failed:', error);
    return [];
  }
}

// Usage
const rustFeed = await scrapeRSS('https://rust.facepunch.com/rss/blog');
console.log(rustFeed[0]); // Latest post
```

**Pros:**
- ✅ **100% GRATIS**
- ✅ Estándar (XML, fácil de parsear)
- ✅ No requiere autenticación
- ✅ Bajo mantenimiento

**Cons:**
- ❌ No todos los sitios tienen RSS
- ❌ Contenido limitado (solo snippets)

---

### **E. Web Scraping Directo (con Puppeteer/Playwright)** ⭐⭐⭐

**Para cuando Firecrawl es muy caro o como backup.**

#### Implementation (sin Firecrawl)

```typescript
// lib/scrapers/playwright-scraper.ts

import { chromium } from 'playwright';

export async function scrapeWithPlaywright(url: string) {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    await page.goto(url, { waitUntil: 'networkidle' });

    // Wait for content to load
    await page.waitForTimeout(3000);

    // Extract content
    const content = await page.evaluate(() => {
      // Remove scripts, styles
      document.querySelectorAll('script, style').forEach(el => el.remove());

      // Get main content
      const main = document.querySelector('main, article, .content, #content');
      return main ? main.innerText : document.body.innerText;
    });

    return {
      content,
      title: await page.title(),
      url: page.url()
    };

  } finally {
    await browser.close();
  }
}

// Usage
const data = await scrapeWithPlaywright('https://rust.facepunch.com/blog');
```

**Pros:**
- ✅ **GRATIS** (solo costo de compute)
- ✅ Control total
- ✅ Maneja JS rendering

**Cons:**
- ❌ Más lento que Firecrawl
- ❌ Consume más recursos (CPU, RAM)
- ❌ Puede ser bloqueado por anti-bot

**Cuándo usar:**
- Cuando Firecrawl se pone caro
- Para sitios simples sin anti-bot
- Como fallback si Firecrawl falla

---

### **F. Wikis Comunitarios (FREE via scraping)** ⭐⭐⭐

**Wikis tienen data histórica valiosa.**

#### Top Wikis

```typescript
const gameWikis = {
  rust: 'https://rust.fandom.com/wiki/Wipe',
  tarkov: 'https://escapefromtarkov.fandom.com/wiki/Patch_Notes',
  poe: 'https://www.poewiki.net/wiki/League',
  valorant: 'https://valorant.fandom.com/wiki/Episode',
  fortnite: 'https://fortnite.fandom.com/wiki/Battle_Pass',
  // etc...
};
```

#### Scraping Strategy

```typescript
// Wikis son estáticos - fácil de scrapear
export async function scrapeWiki(gameId: string) {
  const wikiUrl = gameWikis[gameId];

  // Opción 1: Firecrawl (si tienes credits)
  const result = await app.scrapeUrl(wikiUrl, {
    formats: ['markdown'],
    onlyMainContent: true,
    maxAge: 86400000 // Cache 24h (wikis cambian lento)
  });

  return result.markdown;

  // Opción 2: Simple fetch (wikis son static HTML)
  const response = await fetch(wikiUrl);
  const html = await response.text();
  // Parse HTML...
}
```

**Pros:**
- ✅ Datos históricos completos
- ✅ Fácil de scrapear (HTML estático)
- ✅ Community-maintained (actualizado)

**Cons:**
- ❌ No siempre actualizado inmediatamente
- ❌ Puede tener información incorrecta
- ❌ Ads pesados en Fandom

---

## 2. Estrategia de Implementación Realista

### **Cascade Model (Sin APIs caras)**

```typescript
// lib/scrapers/wipe-data-fetcher.ts

export async function getWipeData(gameId: string): Promise<WipeData> {
  console.log(`🎮 Fetching wipe data for ${gameId}`);

  // TIER 1: Calculated (FREE, INSTANT)
  if (hasCalculatedSchedule(gameId)) {
    console.log('✅ Using calculated schedule');
    return calculateWipe(gameId);
  }

  // TIER 2: Steam API (FREE, for Steam games)
  if (isSteamGame(gameId)) {
    try {
      console.log('🎮 Trying Steam API...');
      const steamNews = await getWipeNewsFromSteam(gameId);
      if (steamNews) {
        return parseWipeDataFromNews(steamNews);
      }
    } catch (error) {
      console.log('❌ Steam API failed:', error);
    }
  }

  // TIER 3: RSS Feed (FREE, if available)
  const rssFeed = getRSSFeed(gameId);
  if (rssFeed) {
    try {
      console.log('📡 Trying RSS feed...');
      const items = await scrapeRSS(rssFeed);
      const wipeItem = findWipeAnnouncement(items);
      if (wipeItem) {
        return parseWipeDataFromRSS(wipeItem);
      }
    } catch (error) {
      console.log('❌ RSS failed:', error);
    }
  }

  // TIER 4: Official Site with Firecrawl (COSTS CREDITS)
  try {
    console.log('🔥 Using Firecrawl for official site...');
    return await scrapeOfficialSite(gameId);
  } catch (error) {
    console.log('❌ Firecrawl failed:', error);
  }

  // TIER 5: Wiki (FREE, cached heavily)
  try {
    console.log('📚 Trying wiki scraping...');
    return await scrapeWiki(gameId);
  } catch (error) {
    console.log('❌ Wiki scraping failed:', error);
  }

  // TIER 6: Fallback static data
  console.log('⚠️  Using fallback data');
  return getFallbackData(gameId);
}
```

---

## 3. Costo Real (Optimizado)

### **Sin Reddit/Twitter APIs:**

| Fuente | Juegos | Frecuencia | Credits/mes | Costo |
|--------|--------|------------|-------------|-------|
| **Calculated** | 2 | N/A | 0 | $0 |
| **Steam API** | 6 | N/A | 0 | $0 |
| **RSS Feeds** | 4 | N/A | 0 | $0 |
| **Firecrawl** | 8 | 4×/día | 960 | ~$9.60 |
| **Wiki (cached)** | 8 | 1×/día | 240 | ~$2.40 |
| **TOTAL** | 20 | - | **1,200** | **~$12/mes** |

**CONCLUSIÓN:** Con Hobby tier de Firecrawl (3,000 credits) = $0/mes en free tier! ✅

---

## 4. Alternative: Community Data Sources (NO APIs)

### **A. Scraping Reddit (sin API)**

**Problema:** Reddit API es caro ($0.24/1K requests)

**Solución 1: Old Reddit + Simple Scraping**
```typescript
// Old Reddit es HTML simple (no JS)
const url = 'https://old.reddit.com/r/playrust/search?q=wipe&restrict_sr=1&sort=new&t=week';

const response = await fetch(url, {
  headers: {
    'User-Agent': 'Mozilla/5.0 (compatible; NextWipeTime/1.0)'
  }
});

const html = await response.text();
// Parse HTML for posts
```

**Solución 2: Reddit RSS Feeds (mejor)**
```typescript
// Reddit tiene RSS feeds (GRATIS)
const rssFeed = 'https://www.reddit.com/r/playrust/.rss';
const posts = await scrapeRSS(rssFeed);

// Filter for wipe mentions
const wipePosts = posts.filter(p =>
  /wipe|reset|season/i.test(p.title)
);
```

**Pros:**
- ✅ Gratis
- ✅ No requiere auth

**Cons:**
- ❌ Puede ser bloqueado
- ❌ Rate limits no documentados
- ❌ Contra ToS (technically)

---

### **B. Twitter Scraping Alternativas**

**Problema:** Twitter API = $100/mes mínimo

**Solución 1: Nitter (Twitter proxy - ya no funciona)**
- ❌ Nitter instances están muriendo (Twitter los bloquea)

**Solución 2: Scraping directo NO funciona**
- ❌ Twitter requiere login obligatorio
- ❌ Heavy JS rendering
- ❌ Aggressive anti-bot

**CONCLUSIÓN: NO intentar scrapear Twitter** ❌

**Alternativa:** Monitorear sitios oficiales que anuncian lo mismo que Twitter

---

## 5. Recomendación Final

### **Stack Recomendado:**

```typescript
// Prioridad de fuentes por tipo de juego

const scrapingStrategy = {
  // Games con schedule fijo
  calculated: ['rust', 'cod'],

  // Games en Steam
  steamAPI: ['rust', 'pubg', 'warframe', 'dbd', 'rocketleague'],

  // Games con RSS
  rss: ['rust', 'tarkov', 'warframe'],

  // Games que requieren Firecrawl
  firecrawl: [
    'poe', 'poe2', 'fortnite', 'valorant', 'lol', 'tft',
    'diablo4', 'apex', 'destiny2', 'overwatch2', 'r6siege',
    'lastepoch'
  ],

  // Games con buenos wikis
  wiki: ['valorant', 'fortnite', 'poe', 'tarkov', 'rust']
};
```

### **Prioridades:**

1. **Calculated** (Rust, CoD) = FREE, INSTANT ✅
2. **Steam API** (6 juegos) = FREE ✅
3. **RSS Feeds** (4 juegos) = FREE ✅
4. **Firecrawl** (8 juegos) = ~960 credits/mes ✅
5. **Wiki scraping** (backup) = FREE o low credits ✅

### **Total cost:** $0 - $12/mes (Hobby tier FREE con 3K credits)

---

## 6. Próximos Pasos de Implementación

### **Semana 1-2:**

1. **Setup Steam API** (30 min)
   ```typescript
   // Already works, just add API key
   STEAM_API_KEY=your_key_here
   ```

2. **Implement RSS scraper** (1 hora)
   ```bash
   npm install rss-parser
   ```

3. **Test con 3 juegos:**
   - Rust (calculated + Steam + RSS)
   - Tarkov (RSS + Firecrawl)
   - PoE (Firecrawl)

### **Semana 3-4:**

4. **Expand to all 20 games**
5. **Add fallback cascade**
6. **Setup monitoring (detect broken scrapers)**

---

## 7. Fuentes GRATIS Confirmadas

### ✅ **APIs Gratis que SÍ funcionan:**

1. **Steam Web API** - News feeds
2. **RSS Feeds** - Varios sitios oficiales
3. **Wikis** - Scraping HTML simple

### ❌ **APIs que NO usar:**

1. ~~Reddit API~~ - $0.24/1K requests (caro)
2. ~~Twitter API~~ - $100/mes mínimo
3. ~~Instagram API~~ - No útil para gaming

### 💰 **Firecrawl (paid pero razonable):**

- Hobby tier: 3,000 credits/mes = FREE
- Con strategy optimizada: 1,200 credits/mes
- **Sobra presupuesto** ✅

---

**Última actualización:** 2026-02-09
**Próxima revisión:** Después de implementar Steam API + RSS
