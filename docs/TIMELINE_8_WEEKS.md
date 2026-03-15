# NextWipeTime - Timeline Detallado 8 Semanas

**Estrategia:** Híbrido Inteligente (Opción C)
**Fecha inicio:** 2026-02-09
**Fecha fin estimada:** 2026-04-06
**Horas estimadas/semana:** 20-30 horas

---

## 📋 Índice

1. [Resumen Ejecutivo](#resumen-ejecutivo)
2. [Semana 1: Foundations & Analytics](#semana-1-foundations--analytics-)
3. [Semana 2: Research & Planning](#semana-2-research--planning-)
4. [Semana 3-4: Build Buscador Básico](#semana-3-4-build-buscador-básico-)
5. [Semana 5: Launch v1.0 + Measure](#semana-5-launch-v10--measure-)
6. [Semana 6-7: Feature Expansion](#semana-6-7-feature-expansion-)
7. [Semana 8: Polish + Monetización Beta](#semana-8-polish--monetización-beta-)
8. [Decision Points Críticos](#-decision-points-críticos)
9. [Tech Stack por Semana](#-tech-stack-por-semana)
10. [Métricas Resumen](#-métricas-resumen-semana-1-8)

---

## 📊 Resumen Ejecutivo

### Filosofía del Timeline

**"Build → Measure → Learn → Decide"**

Este timeline NO es waterfall. Es iterativo y data-driven:
- Cada 2 semanas hay un **decision point**
- Las features se priorizan basadas en **uso real**, no assumptions
- Si algo no funciona en Semana 5, **pivoteamos** en Semana 6

### Objetivos End of Week 8

| Métrica | Target Mínimo | Target Ideal |
|---------|---------------|--------------|
| **Monthly Active Users** | 2,000 | 5,000+ |
| **Premium Subscribers** | 10 | 50+ |
| **Monthly Recurring Revenue** | $50 | $500+ |
| **Search Usage** | 30% of users | 60%+ |
| **Product-Market Fit Signal** | Clear direction | Strong validation |

---

## **SEMANA 1: Foundations & Analytics** 📊

**Fecha:** Semana del 2026-02-09
**Focus:** Entender comportamiento actual + Quick wins
**Tiempo estimado:** 20-25 horas

---

### 🎯 Objetivos de la Semana

- [ ] Implementar analytics completo para tomar decisiones data-driven
- [ ] Identificar qué hacen los usuarios AHORA (antes de nuevas features)
- [ ] Quick wins en UI actual para mejorar conversión
- [ ] Capturar emails de early adopters interesados

---

### 📅 Timeline Día por Día

#### **Día 1-2: Analytics Setup** (6-8 horas)

**Tasks:**
- [ ] **Instalar PostHog** (recomendado) o Mixpanel
  - Crear cuenta en posthog.com
  - Instalar SDK: `npm install posthog-js`
  - Setup en `_app.tsx`:
    ```typescript
    import posthog from 'posthog-js'

    if (typeof window !== 'undefined') {
      posthog.init('YOUR_API_KEY', {
        api_host: 'https://app.posthog.com'
      })
    }
    ```

- [ ] **Event tracking básico:**
  ```typescript
  // Core events
  posthog.capture('page_view', { page: pathname })
  posthog.capture('game_card_click', { gameId, gameName })
  posthog.capture('filter_applied', { filterType, filterValue })
  posthog.capture('external_link_click', { destination, gameId })
  posthog.capture('wipe_date_viewed', { gameId, daysUntilWipe })
  ```

- [ ] **Session recordings** (PostHog lo incluye)
  - Ver cómo navegan usuarios reales
  - Identificar friction points

- [ ] **Heatmaps** (PostHog Toolbar)
  - Ver dónde hacen click
  - Qué ignoran completamente

**Entregable:** Dashboard de PostHog con eventos fluyendo en tiempo real

---

#### **Día 3-4: Quick Wins en UI Actual** (6-8 horas)

**Tasks:**

- [ ] **Botón "Notify Me" en cada GameCard**
  ```typescript
  // Components: NotifyMeButton.tsx
  - Click → Modal simple
  - Captura: email + gameId
  - Store en localStorage temporalmente (no DB aún)
  - Success message: "We'll email you when [Game] wipe is announced!"
  ```
  **Goal:** Validar interés en notifications antes de construir backend

- [ ] **Mejorar CTAs actuales**
  - "View Details" button más prominente (outline → solid)
  - Links a sitios oficiales más claros ("Visit Official Site" con icon externo)
  - Hover states más obvios

- [ ] **Agregar simple survey**
  ```typescript
  // Trigger: Al 3er pageview (localStorage counter)
  // Modal elegante (no intrusivo):
  "What feature would you like to see next?"
  [ ] Price tracking & alerts
  [ ] Game search/discovery
  [ ] Release calendar
  [ ] Other: ___________
  ```

- [ ] **Social proof básico**
  ```typescript
  // Footer o hero:
  "🔥 Tracking wipes for 20+ games"
  "👥 Join X users staying updated"
  ```

**Entregable:** UI mejorada en producción + emails capturados

---

#### **Día 5-7: SEO Básico** (8-10 horas)

**Tasks:**

- [ ] **Mejorar metadata de cada página**
  ```typescript
  // app/page.tsx
  export const metadata = {
    title: 'NextWipeTime - Track Game Wipes, Seasons & Resets',
    description: 'Never miss a wipe. Track 20+ games including Rust, Tarkov, PoE, Fortnite. Countdown timers, confirmed dates, and live streams.',
    openGraph: {
      images: ['/og-image.png']
    }
  }

  // app/game/[id]/page.tsx
  export async function generateMetadata({ params }) {
    return {
      title: `${game.name} - Next Wipe Date & Countdown`,
      description: `${game.name} next wipe in X days. Track season resets, updates, and live streams.`
    }
  }
  ```

- [ ] **Schema.org markup**
  ```typescript
  // VideoGame schema
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "VideoGame",
    "name": "Rust",
    "genre": "Survival",
    "url": "https://nextwipetime.com/game/rust",
    "gamePlatform": ["PC"]
  }
  </script>

  // Event schema para wipes
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "Event",
    "name": "Rust Wipe - March 2026",
    "startDate": "2026-03-07",
    "eventStatus": "EventScheduled"
  }
  </script>
  ```

- [ ] **Sitemap.xml dinámico**
  ```typescript
  // app/sitemap.ts
  export default function sitemap() {
    const games = getAllGames()
    return [
      { url: 'https://nextwipetime.com', priority: 1 },
      ...games.map(game => ({
        url: `https://nextwipetime.com/game/${game.id}`,
        lastModified: new Date(),
        priority: 0.8
      }))
    ]
  }
  ```

- [ ] **robots.txt**
  ```
  User-agent: *
  Allow: /
  Sitemap: https://nextwipetime.com/sitemap.xml
  ```

- [ ] **Submit a Google Search Console**
  - Verificar propiedad
  - Submit sitemap
  - Request indexing para páginas principales

**Entregable:** SEO foundations listas + submitted a Google

---

### ✅ Métricas de Éxito Semana 1

- [ ] **Analytics funcionando:** Ver pageviews en tiempo real
- [ ] **10+ emails capturados** en "Notify me" buttons
- [ ] **20+ respuestas** en feature survey
- [ ] **Top 5 juegos identificados** (más pageviews)
- [ ] **Google Search Console verificado** + sitemap submitted

---

### 🚀 Output de Semana 1

1. **Dashboard de analytics** con data fluyendo
2. **Lista de insights:**
   - Juegos más populares
   - Páginas con más engagement
   - Drop-off points
3. **Emails de early adopters** capturados
4. **Survey results** con feature requests
5. **SEO foundations** implementadas

---

## **SEMANA 2: Research & Planning** 🔍

**Fecha:** Semana del 2026-02-16
**Focus:** Validar assumptions + Definir spec exacto
**Tiempo estimado:** 20-25 horas

---

### 🎯 Objetivos de la Semana

- [ ] Hablar con 5-10 usuarios reales (CRÍTICO)
- [ ] Validar que el problema existe y vale la pena resolver
- [ ] Definir scope EXACTO del buscador v1.0
- [ ] Tomar decisiones técnicas (APIs, DB, architecture)

---

### 📅 Timeline Día por Día

#### **Día 1-3: User Research** (10-12 horas)

**Tasks:**

- [ ] **Reclutar 5-10 usuarios para entrevistas**
  - Sources:
    - Emails capturados en Semana 1
    - Reddit: r/playrust, r/EscapefromTarkov, r/pathofexile
    - Discord servers de gaming
  - Mensaje:
    ```
    "Hey! Building NextWipeTime. Want a $10 gift card for
    15 min video call about how you find/choose games?
    DM if interested!"
    ```
  - Goal: 5 mínimo, 10 ideal

- [ ] **Entrevistas (15-20 min cada una)**

  **Script de preguntas:**

  1. **Current behavior:**
     - "¿Cómo decides qué juego comprar o jugar HOY?"
     - "Muéstrame tu última búsqueda de juego (screen share)"
     - "¿Qué herramientas usas? (Steam, YouTube, Reddit, etc.)"

  2. **Pain points:**
     - "¿Qué es lo más frustrante de ese proceso?"
     - "¿Cuánto tiempo te toma encontrar un juego que te guste?"
     - "¿Alguna vez has comprado un juego y te arrepentiste? ¿Por qué?"

  3. **Wipes/Seasons:**
     - "¿Juegas live-service games? (Rust, Tarkov, PoE, etc.)"
     - "¿Cómo sabes cuándo es el próximo wipe/season?"
     - "¿Es importante para ti? ¿Por qué?"

  4. **Willingness to pay:**
     - "Si hubiera una herramienta que [describe features], ¿la usarías?"
     - "¿Pagarías por ella? ¿Cuánto?"
     - Show mock-ups: "¿Pagarías $5/mes por esto?"

  5. **Feature prioritization:**
     - "Rank estas features: price alerts, game search, release calendar, wipes tracking"

  **Output:** Notas detalladas de cada entrevista

- [ ] **Consolidar findings** (2-3 horas)

  Crear doc con:
  - **Top 3 pain points más mencionados**
  - **Features que más quieren** (ranked)
  - **Price sensitivity:** ¿Cuántos dijeron que pagarían? ¿Cuánto?
  - **Quotes memorables** (usar en marketing después)
  - **Personas:** Definir 2-3 user personas
    - Example: "Hardcore Dave" - juega Rust 30h/semana, busca juegos en oferta, usa isthereanydeal
    - Example: "Casual Carlos" - juega 5h/semana, compra por impulso, usa Steam recomendations

**Entregable:** Research findings doc (Google Doc o Notion)

---

#### **Día 3-4: Competitive Analysis Práctica** (4-6 horas)

**Tasks:**

- [ ] **Usar competidores por 1 hora cada uno:**

  **isthereanydeal.com:**
  - Buscar un juego específico
  - Configurar price alert
  - Navegar por deals actuales
  - Documentar:
    - ✅ Qué funciona bien
    - ❌ Qué es frustrante (pain points)
    - 💡 Ideas de mejora

  **SteamDB:**
  - Buscar info de precio de un juego
  - Ver historical data
  - Documentar pros/cons

  **Steam search nativo:**
  - Buscar "RPG under $20"
  - Ver qué tan buenos son los filtros
  - Documentar limitaciones

  **Google: "best games under $10"**
  - Ver qué aparece primero
  - ¿Son útiles los resultados?
  - ¿Hay oportunidad de SEO?

- [ ] **Crear competitive matrix:**
  ```
  | Feature            | NextWipeTime | isthereanydeal | SteamDB | Steam |
  |--------------------|--------------|----------------|---------|-------|
  | Wipe tracking      | ✅           | ❌             | ❌      | ❌    |
  | Price tracking     | 🔄 (build)   | ✅             | ✅      | ❌    |
  | Multi-store        | 🔄           | ✅             | ❌      | ❌    |
  | Modern UI          | ✅           | ❌             | ❌      | ⚠️    |
  | Release calendar   | 🔄           | ❌             | ⚠️      | ⚠️    |
  ```

**Entregable:** Competitive analysis doc + matrix

---

#### **Día 4-5: Technical Planning** (6-8 horas)

**Tasks:**

- [ ] **Research APIs y capabilities**

  **Steam Web API:**
  - Docs: https://steamcommunity.com/dev
  - Obtener API key
  - Probar endpoints:
    - `GetAppList` (lista de juegos)
    - `GetAppDetails` (detalles de juego)
  - Identificar límites:
    - Rate limits: 200 requests / 5 min
    - No price API oficial (necesitas scraping o partners)

  **IGDB API (Twitch):**
  - Docs: https://api-docs.igdb.com/
  - Obtener API key (requiere Twitch dev account)
  - Probar endpoints
  - Coverage: Muy completo, incluye precios estimados
  - Límites: 4 requests/sec

  **CheapShark API:**
  - Docs: https://apidocs.cheapshark.com/
  - NO requiere API key (público)
  - Perfecto para price tracking multi-store
  - Limitation: Solo PC games

  **Decision: ¿Qué API usar?**
  ```
  Recomendación:
  - IGDB para game data (metadata, covers, genres)
  - CheapShark para prices (multi-store, gratis)
  - Fallback: Steam scraping si necesario
  ```

- [ ] **Database schema design**

  ```sql
  -- Core tables
  CREATE TABLE games (
    id SERIAL PRIMARY KEY,
    igdb_id INTEGER UNIQUE,
    steam_id INTEGER,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE,
    cover_image_url TEXT,
    release_date DATE,
    genres TEXT[], -- {RPG, FPS, Strategy}
    platforms TEXT[], -- {PC, PlayStation, Xbox}
    created_at TIMESTAMP DEFAULT NOW()
  );

  CREATE TABLE prices (
    id SERIAL PRIMARY KEY,
    game_id INTEGER REFERENCES games(id),
    store VARCHAR(50), -- 'steam', 'epic', 'gog', 'humble'
    current_price DECIMAL(10,2),
    original_price DECIMAL(10,2),
    discount_percent INTEGER,
    url TEXT,
    last_updated TIMESTAMP DEFAULT NOW()
  );

  CREATE TABLE price_history (
    id SERIAL PRIMARY KEY,
    game_id INTEGER REFERENCES games(id),
    store VARCHAR(50),
    price DECIMAL(10,2),
    recorded_at TIMESTAMP DEFAULT NOW()
  );

  -- Para future features
  CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE,
    subscription_tier VARCHAR(20) DEFAULT 'free', -- 'free', 'premium'
    created_at TIMESTAMP DEFAULT NOW()
  );

  CREATE TABLE price_alerts (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    game_id INTEGER REFERENCES games(id),
    target_price DECIMAL(10,2),
    notified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
  );

  -- Indexes para performance
  CREATE INDEX idx_games_slug ON games(slug);
  CREATE INDEX idx_prices_game_id ON prices(game_id);
  CREATE INDEX idx_price_alerts_user_id ON price_alerts(user_id);
  ```

- [ ] **Architecture decisions**

  **Decisión 1: Database**
  ```
  Options:
  A) Vercel Postgres (managed, $20/mes después de free tier)
  B) Supabase (generous free tier, escalable)
  C) MongoDB Atlas (NoSQL, free tier)

  Recomendación: Supabase
  - Free tier generoso (500MB, 50K rows)
  - Postgres (SQL, robusto)
  - Real-time features (útil para future)
  - Row Level Security (útil para multi-tenant)
  ```

  **Decisión 2: Caching**
  ```
  Options:
  A) Redis (Upstash) - $10/mes después de free tier
  B) LRU in-memory (ya lo tienes) - Free pero no persiste
  C) Vercel Edge Cache - Free pero limitado

  Recomendación: Start con LRU, upgrade a Redis si necesitas
  - Cache API responses (IGDB, CheapShark)
  - TTL: 1h para prices, 24h para metadata
  ```

  **Decisión 3: Background Jobs**
  ```
  Options:
  A) Vercel Cron Jobs - Free, simple
  B) Upstash QStash - Más robusto, free tier
  C) BullMQ + Redis - Complejo, overkill para ahora

  Recomendación: Vercel Cron Jobs
  - Suficiente para price updates (1x/6h)
  - Simple de configurar
  ```

**Entregable:**
- API keys obtenidas
- DB schema escrito
- Architecture decisions documentadas

---

#### **Día 6-7: Spec del Buscador v1.0** (6-8 horas)

**Tasks:**

- [ ] **Escribir PRD (Product Requirements Document)**

  Template:
  ```markdown
  # Game Search v1.0 - Product Spec

  ## Problem Statement
  [De user research: ¿Qué problema estamos resolviendo?]

  ## Success Metrics
  - 30% de usuarios usan search en primera visita
  - <500ms response time
  - 10+ searches por usuario activo

  ## MVP Scope (MUST HAVE)

  ### Search Input
  - [ ] Text search box (buscar por nombre de juego)
  - [ ] Autocomplete mientras tipeas (debounced 300ms)
  - [ ] Recent searches (localStorage, max 5)
  - [ ] Clear button

  ### Filters (Sidebar o Top Bar)
  - [ ] Genre (multi-select dropdown)
    - Options: Action, RPG, Strategy, FPS, Adventure, Simulation, etc.
  - [ ] Price Range (slider)
    - Min: $0, Max: $60
    - Steps: $5
  - [ ] Platform (checkboxes)
    - Options: PC, PlayStation, Xbox, Nintendo Switch
  - [ ] "Clear all filters" button

  ### Results Display
  - [ ] Grid layout (reuse GameCard component style)
  - [ ] Each card shows:
    - Cover image
    - Title
    - Current price (with store icon)
    - Genre tags
    - "View on [Store]" button
  - [ ] Empty state: "No games found. Try adjusting filters."
  - [ ] Loading state: Skeleton cards
  - [ ] Pagination or Infinite scroll (decide based on UX)

  ### URL State Management
  - [ ] Deep linking: `/search?q=rpg&genre=role-playing&maxPrice=20`
  - [ ] Shareable URLs
  - [ ] Browser back/forward works correctly

  ### Analytics Events
  - [ ] `search_performed` (query, filters)
  - [ ] `filter_applied` (filterType, value)
  - [ ] `game_clicked_from_search` (gameId, position)
  - [ ] `store_link_clicked` (store, gameId)

  ## Out of Scope (v1.1+)
  - Advanced filters (tags, release date, ratings)
  - Sort options (price, rating, release date)
  - Save searches
  - Recommendations ("Similar games")
  ```

- [ ] **Crear wireframes/mockups**

  Tools: Figma (free), Excalidraw, o papel + foto

  Screens needed:
  1. Search page layout (desktop)
  2. Filter sidebar (open/closed states)
  3. Results grid
  4. Empty state
  5. Mobile responsive version

  No necesita ser perfecto, solo claro para development.

**Entregable:**
- PRD completo (Google Doc)
- Wireframes (Figma link o imágenes)

---

### ✅ Métricas de Éxito Semana 2

- [ ] **5+ user interviews completadas** y transcritas
- [ ] **Research findings doc** con insights claros
- [ ] **API keys obtenidas** (IGDB, Steam, CheapShark)
- [ ] **DB schema escrito** y revisado
- [ ] **Architecture decisions documentadas**
- [ ] **PRD del buscador v1.0** completo y aprobado
- [ ] **Wireframes** listos

---

### 🚀 Output de Semana 2

1. **User research findings doc** con quotes, personas, insights
2. **Competitive analysis** matrix y pain points
3. **Technical architecture doc:**
   - APIs elegidas + keys
   - DB schema SQL
   - Caching strategy
   - Background jobs plan
4. **Product spec (PRD)** del buscador v1.0
5. **Wireframes/mockups** aprobados

---

## **SEMANA 3-4: Build Buscador Básico** 🛠️

**Fecha:** Semana del 2026-02-23 y 2026-03-02
**Focus:** Implementar search funcional end-to-end
**Tiempo estimado:** 40-50 horas (20-25 horas/semana)

---

### 🎯 Objetivos de las 2 Semanas

- [ ] Database setup y poblada con games
- [ ] API endpoints funcionando
- [ ] Frontend de búsqueda completo
- [ ] Deploy a producción
- [ ] Performance optimizado (<500ms)

---

### 📅 **SEMANA 3: Backend + Data**

#### **Día 1-2: Database Setup** (8-10 horas)

**Tasks:**

- [ ] **Setup Supabase project**
  - Crear cuenta en supabase.com
  - New project: "nextwipetime-prod"
  - Copy connection string
  - Add to `.env.local`:
    ```
    DATABASE_URL=postgresql://...
    ```

- [ ] **Create tables**
  - Usar schema de Semana 2
  - Supabase Dashboard → SQL Editor → Paste schema
  - Run migration
  - Verify tables created

- [ ] **Setup Prisma (ORM)**
  ```bash
  npm install prisma @prisma/client
  npx prisma init
  ```

  `prisma/schema.prisma`:
  ```prisma
  datasource db {
    provider = "postgresql"
    url      = env("DATABASE_URL")
  }

  model Game {
    id              Int       @id @default(autoincrement())
    igdbId          Int?      @unique @map("igdb_id")
    steamId         Int?      @map("steam_id")
    title           String    @db.VarChar(255)
    slug            String    @unique @db.VarChar(255)
    coverImageUrl   String?   @map("cover_image_url") @db.Text
    releaseDate     DateTime? @map("release_date") @db.Date
    genres          String[]
    platforms       String[]
    createdAt       DateTime  @default(now()) @map("created_at")

    prices          Price[]
    priceHistory    PriceHistory[]

    @@map("games")
  }

  model Price {
    id              Int       @id @default(autoincrement())
    gameId          Int       @map("game_id")
    store           String    @db.VarChar(50)
    currentPrice    Decimal   @map("current_price") @db.Decimal(10, 2)
    originalPrice   Decimal?  @map("original_price") @db.Decimal(10, 2)
    discountPercent Int?      @map("discount_percent")
    url             String?   @db.Text
    lastUpdated     DateTime  @default(now()) @map("last_updated")

    game            Game      @relation(fields: [gameId], references: [id])

    @@map("prices")
  }
  ```

  ```bash
  npx prisma generate
  npx prisma db push
  ```

- [ ] **Seed inicial con top 100 juegos**

  Script: `scripts/seed-games.ts`
  ```typescript
  import { PrismaClient } from '@prisma/client'
  import { fetchTopGames } from '@/lib/igdb-client'

  const prisma = new PrismaClient()

  async function main() {
    // Fetch top 100 games from IGDB
    const games = await fetchTopGames(100)

    for (const game of games) {
      await prisma.game.upsert({
        where: { igdbId: game.id },
        update: {},
        create: {
          igdbId: game.id,
          title: game.name,
          slug: game.slug,
          coverImageUrl: game.cover?.url,
          releaseDate: game.first_release_date,
          genres: game.genres?.map(g => g.name) || [],
          platforms: game.platforms?.map(p => p.name) || []
        }
      })
    }

    console.log('Seeded', games.length, 'games')
  }

  main()
  ```

  Run: `npx tsx scripts/seed-games.ts`

**Entregable:** DB con 100+ juegos reales

---

#### **Día 3-5: API Implementation** (12-15 horas)

**Tasks:**

- [ ] **Setup API clients**

  `lib/igdb-client.ts`:
  ```typescript
  const IGDB_CLIENT_ID = process.env.IGDB_CLIENT_ID!
  const IGDB_ACCESS_TOKEN = process.env.IGDB_ACCESS_TOKEN!

  export async function fetchGames(query: {
    search?: string
    genres?: string[]
    limit?: number
  }) {
    const response = await fetch('https://api.igdb.com/v4/games', {
      method: 'POST',
      headers: {
        'Client-ID': IGDB_CLIENT_ID,
        'Authorization': `Bearer ${IGDB_ACCESS_TOKEN}`
      },
      body: buildIGDBQuery(query)
    })

    return response.json()
  }
  ```

  `lib/cheapshark-client.ts`:
  ```typescript
  export async function fetchPrices(gameTitle: string) {
    const response = await fetch(
      `https://www.cheapshark.com/api/1.0/games?title=${encodeURIComponent(gameTitle)}`
    )
    return response.json()
  }
  ```

- [ ] **Create search API endpoint**

  `app/api/games/search/route.ts`:
  ```typescript
  import { NextRequest, NextResponse } from 'next/server'
  import { prisma } from '@/lib/prisma'
  import { z } from 'zod'

  const searchSchema = z.object({
    q: z.string().optional(),
    genres: z.string().optional(), // comma-separated
    minPrice: z.coerce.number().optional(),
    maxPrice: z.coerce.number().optional(),
    platforms: z.string().optional(),
    limit: z.coerce.number().default(20),
    offset: z.coerce.number().default(0)
  })

  export async function GET(request: NextRequest) {
    try {
      const { searchParams } = new URL(request.url)
      const params = searchSchema.parse(Object.fromEntries(searchParams))

      // Build where clause
      const where: any = {}

      if (params.q) {
        where.title = {
          contains: params.q,
          mode: 'insensitive'
        }
      }

      if (params.genres) {
        where.genres = {
          hasSome: params.genres.split(',')
        }
      }

      if (params.platforms) {
        where.platforms = {
          hasSome: params.platforms.split(',')
        }
      }

      // Query games
      const games = await prisma.game.findMany({
        where,
        include: {
          prices: {
            orderBy: { currentPrice: 'asc' },
            take: 1 // cheapest price
          }
        },
        take: params.limit,
        skip: params.offset,
        orderBy: { title: 'asc' }
      })

      // Filter by price if specified
      let filteredGames = games
      if (params.minPrice !== undefined || params.maxPrice !== undefined) {
        filteredGames = games.filter(game => {
          const price = game.prices[0]?.currentPrice.toNumber()
          if (!price) return false
          if (params.minPrice && price < params.minPrice) return false
          if (params.maxPrice && price > params.maxPrice) return false
          return true
        })
      }

      return NextResponse.json({
        games: filteredGames,
        total: filteredGames.length
      })

    } catch (error) {
      console.error('Search error:', error)
      return NextResponse.json(
        { error: 'Search failed' },
        { status: 500 }
      )
    }
  }
  ```

- [ ] **Implement caching**

  `lib/cache.ts`:
  ```typescript
  import { LRUCache } from 'lru-cache'

  const cache = new LRUCache<string, any>({
    max: 500,
    ttl: 1000 * 60 * 60 // 1 hour
  })

  export async function cachedFetch<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttl?: number
  ): Promise<T> {
    const cached = cache.get(key)
    if (cached) return cached

    const data = await fetcher()
    cache.set(key, data, { ttl })
    return data
  }
  ```

  Use in API:
  ```typescript
  const games = await cachedFetch(
    `search:${JSON.stringify(params)}`,
    () => prisma.game.findMany(...)
  )
  ```

- [ ] **Handle rate limits**

  `lib/rate-limiter.ts`:
  ```typescript
  import { Ratelimit } from '@upstash/ratelimit'
  import { Redis } from '@upstash/redis'

  const ratelimit = new Ratelimit({
    redis: Redis.fromEnv(),
    limiter: Ratelimit.slidingWindow(10, '10 s')
  })

  export async function checkRateLimit(identifier: string) {
    const { success } = await ratelimit.limit(identifier)
    return success
  }
  ```

**Entregable:** API `/api/games/search` funcionando

---

#### **Día 6-7: Testing & Optimization** (6-8 horas)

**Tasks:**

- [ ] **Unit tests**
  ```typescript
  // __tests__/api/search.test.ts
  describe('GET /api/games/search', () => {
    it('returns games matching query', async () => {
      const response = await fetch('/api/games/search?q=zelda')
      const data = await response.json()
      expect(data.games).toBeDefined()
      expect(data.games.length).toBeGreaterThan(0)
    })

    it('filters by genre', async () => {
      const response = await fetch('/api/games/search?genres=RPG')
      const data = await response.json()
      expect(data.games.every(g => g.genres.includes('RPG'))).toBe(true)
    })
  })
  ```

- [ ] **Load testing**
  ```bash
  npm install -g autocannon
  autocannon -c 10 -d 10 http://localhost:3000/api/games/search?q=zelda
  ```

  Target:
  - p99 latency < 500ms
  - No errors under load

- [ ] **Database indexes**
  ```sql
  CREATE INDEX idx_games_title_gin ON games USING gin(to_tsvector('english', title));
  CREATE INDEX idx_games_genres_gin ON games USING gin(genres);
  ```

- [ ] **Error monitoring setup**
  ```bash
  npm install @sentry/nextjs
  ```

  `sentry.client.config.ts`:
  ```typescript
  import * as Sentry from "@sentry/nextjs"

  Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
    tracesSampleRate: 0.1
  })
  ```

**Entregable:** API tested, optimized, monitored

---

### 📅 **SEMANA 4: Frontend**

#### **Día 1-3: Search UI** (12-15 horas)

**Tasks:**

- [ ] **Search bar component**

  `components/search-bar.tsx`:
  ```typescript
  'use client'

  import { useState, useCallback } from 'react'
  import { useDebounce } from '@/hooks/use-debounce'
  import { Search, X } from 'lucide-react'

  export function SearchBar({ onSearch }: { onSearch: (q: string) => void }) {
    const [query, setQuery] = useState('')
    const debouncedQuery = useDebounce(query, 300)

    useEffect(() => {
      if (debouncedQuery) {
        onSearch(debouncedQuery)
      }
    }, [debouncedQuery, onSearch])

    return (
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search games..."
          className="w-full pl-12 pr-12 py-4 bg-[#1a1a1a] border border-white/10 rounded-xl text-white placeholder:text-gray-500 focus:border-white/20 focus:outline-none"
        />
        {query && (
          <button
            onClick={() => setQuery('')}
            className="absolute right-4 top-1/2 -translate-y-1/2"
          >
            <X className="w-5 h-5 text-gray-400 hover:text-white" />
          </button>
        )}
      </div>
    )
  }
  ```

- [ ] **Filter sidebar**

  `components/search-filters.tsx`:
  ```typescript
  'use client'

  import { useState } from 'react'

  export type Filters = {
    genres: string[]
    minPrice: number
    maxPrice: number
    platforms: string[]
  }

  export function SearchFilters({
    filters,
    onChange
  }: {
    filters: Filters
    onChange: (filters: Filters) => void
  }) {
    const genres = ['Action', 'RPG', 'Strategy', 'FPS', 'Adventure', 'Simulation']
    const platforms = ['PC', 'PlayStation', 'Xbox', 'Nintendo Switch']

    return (
      <div className="space-y-6">
        {/* Genre Filter */}
        <div>
          <h3 className="text-sm font-bold text-white mb-3">Genre</h3>
          <div className="space-y-2">
            {genres.map(genre => (
              <label key={genre} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.genres.includes(genre)}
                  onChange={(e) => {
                    const newGenres = e.target.checked
                      ? [...filters.genres, genre]
                      : filters.genres.filter(g => g !== genre)
                    onChange({ ...filters, genres: newGenres })
                  }}
                  className="rounded border-white/20"
                />
                <span className="text-sm text-gray-300">{genre}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Price Range */}
        <div>
          <h3 className="text-sm font-bold text-white mb-3">Price Range</h3>
          <div className="space-y-3">
            <input
              type="range"
              min={0}
              max={60}
              step={5}
              value={filters.maxPrice}
              onChange={(e) => onChange({ ...filters, maxPrice: Number(e.target.value) })}
              className="w-full"
            />
            <div className="flex justify-between text-sm text-gray-400">
              <span>${filters.minPrice}</span>
              <span>${filters.maxPrice}</span>
            </div>
          </div>
        </div>

        {/* Platform Filter */}
        <div>
          <h3 className="text-sm font-bold text-white mb-3">Platform</h3>
          <div className="space-y-2">
            {platforms.map(platform => (
              <label key={platform} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.platforms.includes(platform)}
                  onChange={(e) => {
                    const newPlatforms = e.target.checked
                      ? [...filters.platforms, platform]
                      : filters.platforms.filter(p => p !== platform)
                    onChange({ ...filters, platforms: newPlatforms })
                  }}
                  className="rounded border-white/20"
                />
                <span className="text-sm text-gray-300">{platform}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Clear Filters */}
        <button
          onClick={() => onChange({ genres: [], minPrice: 0, maxPrice: 60, platforms: [] })}
          className="w-full py-2 text-sm text-gray-400 hover:text-white transition"
        >
          Clear all filters
        </button>
      </div>
    )
  }
  ```

- [ ] **Results grid**

  `components/search-results.tsx`:
  ```typescript
  'use client'

  import { GameCard } from './game-card'
  import { Game } from '@/types/game'

  export function SearchResults({
    games,
    loading
  }: {
    games: Game[]
    loading: boolean
  }) {
    if (loading) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="h-[400px] rounded-2xl bg-[#1a1a1a] border border-white/[0.06] animate-pulse"
            />
          ))}
        </div>
      )
    }

    if (games.length === 0) {
      return (
        <div className="text-center py-20">
          <p className="text-2xl text-gray-400 mb-2">No games found</p>
          <p className="text-sm text-gray-500">Try adjusting your filters</p>
        </div>
      )
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {games.map((game, index) => (
          <GameCard
            key={game.id}
            game={game}
            onClick={() => {
              // Analytics
              posthog.capture('game_clicked_from_search', {
                gameId: game.id,
                gameName: game.title,
                position: index
              })
            }}
          />
        ))}
      </div>
    )
  }
  ```

**Entregable:** Search UI funcionando en localhost

---

#### **Día 4-5: Integration & Polish** (10-12 horas)

**Tasks:**

- [ ] **Create search page**

  `app/search/page.tsx`:
  ```typescript
  'use client'

  import { useState, useEffect } from 'react'
  import { useSearchParams, useRouter } from 'next/navigation'
  import { SearchBar } from '@/components/search-bar'
  import { SearchFilters } from '@/components/search-filters'
  import { SearchResults } from '@/components/search-results'
  import { useQuery } from '@tanstack/react-query'

  export default function SearchPage() {
    const router = useRouter()
    const searchParams = useSearchParams()

    const [query, setQuery] = useState(searchParams.get('q') || '')
    const [filters, setFilters] = useState<Filters>({
      genres: searchParams.get('genres')?.split(',') || [],
      minPrice: Number(searchParams.get('minPrice')) || 0,
      maxPrice: Number(searchParams.get('maxPrice')) || 60,
      platforms: searchParams.get('platforms')?.split(',') || []
    })

    // Fetch games
    const { data, isLoading } = useQuery({
      queryKey: ['search', query, filters],
      queryFn: async () => {
        const params = new URLSearchParams({
          q: query,
          genres: filters.genres.join(','),
          minPrice: String(filters.minPrice),
          maxPrice: String(filters.maxPrice),
          platforms: filters.platforms.join(',')
        })
        const res = await fetch(`/api/games/search?${params}`)
        return res.json()
      },
      enabled: query.length > 0 || filters.genres.length > 0
    })

    // Sync URL with state
    useEffect(() => {
      const params = new URLSearchParams()
      if (query) params.set('q', query)
      if (filters.genres.length) params.set('genres', filters.genres.join(','))
      if (filters.minPrice) params.set('minPrice', String(filters.minPrice))
      if (filters.maxPrice) params.set('maxPrice', String(filters.maxPrice))
      if (filters.platforms.length) params.set('platforms', filters.platforms.join(','))

      router.replace(`/search?${params}`, { scroll: false })
    }, [query, filters, router])

    return (
      <div className="min-h-screen bg-[#0a0a0a] pt-24 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-10">
            <h1 className="text-4xl font-black text-white mb-4">
              Find Your Next Game
            </h1>
            <SearchBar onSearch={setQuery} />
          </div>

          {/* Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-8">
            {/* Filters Sidebar */}
            <aside className="lg:sticky lg:top-24 lg:h-fit">
              <SearchFilters filters={filters} onChange={setFilters} />
            </aside>

            {/* Results */}
            <main>
              <SearchResults
                games={data?.games || []}
                loading={isLoading}
              />
            </main>
          </div>
        </div>
      </div>
    )
  }
  ```

- [ ] **Add search to homepage**

  `app/page.tsx`:
  ```typescript
  // In hero section, add prominent search bar
  <div className="max-w-2xl mx-auto mb-16">
    <SearchBar onSearch={(q) => router.push(`/search?q=${q}`)} />
  </div>
  ```

- [ ] **Analytics integration**
  ```typescript
  // Track key events
  posthog.capture('search_performed', { query, filters })
  posthog.capture('filter_applied', { filterType, value })
  posthog.capture('game_clicked_from_search', { gameId, position })
  ```

**Entregable:** Search page integrada y funcionando

---

#### **Día 6-7: QA & Deploy** (6-8 horas)

**Tasks:**

- [ ] **Manual QA checklist**
  - [ ] Search por texto funciona
  - [ ] Autocomplete funciona (debounced)
  - [ ] Cada filtro funciona individualmente
  - [ ] Múltiples filtros combinados funcionan
  - [ ] Clear filters funciona
  - [ ] URL params funcionan (deep linking)
  - [ ] Browser back/forward funciona
  - [ ] Loading states se ven bien
  - [ ] Empty state se ve bien
  - [ ] Error state se ve bien (desconectar internet)
  - [ ] Mobile responsive (320px, 768px, 1024px)

- [ ] **Performance audit**
  - [ ] Lighthouse score > 90
  - [ ] Search response < 500ms
  - [ ] No console errors
  - [ ] Images optimized (Next.js Image)

- [ ] **Deploy to production**
  ```bash
  git add .
  git commit -m "feat: game search v1.0"
  git push origin main
  ```

  Vercel auto-deploys

- [ ] **Post-deploy checks**
  - [ ] Production URL funciona
  - [ ] API endpoints responden
  - [ ] Analytics tracking funciona
  - [ ] Sentry no muestra errores

- [ ] **Announce internally**
  - Post in Discord/Slack: "🚀 Search is live! Check it out at [URL]"

**Entregable:** Search v1.0 en producción

---

### ✅ Métricas de Éxito Semana 3-4

- [ ] **Search funcional** en producción
- [ ] **<500ms response time** (p99)
- [ ] **100+ juegos** indexados en DB
- [ ] **0 critical bugs**
- [ ] **Mobile responsive**
- [ ] **Analytics tracking** funcionando
- [ ] **Lighthouse score > 90**

---

### 🚀 Output de Semana 3-4

1. **Database** con 100+ juegos y precios
2. **API endpoint** `/api/games/search` funcionando
3. **Search page** (`/search`) completa
4. **Homepage** con search bar integrado
5. **Analytics** tracking search behavior
6. **Deployed** a producción

---

## **SEMANA 5: Launch v1.0 + Measure** 🚀

**Fecha:** Semana del 2026-03-09
**Focus:** Lanzamiento público + recolectar data real
**Tiempo estimado:** 25-30 horas

---

### 🎯 Objetivos de la Semana

- [ ] Lanzar públicamente con marketing push
- [ ] Conseguir primeros 1,000 usuarios
- [ ] Medir uso REAL del search
- [ ] Recolectar feedback cualitativo
- [ ] **CRITICAL:** Tomar decisión data-driven para Semana 6-7

---

### 📅 Timeline Día por Día

#### **Día 1: Pre-Launch Prep** (6-8 horas)

**Tasks:**

- [ ] **Update landing page**

  Changes to `app/page.tsx`:
  ```typescript
  // Hero section
  <h1>Track Wipes & Find Your Next Game</h1>
  <p>
    Track 20+ live-service games + search thousands of games
    by price, genre, and platform. All in one place.
  </p>

  // Add screenshots/GIF of search
  <div className="my-12">
    <img src="/search-demo.gif" alt="Search demo" />
  </div>
  ```

- [ ] **Write launch blog post**

  Create: `app/blog/introducing-game-search/page.tsx`

  Content outline:
  ```markdown
  # Introducing Game Search

  ## The Problem
  [Personal story about struggling to find games]

  ## The Solution
  [Demo of search with screenshots]

  ## How It Works
  - Search by name, genre, price
  - Real-time prices from multiple stores
  - Combined with wipe tracking you already love

  ## What's Next
  [Tease price alerts, release calendar]

  ## Try It Now
  [CTA button to /search]
  ```

- [ ] **Create social media assets**

  - [ ] Twitter/X thread (5-7 tweets)
    ```
    🎮 Launching NextWipeTime v1.0!

    We started tracking wipes for Rust/Tarkov/PoE.

    Now we're adding: Game Search 🔍

    Find games by genre, price, platform - all in one place.

    Thread 🧵👇
    ```

  - [ ] Reddit posts (personalize per subreddit)
    - r/GameDeals: "Made a tool to search games by price"
    - r/patientgamers: "Search games under $20 by genre"
    - r/ShouldIbuythisgame: "Built a search tool to help decide"

  - [ ] Screenshots for Product Hunt (if launching there)
    - Homepage
    - Search in action
    - Filter options
    - Results view

- [ ] **Prepare email for early users**

  Subject: "NextWipeTime v1.0 is here 🚀"

  Body:
  ```
  Hey!

  You signed up for early access to NextWipeTime.

  Today we're launching v1.0 with a brand new feature: Game Search

  → Find games by price, genre, and platform
  → Combined with wipe tracking you already use
  → More features coming soon (price alerts, release calendar)

  [Try it now →]

  P.S. Reply with feedback - I read every email!
  ```

**Entregable:** Landing page updated, content ready to post

---

#### **Día 2: Launch Day** (10-12 horas)

**Tasks:**

- [ ] **08:00 AM: ProductHunt launch** (optional)
  - Post product with maker account
  - Respond to every comment within 5 min
  - Ask friends/network for upvotes (not in bulk, individually)

- [ ] **09:00 AM: Twitter/X thread**
  - Post thread
  - Tag relevant accounts (@Steam, gaming influencers)
  - Engage with every reply

- [ ] **10:00 AM: Reddit posts**
  - r/GameDeals (if allowed by rules)
  - r/patientgamers
  - r/ShouldIbuythisgame
  - **CRITICAL:** Add value, don't spam. Each post should be tailored to the subreddit

- [ ] **11:00 AM: Discord servers**
  - Gaming communities you're part of
  - Ask for feedback, not just promotion
  - "Hey, built this tool for finding games. Would love your thoughts"

- [ ] **12:00 PM: Email early users**
  - Send email prepared yesterday
  - Track open/click rates

- [ ] **Throughout day: Engage**
  - Respond to EVERY comment/message
  - Fix bugs immediately if found
  - Thank people publicly for trying it

- [ ] **Evening: Analysis**
  - How many signups?
  - How many searches performed?
  - Any patterns in queries?
  - Top feedback themes?

**Entregable:** Launch executed, initial users acquired

---

#### **Día 3-4: Early Feedback Loop** (8-10 horas)

**Tasks:**

- [ ] **Monitor analytics obsessively**

  PostHog dashboards to watch:
  - [ ] Page views (home, search)
  - [ ] Search funnel:
    - Landed on site
    - → Clicked search bar
    - → Performed search
    - → Clicked game
    - → Clicked store link
  - [ ] Retention: Do they come back?

- [ ] **Respond to all feedback**
  - Twitter DMs
  - Reddit comments
  - Email replies
  - Discord messages

  **Template response:**
  ```
  Thanks for trying it! 🙏

  [Address their specific feedback]

  Quick question: What would make you use this daily?
  ```

- [ ] **Hot-fixes for critical bugs**
  - If search breaks: FIX IMMEDIATELY
  - If API slow: Optimize NOW
  - If mobile broken: URGENT

- [ ] **Collect feature requests**

  Create: `docs/FEATURE_REQUESTS.md`
  ```markdown
  # Feature Requests from Launch

  ## Price Alerts (12 mentions)
  - "Notify me when game drops below $X"
  - "Track price history"

  ## Release Calendar (7 mentions)
  - "Show upcoming releases"
  - "Remind me of launch dates"

  ## Better Filters (5 mentions)
  - "Sort by rating"
  - "Filter by co-op/multiplayer"
  ```

- [ ] **Personal outreach to power users**

  If you see someone using it a lot:
  ```
  Hey! Noticed you've been using NextWipeTime a lot.

  Mind if I ask: What are you using it for?
  What's working? What's not?

  [Your email]
  ```

**Entregable:** Bugs fixed, feedback documented

---

#### **Día 5-7: Analysis & Decision** (6-8 horas)

**Tasks:**

- [ ] **Deep dive on metrics**

  Create: `docs/WEEK_5_ANALYSIS.md`

  Template:
  ```markdown
  # Week 5 Launch Analysis

  ## Traffic
  - Total visitors: X
  - Unique users: X
  - Returning users: X
  - Sources:
    - Reddit: X%
    - Twitter: X%
    - Direct: X%
    - ProductHunt: X%

  ## Feature Usage
  - % who used wipe tracker: X%
  - % who used search: X%
  - Avg searches per user: X

  ## Search Behavior
  - Top searches:
    1. [query]
    2. [query]
  - Most used filters:
    1. Genre: X uses
    2. Price: X uses
  - Conversion to external click: X%

  ## Feedback Themes
  1. [Theme] (X mentions)
  2. [Theme] (X mentions)

  ## Bugs Found
  - [Bug] (severity: high/med/low)

  ## Feature Requests (Top 5)
  1. Price alerts (X mentions)
  2. Release calendar (X mentions)
  3. [...]
  ```

- [ ] **User cohort analysis**

  Segment users:
  - **Power users:** 10+ searches
  - **Engaged:** 3-10 searches
  - **Browsers:** 1-2 searches
  - **Bounced:** 0 searches

  Questions:
  - What % of each cohort?
  - What do power users have in common?
  - Why did browsers not search?

- [ ] **Calculate key metrics**
  ```
  Search Adoption Rate = (Users who searched / Total users) × 100

  Target: 30%+
  ```

  ```
  Search to Click Rate = (Store clicks / Searches) × 100

  Target: 10%+
  ```

- [ ] **DECISION TIME**

  Based on data:

  **Scenario A: Search Usage > 30%**
  ✅ **SUCCESS! Continue with price tracking (Semana 6-7)**

  **Scenario B: Search Usage 10-30%**
  📊 **MIXED. Options:**
  - Iterate on search (better UX, more games, better filters)
  - OR build price alerts (most requested feature)
  - Decision: Talk to 5 users, see what's blocking adoption

  **Scenario C: Search Usage < 10%**
  ⚠️ **PROBLEM. Options:**
  - Pivot to different feature (price alerts? release calendar?)
  - Deeper investigation: Why isn't search being used?
  - User interviews urgently needed

- [ ] **Document decision**

  Add to `docs/WEEK_5_ANALYSIS.md`:
  ```markdown
  ## Decision for Week 6-7

  Based on [metrics], we will:
  [Build price tracking / Iterate on search / Pivot to X]

  Reasoning:
  [Why this makes sense given the data]

  Success criteria for Week 6-7:
  - [Metric 1]
  - [Metric 2]
  ```

**Entregable:** Data analysis complete, decision made

---

### ✅ Métricas de Éxito Semana 5

- [ ] **1,000+ unique visitors**
- [ ] **100+ searches** realizadas
- [ ] **30%+ search adoption** rate (ideal) OR clear understanding why not
- [ ] **50+ pieces of feedback** recolectados
- [ ] **Clear go/no-go decision** for Week 6-7
- [ ] **10+ power users** identified

---

### 🚀 Output de Semana 5

1. **1,000+ usuarios** han usado el producto
2. **Analytics dashboard** con data real
3. **Feature requests** documentados y priorizados
4. **Decision doc** para próximos pasos
5. **Power users** identified para future interviews

---

## **SEMANA 6-7: Feature Expansion** ⚡

**Fecha:** Semana del 2026-03-16 y 2026-03-23
**Focus:** Build feature más demandada (probablemente price alerts)
**Tiempo estimado:** 40-50 horas

---

### 🎯 Objetivos de las 2 Semanas

**NOTA:** El contenido exacto depende de la decisión de Semana 5.

Asumiendo **Escenario A** (search exitoso → build price tracking):

- [ ] Auth system implementado
- [ ] Price tracking backend funcionando
- [ ] User dashboard con alertas
- [ ] Email notifications funcionando
- [ ] Foundation para monetization (Stripe setup)

---

### 📅 **SEMANA 6: Backend + Auth**

#### **Día 1-2: Auth System** (8-10 horas)

**Tasks:**

- [ ] **Install NextAuth**
  ```bash
  npm install next-auth @auth/prisma-adapter
  ```

- [ ] **Configure NextAuth**

  `app/api/auth/[...nextauth]/route.ts`:
  ```typescript
  import NextAuth from "next-auth"
  import GoogleProvider from "next-auth/providers/google"
  import DiscordProvider from "next-auth/providers/discord"
  import { PrismaAdapter } from "@auth/prisma-adapter"
  import { prisma } from "@/lib/prisma"

  export const authOptions = {
    adapter: PrismaAdapter(prisma),
    providers: [
      GoogleProvider({
        clientId: process.env.GOOGLE_CLIENT_ID!,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET!
      }),
      DiscordProvider({
        clientId: process.env.DISCORD_CLIENT_ID!,
        clientSecret: process.env.DISCORD_CLIENT_SECRET!
      })
    ],
    callbacks: {
      session({ session, user }) {
        session.user.id = user.id
        session.user.subscriptionTier = user.subscriptionTier
        return session
      }
    }
  }

  const handler = NextAuth(authOptions)
  export { handler as GET, handler as POST }
  ```

- [ ] **Update Prisma schema**
  ```prisma
  model User {
    id                String    @id @default(cuid())
    email             String    @unique
    name              String?
    image             String?
    emailVerified     DateTime?
    subscriptionTier  String    @default("free") // 'free', 'premium'
    createdAt         DateTime  @default(now())

    accounts          Account[]
    sessions          Session[]
    priceAlerts       PriceAlert[]

    @@map("users")
  }

  model Account {
    id                String  @id @default(cuid())
    userId            String
    type              String
    provider          String
    providerAccountId String
    refresh_token     String? @db.Text
    access_token      String? @db.Text
    expires_at        Int?
    token_type        String?
    scope             String?
    id_token          String? @db.Text
    session_state     String?

    user User @relation(fields: [userId], references: [id], onDelete: Cascade)

    @@unique([provider, providerAccountId])
    @@map("accounts")
  }

  model Session {
    id           String   @id @default(cuid())
    sessionToken String   @unique
    userId       String
    expires      DateTime
    user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)

    @@map("sessions")
  }
  ```

  ```bash
  npx prisma generate
  npx prisma db push
  ```

- [ ] **Create login UI**

  `components/auth-button.tsx`:
  ```typescript
  'use client'

  import { signIn, signOut, useSession } from 'next-auth/react'

  export function AuthButton() {
    const { data: session } = useSession()

    if (session) {
      return (
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-400">{session.user?.email}</span>
          <button
            onClick={() => signOut()}
            className="px-4 py-2 text-sm text-white bg-white/10 hover:bg-white/15 rounded-lg"
          >
            Sign Out
          </button>
        </div>
      )
    }

    return (
      <button
        onClick={() => signIn()}
        className="px-6 py-2 text-sm font-bold text-white bg-white/10 hover:bg-white/15 rounded-lg"
      >
        Sign In
      </button>
    )
  }
  ```

**Entregable:** Auth funcionando (Google + Discord)

---

#### **Día 3-5: Price Alerts Backend** (12-15 horas)

**Tasks:**

- [ ] **Update Prisma schema**
  ```prisma
  model PriceAlert {
    id          String   @id @default(cuid())
    userId      String
    gameId      Int
    targetPrice Decimal  @db.Decimal(10, 2)
    notified    Boolean  @default(false)
    createdAt   DateTime @default(now())

    user User @relation(fields: [userId], references: [id], onDelete: Cascade)
    game Game @relation(fields: [gameId], references: [id])

    @@map("price_alerts")
  }
  ```

- [ ] **Create API endpoints**

  `app/api/alerts/route.ts`:
  ```typescript
  import { NextRequest, NextResponse } from 'next/server'
  import { getServerSession } from 'next-auth'
  import { authOptions } from '../auth/[...nextauth]/route'
  import { prisma } from '@/lib/prisma'
  import { z } from 'zod'

  const createAlertSchema = z.object({
    gameId: z.number(),
    targetPrice: z.number().positive()
  })

  // GET /api/alerts - List user's alerts
  export async function GET(request: NextRequest) {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const alerts = await prisma.priceAlert.findMany({
      where: { userId: session.user.id },
      include: {
        game: {
          include: {
            prices: {
              orderBy: { currentPrice: 'asc' },
              take: 1
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ alerts })
  }

  // POST /api/alerts - Create alert
  export async function POST(request: NextRequest) {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { gameId, targetPrice } = createAlertSchema.parse(body)

    // Check limits for free users
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { priceAlerts: true }
    })

    if (user?.subscriptionTier === 'free' && user.priceAlerts.length >= 3) {
      return NextResponse.json(
        { error: 'Free users can only have 3 alerts. Upgrade to Premium for unlimited.' },
        { status: 403 }
      )
    }

    const alert = await prisma.priceAlert.create({
      data: {
        userId: session.user.id,
        gameId,
        targetPrice
      }
    })

    return NextResponse.json({ alert })
  }

  // DELETE /api/alerts/[id] - Delete alert
  ```

- [ ] **Background job para check prices**

  `app/api/cron/check-prices/route.ts`:
  ```typescript
  import { NextResponse } from 'next/server'
  import { prisma } from '@/lib/prisma'
  import { sendPriceAlert } from '@/lib/email'

  export async function GET(request: Request) {
    // Verify cron secret (Vercel sets this)
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get all active alerts
    const alerts = await prisma.priceAlert.findMany({
      where: { notified: false },
      include: {
        user: true,
        game: {
          include: {
            prices: {
              orderBy: { currentPrice: 'asc' },
              take: 1
            }
          }
        }
      }
    })

    let notified = 0

    for (const alert of alerts) {
      const currentPrice = alert.game.prices[0]?.currentPrice.toNumber()

      if (currentPrice && currentPrice <= alert.targetPrice.toNumber()) {
        // Send notification
        await sendPriceAlert({
          email: alert.user.email!,
          gameName: alert.game.title,
          targetPrice: alert.targetPrice.toNumber(),
          currentPrice,
          storeUrl: alert.game.prices[0]?.url
        })

        // Mark as notified
        await prisma.priceAlert.update({
          where: { id: alert.id },
          data: { notified: true }
        })

        notified++
      }
    }

    return NextResponse.json({ notified })
  }
  ```

- [ ] **Setup Vercel Cron**

  `vercel.json`:
  ```json
  {
    "crons": [
      {
        "path": "/api/cron/check-prices",
        "schedule": "0 */6 * * *"
      }
    ]
  }
  ```

**Entregable:** API de price alerts funcionando

---

#### **Día 6-7: Email Notifications** (6-8 horas)

**Tasks:**

- [ ] **Setup SendGrid or Resend**
  ```bash
  npm install resend
  ```

- [ ] **Email templates**

  `lib/email.ts`:
  ```typescript
  import { Resend } from 'resend'

  const resend = new Resend(process.env.RESEND_API_KEY)

  export async function sendPriceAlert({
    email,
    gameName,
    targetPrice,
    currentPrice,
    storeUrl
  }: {
    email: string
    gameName: string
    targetPrice: number
    currentPrice: number
    storeUrl?: string
  }) {
    await resend.emails.send({
      from: 'alerts@nextwipetime.com',
      to: email,
      subject: `🎮 ${gameName} is now $${currentPrice}!`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h1>Price Drop Alert!</h1>
          <p><strong>${gameName}</strong> has dropped to <strong>$${currentPrice}</strong></p>
          <p>You set an alert for $${targetPrice}.</p>
          ${storeUrl ? `<a href="${storeUrl}" style="display: inline-block; padding: 12px 24px; background: #000; color: #fff; text-decoration: none; border-radius: 8px; margin-top: 16px;">Buy Now</a>` : ''}
          <p style="margin-top: 32px; color: #666; font-size: 12px;">
            You're receiving this because you set a price alert on NextWipeTime.
          </p>
        </div>
      `
    })
  }
  ```

- [ ] **Test email locally**
  ```bash
  curl -X POST http://localhost:3000/api/test-email \
    -H "Content-Type: application/json" \
    -d '{"email":"your@email.com"}'
  ```

**Entregable:** Email notifications funcionando

---

### 📅 **SEMANA 7: Frontend + Dashboard**

#### **Día 1-3: User Dashboard** (12-15 horas)

**Tasks:**

- [ ] **Create dashboard page**

  `app/dashboard/page.tsx`:
  ```typescript
  'use client'

  import { useSession } from 'next-auth/react'
  import { useQuery } from '@tanstack/react-query'
  import { redirect } from 'next/navigation'

  export default function DashboardPage() {
    const { data: session, status } = useSession()

    if (status === 'loading') return <div>Loading...</div>
    if (!session) redirect('/api/auth/signin')

    const { data: alerts } = useQuery({
      queryKey: ['alerts'],
      queryFn: async () => {
        const res = await fetch('/api/alerts')
        return res.json()
      }
    })

    return (
      <div className="min-h-screen bg-[#0a0a0a] pt-24 px-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-black text-white mb-8">
            Your Dashboard
          </h1>

          {/* Price Alerts */}
          <section className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Price Alerts</h2>
              {session.user.subscriptionTier === 'free' && (
                <span className="text-sm text-gray-400">
                  {alerts?.alerts?.length || 0} / 3 alerts
                </span>
              )}
            </div>

            {alerts?.alerts?.length === 0 ? (
              <div className="text-center py-12 bg-[#1a1a1a] rounded-2xl border border-white/10">
                <p className="text-gray-400 mb-4">No price alerts yet</p>
                <a href="/search" className="text-white underline">
                  Search games to add alerts
                </a>
              </div>
            ) : (
              <div className="space-y-4">
                {alerts?.alerts?.map((alert: any) => (
                  <AlertCard key={alert.id} alert={alert} />
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    )
  }

  function AlertCard({ alert }: { alert: any }) {
    const currentPrice = alert.game.prices[0]?.currentPrice
    const targetPrice = alert.targetPrice
    const priceMet = currentPrice <= targetPrice

    return (
      <div className="bg-[#1a1a1a] rounded-2xl border border-white/10 p-6 flex items-center gap-6">
        <img
          src={alert.game.coverImageUrl}
          alt={alert.game.title}
          className="w-20 h-28 object-cover rounded-lg"
        />
        <div className="flex-1">
          <h3 className="text-lg font-bold text-white mb-2">
            {alert.game.title}
          </h3>
          <div className="flex items-center gap-4 text-sm">
            <span className="text-gray-400">
              Target: ${targetPrice.toFixed(2)}
            </span>
            <span className={priceMet ? 'text-green-500' : 'text-gray-400'}>
              Current: ${currentPrice?.toFixed(2)}
            </span>
          </div>
        </div>
        <button
          onClick={async () => {
            await fetch(`/api/alerts/${alert.id}`, { method: 'DELETE' })
            // Refetch
          }}
          className="text-sm text-gray-400 hover:text-white"
        >
          Remove
        </button>
      </div>
    )
  }
  ```

**Entregable:** Dashboard funcionando

---

#### **Día 4-5: "Track Price" Button** (8-10 horas)

**Tasks:**

- [ ] **Add button to GameCard**

  `components/game-card.tsx`:
  ```typescript
  'use client'

  import { useState } from 'react'
  import { useSession } from 'next-auth/react'
  import { Bell } from 'lucide-react'
  import { TrackPriceModal } from './track-price-modal'

  export function GameCard({ game }: { game: Game }) {
    const { data: session } = useSession()
    const [showModal, setShowModal] = useState(false)

    return (
      <>
        <div className="game-card">
          {/* Existing content */}

          <button
            onClick={() => {
              if (!session) {
                signIn()
              } else {
                setShowModal(true)
              }
            }}
            className="w-full py-2 flex items-center justify-center gap-2 bg-white/10 hover:bg-white/15 rounded-lg text-white text-sm font-medium"
          >
            <Bell className="w-4 h-4" />
            Track Price
          </button>
        </div>

        {showModal && (
          <TrackPriceModal
            game={game}
            onClose={() => setShowModal(false)}
          />
        )}
      </>
    )
  }
  ```

- [ ] **Create modal component**

  `components/track-price-modal.tsx`:
  ```typescript
  'use client'

  import { useState } from 'react'
  import { useMutation } from '@tanstack/react-query'
  import { X } from 'lucide-react'

  export function TrackPriceModal({
    game,
    onClose
  }: {
    game: Game
    onClose: () => void
  }) {
    const [targetPrice, setTargetPrice] = useState('')

    const createAlert = useMutation({
      mutationFn: async () => {
        const res = await fetch('/api/alerts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            gameId: game.id,
            targetPrice: parseFloat(targetPrice)
          })
        })
        if (!res.ok) {
          const error = await res.json()
          throw new Error(error.error)
        }
        return res.json()
      },
      onSuccess: () => {
        onClose()
        // Show success toast
      }
    })

    return (
      <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
        <div className="bg-[#1a1a1a] rounded-2xl p-8 max-w-md w-full relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4"
          >
            <X className="w-6 h-6 text-gray-400 hover:text-white" />
          </button>

          <h2 className="text-2xl font-bold text-white mb-4">
            Track Price for {game.title}
          </h2>

          <p className="text-gray-400 mb-6">
            Current price: ${game.prices[0]?.currentPrice || 'N/A'}
          </p>

          <label className="block mb-2 text-sm text-gray-400">
            Notify me when price drops below:
          </label>
          <input
            type="number"
            step="0.01"
            value={targetPrice}
            onChange={(e) => setTargetPrice(e.target.value)}
            placeholder="e.g. 19.99"
            className="w-full px-4 py-3 bg-black border border-white/10 rounded-lg text-white"
          />

          {createAlert.error && (
            <p className="mt-4 text-red-500 text-sm">
              {createAlert.error.message}
            </p>
          )}

          <button
            onClick={() => createAlert.mutate()}
            disabled={!targetPrice || createAlert.isPending}
            className="w-full mt-6 py-3 bg-white text-black font-bold rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {createAlert.isPending ? 'Creating...' : 'Create Alert'}
          </button>
        </div>
      </div>
    )
  }
  ```

**Entregable:** Track price button funcionando

---

#### **Día 6-7: Polish & Test** (6-8 horas)

**Tasks:**

- [ ] **QA checklist**
  - [ ] Sign in/out funciona
  - [ ] Dashboard carga correctamente
  - [ ] Crear alert funciona
  - [ ] Alert limit enforcement (3 for free users)
  - [ ] Delete alert funciona
  - [ ] Email notifications llegan
  - [ ] Mobile responsive

- [ ] **Deploy to production**
  ```bash
  git commit -m "feat: price alerts v1.0"
  git push
  ```

- [ ] **Announce to users**
  - Email: "New feature: Price Alerts!"
  - Twitter/Reddit posts
  - Banner on homepage

**Entregable:** Price alerts en producción

---

### ✅ Métricas de Éxito Semana 6-7

- [ ] **Auth system** funcionando (Google + Discord)
- [ ] **50+ price alerts** creados
- [ ] **500+ usuarios registrados**
- [ ] **Email notifications** enviadas sin errores
- [ ] **Dashboard** funcionando en mobile + desktop

---

### 🚀 Output de Semana 6-7

1. **Auth system** con Google + Discord
2. **Price alerts** funcionando end-to-end
3. **User dashboard** con gestión de alerts
4. **Email notifications** automáticas
5. **Foundation** para monetización (user roles en DB)

---

## **SEMANA 8: Polish + Monetización Beta** 💰

**Fecha:** Semana del 2026-03-30
**Focus:** Activar premium tier + primeros pagos
**Tiempo estimado:** 25-30 horas

---

### 🎯 Objetivos de la Semana

- [ ] Stripe integration funcionando
- [ ] Premium tier activo (beta)
- [ ] Primeros 10+ paying customers
- [ ] Growth optimizations (SEO, email capture)
- [ ] Polish basado en 7 semanas de learning

---

### 📅 Timeline Día por Día

#### **Día 1-2: Stripe Integration** (10-12 horas)

**Tasks:**

- [ ] **Setup Stripe**
  ```bash
  npm install stripe @stripe/stripe-js
  ```

  - Create Stripe account
  - Get API keys (test + production)
  - Add to `.env`:
    ```
    STRIPE_SECRET_KEY=sk_test_...
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
    STRIPE_WEBHOOK_SECRET=whsec_...
    ```

- [ ] **Create product & prices in Stripe Dashboard**
  - Product: "NextWipeTime Premium"
  - Price 1: $4.99/month (recurring)
  - Price 2: $49/year (recurring, 2 months free)

- [ ] **Checkout API**

  `app/api/checkout/route.ts`:
  ```typescript
  import { NextRequest, NextResponse } from 'next/server'
  import { getServerSession } from 'next-auth'
  import Stripe from 'stripe'

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2023-10-16'
  })

  export async function POST(request: NextRequest) {
    const session = await getServerSession()
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { priceId } = await request.json()

    const checkoutSession = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer_email: session.user.email,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${process.env.NEXT_PUBLIC_URL}/premium/success`,
      cancel_url: `${process.env.NEXT_PUBLIC_URL}/premium`,
      metadata: {
        userId: session.user.id
      }
    })

    return NextResponse.json({ url: checkoutSession.url })
  }
  ```

- [ ] **Webhook handler**

  `app/api/webhooks/stripe/route.ts`:
  ```typescript
  import { NextRequest, NextResponse } from 'next/server'
  import Stripe from 'stripe'
  import { prisma } from '@/lib/prisma'

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

  export async function POST(request: NextRequest) {
    const body = await request.text()
    const sig = request.headers.get('stripe-signature')!

    let event: Stripe.Event

    try {
      event = stripe.webhooks.constructEvent(body, sig, webhookSecret)
    } catch (err) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object as Stripe.Checkout.Session

        // Update user to premium
        await prisma.user.update({
          where: { id: session.metadata!.userId },
          data: { subscriptionTier: 'premium' }
        })
        break

      case 'customer.subscription.deleted':
        // Downgrade user to free
        const subscription = event.data.object as Stripe.Subscription
        // Find user by customer ID and downgrade
        break
    }

    return NextResponse.json({ received: true })
  }
  ```

**Entregable:** Stripe checkout funcionando

---

#### **Día 3-4: Premium Page** (8-10 horas)

**Tasks:**

- [ ] **Create premium page**

  `app/premium/page.tsx`:
  ```typescript
  'use client'

  import { useSession } from 'next-auth/react'
  import { Check } from 'lucide-react'

  export default function PremiumPage() {
    const { data: session } = useSession()

    const features = [
      'Unlimited price alerts',
      'Email + Discord notifications',
      'Price history charts',
      'Advanced search filters',
      'Ad-free experience',
      'Early access to new features',
      'Priority support'
    ]

    async function handleCheckout(priceId: string) {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId })
      })
      const data = await res.json()
      window.location.href = data.url
    }

    return (
      <div className="min-h-screen bg-[#0a0a0a] pt-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-black text-white mb-6">
            Go Premium
          </h1>
          <p className="text-xl text-gray-400 mb-12">
            Unlock unlimited alerts and advanced features
          </p>

          {/* Pricing Cards */}
          <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
            {/* Monthly */}
            <div className="bg-[#1a1a1a] rounded-2xl p-8 border border-white/10">
              <h2 className="text-2xl font-bold text-white mb-2">Monthly</h2>
              <div className="text-4xl font-black text-white mb-6">
                $4.99<span className="text-lg text-gray-400">/mo</span>
              </div>
              <button
                onClick={() => handleCheckout('price_...')}
                className="w-full py-3 bg-white text-black font-bold rounded-lg hover:bg-gray-200"
              >
                Subscribe Monthly
              </button>
            </div>

            {/* Yearly */}
            <div className="bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] rounded-2xl p-8 border-2 border-white/20 relative">
              <div className="absolute top-0 right-0 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg rounded-tr-2xl">
                SAVE 17%
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Yearly</h2>
              <div className="text-4xl font-black text-white mb-6">
                $49<span className="text-lg text-gray-400">/yr</span>
              </div>
              <button
                onClick={() => handleCheckout('price_...')}
                className="w-full py-3 bg-white text-black font-bold rounded-lg hover:bg-gray-200"
              >
                Subscribe Yearly
              </button>
            </div>
          </div>

          {/* Features List */}
          <div className="mt-16 max-w-xl mx-auto">
            <h3 className="text-xl font-bold text-white mb-6">
              Premium includes:
            </h3>
            <div className="space-y-3">
              {features.map(feature => (
                <div key={feature} className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span className="text-gray-300">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }
  ```

**Entregable:** Premium page live

---

#### **Día 5: Growth Optimizations** (6-8 horas)

**Tasks:**

- [ ] **SEO improvements**

  - [ ] Game pages programáticas:
    ```typescript
    // app/game/[slug]/page.tsx
    export async function generateStaticParams() {
      const games = await prisma.game.findMany({ take: 100 })
      return games.map(g => ({ slug: g.slug }))
    }

    export async function generateMetadata({ params }) {
      const game = await prisma.game.findUnique({
        where: { slug: params.slug }
      })
      return {
        title: `${game.title} - Price, Wipes & Info`,
        description: `Track ${game.title} wipes and price drops. ${game.genres.join(', ')} game. Current price from $X.`
      }
    }
    ```

  - [ ] Blog posts programáticos:
    ```
    /blog/best-rpg-games-under-20
    /blog/upcoming-releases-march-2026
    /blog/when-is-next-rust-wipe
    ```

- [ ] **Email capture optimized**

  - [ ] Exit intent popup (elegante):
    ```typescript
    // components/exit-intent.tsx
    'use client'

    import { useState, useEffect } from 'react'

    export function ExitIntent() {
      const [show, setShow] = useState(false)

      useEffect(() => {
        const handleMouseLeave = (e: MouseEvent) => {
          if (e.clientY < 10 && !localStorage.getItem('exit-intent-shown')) {
            setShow(true)
            localStorage.setItem('exit-intent-shown', 'true')
          }
        }

        document.addEventListener('mouseleave', handleMouseLeave)
        return () => document.removeEventListener('mouseleave', handleMouseLeave)
      }, [])

      if (!show) return null

      return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-[#1a1a1a] rounded-2xl p-8 max-w-md">
            <h2 className="text-2xl font-bold text-white mb-4">
              Don't miss a deal!
            </h2>
            <p className="text-gray-400 mb-6">
              Get weekly emails with best gaming deals
            </p>
            <input
              type="email"
              placeholder="your@email.com"
              className="w-full px-4 py-3 bg-black border border-white/10 rounded-lg text-white mb-4"
            />
            <button className="w-full py-3 bg-white text-black font-bold rounded-lg">
              Subscribe
            </button>
            <button
              onClick={() => setShow(false)}
              className="w-full mt-2 text-sm text-gray-400 hover:text-white"
            >
              No thanks
            </button>
          </div>
        </div>
      )
    }
    ```

- [ ] **Social proof**
  ```typescript
  // components/live-activity.tsx
  "use client"

  export function LiveActivity() {
    return (
      <div className="fixed bottom-4 left-4 bg-[#1a1a1a] border border-white/10 rounded-lg px-4 py-3 text-sm text-gray-300">
        🔥 <strong>342 users</strong> tracking wipes right now
      </div>
    )
  }
  ```

**Entregable:** Growth features implementadas

---

#### **Día 6-7: Launch Premium + Analysis** (6-8 horas)

**Tasks:**

- [ ] **Announce premium**

  - [ ] Email a registered users:
    ```
    Subject: Introducing Premium 🚀

    Hey!

    Big news: NextWipeTime Premium is here.

    What you get:
    ✅ Unlimited price alerts
    ✅ No ads
    ✅ Advanced features

    Early bird special: First 100 users get 50% off FOREVER

    [Upgrade to Premium →]

    Still free to use! Premium is optional.
    ```

  - [ ] Twitter/Reddit announcement
  - [ ] Banner on homepage:
    ```typescript
    <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white text-center py-3">
      🎉 Premium is live! First 100 users get 50% off forever
      <a href="/premium" className="underline ml-2">Learn more →</a>
    </div>
    ```

- [ ] **Personal outreach to power users**

  Send DMs to top 10 users:
  ```
  Hey! Noticed you've been using NextWipeTime a lot 🙏

  We just launched Premium with unlimited alerts.

  Want to try it free for a month? My way of saying thanks.

  Let me know!
  ```

- [ ] **Track conversions obsessively**

  Dashboard to monitor:
  - Visits to /premium
  - Checkout starts
  - Successful subscriptions
  - Revenue (MRR)

- [ ] **Calculate metrics**
  ```
  Conversion Rate = (Premium subs / Total users) × 100
  Target: 1-2%

  MRR = Premium subs × $4.99
  Target: $50+
  ```

**Entregable:** Premium launched, primeros pagos recibidos

---

### ✅ Métricas de Éxito Semana 8

- [ ] **10+ premium subscribers**
- [ ] **$50+ MRR**
- [ ] **<1% churn rate** (nadie cancela en primera semana)
- [ ] **5,000+ total users**
- [ ] **Stripe integration** funcionando sin errors
- [ ] **Clear understanding** of unit economics

---

### 🚀 Output de Semana 8

1. **Revenue-generating product** 💰
2. **Premium tier** validated (or learnings on why not)
3. **Stripe integration** funcionando
4. **Growth optimizations** implemented (SEO, email)
5. **Clear roadmap** para próximos 3 meses

---

## 🚨 **Decision Points Críticos**

### **Week 5 Decision: ¿Search funciona?**

Basado en metrics de Semana 5:

#### **Escenario A: Search Usage > 30%**
✅ **CONTINUAR con price tracking (Semana 6-7)**

**Reasoning:** Los usuarios valoran el search, ahora dale más razones para quedarse (alerts).

---

#### **Escenario B: Search Usage 10-30%**
⚠️ **MIXED SIGNALS**

**Options:**
1. **Iterate on search:**
   - Mejorar UX (más obvio)
   - Agregar más juegos (>1000)
   - Mejores filtros (sort by rating, tags)

2. **Build price alerts anyway:**
   - Fue la feature más pedida en research
   - Puede aumentar engagement incluso si search es medio

**Decision process:**
- Hablar con 5 power users
- Preguntar: "¿Qué te impide usar search más?"
- Decidir basado en feedback

---

#### **Escenario C: Search Usage < 10%**
🔴 **PROBLEMA SERIO**

**Options:**
1. **Pivot to different feature:**
   - Price alerts (si fue muy pedido en research)
   - Release calendar (más visual, menos friction)

2. **Deeper investigation:**
   - User interviews urgentes (10+ personas)
   - Session recordings (ver qué hacen)
   - Identificar friction points

**NO continuar construyendo sobre search si no se usa.**

---

### **Week 8 Decision: ¿Monetización funciona?**

Basado en metrics de Semana 8:

#### **Escenario A: >10 subs + strong engagement**
🚀 **ESCALAR**

**Next steps (Semana 9+):**
- Marketing agresivo (ads, content, partnerships)
- Build más features premium
- Focus en retention
- Considerar fundraising o bootstrapping fuerte

---

#### **Escenario B: 0-5 subs pero high engagement**
💡 **ADJUST PRICING/POSITIONING**

**Options:**
- Precio muy alto? Test $2.99
- Value prop no claro? Mejorar messaging
- Features no suficientes? Build más antes de cobrar

**Don't panic.** Engagement es más importante que revenue temprano.

---

#### **Escenario C: Low engagement overall**
🤔 **FUNDAMENTAL RETHINK**

**Questions:**
- ¿Estamos resolviendo un problema real?
- ¿El target audience está aquí?
- ¿Hay PMF (product-market fit)?

**Actions:**
- 20+ user interviews
- Competitive analysis profunda
- Considerar pivot mayor

---

## 🛠️ **Tech Stack por Semana**

| Semana | Agregar | Costo/mes |
|--------|---------|-----------|
| 1 | PostHog (analytics) | $0 (free tier) |
| 1 | SendGrid (emails) | $0 (free tier) |
| 3 | Supabase (Postgres) | $0 (free tier) |
| 3 | Upstash Redis (cache) | $0 (optional) |
| 6 | NextAuth (auth) | $0 |
| 8 | Stripe (payments) | 2.9% + $0.30/transaction |
| 8 | Sentry (errors) | $0 (free tier) |

**Total cost Semana 1-8: $0-20/mes**

(Todo en free tiers excepto Stripe fees cuando hay ventas)

---

## 📊 **Métricas Resumen (Semana 1-8)**

| Semana | Focus | Key Metric | Target |
|--------|-------|------------|--------|
| 1 | Analytics + Quick Wins | Analytics setup | ✅ Live |
| 2 | Research + Planning | User interviews | 5+ done |
| 3-4 | Build Search | Search launched | ✅ Live |
| 5 | Launch v1.0 | Users | 1,000 MAU |
| 5 | **DECISION POINT** | Search adoption | >30% |
| 6-7 | Feature #2 | Feature adoption | 50+ users |
| 8 | Monetization | Premium subs | 10+ subs |
| 8 | **DECISION POINT** | MRR + engagement | $50+ MRR |

---

## ✅ **Entregables por Semana**

| Semana | Entregable Principal | Formato |
|--------|---------------------|---------|
| 1 | Analytics dashboard | PostHog setup |
| 2 | Research findings + Spec | Google Docs |
| 3-4 | Working search | Live on prod |
| 5 | Launch metrics + decision | Analysis doc |
| 6-7 | Price alerts (or pivot) | Live on prod |
| 8 | Premium tier + first revenue | Live + Stripe |

---

## 🎯 **Horas Estimadas por Semana**

| Semana | Horas | Breakdown |
|--------|-------|-----------|
| 1 | 20-25h | Analytics (8h) + UI (8h) + SEO (8h) |
| 2 | 20-25h | Research (12h) + Planning (12h) |
| 3 | 20-25h | Backend (20h) + Testing (5h) |
| 4 | 20-25h | Frontend (20h) + QA (5h) |
| 5 | 25-30h | Launch (12h) + Feedback (8h) + Analysis (8h) |
| 6 | 20-25h | Auth (10h) + Backend (15h) |
| 7 | 20-25h | Frontend (15h) + Polish (10h) |
| 8 | 25-30h | Stripe (12h) + Premium (8h) + Launch (8h) |

**Total: ~175-200 horas en 8 semanas**

**Average: 22-25 horas/semana**

---

## 📝 **Notas Finales**

### **Filosofía:**

1. **Build → Measure → Learn → Decide**
   - No construir features sin validar primero
   - Data > assumptions
   - User feedback > internal opinions

2. **Speed over perfection**
   - MVP de cada feature, no over-engineer
   - Iterar rápido basado en uso real

3. **Focus on core value**
   - Wipes tracking (único)
   - + Game discovery (amplio appeal)
   - + Price tracking (monetizable)

4. **Monetización desde el inicio**
   - No esperar a "tener suficientes usuarios"
   - Validar willingness to pay temprano
   - Premium es OPCIONAL, free tier siempre fuerte

---

## ❓ **Preguntas para Próxima Conversación**

1. **Tiempo disponible:** ¿Puedes dedicar 20-30h/semana?
   - Si no, ajustaremos timeline (12 semanas en lugar de 8)

2. **Skills gaps:** ¿Hay áreas donde necesitas ayuda?
   - Backend/DB
   - Frontend/UI
   - DevOps/Deploy
   - Marketing/Growth

3. **Budget:** ¿Presupuesto para tools/marketing?
   - $0: Solo free tiers
   - $100-500: Paid tools + ads
   - $1000+: Agresivo en marketing

4. **Risk tolerance:** ¿Qué tan cómodo con pivotar?
   - Si search no funciona en Semana 5, ¿pivotas rápido o insistes?

---

**Última actualización:** 2026-02-09
**Próxima revisión:** Fin de Semana 1 (analytics + insights)
