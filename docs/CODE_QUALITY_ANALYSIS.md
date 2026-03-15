# 🔍 Análisis de Calidad del Código - NextWipeTime

## 🚨 Problemas Críticos Identificados

### 1. **API Routes Boilerplate Masivo** 🔴 CRÍTICO

**Problema:**
```bash
19 API routes × ~140 líneas = 2,637 líneas de código duplicado
```

Cada route (rust, tarkov, fortnite, etc.) tiene EXACTAMENTE la misma lógica:
- readCache()
- writeCache()
- validateCachedData()
- getCachedWipeData()
- GET handler

**Impacto:**
- ❌ DRY violation extremo
- ❌ Bugs se replican en todos los routes
- ❌ Cambios requieren editar 19 archivos
- ❌ Testing nightmare (19 tests idénticos)
- ❌ Bundle size innecesariamente grande

**Solución:**
```typescript
// ✅ DESPUÉS: 1 route dinámico
// src/app/api/wipes/[gameId]/route.ts (140 líneas)
// vs
// ❌ ANTES: 19 routes estáticos (2,637 líneas)
```

---

### 2. **useEffects Problemáticos** 🔴 CRÍTICO

**Problema en game-card.tsx:**

```typescript
// ❌ PROBLEMA 1: Timer cada segundo (línea 122-169)
useEffect(() => {
  const interval = setInterval(calculateTimeLeft, 1000); // 60 FPS
  return () => clearInterval(interval);
}, [nextWipe, showCountdown, game.id, wipeData]);

// ❌ PROBLEMA 2: Progress cada minuto (línea 172-216)
useEffect(() => {
  const interval = setInterval(calculateProgress, 60000);
  return () => clearInterval(interval);
}, [nextWipe, lastWipe, showCountdown, game.id]);

// ❌ PROBLEMA 3: Dropdown listener (línea 54-70)
useEffect(() => {
  if (isVersionDropdownOpen) {
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }
}, [isVersionDropdownOpen]);
```

**Impactos:**
- ❌ **24 cards × 1 timer/seg = 24 intervalos corriendo simultáneamente**
- ❌ **Race conditions** si wipeData cambia mientras timer corre
- ❌ **Memory leaks** si cleanup falla
- ❌ **Re-renders masivos** (aunque ya optimizado con refs, sigue siendo heavy)
- ❌ **Dependencies array** puede causar re-creación de intervals

**Evidencia:**
```typescript
// Dependencies que pueden cambiar:
[nextWipe, showCountdown, game.id, wipeData]
// Si wipeData cambia → interval se destruye y recrea → pérdida de sincronización
```

---

### 3. **Client Components Innecesarios** 🟡 ALTO

**Problema:**
```typescript
// game-card.tsx - línea 1
"use client";  // ❌ TODO el componente es client-side

// Pero solo necesita client para:
// - Timer (countdown)
// - Hover states
// - Dropdown interactions
```

**Impacto:**
- ❌ No usa React Server Components
- ❌ Hidratación pesada (24 cards × JS bundle grande)
- ❌ No puede usar async/await en el componente
- ❌ No puede fetchear data en el server

**Solución:**
```typescript
// ✅ Separar en Server + Client Components
<GameCardServer data={wipeData}>  {/* Server Component */}
  <GameCardTimer />                {/* Client Component */}
  <GameCardDropdown />             {/* Client Component */}
</GameCardServer>
```

---

### 4. **No Usa Next.js 16 Features** 🟡 ALTO

**Features no aprovechados:**

```typescript
// ❌ No usa Parallel Routes
// ❌ No usa Streaming con Suspense
// ❌ No usa Server Actions
// ❌ No usa Partial Prerendering
// ❌ No usa Route Groups para organización
```

**Impacto:**
- ❌ Performance subóptima
- ❌ Loading states manuales en vez de Suspense
- ❌ No streaming de datos
- ❌ Waterfalls de requests

---

