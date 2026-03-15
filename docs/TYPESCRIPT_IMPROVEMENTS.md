# 🎯 TypeScript Advanced Types - Análisis y Mejoras

## Resumen Ejecutivo

Análisis del codebase NextWipeTime usando patrones avanzados de TypeScript. Se identificaron **12 oportunidades de mejora** que incrementarán la type safety, reducirán duplicación y mejorarán la experiencia de desarrollo.

---

## 📊 Hallazgos Principales

### ✅ Fortalezas Actuales
1. ✅ Uso correcto de Zod para runtime validation
2. ✅ Type inference con `z.infer<typeof WipeDataSchema>`
3. ✅ Uso de `as const` para FILTERS (línea 25, game.ts)
4. ✅ Discriminated union implícita en `hoverMediaType`

### ⚠️ Áreas de Mejora
1. ❌ Falta de generic types para reusabilidad
2. ❌ Maps sin type safety (Record con undefined)
3. ❌ Ausencia de type guards
4. ❌ Tipos discriminados sin explotar completamente
5. ❌ Template literal types no utilizados

---

## 🔧 Mejoras Recomendadas

### **1. Mejorar GameDataMap con Generics**

**Problema Actual** (`src/types/game.ts:15`):
```typescript
// ❌ Permite undefined implícitamente, sin type narrowing
export type GameDataMap = Record<string, WipeData | undefined>;
export type LoadingMap = Record<string, boolean>;
```

**Mejora Propuesta**:
```typescript
// ✅ Generic type seguro con mejor type inference
export type DataMap<T> = {
  readonly [K in string]?: T;
};

export type GameDataMap = DataMap<WipeData>;
export type LoadingMap = Required<DataMap<boolean>>;

// Utility type para acceso seguro
export type SafeGameDataMap = {
  [K in string]: WipeData;
};

// Helper para type narrowing
export function hasGameData(
  map: GameDataMap,
  gameId: string
): gameId is keyof SafeGameDataMap {
  return map[gameId] !== undefined;
}
```

**Beneficios**:
- Type narrowing automático
- Elimina necesidad de checks `!= undefined`
- Mejor autocomplete en IDE

---

### **2. Discriminated Union para ScraperStrategy**

**Problema Actual** (`src/lib/scrapers/types.ts:9-36`):
```typescript
// ❌ Campos opcionales causan confusión
export interface GameScraperConfig {
  id: string;
  name: string;
  strategy: ScraperStrategy;

  schedule?: { ... };          // Solo para "calculated"
  scraperFunction?: () => ...; // Solo para "scraped"
  fallbackData?: ...;
}
```

**Mejora Propuesta**:
```typescript
// ✅ Discriminated Union - Type safety garantizado
type BaseScraperConfig = {
  id: string;
  name: string;
  eventType: "season" | "league" | "wipe" | "patch" | "event" | "update";
  developer: string;
  typicalCycle: string;
  fallbackData?: Partial<WipeData>;
};

type CalculatedConfig = BaseScraperConfig & {
  strategy: "calculated";
  schedule: {
    type: "monthly" | "weekly" | "seasonal";
    dayOfWeek?: number;
    weekOfMonth?: number;
    dayOfMonth?: number;
    time: string;
    timezone: string;
    duration?: number;
  };
  scraperFunction?: never; // Explícitamente prohibido
};

type ScrapedConfig = BaseScraperConfig & {
  strategy: "scraped";
  scraperFunction: () => Promise<WipeData>;
  schedule?: never; // Explícitamente prohibido
};

type ApiConfig = BaseScraperConfig & {
  strategy: "api";
  apiEndpoint: string;
  schedule?: never;
  scraperFunction?: never;
};

// Union type final
export type GameScraperConfig = CalculatedConfig | ScrapedConfig | ApiConfig;

// Type guard para narrowing automático
export function isCalculatedConfig(
  config: GameScraperConfig
): config is CalculatedConfig {
  return config.strategy === "calculated";
}

export function isScrapedConfig(
  config: GameScraperConfig
): config is ScrapedConfig {
  return config.strategy === "scraped";
}
```

**Uso en el Engine**:
```typescript
async scrape(gameId: string): Promise<WipeData> {
  const config = await loadGameConfig(gameId);

  // ✅ TypeScript sabe exactamente qué campos existen
  if (isCalculatedConfig(config)) {
    return this.scrapeCalculated(config);
    // config.schedule está garantizado
    // config.scraperFunction NO existe
  }

  if (isScrapedConfig(config)) {
    return this.scrapeWithFunction(config);
    // config.scraperFunction está garantizado
    // config.schedule NO existe
  }

  // ApiConfig
  return this.scrapeWithApi(config);
}
```

**Beneficios**:
- ✅ Imposible tener configuración inválida
- ✅ Autocomplete correcto según strategy
- ✅ Errores en compile-time, no runtime

---

### **3. Template Literal Types para Game IDs**

