# Live Streams Scraping Strategy - Sin APIs

**Created**: 2026-02-09
**Purpose**: Scrapear streams EN VIVO de Twitch, Kick y YouTube sin crear apps ni usar APIs
**Method**: Playwright scraping directo de páginas de categorías
**Status**: Production Ready

---

## 🎯 Objetivo

Obtener streams **LIVE** (en vivo) para cualquier juego, ordenados por **viewer count** (mayor a menor), sin importar si el streamer es grande o chico. Si Shroud está jugando Diablo IV, debe aparecer primero.

**Requisitos**:
- ❌ NO crear apps en plataformas (sin OAuth, sin API keys)
- ✅ Scraping directo con Playwright
- ✅ Solo streams LIVE (no offline, no VODs)
- ✅ Ordenados por viewers (mayor a menor)
- ✅ Dinámico: cualquier streamer jugando el juego
- ✅ Funciona con todos los juegos

---

## 📊 Análisis de la Implementación Actual

### ✅ Lo que ya funciona bien:

1. **Twitch scraper** (`twitch-scraper.ts`):
   - ✅ Scrapea `twitch.tv/directory/game/{game}`
   - ✅ Obtiene streams LIVE reales
   - ✅ Extrae viewer count
   - ✅ Ordena por viewers
   - ✅ Usa Playwright con anti-detection

2. **Kick scraper** (`kick-scraper.ts`):
   - ✅ Scrapea `kick.com/categories/{category}`
   - ✅ Filtra solo streams LIVE
   - ✅ Extrae viewer count
   - ✅ Ordena por viewers
   - ✅ Usa Playwright

3. **Browser setup** (`browser.ts`):
   - ✅ Playwright con anti-detection
   - ✅ User agent rotation
   - ✅ Navigator.webdriver override
   - ✅ Context reutilizable

### ❌ Problema principal:

**YouTube scraper** (`youtube-scraper.ts`):
- ❌ Busca **videos** generales, NO streams LIVE
- ❌ URL actual: `youtube.com/results?search_query={query}`
- ❌ No filtra por estado "LIVE"
- ❌ No extrae viewer count en vivo

**Resultado**: La app usa `getMockLiveStreams()` como fallback porque YouTube no devuelve streams reales.

---

## 🔧 Solución 1: Mejorar YouTube Scraper para LIVE Streams

### URL correcta para YouTube Live Streams

```
https://www.youtube.com/results?search_query={game}&sp=EgJAAQ%253D%253D
```

**Parámetro `sp=EgJAAQ%253D%253D`**: Filtra solo streams LIVE (decoded: `{"1":{"1":64}}`).

### Código Nuevo: `youtube-live-scraper.ts`

**File**: `src/lib/scrapers/youtube-live-scraper.ts`