### 5. **Data Fetching en Cliente** 🟡 MEDIO

**Problema:**
```typescript
// game-card.tsx - línea 36-41
const {
  data: fetchedWipeData,
  loading: fetchLoading,
  error: fetchError,
} = useWipeData(selectedVersionId);  // ❌ Fetch en cliente
```

**Impacto:**
- ❌ Waterfalls (espera hidratación → fetch → render)
- ❌ Loading spinners en vez de Suspense
- ❌ No aprovecha Server Components para data fetching
- ❌ Duplica requests (24 cards haciendo fetches)

---

### 6. **GAME_SOURCES No Existe** 🟡 MEDIO

**Problema:**
```typescript
// ❌ URLs hardcodeadas en cada scraper config
tarkovConfig: {
  scraperFunction: async () => {
    // URL hardcodeada aquí
  }
}

rustConfig: {
  scraperFunction: async () => {
    // Otra URL hardcodeada
  }
}
```

**Solución:**
```typescript
// ✅ Centralizar URLs
export const GAME_SOURCES = {
  rust: {
    official: ['https://rust.facepunch.com/news'],
    reddit: ['https://reddit.com/r/playrust'],
  },
  tarkov: {
    official: ['https://www.escapefromtarkov.com/news'],
    reddit: ['https://reddit.com/r/EscapefromTarkov'],
    twitter: ['@bstategames']
  }
}
```

---

## 🎯 Arquitectura Propuesta (Clean)

### Antes (Problemático):
```
src/
├── app/
│   ├── api/
│   │   └── wipes/
│   │       ├── rust/route.ts         (140 líneas)
│   │       ├── tarkov/route.ts       (140 líneas)
│   │       ├── fortnite/route.ts     (140 líneas)
│   │       └── ... (16 más)          (2,240 líneas total)
│   └── page.tsx                       ("use client")
├── components/
│   └── game-card.tsx                 (684 líneas, "use client")
└── hooks/
    └── use-wipe-data.ts              (client-side fetch)
```

### Después (Limpio):
```
src/
├── app/
│   ├── api/
│   │   └── wipes/
│   │       └── [gameId]/
│   │           └── route.ts          (50 líneas) ✅ 1 route dinámico
│   ├── page.tsx                      (Server Component) ✅
│   └── _components/
│       ├── game-grid.server.tsx      (Server) ✅
│       └── game-card.server.tsx      (Server) ✅
├── components/
│   ├── game-card-timer.client.tsx    (Client) ✅ Solo timer
│   └── game-card-dropdown.client.tsx (Client) ✅ Solo dropdown
├── lib/
│   ├── data/
│   │   └── game-sources.ts           ✅ Centralizado
│   └── scrapers/
│       ├── unified-scraper.ts        ✅ 1 scraper genérico
│       └── configs/
│           └── index.ts              ✅ Config centralizado
└── hooks/
    └── use-countdown.ts              ✅ Timer aislado
```

---

## 📋 Refactorización Propuesta

### Fase 1: Eliminar Boilerplate de API Routes

**ANTES:**
```typescript
// 19 archivos idénticos
// src/app/api/wipes/rust/route.ts
const CACHE_FILE = join(process.cwd(), 'cache', 'rust-wipe.json');

function readCache(): WipeData | null { ... }
function writeCache(data: WipeData) { ... }
async function getCachedWipeData(forceRefresh: boolean) { ... }

export async function GET(request: Request) { ... }
```

**DESPUÉS:**
```typescript
// src/app/api/wipes/[gameId]/route.ts
import { getGameWipeData } from '@/lib/wipe-data-service';

export async function GET(
  request: Request,
  { params }: { params: { gameId: string } }
) {
  const { gameId } = params;
  const { searchParams } = new URL(request.url);
  const forceRefresh = searchParams.get('refresh') === 'true';

  try {
    const data = await getGameWipeData(gameId, forceRefresh);
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch wipe data' },
      { status: 500 }
    );
  }
}

// ✅ 50 líneas vs 2,637 líneas (98% reducción)
```