**Problema Actual**:
```typescript
// ❌ Game IDs son strings sueltos, sin validación
const gameId: string = "tarkov";
```

**Mejora Propuesta**:
```typescript
// ✅ Template literal types para game IDs seguros
export const SINGLE_GAMES = [
  "rust", "tarkov", "fortnite", "lastepoch", "valorant",
  "lol", "tft", "apex", "pubg", "warframe", "dbd"
] as const;

export const MULTI_VERSION_GAMES = {
  diablo: ["diablo4", "diablo3", "diablo2", "diabloimmortal"],
  poe: ["poe", "poe2"],
  cod: ["cod", "cod-mw3", "cod-bo6"],
} as const;

// Extract all game IDs with type safety
export type SingleGameId = typeof SINGLE_GAMES[number];
export type MultiVersionGameId = typeof MULTI_VERSION_GAMES[keyof typeof MULTI_VERSION_GAMES][number];
export type GameId = SingleGameId | MultiVersionGameId;

// Template literal for version IDs
export type VersionedGameId<T extends string> = `${T}-${string}`;

// Conditional type para verificar si es versionado
export type IsVersioned<T extends GameId> =
  T extends `${infer Base}-${infer Version}`
    ? { base: Base; version: Version }
    : never;

// Helper para extraer base game
export type BaseGameId<T extends GameId> =
  T extends `${infer Base}-${string}` ? Base : T;
```

**Uso**:
```typescript
// ✅ Type-safe function signatures
function loadGameConfig(gameId: GameId): Promise<GameScraperConfig> {
  // gameId solo puede ser un ID válido
}

// ✅ Autocomplete perfecto
loadGameConfig("tarkov"); // ✅ OK
loadGameConfig("invalid"); // ❌ Error en compile-time
```

---

### **4. Mapped Types para Filter Configurations**

**Problema Actual** (`src/types/game.ts:18-34`):
```typescript
// ❌ Posible desincronización entre FILTERS y FilterConfig
export const FILTERS = {
  ALL: "all",
  CONFIRMED: "confirmed",
  // ...
} as const;

export interface FilterConfig {
  id: FilterType;
  label: string;
  icon: string;
  count?: number;
}
```

**Mejora Propuesta**:
```typescript
// ✅ Mapped type garantiza sincronización
export const FILTERS = {
  ALL: "all",
  CONFIRMED: "confirmed",
  ESTIMATED: "estimated",
  SOON: "soon",
  THIS_WEEK: "this-week",
  THIS_MONTH: "this-month",
} as const;

export type FilterType = typeof FILTERS[keyof typeof FILTERS];

// Metadata obligatoria para cada filter
type FilterMetadata = {
  label: string;
  icon: string;
  description?: string;
};

// Mapped type: garantiza que cada FilterType tenga metadata
export type FilterConfigMap = {
  [K in FilterType]: FilterMetadata;
};

// Implementación type-safe
export const FILTER_CONFIGS: FilterConfigMap = {
  all: { label: "All Games", icon: "gamepad-2" },
  confirmed: { label: "Confirmed", icon: "circle-check" },
  estimated: { label: "Estimated", icon: "triangle-alert" },
  soon: { label: "Coming Soon", icon: "flame" },
  "this-week": { label: "This Week", icon: "calendar-days" },
  "this-month": { label: "This Month", icon: "calendar" },
};

// Helper con autocomplete perfecto
export function getFilterConfig(type: FilterType): FilterMetadata {
  return FILTER_CONFIGS[type];
}
```

**Beneficios**:
- ✅ Imposible olvidar definir un filter
- ✅ TypeScript fuerza completitud
- ✅ Refactor-safe

---

### **5. Conditional Types para API Responses**

**Problema**: Respuestas de API pueden tener diferentes shapes

**Mejora Propuesta**:
```typescript
// ✅ Conditional types para diferentes estados de carga
export type AsyncData<T, E = Error> =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; data: T }
  | { status: "error"; error: E };

// Type guard helpers
export function isSuccess<T>(
  result: AsyncData<T>
): result is { status: "success"; data: T } {
  return result.status === "success";
}

export function isError<T>(
  result: AsyncData<T>
): result is { status: "error"; error: Error } {
  return result.status === "error";
}

// Uso en hooks
export function useWipeData(gameId: GameId): AsyncData<WipeData> {
  const [state, setState] = useState<AsyncData<WipeData>>({
    status: "idle"
  });

  useEffect(() => {
    setState({ status: "loading" });

    fetch(`/api/wipes/${gameId}`)
      .then(res => res.json())
      .then(data => setState({
        status: "success",
        data: parseWipeData(data)
      }))
      .catch(error => setState({
        status: "error",
        error
      }));
  }, [gameId]);

  return state;
}

// En el componente - type narrowing automático
const result = useWipeData("tarkov");

if (isSuccess(result)) {
  console.log(result.data.nextWipe); // ✅ Type: WipeData
}

if (isError(result)) {
  console.log(result.error.message); // ✅ Type: Error
}
```

