# NextWipeTime — Estrategia de Escala y Rentabilidad

**Fecha:** 2026-03-15
**Objetivo:** Side income sostenible de $500–2K/mes
**Estado actual:** 0 usuarios, en desarrollo
**Disponibilidad:** 15–30h/semana

---

## Contexto y Diferenciación

### ¿Por qué este nicho no está pulido?

Ningún sitio existente combina las tres piezas en un solo lugar con buena UI:

| Sitio | Qué hace bien | Qué le falta |
|-------|--------------|--------------|
| SteamDB | Data técnica profunda | UI horrible, solo Steam |
| isthereanydeal | Price tracking sólido | UI anticuada, sin wipes/seasons |
| IGDB | Base de datos enorme | Sin precios, sin deals, sin wipes |
| stash.games | Wishlist/backlog | Poco tráfico, sin deals reales |
| HowLongToBeat | Duración de juegos | Sin precios ni wipes |
| intoindiegames | Indie discovery | Muy nicho, sin precios |

**La ventaja de NextWipeTime:** UI moderna + wipes + deals + streams + calendario en un solo lugar. Esa combinación no existe.

---

## Los 3 Pilares del Producto

### Pilar 1 — Wipe Tracker (core actual)
Lo que ya tienes. Countdowns, fechas confirmadas vs estimadas, multi-versión de juegos. Es el hook inicial y el diferenciador principal frente a cualquier competidor.

### Pilar 2 — Game Deals & Discovery
La extensión natural. Agregar:
- **Price tracker cross-plataforma**: Steam, Epic, GOG, Humble, Fanatical, GMG
- **Epic Free Games semanales**: tráfico recurrente garantizado, la gente vuelve cada semana
- **Upcoming releases con precio estimado**: combinar IGDB (fechas) + historial de precios del publisher

**Stack técnico inicial (costo $0):**
```
CheapShark API  → precios cross-store (gratis)
IGDB API        → catálogo + fechas de lanzamiento (gratis)
Steam API       → reviews, tags, datos adicionales (gratis)
```

### Pilar 3 — Features Ambiciosas (diferenciadores reales)

Estas son las ideas que crean un moat difícil de copiar:

#### A. Predicción de wipes con IA
Los developers no siempre anuncian fechas exactas, pero hay patrones históricos (cada X semanas, siempre en jueves, etc.). Un modelo entrenado con historial puede decir *"probabilidad 78% de wipe entre el 20-25 de marzo"* antes del anuncio oficial. **Nadie hace esto.**

#### B. Score "¿Vale la pena entrar ahora?"
Responde la pregunta que todo jugador se hace antes de invertir 100 horas. Analiza: días desde el último wipe, tamaño de comunidad activa, fecha estimada del próximo reset. Puede empezar como lógica simple y evolucionar a ML.

#### C. Ecosistema de streamers (largo plazo)
Widgets embebibles para OBS/StreamElements con countdown en tiempo real. Un streamer grande usándolo en stream = mejor marketing posible, orgánico y masivo. **Esto es para cuando el producto esté pulido** — pero es el objetivo aspiracional más poderoso. Un streamer importante en Twitch o Kick usando el widget en directo sería un momento definitorio para el proyecto.

---

## Distribución — Cómo llegar a los primeros 1,000 usuarios

Con cero usuarios, el error más común es seguir construyendo features. El problema #1 es distribución.

### Canal 1: Reddit (tráfico inmediato)
Cada juego tiene comunidades que preguntan exactamente lo que tu app responde:
- `/r/playrust` (2.4M miembros) — "when is the next wipe?" se pregunta cada semana
- `/r/pathofexile` — league start dates
- `/r/EscapefromTarkov` — wipe speculation threads
- `/r/freegames` (2.5M miembros) — para la sección de Epic Free Games

**Táctica:** No spam. Entrar a esos threads genuinamente y ofrecer la herramienta. Un post bien recibido puede traer 500–2,000 visitas en un día.

### Canal 2: Discord (retención a largo plazo)
Los jugadores hardcore viven en Discord. Un bot que responda `!nextwipe rust` en servidores de gaming es distribución gratuita que escala sola. Cada servidor donde entre el bot es marketing pasivo permanente.

### Canal 3: SEO (el más importante a 6 meses)
Queries con miles de búsquedas mensuales y resultados actuales malos (foros viejos, posts de Reddit, nada centralizado):
- "when is next rust wipe"
- "tarkov wipe date 2026"
- "poe league start"
- "epic free games this week"
- "best games under $10"

Una página bien optimizada por juego (`/game/rust`, `/game/tarkov`) puede rankear en top 3 en 3–4 meses.

---

## Camino a $500–2K/mes

### Fase 0 → Primeros 1,000 usuarios (mes 1-2)
**Objetivo:** Validar que la gente vuelve

- Lanzar en los subreddits de Rust, PoE, Tarkov
- Una página SEO optimizada por cada juego
- Sección de Epic Free Games weekly
- **Meta de validación:** 1,000 usuarios, 20% retención en semana 2

### Fase 1 → $100–300/mes (mes 2-3)
**Solo affiliate links, sin premium aún**