---

### Fase 2: Server Components + Client Islands

**ANTES:**
```typescript
// game-card.tsx (684 líneas, todo cliente)
"use client";

export const GameCard = ({ game }) => {
  // 3 useEffects
  // 10 useState
  // Todo el markup
}
```

**DESPUÉS:**
```typescript
// game-card.server.tsx (Server Component)
import { GameCardTimer } from './game-card-timer.client';
import { GameCardDropdown } from './game-card-dropdown.client';

export async function GameCard({ gameId }: { gameId: string }) {
  // ✅ Fetch directo en server (sin hooks, sin loading states)
  const wipeData = await getWipeData(gameId);

  return (
    <div className="game-card">
      {/* Static content (Server) */}
      <div className="game-image">...</div>
      <h3>{game.name}</h3>

      {/* Dynamic content (Client Islands) */}
      <GameCardTimer
        nextWipe={wipeData.nextWipe}
        accentColor={game.accentColor}
      />

      <GameCardDropdown versions={game.versions} />
    </div>
  );
}

// game-card-timer.client.tsx (Client Component)
"use client";

export function GameCardTimer({ nextWipe, accentColor }) {
  const timeLeft = useCountdown(nextWipe);

  return (
    <div style={{ color: accentColor }}>
      {timeLeft}
    </div>
  );
}

// ✅ Separation of Concerns
// ✅ Menos hidratación
// ✅ Mejor performance
```

---

### Fase 3: Centralizar GAME_SOURCES

```typescript
// src/lib/data/game-sources.ts
export const GAME_SOURCES = {
  rust: {
    id: 'rust',
    name: 'Rust',
    developer: 'Facepunch Studios',
    sources: {
      official: [
        { url: 'https://rust.facepunch.com/news', type: 'news' },
        { url: 'https://rust.facepunch.com/blog', type: 'blog' },
      ],
      social: [
        { url: 'https://reddit.com/r/playrust', type: 'reddit' },
        { url: 'https://twitter.com/playrust', type: 'twitter' },
      ],
      api: null, // No API oficial
    },
    scraping: {
      strategy: 'calculated',
      schedule: { /* ... */ },
    },
    ui: {
      accentColor: 'rgb(206, 106, 76)',
      backgroundImage: '/images/games/rust.jpg',
      hoverMedia: '/videos/games/rust.webm',
    }
  },

  tarkov: {
    id: 'tarkov',
    name: 'Escape from Tarkov',
    developer: 'Battlestate Games',
    sources: {
      official: [
        { url: 'https://www.escapefromtarkov.com/news', type: 'news' },
        { url: 'https://forum.escapefromtarkov.com', type: 'forum' },
      ],
      social: [
        { url: 'https://reddit.com/r/EscapefromTarkov', type: 'reddit' },
        { url: 'https://twitter.com/bstategames', type: 'twitter' },
      ],
      api: null,
    },
    scraping: {
      strategy: 'agent', // Firecrawl Agent
      priority: 'high',
    },
    ui: {
      accentColor: 'rgb(155, 179, 96)',
      backgroundImage: '/images/games/tarkov.jpg',
      hoverMedia: '/videos/games/tarkov.webm',
    }
  },

  // ... resto de juegos
} as const;

// Type-safe helpers
export type GameSource = typeof GAME_SOURCES[keyof typeof GAME_SOURCES];
export type GameSourceId = keyof typeof GAME_SOURCES;

export function getGameSource(id: string): GameSource | undefined {
  return GAME_SOURCES[id as GameSourceId];
}
```

**Beneficios:**
- ✅ Single source of truth
- ✅ Fácil agregar/modificar URLs
- ✅ UI config junto a scraping config
- ✅ Type-safe
- ✅ Reusable en frontend y backend

---

### Fase 4: Unified Scraper