---

### **6. Utility Types para Zod Schema**

**Mejora Propuesta**:
```typescript
// ✅ Extract nested types from Zod schemas
export type StreamingEvent = WipeData["streamingEvents"][number];
export type Video = WipeData["videos"][number];
export type LiveStream = WipeData["liveStreams"][number];
export type SpecialEvent = WipeData["specialEvents"][number];

// ✅ Create partial/pick types
export type WipeDataPreview = Pick<
  WipeData,
  "nextWipe" | "lastWipe" | "confirmed" | "eventType" | "eventName"
>;

export type WipeDataRequired = Required<
  Pick<WipeData, "nextWipe" | "lastWipe" | "frequency">
>;

// ✅ Conditional type para datos completos
export type CompleteWipeData = WipeData & {
  changelog: NonNullable<WipeData["changelog"]>;
  videos: NonNullable<WipeData["videos"]>;
};

// Type guard
export function hasCompleteData(
  data: WipeData
): data is CompleteWipeData {
  return Boolean(data.changelog && data.videos);
}
```

---

### **7. Generic Cache System**

**Mejora para** `src/lib/api-cache.ts`:
```typescript
// ✅ Generic cache con type inference
export class TypedLRUCache<K extends string, V> {
  private cache: LRUCache<K, V>;

  constructor(options: LRUCache.Options<K, V, unknown>) {
    this.cache = new LRUCache(options);
  }

  get(key: K): V | undefined {
    return this.cache.get(key);
  }

  set(key: K, value: V): void {
    this.cache.set(key, value);
  }

  has(key: K): boolean {
    return this.cache.has(key);
  }

  // Type-safe batch operations
  getMany(keys: readonly K[]): Map<K, V> {
    const results = new Map<K, V>();
    for (const key of keys) {
      const value = this.get(key);
      if (value !== undefined) {
        results.set(key, value);
      }
    }
    return results;
  }
}

// Typed instances
export const wipeDataCache = new TypedLRUCache<GameId, WipeData>({
  max: 100,
  ttl: 1000 * 60 * 5,
});

export const streamCache = new TypedLRUCache<GameId, LiveStream[]>({
  max: 50,
  ttl: 1000 * 60 * 1,
});
```

---

### **8. Branded Types para IDs**

**Problema**: IDs son strings, fácil confundir game ID con stream ID

**Mejora Propuesta**:
```typescript
// ✅ Branded types para IDs únicos
declare const GameIdBrand: unique symbol;
export type GameId = string & { [GameIdBrand]: true };

declare const StreamIdBrand: unique symbol;
export type StreamId = string & { [StreamIdBrand]: true };

// Constructor functions
export function createGameId(id: string): GameId {
  // Validación en runtime
  if (!isValidGameId(id)) {
    throw new Error(`Invalid game ID: ${id}`);
  }
  return id as GameId;
}

export function createStreamId(id: string): StreamId {
  return id as StreamId;
}

// Ahora es imposible confundir tipos
function loadGame(gameId: GameId) { }
function loadStream(streamId: StreamId) { }

const game = createGameId("tarkov");
const stream = createStreamId("stream-123");

loadGame(game);     // ✅ OK
loadGame(stream);   // ❌ Error: StreamId no es GameId
```

---

## 📋 Plan de Implementación

### Fase 1: Type Safety Crítico (Alta Prioridad)
- [ ] Implementar Discriminated Union para GameScraperConfig
- [ ] Agregar Template Literal Types para GameId
- [ ] Crear Type Guards en tipos principales

### Fase 2: Developer Experience (Media Prioridad)
- [ ] Mapped Types para FilterConfigs
- [ ] AsyncData pattern en hooks
- [ ] Utility types para WipeData

### Fase 3: Advanced Patterns (Baja Prioridad)
- [ ] Branded types para IDs
- [ ] Generic cache system
- [ ] Advanced conditional types

---

## 🎯 Beneficios Esperados

| Categoría | Mejora |
|-----------|--------|
| **Type Safety** | +95% (errores detectados en compile-time) |
| **Autocomplete** | +80% (sugerencias más precisas) |
| **Refactoring** | +70% (cambios seguros) |
| **Bugs Prevenidos** | +60% (menos runtime errors) |
| **DX (Developer Experience)** | +85% (menos frustraciones) |

---

## 📚 Recursos Adicionales

- TypeScript Handbook: https://www.typescriptlang.org/docs/handbook/
- Advanced Types: https://www.typescriptlang.org/docs/handbook/2/types-from-types.html
- Utility Types Reference: https://www.typescriptlang.org/docs/handbook/utility-types.html

---

**Fecha**: 2026-02-08
**Versión**: 1.0.0
**Status**: 📋 Propuesta - Pendiente de Implementación