- CheapShark integration + links a tiendas con comisión
- Epic/Humble affiliate programs
- Con 5K visitas/mes y 3% CTR en deals → ~$150/mes realista
- Objetivo: validar tráfico antes de monetización compleja

### Fase 2 → $300–800/mes (mes 3-5)
**Activar premium**

```
Free:     wipes básicos, 3 price alerts, deals semanales
$4.99/mes: alertas ilimitadas, notificaciones Discord/email,
            predicción de wipes (feature ambiciosa A),
            score "¿vale la pena entrar ahora?" (feature B),
            sin ads, calendario sync (Google/iCal)
```

Con 15K usuarios y conversión del 1.5% → 225 subs → **$1,123/mes**

### Fase 3 → $1K–2K/mes (mes 5-8)
**SEO compounding + deals section madura**

- Las páginas de juego empiezan a rankear en Google
- Deals section atrae usuarios fuera del nicho wipes
- Affiliate revenue crece con el tráfico
- Primer streamer usando el widget (aunque sea pequeño)

### El número clave

Para $1,000/mes necesitas **una de estas tres cosas** (o combinación):

| Fuente | Qué necesitas |
|--------|--------------|
| Premium | 200 suscriptores a $4.99 |
| Ads | 100K pageviews/mes |
| Affiliates | 200 conversiones/mes a $5 comisión promedio |

**Estimación realista:** Combinación de los tres, llegando a $1K en mes 6-7 ejecutando SEO y Reddit desde el día 1.

---

## Stack de Notificaciones — Mayor ventaja de retención

La razón #1 para que los usuarios vuelvan sin que tú hagas nada:

```
Wipe anunciado → scraper detecta → notificación automática
                                   → Email
                                   → Discord DM via bot
                                   → Push notification (PWA)
                                   → (futuro) SMS
```

Esto transforma NextWipeTime de "sitio que visito una vez al mes" a "herramienta que me avisa cuando importa". **Eso es lo que justifica el premium.**

---

## Infraestructura mínima desde día 1

```
Analytics     → PostHog (gratis hasta 1M eventos)
Emails        → Resend (gratis hasta 3K/mes)
Pagos         → Stripe (solo cuando actives premium)
Auth          → Clerk o NextAuth (1 día de setup, no semanas)
Monitoring    → Vercel Analytics (ya incluido)
SEO           → /game/[id] bien optimizada por juego
```

---

## Lo que NO construir todavía

- Base de datos propia de juegos → IGDB + Steam API son suficientes por 6 meses
- App móvil nativa → PWA con push notifications es suficiente hasta 10K usuarios
- Sistema de recomendaciones ML → el score puede ser lógica simple primero
- Auth compleja → solución out-of-the-box desde el inicio

---

## Métricas clave por fase

| Fase | Usuarios | Métrica norte |
|------|----------|--------------|
| Validación | 0 → 1K | Retención semana 2 (¿vuelven?) |
| Crecimiento | 1K → 10K | Alertas creadas por usuario |
| Monetización | 10K → 50K | Affiliate CTR + premium conversion |
| Escala | 50K+ | MRR growth rate |

---

## Plataformas de distribución de juegos a integrar

Para la sección de deals y discovery, cubrir estas plataformas:

**Tiendas PC principales:**
- Steam — líder del mercado
- Epic Games Store — juegos gratis semanales, exclusivas
- GOG — sin DRM, clásicos y retro
- Humble Bundle / Fanatical — bundles y deals
- Green Man Gaming — precios competitivos

**Launchers de publishers (para wipes/seasons):**
- Battle.net — Blizzard (Overwatch, Diablo, WoW)
- EA App — FIFA, Battlefield
- Ubisoft Connect — Rainbow Six, Far Cry

**Indie/alternativas:**
- Itch.io — indie, experimental, muchos gratuitos

---

## Próximos pasos inmediatos

### Semana 1-2
- [ ] Instalar PostHog para analytics
- [ ] Crear páginas `/game/[id]` optimizadas para SEO por cada juego soportado
- [ ] Integrar CheapShark API para precio básico
- [ ] Sección "Epic Free Games this week"

### Semana 3-4
- [ ] Bot de Discord básico (`!nextwipe [juego]`)
- [ ] Primer post en Reddit (genuino, no spam)
- [ ] Affiliate links de Humble/GMG en páginas de juegos

### Mes 2
- [ ] Sistema de alertas (email con Resend)
- [ ] Auth básico (Clerk)
- [ ] Primer premium tier con Stripe

### Mes 3+
- [ ] Predicción de wipes (empezar con lógica de patrones históricos)
- [ ] Score "¿vale la pena entrar ahora?"
- [ ] Widget embebible para streamers (versión beta)

---

## Ideas a explorar en sesiones futuras

- Detalles de implementación de la predicción de wipes con IA
- Estrategia completa para el ecosistema de streamers
- SEO programático — estructura de páginas y content strategy
- Discord bot — scope completo y distribución en servidores

---

*Documento generado en sesión de brainstorming — 2026-03-15*
*Próxima revisión: cuando se alcancen 1,000 usuarios*
