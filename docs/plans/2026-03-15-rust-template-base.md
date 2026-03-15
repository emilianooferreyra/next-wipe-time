# Rust — Template Base de Juego

**Fecha:** 2026-03-15
**Propósito:** Definir el estándar de calidad completo para Rust. Este documento se convierte en el template para todos los demás juegos.
**Orden de implementación:** #1 — el más simple para validar el schema

---

## ¿Por qué Rust primero?

- Wipe predecible: casi siempre el **primer jueves del mes**
- Comunidad enorme: `/r/playrust` (2.4M miembros)
- Datos limpios: Facepunch es transparente con sus anuncios
- Tipos de wipe bien definidos — fácil de modelar
- Valida el template para juegos más complejos (Tarkov, Diablo)

---

## Schema Completo — Lo que debe mostrar la app

### 1. Wipe Data (núcleo)

```typescript
type RustWipeData = {
  // Próximo evento
  nextWipe: {
    date: Date | null
    type: WipeType           // ver tipos abajo
    confirmed: boolean
    confidence: number       // 0-100%, basado en patrón histórico
    source: WipeSource       // de dónde viene la info
    announcedAt: Date | null // cuándo se anunció oficialmente
  }

  // Evento actual/pasado
  lastWipe: {
    date: Date
    type: WipeType
    blueprintWiped: boolean  // ¿se borró el progreso de BPs?
    mapSeed: string | null   // seed del mapa si está disponible
  }

  // Patrón histórico
  pattern: {
    averageIntervalDays: number   // promedio entre wipes
    typicalDayOfWeek: string      // "Thursday"
    typicalWeekOfMonth: number    // 1 = primera semana
    historicalDates: WipeHistory[]
  }

  // Metadata
  scrapedAt: Date
  fromCache: boolean
}

type WipeType =
  | "forced_wipe"      // wipe mensual oficial de Facepunch (mapa + blueprints)
  | "map_wipe"         // solo mapa, blueprints se mantienen
  | "blueprint_wipe"   // solo blueprints
  | "server_wipe"      // wipe individual de servidor (no aplica para tracking global)

type WipeSource =
  | "official_announcement"  // blog.facepunch.com o Steam
  | "twitter_official"       // @playrust
  | "steam_news"
  | "pattern_prediction"     // calculado por nuestro sistema
  | "community_verified"     // leak verificado por comunidad (sin clickbait)

type WipeHistory = {
  date: Date
  type: WipeType
  blueprintWiped: boolean
  patchVersion: string | null
}
```

---

### 2. Tipos de Wipe en Rust — Explicados

| Tipo | Qué se borra | Frecuencia | Quién lo decide |
|------|-------------|------------|-----------------|
| **Forced Wipe** | Mapa + Blueprints | Mensual (1er jueves) | Facepunch (obligatorio para todos los servidores) |
| **Map Wipe** | Solo mapa | Variable | Cada servidor (no aplica al tracker global) |
| **Blueprint Wipe** | Solo blueprints | Variable | Cada servidor |

**Para el tracker:** Solo nos importa el **Forced Wipe** mensual — es el evento global que afecta a toda la comunidad.

---

### 3. Información del Patch/Update

Cada wipe viene acompañado de un update. Mostrar:

```typescript
type RustPatchInfo = {
  title: string           // "Donkey's Rust Hapis"
  summary: string         // resumen corto del update (2-3 líneas)
  highlights: string[]    // cambios principales en bullets
  blueprintWiped: boolean
  newContent: string[]    // armas, builds, mecánicas nuevas
  balanceChanges: string[] // cambios de balance importantes
  url: string             // link al blog post oficial
  imageUrl: string | null
}
```

**Regla de calidad:** El resumen debe ser **informativo y neutro**. Sin "¡WIPE ÉPICO!", sin clickbait. Si Facepunch dice "mapa nuevo y cambios de balance", eso es lo que ponemos.

---

### 4. Leaks Viables — Criterios de Calidad

**¿Qué cuenta como leak viable?**

| Fuente | ¿Usar? | Por qué |
|--------|--------|---------|
| SteamDB changelog con cambios de código relevantes | ✅ Sí | Técnico, verificable |
| Post de dev de Facepunch en Reddit/Twitter | ✅ Sí | Fuente oficial informal |
| Datamine de archivos del juego (texturas, strings) | ✅ Sí | Verificable |
| "Insider" anónimo en Discord | ❌ No | No verificable |
| Youtuber con "WIPE DATE CONFIRMED???" | ❌ No | Clickbait |
| Subreddit post con 90%+ upvote ratio + confirmación de mods | ⚠️ Con nota | Marcar como "rumor comunitario" |