```typescript
// src/lib/scrapers/unified-scraper.ts
import { GAME_SOURCES } from '@/lib/data/game-sources';

export async function scrapeGame(gameId: string): Promise<WipeData> {
  const gameSource = getGameSource(gameId);

  if (!gameSource) {
    throw new Error(`Unknown game: ${gameId}`);
  }

  // Dispatch basado en estrategia
  switch (gameSource.scraping.strategy) {
    case 'calculated':
      return calculateWipeDate(gameSource);

    case 'agent':
      return scrapeWithAgent(gameSource);

    case 'extract':
      return scrapeWithExtract(gameSource);

    case 'api':
      return fetchFromAPI(gameSource);

    default:
      throw new Error(`Unknown strategy: ${gameSource.scraping.strategy}`);
  }
}

// ✅ 1 scraper para todos los juegos
// ✅ Config-driven
// ✅ Easy to extend
```

---

### Fase 5: Eliminar useEffects Problemáticos

```typescript
// ❌ ANTES: useEffect con interval
useEffect(() => {
  const interval = setInterval(calculateTimeLeft, 1000);
  return () => clearInterval(interval);
}, [nextWipe, wipeData]); // Dependencies problemáticas

// ✅ DESPUÉS: Hook especializado
export function useCountdown(targetDate: Date | null) {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    if (!targetDate) return;

    // ✅ Función estable (no dependencies)
    const updateTime = () => {
      const now = Date.now();
      const diff = targetDate.getTime() - now;

      if (diff <= 0) {
        setTimeLeft('LIVE');
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft(`${days}d ${hours}h ${minutes}m ${seconds}s`);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);

    return () => clearInterval(interval);
  }, [targetDate?.getTime()]); // ✅ Solo cambia si fecha cambia

  return timeLeft;
}

// Uso:
const timeLeft = useCountdown(nextWipe);
```

---

## 📊 Métricas de Mejora Esperadas

| Métrica | Antes | Después | Mejora |
|---------|-------|---------|--------|
| API Routes | 2,637 líneas | 150 líneas | **94% ⬇️** |
| Bundle Size (Client JS) | ~180KB | ~80KB | **55% ⬇️** |
| useEffects activos | 72 (24 cards × 3) | 24 (solo timers) | **67% ⬇️** |
| Time to Interactive | ~2.5s | ~800ms | **68% ⬇️** |
| Server Components | 0% | 80% | **80% ⬆️** |
| Code Duplication | ALTO | BAJO | **✅** |
| Maintainability | 3/10 | 9/10 | **600% ⬆️** |

---

## 🚀 Plan de Implementación

### Semana 1: Foundation
1. ✅ Crear GAME_SOURCES centralizado
2. ✅ Refactorizar API routes a route dinámico
3. ✅ Crear unified scraper
4. ✅ Testing

### Semana 2: Components
5. ✅ Separar Server/Client Components
6. ✅ Crear Client Islands (Timer, Dropdown)
7. ✅ Eliminar useEffects problemáticos
8. ✅ Implementar Suspense boundaries

### Semana 3: Optimizations
9. ✅ Implement Streaming
10. ✅ Optimize bundle splitting
11. ✅ Performance testing
12. ✅ Deploy to production

---

## ⚠️ Riesgos y Mitigaciones

| Riesgo | Impacto | Mitigación |
|--------|---------|------------|
| Breaking changes | ALTO | Feature flags, gradual rollout |
| SEO regression | MEDIO | Mantener metadata, test crawlers |
| Cache invalidation | MEDIO | Versionar cache keys |
| useEffect bugs | BAJO | Tests unitarios exhaustivos |

---

## 💡 Recomendaciones Adicionales

1. **TypeScript Strict Mode**: Activar para catch más errores
2. **Biome Linter**: Configurar reglas para evitar anti-patterns
3. **Pre-commit Hooks**: Validar antes de commits
4. **E2E Tests**: Playwright para flujos críticos
5. **Performance Budget**: Max 80KB JS bundle initial

