# NextWipeTime - Timeline Ajustado (Part-Time)

**Realidad:** 10-15 horas/semana después del trabajo
**Timeline:** 12 semanas (3 meses)
**Filosofía:** Sostenible, sin burnout, shipping incremental

---

## 🎯 Por Qué Este Timeline Funciona Mejor

### **Cambios vs Timeline Original:**

1. **Más tiempo por fase** (menos presión)
2. **Buffers para vida real** (trabajo, familia, cansancio)
3. **Milestones más pequeños** (wins frecuentes)
4. **Flexible** (si una semana solo puedes 8h, no se cae todo)

### **Estructura:**

```
Semanas 1-2:   Foundations (Analytics + Research)
Semanas 3-6:   Build Search MVP (4 semanas en lugar de 2)
Semana 7:      Launch v1.0
Semanas 8-10:  Feature #2 (Price Alerts)
Semanas 11-12: Monetization + Polish
```

---

## 📅 **Timeline Detallado - 12 Semanas**

---

## **SEMANA 1-2: Foundations & Research** 📊

**Horas:** 10-15h/semana (20-30h total)
**Fecha:** Semanas 1-2

---

### **Semana 1: Analytics + Quick Wins**

**Horas estimadas:** 10-12h

#### **Prioridad 1: Analytics Setup** (3-4h)
- [ ] Instalar PostHog
- [ ] Setup events básicos:
  - `page_view`
  - `game_card_click`
  - `filter_applied`
- [ ] Verificar que fluye data

#### **Prioridad 2: Quick UI Wins** (4-5h)
- [ ] Botón "Notify Me" en GameCard (sin backend)
- [ ] Simple survey: "¿Qué feature quieres?"
- [ ] Mejorar CTAs actuales

#### **Prioridad 3: SEO Básico** (3-4h)
- [ ] Mejorar metadata (title, description)
- [ ] Schema.org markup básico
- [ ] Sitemap.xml
- [ ] Submit a Google Search Console

**Output:** Analytics funcionando + UI mejorada

---

### **Semana 2: User Research**

**Horas estimadas:** 10-12h

#### **Prioridad 1: User Interviews** (6-8h)
- [ ] Reclutar 5 usuarios (Reddit, Discord, emails)
- [ ] Hacer 5 entrevistas de 15-20 min
- [ ] Consolidar findings

**Questions clave:**
- ¿Cómo decides qué juego comprar HOY?
- ¿Qué tools usas?
- ¿Pagarías por [features]?

#### **Prioridad 2: Competitive Analysis** (2-3h)
- [ ] Usar isthereanydeal por 30 min
- [ ] Usar SteamDB por 30 min
- [ ] Documentar pain points

#### **Prioridad 3: Technical Planning** (2-3h)
- [ ] Research APIs (Steam, IGDB, CheapShark)
- [ ] Decidir stack (Supabase vs otros)
- [ ] DB schema draft

**Output:** Research doc + Tech decisions

---

## **SEMANA 3-6: Build Search MVP** 🛠️

**Horas:** 10-15h/semana (40-60h total)
**Fecha:** Semanas 3-6

**Estrategia:** 4 semanas para build cómodamente, sin rush

---

### **Semana 3: Database + API Foundation**

**Horas estimadas:** 12-15h

#### **Lunes-Miércoles: DB Setup** (6-8h)
- [ ] Setup Supabase project
- [ ] Create tables (schema de Semana 2)
- [ ] Install Prisma
- [ ] Prisma schema + generate

#### **Jueves-Domingo: Seed Data** (6-8h)
- [ ] Script para importar top 100 juegos
- [ ] IGDB API integration
- [ ] Run seed, verificar data en DB

**Output:** DB con 100+ juegos

---

### **Semana 4: API Backend**

**Horas estimadas:** 12-15h

#### **Lunes-Miércoles: API Endpoints** (6-8h)
- [ ] `/api/games/search` endpoint
- [ ] Query con filters (genre, price, platform)
- [ ] Pruebas en Postman/curl

#### **Jueves-Viernes: Caching** (3-4h)
- [ ] LRU cache setup
- [ ] Cache API responses (1h TTL)