**Cómo mostrarlo en la UI:**
```
[OFICIAL] Wipe confirmado: 3 abril
vs
[ESTIMADO] Wipe probable: ~3 abril (confianza 78%, basado en patrón histórico)
vs
[RUMOR] Posible wipe anticipado — fuente: dev post en Reddit (sin confirmar)
```

---

### 5. Fuentes Oficiales a Monitorear

**Prioridad 1 — Fuentes primarias (scraping directo):**
- `rust.facepunch.com/blog` — anuncios oficiales de updates
- Steam News para Rust (App ID: 252490)
- Twitter/X: `@playrust`, `@Facepunch`

**Prioridad 2 — Fuentes secundarias (verificación y contexto):**
- `/r/playrust` — posts fijados, anuncios de mods
- Discord oficial de Rust — canal `#announcements`
- SteamDB changelog — detectar cambios de código pre-wipe

**Frecuencia de scraping recomendada:**
```
Blog Facepunch  → cada 6 horas
Steam News      → cada 6 horas
Twitter         → cada 2 horas (en la semana antes del wipe esperado)
Reddit fijados  → cada 12 horas
SteamDB         → cada 24 horas (excepto semana de wipe: cada 6h)
```

---

### 6. Predicción de Wipes — Implementación para Rust

Rust es el caso más simple para empezar porque el patrón es muy claro.

**Algoritmo Nivel 1 (implementar primero):**
```
1. Recopilar historial de forced wipes (últimos 24 meses mínimo)
2. Calcular: ¿qué jueves del mes ocurre el wipe?
   → Casi siempre: primer jueves
   → Excepción: si hay holiday major (Navidad, etc.) → se mueve
3. Proyectar próxima fecha probable
4. Calcular confianza:
   → 95% si ya está dentro de los 30 días del patrón esperado
   → 80% si es predicción del siguiente mes sin anuncio
   → 60% si hay señales de excepción (holidays, eventos especiales)
5. Ajustar automáticamente si se detecta anuncio oficial → 100%
```

**Datos históricos necesarios:**
Buscar y hardcodear los últimos 24 meses de forced wipes de Rust. Esta data existe en `/r/playrust` y en el blog de Facepunch. Una vez cargada, el sistema la mantiene actualizado solo.

**Nivel 2 — Señales de alerta temprana:**
- Facepunch suele hacer un devblog o post ~1 semana antes del forced wipe
- SteamDB muestra cambios en archivos de mapa los días previos
- Detectar estas señales → subir confianza automáticamente

---

### 7. Streams en Vivo

```typescript
type StreamConfig = {
  twitchGameId: "263490"     // ID oficial de Rust en Twitch
  kickCategory: "rust"
  featuredStreamers: string[] // streamers verificados con audiencia rust
  minViewers: 100             // no mostrar streams con menos de esto
  maxResults: 10
}
```

**Streamers relevantes de Rust a configurar como featured:**
- Pestily, Ser Winter, Shadowfrax, Malonik, Trausi (verificar que sigan activos)

---

### 8. Videos / YouTube

```typescript
type VideoConfig = {
  searchQueries: [
    "Rust forced wipe {month} {year}",
    "Rust wipe day highlights",
    "Rust update {month} {year}",
    "Rust patch notes",
  ]
  officialChannel: "UCtu4f1lVB-7A02f0yD3yb8A" // Facepunch Studios
  maxResults: 8
  freshnessDays: 30  // solo videos de los últimos 30 días
}
```

---

### 9. Countdown — Lógica de Display

```
Estado 1: Wipe confirmado con fecha exacta
  → "Wipe en 3d 14h 22m 05s"
  → Badge verde: CONFIRMADO

Estado 2: Fecha estimada con alta confianza (>70%)
  → "Wipe estimado ~3 abril (±2 días)"
  → Badge amarillo: ESTIMADO 78%

Estado 3: Fecha estimada con baja confianza (<70%)
  → "Próximo wipe: mes de abril"
  → Badge gris: TBD

Estado 4: Wipe ocurrió hace menos de 24h
  → "Wipe en curso — ¡Es día de wipe!"
  → Badge rojo animado: LIVE

Estado 5: Datos desactualizados (>48h sin actualizar)
  → "Verificar fecha — datos posiblemente desactualizados"
  → Badge naranja: ACTUALIZAR
```

