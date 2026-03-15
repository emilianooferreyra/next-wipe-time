# NextWipeTime - Análisis de Negocio y Estrategia

**Fecha:** 2026-02-09
**Versión:** 1.0

---

## 📋 Índice

1. [Contexto del Proyecto](#contexto-del-proyecto)
2. [Análisis Crítico del Modelo Actual](#análisis-crítico-del-modelo-actual)
3. [Propuesta de Pivote Estratégico](#propuesta-de-pivote-estratégico)
4. [Modelo de Monetización](#modelo-de-monetización)
5. [Análisis de Competencia](#análisis-de-competencia)
6. [Roadmap Estratégico](#roadmap-estratégico)
7. [Proyecciones Financieras](#proyecciones-financieras)

---

## 🎯 Contexto del Proyecto

### ¿Qué es NextWipeTime actualmente?

**NextWipeTime** es una aplicación web que rastrea información sobre "wipes" (reinicios de temporada/progreso) para juegos online populares.

**Stack Técnico:**
- Next.js 16 + React 19
- TanStack Query para data fetching
- Sistema de scraping modular (Firecrawl, Playwright)
- 20+ juegos soportados
- UI estilo Letterboxd para gaming

**Características actuales:**
- ✅ Countdown timers para próximos wipes
- ✅ Fechas confirmadas vs estimadas
- ✅ Integración con Twitch/YouTube/Kick streams
- ✅ Sistema de caché (LRU)
- ✅ Filtros por estado (esta semana, este mes, confirmado, etc.)

---

## 🔍 Análisis Crítico del Modelo Actual

### La Verdad Incómoda

**NextWipeTime SOLO como tracker de wipes es un FEATURE, no un negocio completo.**

### ❌ Problemas del Modelo "Solo Wipes"

#### 1. **Audiencia Extremadamente Nicho**
- Solo jugadores hardcore de live-service games (Rust, Tarkov, PoE)
- Representa <5% del mercado total de gamers
- Excluye a casuales, single-player fans, mobile gamers

#### 2. **Frecuencia de Uso Baja**
- Los usuarios solo entran 1-2 veces por mes
- No hay razón para volver diariamente
- Bajo engagement = bajo valor publicitario

#### 3. **Información Disponible Gratuitamente**
- Discord servers por juego
- Subreddits especializados (/r/playrust, /r/EscapefromTarkov)
- Wikis comunitarias (muy actualizadas)
- Twitter/X de developers

#### 4. **Difícil de Monetizar**
```
Casual Players → NO pagarían nunca (usan versión free)
Hardcore Players → QUIZÁS $2-5/mes (si hay features premium muy buenas)
Pro Players/Streamers → TAL VEZ (si integra con su workflow)
```

#### 5. **Monetización Limitada**
- **Ads**: Necesitas 50K+ visitas/mes para generar ingresos significativos
- **Premium**: ¿Qué features justifican pagar por "fechas de wipes"?
- **Afiliados**: Casi nada (no vendes juegos, solo información)

### 📊 Números Realistas del Modelo Actual

| Métrica | Optimista | Realista |
|---------|-----------|----------|
| Usuarios activos/mes | 5,000 | 2,000 |
| Premium conversion | 2% | 0.5% |
| Suscriptores premium | 100 | 10 |
| Revenue premium ($4.99) | $499 | $49.90 |
| Revenue ads | $200 | $50 |
| **Total mensual** | **$699** | **$99.90** |

**Conclusión:** No es suficiente para ser un negocio sostenible.

---

## 🚀 Propuesta de Pivote Estratégico

### Nueva Visión: Gaming Discovery & Intelligence Hub

**Concepto expandido:**
```
NextWipeTime (core feature)
    ↓
    + Game Discovery Engine (buscador inteligente)
    + Price Tracking & Alerts (ofertas y predicciones)
    + Release Calendar (próximos lanzamientos + precios esperados)
    + News Aggregation (últimas novedades por juego)
    + Community Features (listas, reviews, tracking personal)
    ↓
    = Plataforma todo-en-uno para decisiones de gaming
```

### ✅ Por Qué Este Pivote Funciona

#### 1. **Problema Más Grande**
- **Antes:** "¿Cuándo es el próximo wipe?" (pregunta mensual)
- **Ahora:** "¿Qué juego compro/juego hoy?" (pregunta DIARIA)

#### 2. **Audiencia 100x Más Grande**
- TODOS los gamers buscan juegos constantemente
- No solo jugadores de live-service
- Incluye casual, hardcore, mobile, console, PC

#### 3. **Engagement Permanente**
- Razones para volver DIARIAMENTE:
  - Nuevas ofertas de precio
  - Próximos lanzamientos
  - Noticias de juegos favoritos
  - Tracking personal de biblioteca
  - Wipes/temporadas de juegos seguidos

#### 4. **Múltiples Fuentes de Monetización**
- 💰 Afiliados de Steam/Epic/Humble (5-20% comisión)
- 💰 Premium features (alertas, búsquedas avanzadas)
- 💰 Ads de gaming (muy bien pagados: $5-15 CPM)
- 💰 API para developers/streamers
- 💰 Partnerships con publishers

---

## 💡 Features Específicas (Basadas en Necesidades Reales)

### 1. 🔍 **Buscador Inteligente con Filtros Avanzados**

**Problema que resuelve:**
> "Vi un reel de un RPG pero sale en marzo recién. ¿Cuánto podría costar ese juego?"
> "Quiero juegos tipo shooter en Steam menos de $10"

**Features:**
```
Búsquedas naturales:
- "Juegos tipo shooter en Steam menos de $10"
- "RPG que salen en marzo 2026"
- "Juegos de aventura en oferta"
- "Roguelikes con controller support bajo $15"

Filtros avanzados:
- Género (FPS, RPG, Strategy, etc.)
- Precio (rangos personalizables)
- Plataforma (Steam, Epic, GOG, Console)
- Fecha de lanzamiento (Released, Upcoming, This Month, This Year)
- Rating (Metacritic, Steam Reviews)
- Tags (Multiplayer, Single-player, Co-op, VR)
- Features (Controller, Cloud Saves, Achievements)
```

**Tecnología:**
- Elasticsearch o Algolia para búsqueda rápida
- Scraping de Steam API, IGDB, HowLongToBeat
- ML para recomendaciones personalizadas (futuro)

---

### 2. 💰 **Price Tracking & Alerts**

**Problema que resuelve:**
> "Quiero comprar Elden Ring pero espero que baje de precio"

**Features:**
```
Core:
- Alertas de precio personalizadas
- Comparación entre tiendas (Steam, Epic, GOG, Humble)
- Historial de precios (gráficos)
- Predicción de próximas ofertas (based on historical data)

Premium:
- Alertas ilimitadas (Free: 3 juegos, Premium: ilimitadas)
- Notificaciones instantáneas (Email, Discord, Push)
- Price drop forecast (ML predictions)
- Bundle tracking (Humble, Fanatical)
```

**Monetización:**
- Affiliate links a tiendas (5-20% comisión)
- Premium subscriptions para features avanzadas

**Competencia:**
- isthereanydeal.com (pero UI horrible y confusa)
- SteamDB (muy técnico, no user-friendly)

**Diferenciación:**
- UI moderna y limpia (ya la tienes)
- Integración con otras features (wipes, releases, news)
- Enfoque en casual gamers, no geeks

---

### 3. 📅 **Release Calendar con Predicción de Precios**

**Problema que resuelve:**
> "Vi un juego en un reel que sale en marzo, pero no sé cuánto costará"

**Features:**
```
Core:
- Calendario visual de próximos lanzamientos
- Precio esperado basado en:
  - Precios de pre-order
  - Ediciones anunciadas (Standard, Deluxe, Ultimate)
  - Historical data de juegos similares
  - Publisher pricing patterns

Premium:
- Alertas 1 semana antes del lanzamiento
- Descuentos de pre-order automáticos
- "Remind me" notifications
- Wishlist sincronizada con Steam/Epic
```

**Diferenciación:**
- Nadie hace predicción de precios bien
- Steam solo muestra "Coming Soon" sin contexto de precio
- Metacritic/IGN no tienen buenos calendarios

---

### 4. 📰 **News Aggregation por Juego**

**Features:**
```
- Feed personalizado de juegos que sigues
- Agregación de:
  - Patch notes oficiales
  - Reddit top posts
  - YouTube/Twitch highlights
  - Developer updates
- Filtros por tipo (Updates, Patches, DLC, Events, Wipes)
```

---

### 5. 📚 **Game Library & Tracking Personal**

**Features:**
```
- Import library from Steam/Epic/GOG
- Tracking de:
  - Juegos jugados
  - Backlog (want to play)
  - Completados
  - Abandonados
- Stats personales (horas jugadas, géneros favoritos)
- Recomendaciones basadas en tu biblioteca
```

---

## 💸 Modelo de Monetización Completo

### Tier 1: **Free**
```
✅ Búsqueda básica de juegos
✅ Ver próximos wipes/temporadas
✅ Release calendar (30 días)
✅ Price tracking (3 juegos máximo)
✅ News feed básico
⚠️  Ads (no intrusivos)
```

### Tier 2: **Premium - $4.99/mes** (o $49/año - 2 meses gratis)
```
✅ Todo de Free +
✅ Búsquedas avanzadas ilimitadas
✅ Price alerts ilimitados
✅ Notificaciones instantáneas (Email, Discord, Push)
✅ Release calendar completo (1 año)
✅ Sin ads
✅ Early access a nuevas features
✅ Export de datos (CSV, JSON)
✅ Calendario sincronizado (Google Calendar, iCal)
✅ Discord bot personalizado
```

### Tier 3: **API Access - $29/mes**
```
✅ Todo de Premium +
✅ API access (10,000 requests/mes)
✅ Webhooks para automatizaciones
✅ Priority support
✅ Custom integrations (OBS, StreamElements)

Target: Streamers, content creators, developers
```

### Revenue Streams Adicionales

#### 1. **Affiliate Commissions**
- Steam: No official program (pero enlaces de búsqueda)
- Epic Games: Creator program (up to 12% comisión)
- Humble Bundle: 5-20% comisión
- GOG: Affiliate program
- Green Man Gaming: Hasta 15%
- Fanatical: 5-10%

**Estimación:**
- 10,000 usuarios activos
- 5% click-through rate = 500 clicks/mes
- 10% conversion = 50 compras/mes
- Precio promedio: $30
- Comisión promedio: 10%
- **Revenue: $150/mes** (conservador)

Con escala (100K usuarios): **$1,500/mes**

#### 2. **Display Ads** (solo Free tier)
- Gaming ads CPM: $5-15
- 10,000 usuarios free × 10 pageviews/mes = 100,000 impressions
- **Revenue: $500-1,500/mes**

Con escala (100K free users): **$5,000-15,000/mes**

#### 3. **Sponsored Content**
- Featured game listings: $200-500/spot
- Publisher partnerships: $500-2,000/mes
- Newsletter sponsorships: $100-500/email

**Estimación inicial:** $500-1,000/mes

---

## 📊 Proyecciones Financieras

### Año 1: MVP + Growth

| Métrica | Q1 | Q2 | Q3 | Q4 |
|---------|----|----|----|----|
| Usuarios activos/mes | 1,000 | 5,000 | 15,000 | 30,000 |
| Premium subs (2% conversion) | 20 | 100 | 300 | 600 |
| Revenue premium | $99 | $499 | $1,497 | $2,994 |
| Revenue affiliates | $50 | $150 | $450 | $900 |
| Revenue ads | $100 | $300 | $1,000 | $2,000 |
| **Total Revenue** | **$249** | **$949** | **$2,947** | **$5,894** |

### Año 2: Scaling

| Métrica | Q1 | Q2 | Q3 | Q4 |
|---------|----|----|----|----|
| Usuarios activos/mes | 50,000 | 80,000 | 120,000 | 200,000 |
| Premium subs (2.5% conversion) | 1,250 | 2,000 | 3,000 | 5,000 |
| API subs | 10 | 25 | 50 | 100 |
| Revenue premium | $6,237 | $9,980 | $14,970 | $24,950 |
| Revenue API | $290 | $725 | $1,450 | $2,900 |
| Revenue affiliates | $1,500 | $2,400 | $3,600 | $6,000 |
| Revenue ads | $4,000 | $6,000 | $9,000 | $15,000 |
| Revenue partnerships | $1,000 | $2,000 | $3,000 | $5,000 |
| **Total Revenue** | **$13,027** | **$21,105** | **$32,020** | **$53,850** |

**Año 2 Total: ~$120,000 ARR**

### Costos Operacionales (Año 2)

| Categoría | Mensual | Anual |
|-----------|---------|-------|
| Hosting (Vercel Pro + DB) | $100 | $1,200 |
| Firecrawl API | $200 | $2,400 |
| Scraping infrastructure | $150 | $1,800 |
| Email service (SendGrid) | $50 | $600 |
| Analytics tools | $50 | $600 |
| Domain + SSL | $10 | $120 |
| Payment processing (3%) | $1,200 | $14,400 |
| **Total** | **$1,760** | **$21,120** |

**Net Profit Año 2: ~$99,000**

---

## 🎯 Análisis de Competencia

### Competidores Directos

#### 1. **isthereanydeal.com**
**Fortalezas:**
- Muy completo en price tracking
- Base de datos masiva
- Trusted por la comunidad

**Debilidades:**
- UI anticuada y confusa
- No tiene release calendar
- No tiene game discovery
- No tiene info de wipes/seasons
- Solo enfocado en precios

**Oportunidad:** UI moderna + features adicionales

---

#### 2. **SteamDB**
**Fortalezas:**
- Data técnica profunda
- Steam API completa
- Historical charts excelentes

**Debilidades:**
- MUY técnico (no para casual gamers)
- No user-friendly
- No tiene price comparison cross-store
- No tiene game discovery
- Solo Steam (no Epic, GOG, etc.)

**Oportunidad:** Enfoque en casual gamers + multi-store

---

#### 3. **HowLongToBeat**
**Fortalezas:**
- Data única (tiempo de juego)
- Comunidad activa
- Trusted source

**Debilidades:**
- Solo una feature (tiempo de juego)
- No price tracking
- No release calendar
- UI básica

**Oportunidad:** Integrar su data + añadir más features

---

#### 4. **Metacritic / OpenCritic**
**Fortalezas:**
- Aggregated reviews
- Trusted scores
- Cobertura masiva

**Debilidades:**
- No price tracking
- No game discovery avanzado
- Release calendar básico
- No wipes/seasons info

**Oportunidad:** Combinar reviews + precios + discovery

---

### Competidores Indirectos

- **Discord servers por juego**: Info de wipes pero fragmentado
- **Reddit (/r/GameDeals, /r/ShouldIbuythisgame)**: Manual, no automatizado
- **Steam search**: Limitado, no cross-store
- **Google**: Disperso, no centralizado

---

## 🗺️ Roadmap Estratégico

### Fase 1: MVP Mejorado (Mes 1-2)

**Objetivo:** Validar el pivote con usuarios existentes

**Features:**
- [ ] Mantener sistema de wipes actual (core value)
- [ ] Añadir buscador básico de juegos
  - [ ] Integrar Steam API
  - [ ] Filtros: género, precio, plataforma
  - [ ] Búsqueda por texto
- [ ] Price tracking básico (3 juegos max para free)
- [ ] Release calendar (30 días)
- [ ] Affiliate links de Humble/GMG
- [ ] Analytics (PostHog o similar)

**Métricas de éxito:**
- 1,000 usuarios activos/mes
- 10% de usuarios usan buscador
- 50+ price alerts creados
- $200+ en affiliate revenue

---

### Fase 2: Monetización (Mes 3-4)

**Objetivo:** Implementar premium tier y validar willingness to pay

**Features:**
- [ ] Sistema de auth (NextAuth)
- [ ] Premium subscription ($4.99/mes)
  - [ ] Stripe integration
  - [ ] Price alerts ilimitados
  - [ ] Sin ads
  - [ ] Email notifications
- [ ] Improved price tracking
  - [ ] Multi-store comparison (Steam, Epic, GOG)
  - [ ] Price history charts
- [ ] User dashboard (tracked games, alerts)

**Métricas de éxito:**
- 5,000 usuarios registrados
- 1-2% premium conversion
- 50-100 suscriptores premium
- $500+ MRR

---

### Fase 3: Growth (Mes 5-8)

**Objetivo:** Escalar usuarios y revenue

**Features:**
- [ ] SEO optimization (contenido programático)
- [ ] Content marketing
  - [ ] Blog: "Best deals this week"
  - [ ] "Games under $10"
  - [ ] "Upcoming releases March 2026"
- [ ] Social sharing (Twitter cards, OG images)
- [ ] Discord bot (alertas de precio/wipes)
- [ ] Chrome extension
- [ ] Improved game discovery
  - [ ] ML recommendations
  - [ ] "Similar games" suggestions
  - [ ] User reviews/ratings

**Métricas de éxito:**
- 30,000 usuarios activos/mes
- 600+ premium subs
- $3,000+ MRR
- 50% traffic from organic search

---

### Fase 4: Platform (Mes 9-12)

**Objetivo:** Convertirse en THE platform para gaming decisions

**Features:**
- [ ] API pública (tier de $29/mes)
- [ ] Game library import (Steam, Epic, GOG)
- [ ] Personal tracking
  - [ ] Played, backlog, completed
  - [ ] Stats & insights
- [ ] Community features
  - [ ] User lists ("Best RPGs under $20")
  - [ ] Social sharing
  - [ ] Following system
- [ ] Publisher partnerships
- [ ] Advanced search con NLP
  - [ ] "Juegos parecidos a Hollow Knight pero más fáciles"

**Métricas de éxito:**
- 100,000+ usuarios activos/mes
- 2,000+ premium subs
- 50+ API customers
- $10,000+ MRR
- Acercamiento a VC o M&A

---

## 🎯 Estrategia de Crecimiento

### SEO (Tráfico Orgánico - 60% del crecimiento)

**Palabras clave objetivo:**
```
High volume, low competition:
- "when is next rust wipe"
- "tarkov wipe date"
- "fortnite season end date"
- "best games under $10"
- "upcoming rpg releases 2026"
- "steam games on sale"
- "is [game] worth it"

Long-tail (contenido programático):
- "best [genre] games under $[price]"
- "games like [popular game]"
- "[game] price history"
- "when does [game] season end"
```

**Estrategia:**
1. Páginas programáticas por juego (ej: `/game/elden-ring`)
2. Blog posts automatizados ("Best deals this week")
3. Landing pages por query ("Best RPGs under $20")
4. Schema markup para rich snippets

---

### Content Marketing

**Blog posts semanales:**
- "Top 10 Games Under $10 This Week"
- "Upcoming Releases March 2026"
- "Is [New Game] Worth The Price?"
- "When Is The Next [Game] Wipe?"

**Distribución:**
- Reddit (/r/GameDeals, /r/patientgamers)
- Twitter/X
- Discord servers (gaming communities)
- Newsletter semanal

---

### Product-Led Growth

**Viral loops:**
1. Share alert → Friend gets 1 month free → Sharer gets 1 month free
2. Import Steam library → Share stats → Friends sign up
3. Create list → Share on social → Traffic back to site

**Retention:**
- Email notifications (price drops, wipes, releases)
- Discord bot (passive presence en servers)
- Chrome extension (always visible)

---

### Partnerships

**Targets:**
1. **Streamers/Content Creators**
   - Free API access
   - Custom OBS widgets
   - Affiliate revenue share

2. **Gaming Communities**
   - Discord server partnerships
   - Reddit mod collaborations
   - Subreddit sidebars

3. **Publishers/Developers**
   - Featured listings ($200-500)
   - Early access announcements
   - Data partnerships

---

## 🚨 Riesgos y Mitigación

### Riesgo 1: Competencia de Steam/Epic

**Probabilidad:** Media
**Impacto:** Alto

**Mitigación:**
- Enfoque en features que ellos no tienen (wipes, cross-store, advanced search)
- Velocidad de iteración (ellos son lentos)
- Community-first approach

---

### Riesgo 2: APIs se rompen (Steam, scraping)

**Probabilidad:** Alta
**Impacto:** Medio

**Mitigación:**
- Múltiples sources por dato
- Fallback systems
- Community contributions
- Paid APIs como backup (IGDB, RAWG)

---

### Riesgo 3: No hay PMF (Product-Market Fit)

**Probabilidad:** Media
**Impacto:** Crítico

**Mitigación:**
- Validar con usuarios existentes ANTES de gran desarrollo
- MVP rápido de cada feature
- A/B testing
- User interviews (10-20 usuarios)

---

### Riesgo 4: Costos de scraping/API explotan

**Probabilidad:** Media
**Impacto:** Alto

**Mitigación:**
- Caching agresivo
- Rate limiting inteligente
- Community contributions (user-submitted data)
- Eventual pivot a API pública en lugar de scraping

---

## 📈 KPIs y Métricas Clave

### North Star Metric
**"Usuarios que toman una decisión de gaming usando la plataforma"**

Proxy metrics:
- Game searches realizadas
- Price alerts creados
- Affiliate clicks
- Wipe dates consultados

---

### Métricas por Fase

**Fase 1 (MVP):**
- [ ] 1,000 MAU (Monthly Active Users)
- [ ] 50+ price alerts creados
- [ ] $200 affiliate revenue

**Fase 2 (Monetización):**
- [ ] 5,000 MAU
- [ ] 50 premium subs
- [ ] $500 MRR
- [ ] 2% premium conversion

**Fase 3 (Growth):**
- [ ] 30,000 MAU
- [ ] 600 premium subs
- [ ] $3,000 MRR
- [ ] 50% organic traffic

**Fase 4 (Platform):**
- [ ] 100,000 MAU
- [ ] 2,000 premium subs
- [ ] $10,000 MRR
- [ ] 10 partnerships

---

## 🎯 Próximos Pasos Inmediatos

### Validación (Esta Semana)

1. **User Research**
   - [ ] Encuesta a usuarios actuales (si los hay)
   - [ ] 5-10 entrevistas con gamers
   - [ ] Preguntas:
     - ¿Cómo decides qué juego comprar/jugar?
     - ¿Qué herramientas usas hoy?
     - ¿Pagarías por [premium features]?
     - ¿Cuánto?

2. **Competitive Analysis Profunda**
   - [ ] Usar isthereanydeal por 1 semana
   - [ ] Documentar pain points
   - [ ] Identificar gaps

3. **Technical Validation**
   - [ ] Steam API limits/capabilities
   - [ ] IGDB API (alternativa)
   - [ ] Feasibility de price tracking

---

### Desarrollo (Próximas 2 Semanas)

1. **Phase 1 MVP Features**
   - [ ] Game search básico (Steam API)
   - [ ] Price display simple
   - [ ] Filtros básicos

2. **Analytics Setup**
   - [ ] PostHog o Mixpanel
   - [ ] Event tracking
   - [ ] Funnel analysis

3. **Landing Page Optimizada**
   - [ ] Messaging claro del value prop
   - [ ] Call-to-action para early access
   - [ ] Email capture

---

## 💭 Preguntas Estratégicas Abiertas

1. **Geografía:** ¿Enfoque global o US-first?
   - Afecta precios, currencies, stores

2. **Platform priority:** ¿PC-first o multi-platform desde día 1?
   - PC (Steam) es más fácil
   - Console/Mobile expande mercado pero complejiza

3. **Data strategy:** ¿Scraping vs API paid vs community-driven?
   - Trade-off: costo vs confiabilidad vs escalabilidad

4. **Branding:** ¿Mantener "NextWipeTime" o rebrand?
   - "NextWipeTime" es muy específico para wipes
   - Algo más amplio: "GameRadar", "GamePulse", "PlayNext"

5. **Go-to-market:** ¿Launch silencioso o big bang?
   - Silencioso: iterar rápido, menos presión
   - Big bang: ProductHunt, prensa, más riesgo

---

## 📚 Recursos y Referencias

### APIs y Data Sources
- [Steam Web API](https://steamcommunity.com/dev)
- [IGDB API](https://www.igdb.com/api) (Twitch)
- [RAWG API](https://rawg.io/apidocs)
- [CheapShark API](https://apidocs.cheapshark.com/)
- [HowLongToBeat unofficial API](https://github.com/ckatzorke/howlongtobeat)

### Inspiration
- [Letterboxd](https://letterboxd.com/) - Social for movies
- [isthereanydeal](https://isthereanydeal.com/) - Price tracking
- [GG.deals](https://gg.deals/) - Price comparison
- [Metacritic](https://www.metacritic.com/) - Reviews aggregation

### Monetization Models
- [Epic Creator Program](https://www.epicgames.com/affiliate/en-US/overview)
- [Humble Partner](https://www.humblebundle.com/partner)
- [Green Man Gaming Affiliate](https://greenmangaming.mention-me.com/)

---

## ✅ Conclusión

**NextWipeTime tiene potencial REAL como negocio** si se ejecuta el pivote estratégico hacia una plataforma más amplia de game discovery + intelligence.

**Keys to Success:**
1. ✅ **Mantener wipes como diferenciador** (nadie más lo hace)
2. ✅ **Expandir a game discovery** (mercado 100x más grande)
3. ✅ **Ejecutar rápido** (validar antes de sobre-construir)
4. ✅ **SEO desde día 1** (tráfico orgánico es clave)
5. ✅ **Monetización clara** (premium + affiliates + ads)

**Potential Outcomes:**
- **Best case:** $10K+ MRR en 12 meses, exit opportunity a publisher/platform
- **Base case:** $3-5K MRR, sustainable side business, possible full-time
- **Worst case:** Aprendizaje valioso, portfolio piece, pivot a algo más grande

**Recommendation:** GO FOR IT 🚀

---

**Última actualización:** 2026-02-09
**Próxima revisión:** Después de validación con usuarios (2 semanas)