```typescript
import { newPage } from "../browser";

export interface YouTubeLiveStream {
  platform: "youtube";
  streamerUsername: string;
  streamerDisplayName: string;
  title: string;
  game: string;
  viewerCount: number;
  url: string;
  thumbnailUrl: string;
  videoId: string;
  channelUrl: string;
}

/**
 * Scrape YouTube for LIVE gaming streams
 * Uses the search filter for live content only
 */
export async function scrapeYouTubeLiveStreams(
  gameQuery: string,
  limit: number = 20
): Promise<YouTubeLiveStream[]> {
  const page = await newPage();

  try {
    console.log(`🔴 Scraping YouTube LIVE streams for "${gameQuery}"...`);

    // URL with LIVE filter (sp=EgJAAQ%253D%253D)
    const url = `https://www.youtube.com/results?search_query=${encodeURIComponent(gameQuery + " live")}&sp=EgJAAQ%253D%253D`;
    console.log(`   URL: ${url}`);

    await page.goto(url, {
      waitUntil: "domcontentloaded",
      timeout: 30000,
    });

    // Wait for content to load
    await new Promise((resolve) => setTimeout(resolve, 3000));

    // Scroll to load more streams
    for (let i = 0; i < 2; i++) {
      await page.evaluate(() => {
        window.scrollBy(0, window.innerHeight);
      });
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    const streams = await page.evaluate(() => {
      const streamList: any[] = [];
      const debugInfo: any[] = [];

      // YouTube uses ytd-video-renderer for search results
      const videoElements = document.querySelectorAll('ytd-video-renderer');
      debugInfo.push(`Found ${videoElements.length} video renderers`);

      for (const el of videoElements) {
        try {
          // Check if it's actually LIVE (has red LIVE badge)
          const badges = el.querySelectorAll('.badge-style-type-live-now');
          const isLive = badges.length > 0;

          if (!isLive) {
            debugInfo.push('Skipped: not live');
            continue;
          }

          // Extract video URL and ID
          const linkEl = el.querySelector('a#video-title');
          const videoUrl = linkEl ? (linkEl as any).href : '';

          if (!videoUrl) continue;

          const urlMatch = videoUrl.match(/v=([^&]+)/);
          const videoId = urlMatch ? urlMatch[1] : '';

          if (!videoId) continue;

          // Extract title
          const titleEl = el.querySelector('a#video-title');
          const title = titleEl ? titleEl.textContent?.trim() || '' : '';

          // Extract channel name
          const channelEl = el.querySelector('#channel-name a');
          const channelName = channelEl ? channelEl.textContent?.trim() || '' : '';

          // Extract channel URL
          const channelLink = channelEl ? (channelEl as any).href : '';

          // Extract viewer count (LIVE viewer count shows as "X watching now")
          const metadataEl = el.querySelector('#metadata-line');
          let viewerCount = 0;

          if (metadataEl) {
            const text = metadataEl.textContent || '';

            // Match patterns like "1.2K watching", "234 watching", etc.
            const viewerMatch = text.match(/([\d,.]+)\s*([KM])?\s*watching/i);

            if (viewerMatch) {
              let viewers = parseFloat(viewerMatch[1].replace(/,/g, ''));
              const multiplier = viewerMatch[2];

              if (multiplier === 'K') viewers *= 1000;
              if (multiplier === 'M') viewers *= 1000000;

              viewerCount = Math.floor(viewers);
            }
          }

          // Extract thumbnail
          const thumbnailEl = el.querySelector('img#img');
          const thumbnail = thumbnailEl ? (thumbnailEl as any).src || '' : '';

          if (title && channelName && videoId) {
            streamList.push({
              videoId,
              title,
              channelName,
              channelUrl: channelLink,
              url: videoUrl,
              thumbnail,
              viewerCount
            });
          }

        } catch (e) {
          debugInfo.push(`Error parsing element: ${e}`);
        }
      }

      debugInfo.push(`Extracted ${streamList.length} live streams`);
      console.log('YouTube DEBUG:', JSON.stringify(debugInfo));
      console.log('YouTube STREAMS:', JSON.stringify(streamList.slice(0, 3)));

      return { streams: streamList, debug: debugInfo };
    });

    // Extract streams and debug info
    const streamData = streams as any;
    const streamList = streamData.streams || [];
    const debugInfo = streamData.debug || [];

    console.log('YouTube Debug Info:', debugInfo);

    // Format and sort by viewer count
    const liveStreams: YouTubeLiveStream[] = streamList
      .filter((s: any) => s.videoId && s.title)
      .map((stream: any) => ({
        platform: "youtube",
        streamerUsername: stream.channelName,
        streamerDisplayName: stream.channelName,
        title: stream.title,
        game: gameQuery,
        viewerCount: stream.viewerCount,
        url: stream.url,
        thumbnailUrl: stream.thumbnail,
        videoId: stream.videoId,
        channelUrl: stream.channelUrl
      }))
      .sort((a: YouTubeLiveStream, b: YouTubeLiveStream) =>
        b.viewerCount - a.viewerCount
      );

    console.log(`✅ Found ${liveStreams.length} LIVE YouTube streams for ${gameQuery}`);
    await page.close();
    return liveStreams;

  } catch (error) {
    console.error('❌ Error scraping YouTube live streams:', error);
    await page.close();
    return [];
  }
}