---

### 10. Página de Juego — Estructura de Layout

```
/game/rust
├── Hero section
│   ├── Countdown principal (próximo forced wipe)
│   ├── Badge de estado (CONFIRMADO / ESTIMADO / TBD)
│   └── Fuente de la información + fecha de último update
│
├── Wipe Info
│   ├── Tipo de wipe (Forced: mapa + blueprints)
│   ├── ¿Qué se pierde? (explicación clara para nuevos)
│   └── ¿Vale la pena entrar ahora? (score basado en días desde último wipe)
│
├── Último Update / Patch
│   ├── Título del patch
│   ├── Resumen (2-3 líneas, sin clickbait)
│   └── Highlights en bullets
│
├── Historial de Wipes
│   └── Tabla últimos 12 meses con tipo y fecha
│
├── Live Streams
│   └── Top 10 streamers activos en Rust ahora
│
└── Videos Recientes
    └── Últimos videos relevantes (patch notes, wipe day, highlights)
```

---

## Checklist de "Juego Pulido" — El Estándar

Cuando Rust cumpla todos estos puntos, el template está listo para replicar:

### Datos
- [ ] Próximo wipe con fecha, tipo, fuente y confianza
- [ ] Último wipe con todos sus detalles
- [ ] Historial de 24 meses de wipes
- [ ] Patch notes del último update (resumen, highlights)
- [ ] Predicción automática funcionando (nivel 1)
- [ ] Detección automática de anuncio oficial

### Fuentes
- [ ] Scraper del blog de Facepunch funcionando
- [ ] Steam News integration
- [ ] Reddit pinned posts monitoring
- [ ] SteamDB changelog básico

### UI/UX
- [ ] Countdown con los 5 estados definidos
- [ ] Badge de confianza visible
- [ ] Sección "¿Qué se pierde en el wipe?" (para nuevos jugadores)
- [ ] Score "¿Vale la pena entrar ahora?"
- [ ] Live streams funcionando
- [ ] Videos recientes funcionando
- [ ] Mobile responsive

### Calidad de datos
- [ ] Sin clickbait en ningún texto
- [ ] Fuente visible para cada dato
- [ ] Leaks marcados claramente como "no oficial"
- [ ] Datos actualizados en las últimas 12 horas

---

## Aplicar Este Template a Otros Juegos

Una vez Rust está al 100%, el proceso para cada juego nuevo es:

1. **Identificar tipos de evento** — ¿wipe? ¿season? ¿league? ¿reset parcial?
2. **Mapear fuentes oficiales** — blog, Twitter, Steam, Discord oficial
3. **Definir patrón histórico** — ¿cada cuánto? ¿qué día? ¿hay excepciones?
4. **Adaptar el schema** — mismo base, campos específicos por juego
5. **Configurar scrapers** — usar los mismos helpers, diferentes URLs
6. **Verificar checklist** — mismo estándar de calidad

**Tiempo estimado por juego nuevo (usando este template):** 3-5 días vs 2 semanas desde cero.

---

## Orden de Implementación Post-Rust

| # | Juego | Complejidad | Por qué ese orden |
|---|-------|-------------|------------------|
| 1 | **Rust** | Baja | Define el template |
| 2 | **Tarkov + Arena** | Media | Misma franquicia, wipes son eventos masivos |
| 3 | **PoE + PoE 2** | Media | Leagues complejas pero bien documentadas |
| 4 | **Fortnite** | Baja | Seasons simples, audiencia masiva |
| 5 | **Diablo IV** | Media | Seasons trimestrales de Blizzard |
| 6 | **Diablo III** | Baja | Seasons establecidas, datos históricos abundantes |
| 7 | **Diablo II: Resurrected** | Baja | Ladders bianuales, predecibles |
| 8 | **Diablo Immortal** | Media | Mobile + PC, battlepass + seasons |
| 9 | **PUBG** | Baja | Seasons + ranked resets, bien documentado |

---

*Documento generado en sesión de brainstorming — 2026-03-15*
*Próximo paso: implementar Rust al 100% usando este schema como guía*