#### **Sábado-Domingo: Testing** (3-4h)
- [ ] Unit tests básicos
- [ ] Performance testing (autocannon)
- [ ] DB indexes

**Output:** API funcionando + tested

---

### **Semana 5: Frontend - Search UI**

**Horas estimadas:** 12-15h

#### **Lunes-Miércoles: Search Bar + Filters** (8-10h)
- [ ] SearchBar component (con autocomplete)
- [ ] FilterSidebar component
  - Genre selector
  - Price slider
  - Platform checkboxes

#### **Jueves-Domingo: Results Grid** (4-5h)
- [ ] SearchResults component
- [ ] Loading states
- [ ] Empty states
- [ ] Reusar GameCard

**Output:** UI components listos

---

### **Semana 6: Integration + Polish**

**Horas estimadas:** 12-15h

#### **Lunes-Miércoles: Integration** (6-8h)
- [ ] Create `/search` page
- [ ] Connect UI to API (React Query)
- [ ] URL params syncing
- [ ] Analytics events

#### **Jueves-Viernes: Mobile Responsive** (3-4h)
- [ ] Test en móvil (320px, 768px)
- [ ] Fix layout issues
- [ ] Touch interactions

#### **Sábado-Domingo: QA + Deploy** (3-4h)
- [ ] Manual QA checklist
- [ ] Fix bugs encontrados
- [ ] Deploy a Vercel
- [ ] Smoke test en prod

**Output:** Search v1.0 en producción ✅

---

## **SEMANA 7: Launch v1.0** 🚀

**Horas estimadas:** 15-20h (esta semana será intensa)
**Fecha:** Semana 7

**Esta es LA semana crítica - reserva más tiempo si puedes.**

---

### **Lunes-Martes: Pre-Launch Prep** (4-6h)
- [ ] Update landing page
- [ ] Write launch blog post
- [ ] Create social media assets (Twitter, Reddit posts)
- [ ] Prepare email for early users
- [ ] Screenshots/GIFs para Product Hunt

### **Miércoles: LAUNCH DAY** (6-8h)
**Toma el día off del trabajo si puedes - es importante.**

- [ ] **09:00:** ProductHunt post
- [ ] **10:00:** Twitter thread
- [ ] **11:00:** Reddit posts (r/GameDeals, r/patientgamers)
- [ ] **Todo el día:** Responder TODOS los comments
- [ ] **Noche:** Email a early users

### **Jueves-Viernes: Feedback Loop** (3-4h)
- [ ] Monitor analytics obsesivamente
- [ ] Fix hot bugs
- [ ] Responder feedback
- [ ] Collect feature requests

### **Sábado-Domingo: Analysis** (2-3h)
- [ ] Analyze metrics:
  - Cuántos usuarios?
  - % usando search?
  - Top searches?
  - Feedback themes?
- [ ] **DECISION:** ¿Continuar con price alerts o pivotar?
- [ ] Document decision en `WEEK_7_ANALYSIS.md`

**Output:** 1,000+ usuarios + decision clara

---

## **SEMANA 8-10: Feature #2 - Price Alerts** ⚡

**Horas:** 10-15h/semana (30-45h total)
**Fecha:** Semanas 8-10

**NOTA:** Solo si search tuvo >30% adoption. Si no, iteramos en search.

---

### **Semana 8: Auth + Backend**

**Horas estimadas:** 12-15h

#### **Lunes-Miércoles: Auth System** (6-8h)
- [ ] Install NextAuth
- [ ] Configure Google + Discord providers
- [ ] Update Prisma schema (User, Account, Session)
- [ ] AuthButton component

#### **Jueves-Domingo: Price Alerts API** (6-8h)
- [ ] PriceAlert model en Prisma
- [ ] `/api/alerts` endpoints (GET, POST, DELETE)
- [ ] Alert limits (3 for free users)
- [ ] Test en Postman

**Output:** Auth + API funcionando

---

### **Semana 9: Background Jobs + Emails**

**Horas estimadas:** 12-15h

#### **Lunes-Miércoles: Cron Job** (6-8h)
- [ ] `/api/cron/check-prices` endpoint
- [ ] Query active alerts
- [ ] Compare prices
- [ ] Mark as notified