/**
 * Alternative: Scrape YouTube Gaming directory by game
 * URL: youtube.com/gaming/{game}/streams
 * (This may require game IDs which are harder to map)
 */
export async function scrapeYouTubeGamingDirectory(
  gameSlug: string,
  limit: number = 20
): Promise<YouTubeLiveStream[]> {
  const page = await newPage();

  try {
    console.log(`🎮 Scraping YouTube Gaming directory for ${gameSlug}...`);

    // Try the gaming directory URL
    const url = `https://www.youtube.com/gaming/${gameSlug}/streams`;
    console.log(`   URL: ${url}`);

    await page.goto(url, {
      waitUntil: "domcontentloaded",
      timeout: 30000,
    });

    await new Promise((resolve) => setTimeout(resolve, 3000));

    // Scroll to load more
    for (let i = 0; i < 3; i++) {
      await page.evaluate(() => {
        window.scrollBy(0, window.innerHeight);
      });
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    const streams = await page.evaluate(() => {
      const streamList: any[] = [];

      // Gaming directory uses ytd-rich-item-renderer
      const items = document.querySelectorAll('ytd-rich-item-renderer');

      for (const item of items) {
        try {
          // Check for LIVE badge
          const liveBadge = item.querySelector('.badge-style-type-live-now');
          if (!liveBadge) continue;

          // Extract video link
          const linkEl = item.querySelector('a#video-title-link');
          const videoUrl = linkEl ? (linkEl as any).href : '';

          if (!videoUrl) continue;

          const urlMatch = videoUrl.match(/v=([^&]+)/);
          const videoId = urlMatch ? urlMatch[1] : '';

          // Extract title
          const titleEl = item.querySelector('#video-title');
          const title = titleEl ? titleEl.textContent?.trim() || '' : '';

          // Extract channel
          const channelEl = item.querySelector('#channel-name a');
          const channelName = channelEl ? channelEl.textContent?.trim() || '' : '';
          const channelUrl = channelEl ? (channelEl as any).href : '';

          // Extract viewer count
          const metadataEl = item.querySelector('#metadata-line');
          let viewerCount = 0;

          if (metadataEl) {
            const text = metadataEl.textContent || '';
            const viewerMatch = text.match(/([\d,.]+)\s*([KM])?\s*watching/i);

            if (viewerMatch) {
              let viewers = parseFloat(viewerMatch[1].replace(/,/g, ''));
              const multiplier = viewerMatch[2];

              if (multiplier === 'K') viewers *= 1000;
              if (multiplier === 'M') viewers *= 1000000;

              viewerCount = Math.floor(viewers);
            }
          }

          // Extract thumbnail
          const thumbnailEl = item.querySelector('img#img');
          const thumbnail = thumbnailEl ? (thumbnailEl as any).src : '';

          if (title && channelName && videoId) {
            streamList.push({
              videoId,
              title,
              channelName,
              channelUrl,
              url: videoUrl,
              thumbnail,
              viewerCount
            });
          }

        } catch (e) {
          // Skip
        }
      }

      return streamList;
    });

    const liveStreams: YouTubeLiveStream[] = streams
      .map((stream: any) => ({
        platform: "youtube",
        streamerUsername: stream.channelName,
        streamerDisplayName: stream.channelName,
        title: stream.title,
        game: gameSlug,
        viewerCount: stream.viewerCount,
        url: stream.url,
        thumbnailUrl: stream.thumbnail,
        videoId: stream.videoId,
        channelUrl: stream.channelUrl
      }))
      .sort((a: YouTubeLiveStream, b: YouTubeLiveStream) =>
        b.viewerCount - a.viewerCount
      );

    console.log(`✅ Found ${liveStreams.length} streams from Gaming directory`);
    await page.close();
    return liveStreams;

  } catch (error) {
    console.error('❌ Error scraping YouTube Gaming directory:', error);
    await page.close();
    return [];
  }
}
```

---

## 🔄 Actualizar Route API

**File**: `src/app/api/streams/live/route.ts`

```typescript
import { NextResponse } from "next/server";
import { scrapeTwitchByGameDirect } from "@/lib/scrapers/twitch-scraper";
import { scrapeKickByCategory } from "@/lib/scrapers/kick-scraper";
import { scrapeYouTubeLiveStreams } from "@/lib/scrapers/youtube-live-scraper"; // NEW
import { GAME_STREAM_QUERIES } from "@/lib/scrapers/stream-helpers";

export interface LiveStreamsResponse {
  twitch: any[];
  kick: any[];
  youtube: any[]; // NOW POPULATED
  total: number;
  gameId?: string;
  timestamp: string;
  debug?: {
    twitchError?: string;
    kickError?: string;
    youtubeError?: string;
  };
}

function getGameCategory(gameId: string): string | undefined {
  const category = GAME_STREAM_QUERIES[gameId];
  if (category) return category;
  if (gameId.startsWith("diablo")) return GAME_STREAM_QUERIES["diablo4"];
  if (gameId.startsWith("poe"))
    return GAME_STREAM_QUERIES["poe"] ?? GAME_STREAM_QUERIES["poe2"];
  if (gameId.startsWith("cod"))
    return GAME_STREAM_QUERIES["cod-bo6"] ?? GAME_STREAM_QUERIES["cod"];
  return undefined;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const gameId = searchParams.get("game");

  try {
    console.log(`📡 Fetching live streams${gameId ? ` for ${gameId}` : ""}...`);

    let twitchStreams: any[] = [];
    let kickStreams: any[] = [];
    let youtubeStreams: any[] = [];
    let twitchError: string | undefined;
    let kickError: string | undefined;
    let youtubeError: string | undefined;

    const gameCategory = gameId ? getGameCategory(gameId) : undefined;

    if (gameId && gameCategory) {
      // Fetch all platforms in parallel for speed
      const results = await Promise.allSettled([
        // Twitch
        (async () => {
          try {
            console.log(`🎮 Scraping Twitch for ${gameCategory}...`);
            const streams = await scrapeTwitchByGameDirect(gameCategory);
            console.log(`✅ Twitch: Found ${streams.length} live streams`);
            return streams;
          } catch (err) {
            twitchError = err instanceof Error ? err.message : "Unknown error";
            console.error(`❌ Twitch error:`, err);
            return [];
          }
        })(),

        // Kick
        (async () => {
          try {
            console.log(`🎮 Scraping Kick for ${gameCategory}...`);
            const streams = await scrapeKickByCategory(gameCategory);
            console.log(`✅ Kick: Found ${streams.length} live streams`);
            return streams;
          } catch (err) {
            kickError = err instanceof Error ? err.message : "Unknown error";
            console.error(`❌ Kick error:`, err);
            return [];
          }
        })(),

        // YouTube (NEW!)
        (async () => {
          try {
            console.log(`🎮 Scraping YouTube LIVE for ${gameCategory}...`);
            const streams = await scrapeYouTubeLiveStreams(gameCategory, 10);
            console.log(`✅ YouTube: Found ${streams.length} live streams`);
            return streams;
          } catch (err) {
            youtubeError = err instanceof Error ? err.message : "Unknown error";
            console.error(`❌ YouTube error:`, err);
            return [];
          }
        })(),
      ]);

      // Extract results
      twitchStreams = results[0].status === 'fulfilled' ? results[0].value : [];
      kickStreams = results[1].status === 'fulfilled' ? results[1].value : [];
      youtubeStreams = results[2].status === 'fulfilled' ? results[2].value : [];

    } else if (gameId) {
      console.log(`⚠️ No stream category configured for game: ${gameId}`);
    }

    // Combine and sort ALL streams by viewer count
    const allStreams = [
      ...twitchStreams,
      ...kickStreams,
      ...youtubeStreams
    ].sort((a, b) => b.viewerCount - a.viewerCount);

    const response: LiveStreamsResponse = {
      twitch: twitchStreams,
      kick: kickStreams,
      youtube: youtubeStreams,
      total: allStreams.length,
      gameId: gameId || undefined,
      timestamp: new Date().toISOString(),
      debug: twitchError || kickError || youtubeError
        ? { twitchError, kickError, youtubeError }
        : undefined,
    };

    console.log(
      `📊 Response: ${twitchStreams.length} Twitch + ${kickStreams.length} Kick + ${youtubeStreams.length} YouTube = ${response.total} total`
    );

    return NextResponse.json(response, {
      headers: {
        "Cache-Control": "public, max-age=60", // Cache for 1 minute
      },
    });
  } catch (error) {
    console.error("❌ Error fetching live streams:", error);

    return NextResponse.json(
      {
        error: "Failed to fetch live streams",
        twitch: [],
        kick: [],
        youtube: [],
        total: 0,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
```

---

## 🎯 Eliminar Mock Data

**File**: `src/app/game/[id]/page.tsx`

```typescript
// BEFORE (uses mock data as fallback)
const displayStreams = liveStreams.length > 0 ? liveStreams : getMockLiveStreams(gameId);

// AFTER (no mock data, show empty state if no streams)
const displayStreams = liveStreams;

// Add empty state UI:
{displayStreams.length === 0 && (
  <div className="text-center py-12">
    <p className="text-gray-400">
      No live streams found for this game right now.
      <br />
      Check back later!
    </p>
  </div>
)}

{displayStreams.length > 0 && (
  <div className="grid gap-4">
    {displayStreams.map(stream => (
      <StreamCard key={stream.id} stream={stream} />
    ))}
  </div>
)}
```

---

## ⚡ Optimización: Caching Agresivo

Los scrapers son lentos (2-5 segundos cada uno). Agrega caching para evitar scrapear en cada request.

**File**: `src/lib/stream-cache.ts`

```typescript
interface CachedStreams {
  data: any[];
  expiresAt: number;
}

// In-memory cache (use Redis in production)
const cache = new Map<string, CachedStreams>();

export async function getCachedStreams<T>(
  cacheKey: string,
  fetchFn: () => Promise<T[]>,
  ttlMs: number = 2 * 60 * 1000 // 2 minutes default
): Promise<T[]> {
  const cached = cache.get(cacheKey);

  if (cached && Date.now() < cached.expiresAt) {
    console.log(`✅ Cache HIT: ${cacheKey}`);
    return cached.data as T[];
  }

  console.log(`🔄 Cache MISS: ${cacheKey}, fetching...`);
  const data = await fetchFn();

  cache.set(cacheKey, {
    data,
    expiresAt: Date.now() + ttlMs
  });

  return data;
}

// Usage in route.ts
import { getCachedStreams } from '@/lib/stream-cache';

export async function GET(request: Request) {
  // ...

  if (gameId && gameCategory) {
    // Cache each platform for 2 minutes
    const [twitchStreams, kickStreams, youtubeStreams] = await Promise.all([
      getCachedStreams(
        `twitch:${gameCategory}`,
        () => scrapeTwitchByGameDirect(gameCategory),
        2 * 60 * 1000
      ),
      getCachedStreams(
        `kick:${gameCategory}`,
        () => scrapeKickByCategory(gameCategory),
        2 * 60 * 1000
      ),
      getCachedStreams(
        `youtube:${gameCategory}`,
        () => scrapeYouTubeLiveStreams(gameCategory, 10),
        2 * 60 * 1000
      ),
    ]);

    // ...
  }
}
```

**Beneficios**:
- Primera request: 5-10 segundos (scraping)
- Siguientes requests (2 min): <50ms (cache hit)
- Reduce carga en Vercel
- Menos riesgo de rate limiting

---

## 🚀 Alternativa: Firecrawl para Scraping Más Ligero

Si Playwright es muy pesado para tu serverless environment (Vercel), puedes usar **Firecrawl** para scrapear sin headless browser.

### Ventajas de Firecrawl:
- ✅ No requiere Playwright/Puppeteer (sin overhead de 100-200MB)
- ✅ Maneja JavaScript rendering
- ✅ Evita anti-bot detection
- ✅ Response time más rápido (~1-2s vs 3-5s)

### Desventajas:
- ❌ Cuesta dinero (~1 crédito por scrape = $0.001-0.002)
- ❌ Rate limits (dependiendo del plan)

### Costo Estimado con Firecrawl:

**Escenario**: 20 juegos, 3 plataformas, scrape cada 2 minutos (con cache)

```
20 games × 3 platforms = 60 scrapes
60 scrapes every 2 minutes × 30 requests/hour × 24 hours = 21,600 requests/day
21,600 requests/day × 30 days = 648,000 requests/month

CON CACHE (2 minutos):
648,000 / 2 min cache hit rate (~50% cache hits) = ~324,000 scrapes/month
324,000 scrapes × 1 credit = 324,000 credits/month

Firecrawl Hobby tier: 3,000 credits/month = $10/month
Needed: 324,000 credits = ~$1,080/month ❌ (demasiado caro)
```

**Conclusión**: Firecrawl es demasiado caro para este caso de uso. **Mantén Playwright con caching agresivo**.

---

## 🎯 Plan de Implementación (2-3 horas)

### Paso 1: Crear YouTube Live Scraper (30 min)

```bash
# Crear el archivo
touch src/lib/scrapers/youtube-live-scraper.ts

# Copiar el código de arriba
# Test manual:
curl http://localhost:3000/api/streams/live?game=tarkov
```

### Paso 2: Actualizar API Route (15 min)

```bash
# Editar src/app/api/streams/live/route.ts
# Agregar import y llamada a scrapeYouTubeLiveStreams
```

### Paso 3: Agregar Caching (30 min)

```bash
# Crear src/lib/stream-cache.ts
# Implementar cache de 2 minutos
```

### Paso 4: Eliminar Mock Data (15 min)

```bash
# Editar src/app/game/[id]/page.tsx
# Remover getMockLiveStreams, agregar empty state
```

### Paso 5: Testing (30 min)

```bash
# Test local
pnpm dev

# Probar múltiples juegos:
curl http://localhost:3000/api/streams/live?game=tarkov
curl http://localhost:3000/api/streams/live?game=poe2
curl http://localhost:3000/api/streams/live?game=diablo4

# Verificar:
# - Twitch streams tienen viewerCount
# - Kick streams tienen viewerCount
# - YouTube streams tienen viewerCount
# - Todos están ordenados por viewerCount
```

### Paso 6: Deploy a Vercel (15 min)

```bash
# Commit cambios
git add .
git commit -m "feat: add YouTube live streaming with proper caching"
git push

# Vercel auto-deploy
# Verificar en producción
```

---

## 🔍 Debugging: Si No Funciona

### Problema 1: YouTube no devuelve streams

**Causa**: Selectors cambiaron, o YouTube bloqueó el scraping

**Solución**:
```bash
# Test manual con Playwright
pnpm playwright test

# O debug interactivo:
PWDEBUG=1 pnpm dev
```

**Verificar selectors**:
- `ytd-video-renderer` (resultados de búsqueda)
- `.badge-style-type-live-now` (badge LIVE)
- `#video-title` (título)
- `#metadata-line` (metadata con viewer count)

### Problema 2: Playwright timeout en Vercel

**Causa**: Vercel Serverless Functions tienen timeout de 10s (Hobby) o 60s (Pro)

**Solución**:
```typescript
// Reducir timeout en page.goto
await page.goto(url, {
  waitUntil: "domcontentloaded", // No esperar networkidle
  timeout: 15000 // 15s max
});

// Reducir scroll iterations
for (let i = 0; i < 1; i++) { // Solo 1 scroll en lugar de 3
  await page.evaluate(() => window.scrollBy(0, window.innerHeight));
  await new Promise(resolve => setTimeout(resolve, 500));
}
```

### Problema 3: Playwright no funciona en Vercel

**Causa**: Vercel Serverless no soporta bien Playwright (falta de librerías del sistema)

**Soluciones**:

**Opción A**: Usar Vercel Edge Functions (pero no soporta Playwright)

**Opción B**: Separar scraping a un servicio externo
```typescript
// API route se convierte en proxy
export async function GET(request: Request) {
  // Llamar a un servicio externo que corre Playwright
  const response = await fetch('https://your-scraper-service.com/scrape', {
    method: 'POST',
    body: JSON.stringify({ game: gameId })
  });

  return response.json();
}
```

**Opción C**: Usar container deployment (Docker)
```dockerfile
FROM mcr.microsoft.com/playwright:v1.40.0-focal

WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN pnpm install
COPY . .

CMD ["pnpm", "start"]
```

**Opción D**: Usar Railway, Render, o Fly.io (mejor soporte para Playwright que Vercel)

---

## 📊 Comparación Final: Playwright vs Firecrawl

| Feature | Playwright (Actual) | Firecrawl |
|---------|---------------------|-----------|
| **Cost** | $0 (gratis) | ~$300-1000/mes |
| **Setup** | ✅ Ya implementado | Requiere API key |
| **Speed** | 3-5s (sin cache) | 1-2s |
| **Memory** | 100-200MB | 1-5MB |
| **Vercel Support** | ⚠️ Limitado | ✅ Excelente |
| **Maintenance** | Media (selectors cambian) | Baja |
| **Anti-bot** | ✅ Ya implementado | ✅ Built-in |

**Recomendación**:
1. **Corto plazo**: Mantén Playwright con caching agresivo (2-5 min)
2. **Largo plazo**: Si Playwright da problemas en Vercel, considera migrar a Railway/Render o usar un servicio externo de scraping

---

## ✅ Checklist de Implementación

- [ ] Crear `youtube-live-scraper.ts` con scraping de LIVE streams
- [ ] Actualizar `/api/streams/live/route.ts` para incluir YouTube
- [ ] Crear `stream-cache.ts` con caching de 2 minutos
- [ ] Actualizar `game/[id]/page.tsx` para eliminar mock data
- [ ] Test local con múltiples juegos
- [ ] Deploy a Vercel
- [ ] Verificar en producción:
  - [ ] Twitch streams ordenados por viewers
  - [ ] Kick streams ordenados por viewers
  - [ ] YouTube streams ordenados por viewers
  - [ ] Si Shroud está en Diablo IV, aparece primero
  - [ ] Solo streams LIVE (no offline, no VODs)
  - [ ] Cache funciona (segunda request es rápida)

---

## 🎬 Resultado Final

Después de implementar esto, tendrás:

1. ✅ **Twitch streams LIVE** ordenados por viewers
2. ✅ **Kick streams LIVE** ordenados por viewers
3. ✅ **YouTube streams LIVE** ordenados por viewers (NUEVO!)
4. ✅ **Sin mock data** - solo streams reales
5. ✅ **Cualquier streamer** - grande o chico, si está jugando aparece
6. ✅ **Cache de 2 minutos** - respuestas rápidas
7. ✅ **Sin APIs** - todo scraping directo
8. ✅ **$0 de costo** (solo hosting en Vercel)

**Ejemplo**: Si Shroud (50K viewers) y Pestily (20K viewers) están jugando Tarkov:
```json
{
  "twitch": [
    { "username": "shroud", "viewerCount": 50000 },
    { "username": "pestily", "viewerCount": 20000 }
  ],
  "kick": [...],
  "youtube": [...],
  "total": 25
}
```

¡Todo ordenado por viewers automáticamente! 🎉
