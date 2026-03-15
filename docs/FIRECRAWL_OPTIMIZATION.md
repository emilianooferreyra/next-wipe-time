# 🔥 Estrategias de Optimización Firecrawl - NextWipeTime

## 📋 Tabla de Contenidos

1. [Estrategias por Tipo de Fuente](#estrategias-por-tipo-de-fuente)
2. [Background Scraping Implementation](#background-scraping)
3. [Optimización de Costos](#optimización-de-costos)
4. [Schema Validation](#schema-validation)
5. [Versionado de Scrapers](#versionado)
6. [Monitoring & Logging](#monitoring)

---

## 🎯 Estrategias por Tipo de Fuente

### Matriz de Decisión

| Fuente | Herramienta | Uso | Ventaja |
|--------|-------------|-----|---------|
| Schedule fijo | Calculated | Rust, Warframe | Sin costo, 100% preciso |
| API oficial | fetch() | Valorant, LoL, TFT | Gratis, confiable |
| Sitio oficial estable | `firecrawl_extract` | Destiny 2, Apex | LLM extrae datos, schema |
| Reddit/Forums dinámicos | `firecrawl_agent` | Tarkov, PoE | Búsqueda autónoma |
| Sitios con anti-bot | `firecrawl_scrape` + proxy | Fortnite | Stealth bypass |
| Múltiples páginas | `firecrawl_map` + `batch_scrape` | Overwatch 2 | Eficiente, paralelo |

---

## 🚀 Background Scraping

### Arquitectura Propuesta

```
┌─────────────────────────────────────────────────┐
│          Background Jobs (Node-cron)            │
├─────────────────────────────────────────────────┤
│                                                 │
│  ┌──────────────┐  ┌──────────────┐            │
│  │ Priority Job │  │  All Games   │            │
│  │  Every 2min  │  │  Every 5min  │            │
│  └──────┬───────┘  └──────┬───────┘            │
│         │                  │                     │
│         v                  v                     │
│   [Rust, Tarkov,     [All 24 games]            │
│    PoE2, Fortnite]                              │
│         │                  │                     │
│         v                  v                     │
│  ┌─────────────────────────────────┐            │
│  │   Firecrawl MCP Tools            │            │
│  │  - Agent (Tarkov, PoE)           │            │
│  │  - Extract (Valorant, Apex)      │            │
│  │  - Scrape (Fortnite, Destiny 2)  │            │
│  └─────────────┬────────────────────┘            │
│                │                                 │
│                v                                 │
│  ┌─────────────────────────────────┐            │
│  │   Triple-Layer Cache             │            │
│  │  1. Filesystem (persistent)      │            │
│  │  2. LRU (in-memory, 5min)        │            │
│  │  3. Next.js cache (1 hour)       │            │
│  └─────────────────────────────────┘            │
└─────────────────────────────────────────────────┘
                    │
                    v
         ┌──────────────────────┐
         │   User API Request   │
         │   Response: <10ms    │
         └──────────────────────┘
```

---

## 💰 Optimización de Costos Firecrawl

### Pricing Actual (Febrero 2026)

```
Firecrawl Pricing:
- Scrape: 1 crédito/página
- Extract: 5 créditos/extracción
- Agent: 10-50 créditos/búsqueda (varía)
- Search: 2 créditos/búsqueda

Plan Starter: $50/mes = 5,000 créditos
Plan Scale: $200/mes = 25,000 créditos
```

### Cálculo para NextWipeTime (24 juegos)

#### Escenario A: Sin Optimización (MALO)
```
Scraping en cada request del usuario:
- 1000 requests/día × 24 juegos = 24,000 requests/día
- 24,000 × 1 crédito = 24,000 créditos/día
- 24,000 × 30 días = 720,000 créditos/mes
- Costo: $7,200/mes 💸 (INSOSTENIBLE)
```

#### Escenario B: Background Scraping (BUENO)
```
Scraping cada 5 minutos en background:
- 12 scrapes/hora × 24 horas = 288 scrapes/día
- 288 × 24 juegos = 6,912 scrapes/día
- 6,912 × 30 días = 207,360 créditos/mes
- Costo: $830/mes 💸 (CARO)
```

#### Escenario C: Optimizado + Cache + APIs (ÓPTIMO)
```
Distribución inteligente:
- 8 juegos con APIs oficiales: 0 créditos (gratis)
- 6 juegos calculated: 0 créditos (gratis)
- 5 juegos Extract (cada 10min): 5 × 6 × 24 × 30 = 21,600 créditos
- 3 juegos Agent (cada 30min): 25 × 2 × 24 × 30 = 36,000 créditos
- 2 juegos Scrape (cada 5min): 1 × 12 × 24 × 30 = 8,640 créditos

Total: 66,240 créditos/mes
Costo: $265/mes ✅ (SOSTENIBLE)

Ahorro vs Sin Optimización: 96.3% ($6,935/mes)
Ahorro vs Background Simple: 68% ($565/mes)
```

### Estrategia de Cache Agresivo

```typescript
// cache-strategy.ts
export const CACHE_STRATEGIES = {
  // Juegos con schedule fijo → cache largo
  rust: {
    ttl: 24 * 60 * 60 * 1000,      // 24 horas
    firecrawlMaxAge: 86400000,     // 24h en Firecrawl cache
    scrapingInterval: 60,          // Cada hora
  },

  // Juegos con eventos irregulares → cache medio
  tarkov: {
    ttl: 2 * 60 * 60 * 1000,       // 2 horas
    firecrawlMaxAge: 7200000,      // 2h en Firecrawl cache
    scrapingInterval: 30,          // Cada 30 min
  },

  // Juegos con updates frecuentes → cache corto
  fortnite: {
    ttl: 5 * 60 * 1000,            // 5 minutos
    firecrawlMaxAge: 300000,       // 5min en Firecrawl cache
    scrapingInterval: 5,           // Cada 5 min
  },
};
```

---

## ✅ Schema Validation con Zod

### Problema: Detectar cambios de estructura

```typescript
// src/lib/scrapers/validators.ts
import { z } from 'zod';

// Schema base para todos los scrapers
const BaseWipeDataSchema = z.object({
  nextWipe: z.string().datetime().or(z.null()),
  lastWipe: z.string().datetime().or(z.null()),
  frequency: z.string(),
  source: z.string(),
  scrapedAt: z.string().datetime(),
  confirmed: z.boolean(),
  eventType: z.enum(['wipe', 'season', 'league', 'patch', 'event', 'update']),
});

// Schema específico por juego
const TarkovWipeSchema = BaseWipeDataSchema.extend({
  announcement: z.string().optional(),
  eventName: z.string().optional(),
  estimatedBasis: z.string().optional(), // "community", "developer hint", etc
});

// Validador con logging de cambios
export async function validateAndLog<T>(
  gameId: string,
  data: unknown,
  schema: z.ZodSchema<T>,
  version: string
): Promise<T> {
  const result = schema.safeParse(data);

  if (!result.success) {
    // 🚨 Schema cambió - loguear para debugging
    const error = {
      gameId,
      version,
      errors: result.error.errors,
      rawData: data,
      timestamp: new Date().toISOString(),
    };

    // Log a archivo
    await logSchemaError(error);

    // Log a consola para debugging inmediato
    console.error(`❌ [${gameId}] Schema validation failed:`, error);

    // Opcional: Enviar alerta (email, Discord, Slack)
    await sendAlert({
      type: 'schema_validation_failed',
      gameId,
      details: error,
    });

    throw new Error(`Schema validation failed for ${gameId}`);
  }

  return result.data;
}

// Uso en scraper
export const tarkovConfigV2: ScrapedScraperConfig = {
  scraperFunction: async () => {
    const rawData = await firecrawlAgent({ ... });

    // Validar con schema específico
    const validatedData = await validateAndLog(
      'tarkov',
      rawData,
      TarkovWipeSchema,
      'v2'
    );

    return validatedData;
  },
};
```

---

## 🔄 Versionado de Scrapers

### Estructura de Carpetas

```
src/lib/scrapers/
├── configs/
│   ├── rust/
│   │   ├── index.ts         # Exports current version
│   │   ├── v1.config.ts     # Original (deprecated)
│   │   └── v2.config.ts     # Current with Firecrawl MCP
│   ├── tarkov/
│   │   ├── index.ts
│   │   ├── v1.config.ts     # Reddit scraping
│   │   ├── v2.config.ts     # Firecrawl Agent
│   │   └── v3.config.ts     # Future: Official API when available
│   └── poe/
│       ├── index.ts
│       └── v2.config.ts
└── types.ts
```

### Implementación de Versionado

```typescript
// src/lib/scrapers/configs/tarkov/index.ts
import { tarkovConfigV1 } from './v1.config';
import { tarkovConfigV2 } from './v2.config';
import type { ScrapedScraperConfig } from '../../config-types';

export const TARKOV_VERSIONS = {
  v1: tarkovConfigV1,
  v2: tarkovConfigV2,
} as const;

export const CURRENT_VERSION = 'v2';

// Config actual con fallback automático
export const tarkovConfig: ScrapedScraperConfig = {
  ...TARKOV_VERSIONS[CURRENT_VERSION],

  // Override scraperFunction para agregar fallback
  scraperFunction: async () => {
    // Intentar versión actual
    try {
      const data = await TARKOV_VERSIONS.v2.scraperFunction();
      console.log(`✅ [tarkov] Scraped with ${CURRENT_VERSION}`);
      return data;
    } catch (error) {
      console.error(`❌ [tarkov] ${CURRENT_VERSION} failed:`, error);

      // Fallback a v1
      try {
        console.log(`🔄 [tarkov] Falling back to v1...`);
        const data = await TARKOV_VERSIONS.v1.scraperFunction();
        console.log(`⚠️ [tarkov] Using v1 fallback`);

        // Alerta: v2 está roto
        await sendAlert({
          type: 'scraper_version_fallback',
          gameId: 'tarkov',
          failedVersion: CURRENT_VERSION,
          usedVersion: 'v1',
        });

        return data;
      } catch (v1Error) {
        console.error(`❌ [tarkov] v1 also failed:`, v1Error);

        // Último recurso: fallback data
        throw error; // Engine usará fallbackData
      }
    }
  },
};
```

---

## 📊 Monitoring & Logging

### Dashboard de Métricas

```typescript
// src/lib/scrapers/metrics.ts
export interface ScraperMetrics {
  gameId: string;
  version: string;
  success: boolean;
  duration: number;
  creditsUsed?: number;
  error?: string;
  timestamp: string;
}

class MetricsCollector {
  private metrics: ScraperMetrics[] = [];

  record(metric: ScraperMetrics) {
    this.metrics.push(metric);

    // Escribir a archivo diario
    const logFile = `logs/metrics/${new Date().toISOString().split('T')[0]}.jsonl`;
    fs.appendFileSync(logFile, JSON.stringify(metric) + '\n');
  }

  getStats(gameId?: string) {
    const filtered = gameId
      ? this.metrics.filter(m => m.gameId === gameId)
      : this.metrics;

    return {
      total: filtered.length,
      successful: filtered.filter(m => m.success).length,
      failed: filtered.filter(m => !m.success).length,
      avgDuration: average(filtered.map(m => m.duration)),
      totalCredits: sum(filtered.map(m => m.creditsUsed || 0)),
      successRate: (filtered.filter(m => m.success).length / filtered.length) * 100,
    };
  }

  // Detectar scrapers con problemas
  getProblematicScrapers(threshold = 0.8) {
    const gameIds = [...new Set(this.metrics.map(m => m.gameId))];

    return gameIds
      .map(gameId => ({
        gameId,
        ...this.getStats(gameId),
      }))
      .filter(stats => stats.successRate < threshold * 100)
      .sort((a, b) => a.successRate - b.successRate);
  }
}

export const metrics = new MetricsCollector();
```

### Alertas Automáticas

```typescript
// src/lib/scrapers/alerts.ts
import { metrics } from './metrics';

// Revisar cada 10 minutos
setInterval(async () => {
  const problematic = metrics.getProblematicScrapers(0.7); // <70% success

  if (problematic.length > 0) {
    await sendDiscordAlert({
      title: '🚨 Scrapers con problemas detectados',
      description: problematic
        .map(s => `${s.gameId}: ${s.successRate.toFixed(1)}% success rate`)
        .join('\n'),
      color: 'red',
    });
  }
}, 10 * 60 * 1000);
```

---

## 🎯 Próximos Pasos

### Semana 1: Setup Background Scraping
1. Implementar scraper-cron.ts
2. Migrar 3 juegos prioritarios (Rust, Tarkov, PoE2) a nuevas estrategias
3. Testing en local

### Semana 2: Migración Gradual
4. Implementar APIs oficiales (Valorant, LoL, TFT)
5. Migrar 5 juegos más a Firecrawl Extract
6. Setup metrics & logging

### Semana 3: Optimización
7. Implementar cache agresivo con TTLs específicos
8. Setup alertas automáticas
9. Versionado de scrapers

### Semana 4: Producción
10. Deploy a producción
11. Monitoring de costos
12. Ajustes finales basados en métricas reales

---

## 📈 Métricas de Éxito

| Métrica | Antes | Después | Mejora |
|---------|-------|---------|--------|
| Response Time | 3-5s | <50ms | 98% ⬇️ |
| Firecrawl Costs | $7,200/mes | $265/mes | 96% ⬇️ |
| Success Rate | ~85% | >95% | 12% ⬆️ |
| Availability | 95% | 99.9% | 5% ⬆️ |
| User Experience | Variable | Consistente | ✨ |