#### **Jueves-Domingo: Email System** (6-8h)
- [ ] Setup Resend or SendGrid
- [ ] Email template para price alerts
- [ ] Test email locally
- [ ] Vercel cron setup (every 6h)

**Output:** Notifications automáticas funcionando

---

### **Semana 10: Frontend Dashboard**

**Horas estimadas:** 12-15h

#### **Lunes-Miércoles: Dashboard Page** (6-8h)
- [ ] `/dashboard` page
- [ ] List user's alerts
- [ ] Alert cards con current price
- [ ] Delete alert button

#### **Jueves-Viernes: Track Price Button** (4-5h)
- [ ] Button en GameCard
- [ ] TrackPriceModal component
- [ ] Integration con API

#### **Sábado-Domingo: QA + Deploy** (2-3h)
- [ ] Test completo
- [ ] Mobile responsive
- [ ] Deploy
- [ ] Announce to users

**Output:** Price alerts v1.0 live ✅

---

## **SEMANA 11-12: Monetization + Polish** 💰

**Horas:** 10-15h/semana (20-30h total)
**Fecha:** Semanas 11-12

---

### **Semana 11: Stripe + Premium**

**Horas estimadas:** 12-15h

#### **Lunes-Martes: Stripe Integration** (6-8h)
- [ ] Setup Stripe account
- [ ] Create products ($4.99/mo, $49/yr)
- [ ] `/api/checkout` endpoint
- [ ] Webhook handler

#### **Miércoles-Jueves: Premium Page** (4-5h)
- [ ] `/premium` page
- [ ] Pricing cards
- [ ] Features list
- [ ] Checkout flow

#### **Viernes-Domingo: Testing** (2-3h)
- [ ] Test checkout en test mode
- [ ] Verify webhook works
- [ ] Test subscription upgrade/downgrade

**Output:** Stripe working, ready to launch

---

### **Semana 12: Launch Premium + Optimize**

**Horas estimadas:** 12-15h

#### **Lunes: Launch Premium** (4-5h)
- [ ] Switch Stripe to production
- [ ] Email announcement
- [ ] Twitter/Reddit posts
- [ ] Banner on homepage
- [ ] Personal DMs to power users

#### **Martes-Jueves: Growth Optimizations** (6-8h)
- [ ] SEO improvements (game pages programáticas)
- [ ] Exit intent popup (email capture)
- [ ] Social proof ("X users tracking")
- [ ] Blog post programático

#### **Viernes-Domingo: Analysis + Planning** (2-3h)
- [ ] Analyze first week metrics:
  - Cuántos subs?
  - MRR?
  - Conversion rate?
- [ ] Document learnings
- [ ] Plan next 3 months

**Output:** Premium launched + first revenue 💰

---

## 📊 **Métricas por Fase**

| Semana | Milestone | Key Metric | Target |
|--------|-----------|------------|--------|
| 1-2 | Foundations | Analytics + Research | 5 interviews done |
| 3-6 | Search MVP | Feature shipped | ✅ Live in prod |
| 7 | Launch | Users | 1,000 MAU |
| 7 | **DECISION** | Search adoption | >30% |
| 8-10 | Price Alerts | Feature shipped | ✅ Live in prod |
| 11-12 | Monetization | Premium subs | 10+ subs |
| 12 | **DECISION** | Revenue + PMF | $50+ MRR |

---

## 🎯 **Horas Reales por Semana**

| Semana | Estimado | Tipo |
|--------|----------|------|
| 1-2 | 10-12h/sem | Liviano (research) |
| 3-6 | 12-15h/sem | Medio (building) |
| 7 | 15-20h | **INTENSO (launch)** ⚠️ |
| 8-10 | 12-15h/sem | Medio (feature #2) |
| 11-12 | 12-15h/sem | Medio (monetization) |

**Total: ~150-180 horas en 12 semanas**
**Average: 12.5-15h/semana** ✅ SOSTENIBLE

---

## 💡 **Tips para Part-Time Después del Trabajo**

### **1. Time Blocking Realista**

**NO hagas esto:**
```
❌ "Trabajaré 3 horas todas las noches después del trabajo"
```
Esto te quemará en 2 semanas.

**HAZ esto:**
```
✅ Lunes-Miércoles: 1.5-2h/noche (después de cenar, descansar)
✅ Jueves: OFF (descanso mental)
✅ Viernes: OFF o 1h si tenés energía
✅ Sábado: 4-5h (mañana fresca)
✅ Domingo: 3-4h (tarde)

Total: 12-15h/semana
```

### **2. Momentum Management**

**Uso de "micro-sessions":**
- 30 min: Code review, planning, escribir specs
- 1 hora: Bug fixes, small features, tests
- 2+ horas: New features, architecture, deep work

**Tip:** Mantén un `TODO.md` actualizado para arrancar rápido sin pensar.

### **3. Energy Management**

**Después del trabajo estás cansado - acepta esto.**

Días de semana (baja energía):
- Tasks mecánicas (styling, refactors, tests)
- Bug fixes
- Code reviews
- Documentación

Fines de semana (alta energía):
- New features
- Architecture decisions
- Complex backend work
- Problem solving

### **4. Buffer para Vida Real**

**Cosas que PASARÁN:**
- Semana pesada en el trabajo → solo 5h en el proyecto
- Finde social/familiar → 0h en el proyecto
- Te enfermas → 0h
- Burnout mini → necesitas una semana light

**Solución:** Este timeline tiene buffers. Si una semana solo haces 8h en lugar de 15h, no pasa nada. La siguiente semana compensas.

### **5. Celebrate Small Wins**

Cada viernes, tweet o escribe:
```
This week I:
✅ [Lo que lograste]

Next week:
🎯 [Lo que harás]
```

Esto mantiene momentum + accountability.

---

## 🚨 **Semanas Críticas (Reserva Más Tiempo)**

### **Semana 7: LAUNCH** 🚀

**Esta es LA semana más importante.**

**Recomendación:**
- Toma 1-2 días off del trabajo si puedes
- O launch un Viernes (para tener todo el finde)
- Necesitas estar disponible para responder feedback TODO EL DÍA

**Por qué:**
- Launch tiene window de atención corto (24-48h)
- ProductHunt requiere engagement todo el día
- Reddit posts necesitan respuestas rápidas
- Bugs urgentes necesitan fixing inmediato

**Si NO puedes tomar días off:**
- Launch un Sábado temprano (tenés todo el finde)
- Prepara TODO el Viernes anterior (posts, emails, assets)
- Sábado = 100% dedicado a launch

---

## 📅 **Ejemplo de Horario Semana Típica**

### **Semana de Build (Semanas 3-6, 8-10)**

| Día | Horas | Tasks | Energía |
|-----|-------|-------|---------|
| **Lun** | 1.5-2h | Small features, refactors | 🟡 Media |
| **Mar** | 1.5-2h | Continue from Monday | 🟡 Media |
| **Mié** | 1.5-2h | Bug fixes, tests, polish | 🟡 Media |
| **Jue** | 0h | OFF - descanso | - |
| **Vie** | 0-1h | Code review, planning | 🟡 Media |
| **Sáb** | 4-5h | **Deep work:** new feature | 🟢 Alta |
| **Dom** | 3-4h | Finish feature, tests, deploy | 🟢 Alta |

**Total: 12-15h**

---

### **Semana de Launch (Semana 7)**

| Día | Horas | Tasks |
|-----|-------|-------|
| **Lun** | 2h | Prep: landing page, blog post |
| **Mar** | 2h | Prep: social assets, emails |
| **Mié** | 0h | Relax before launch |
| **Jue** | 0h | Relax before launch |
| **Vie** | 2h | Final prep, schedule posts |
| **Sáb** | 8-10h | **LAUNCH DAY** 🚀 |
| **Dom** | 4-5h | Feedback loop, analysis |

**Total: 18-21h** (excepcional, solo esta semana)

---

## 🎯 **Decision Framework Ajustado**

### **End of Week 7: ¿Search funciona?**

**Métrica clave:** % de usuarios que usaron search

```
IF search_adoption > 30%:
    ✅ Continue to price alerts (Weeks 8-10)
    Reasoning: Los usuarios valoran search, ahora darles más value

ELIF search_adoption 15-30%:
    ⚠️ MIXED
    Options:
    A) Iterate on search 1 week, then continue
    B) Build price alerts (fue muy pedido en research)
    Decision: Talk to 5 users, see what's blocking adoption

ELSE (search_adoption < 15%):
    🔴 PROBLEM
    Options:
    A) Pivot to price alerts (skip search iteration)
    B) Deep investigation (2 weeks user research)
    Recommendation: Talk to 10 users URGENTLY
```

**Importante:** Este decision point te puede ahorrar SEMANAS de trabajo en la dirección equivocada.

---

### **End of Week 12: ¿Monetización funciona?**

**Métricas clave:**
- Premium subs
- MRR
- Overall engagement

```
IF premium_subs >= 10 AND engagement_strong:
    🚀 SCALE
    Next: Marketing agresivo, más features, growth

ELIF premium_subs 0-5 BUT engagement_strong:
    💡 ADJUST PRICING/POSITIONING
    Maybe: Lower price to $2.99, add more premium features
    Don't panic: Engagement > early revenue

ELSE (low_subs AND low_engagement):
    🤔 RETHINK
    Questions: PMF? Target audience? Problem real?
    Action: 20+ user interviews
```

---

## 📝 **Weekly Planning Template**

Usa esto cada domingo para planear la semana:

```markdown
# Week X - [Date]

## 🎯 Goal of the Week
[One sentence: What MUST be done this week?]

## ✅ Tasks (Prioritized)

### Priority 1 (MUST DO)
- [ ] [Task] (Xh)
- [ ] [Task] (Xh)

### Priority 2 (SHOULD DO)
- [ ] [Task] (Xh)
- [ ] [Task] (Xh)

### Priority 3 (NICE TO HAVE)
- [ ] [Task] (Xh)

Total estimated: Xh

## 📅 Time Allocation
- Mon: Xh
- Tue: Xh
- Wed: Xh
- Thu: 0h (OFF)
- Fri: Xh
- Sat: Xh (deep work)
- Sun: Xh

## 🚧 Blockers / Risks
- [Anything that could derail the week]

## 📊 Metrics to Track
- [What you're measuring this week]
```

---

## 🎁 **Bonus: "No Time This Week" Protocol**

**Qué hacer si una semana es muy pesada en el trabajo:**

### **Minimum Viable Week (5-8h)**

**Option A: Maintenance Mode**
- [ ] 2h: Bug fixes
- [ ] 2h: Respond to user feedback
- [ ] 2h: Planning next week
- [ ] 2h: Small polish tasks

**Option B: One Big Thing**
- [ ] 5-8h: Focus en UNA task importante
- [ ] Ignora todo lo demás
- Ejemplo: "Esta semana solo voy a terminar el API endpoint"

**The Rule:** Es mejor hacer POCO bien que mucho mal. No te fuerces.

---

## ✅ **Checklist de Éxito para Part-Time**

- [ ] **Realismo:** Aceptaste que esto tomará 12 semanas, no 8
- [ ] **Buffers:** Planeaste semanas light cuando sea necesario
- [ ] **Energy:** Usas fines de semana para deep work
- [ ] **Momentum:** Trabajas al menos 3 días/semana (no desapareces por semanas)
- [ ] **Focus:** Priorizas ruthlessly (lo importante vs lo urgente)
- [ ] **Health:** Dormís bien, no te quemas
- [ ] **Flexibility:** Si la vida pasa, ajustas sin culpa

---

## 🚀 **Estás Listo**

Este timeline es:
- ✅ **Realista** para part-time después del trabajo
- ✅ **Sostenible** (no te quemas)
- ✅ **Flexible** (vida real tiene prioridad)
- ✅ **Enfocado** (shipping > perfection)

**Recuerda:**
- 12 semanas = 3 meses
- En 3 meses tendrás un producto con revenue
- 99% de la gente no llega a esta etapa
- Vas a lograrlo porque eres realista con tu tiempo

---

**Próximo paso:** Empezar Semana 1 (Analytics + Quick Wins)

**Última actualización:** 2026-02-09
**Timeline:** 12 semanas (2026-02-09 hasta 2026-05-04)
