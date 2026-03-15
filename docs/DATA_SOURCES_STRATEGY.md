# NextWipeTime - Fuentes de Datos y Estrategia de Scraping

**Fecha:** 2026-02-09
**Objetivo:** Mapear todas las fuentes de datos oficiales y comunitarias para obtener información de wipes/seasons/resets

---

## 📋 Índice

1. [Fuentes Oficiales por Juego](#1-fuentes-oficiales-por-juego)
2. [Reddit (Subreddits)](#2-reddit-subreddits)
3. [Twitter/X.com](#3-twitterxcom)
4. [Wikis y Bases de Datos](#4-wikis-y-bases-de-datos)
5. [Foros Oficiales](#5-foros-oficiales)
6. [APIs Oficiales](#6-apis-oficiales)
7. [Estrategia de Scraping con Firecrawl](#7-estrategia-de-scraping-con-firecrawl)
8. [Priorización de Fuentes](#8-priorización-de-fuentes)

---

# 1. Fuentes Oficiales por Juego

## 🎮 Rust

### Sitio Oficial
- **URL:** https://rust.facepunch.com/blog
- **Tipo:** Blog oficial con anuncios de updates
- **Frecuencia:** Mensual (primer jueves)
- **Firecrawl Strategy:**
  ```python
  doc = app.scrape(
      url="https://rust.facepunch.com/blog",
      formats=["markdown", "json"],
      json_options={
          "prompt": "Extract the most recent wipe date announcement and next scheduled wipe"
      }
  )
  ```

### Twitter Oficial
- **URL:** https://twitter.com/playrust
- **Handle:** @playrust
- **Contenido:** Anuncios de wipes, patches

### Reddit
- **URL:** https://reddit.com/r/playrust
- **Subs:** 500K+
- **Contenido:** Wipe discussions, leaks, community announcements

---

## 🔫 Escape from Tarkov

### Sitio Oficial
- **URL:** https://www.escapefromtarkov.com/news
- **Tipo:** News page oficial
- **Frecuencia:** Irregular (6-9 meses)
- **Firecrawl Strategy:**
  ```python
  doc = app.scrape(
      url="https://www.escapefromtarkov.com/news",
      formats=["markdown"],
      only_main_content=True
  )
  # Parse for "wipe" keywords
  ```

### Twitter Oficial
- **URL:** https://twitter.com/bstategames
- **Handle:** @bstategames
- **Contenido:** Wipe announcements (usually 24-48h before)

### Reddit
- **URL:** https://reddit.com/r/EscapefromTarkov
- **Subs:** 1M+
- **Contenido:** Wipe hype threads, datamines, BSG employee hints

### Forum Oficial
- **URL:** https://forum.escapefromtarkov.com/
- **Contenido:** Official announcements

---

## 🗡️ Path of Exile

### Sitio Oficial
- **URL:** https://www.pathofexile.com/news
- **Tipo:** News feed con league announcements
- **Frecuencia:** ~13 semanas (3-4 meses)
- **Firecrawl Strategy:**
  ```python
  doc = app.search(
      query="site:pathofexile.com league announcement",
      limit=5,
      scrape_options={
          "formats": ["markdown"],
          "only_main_content": True
      }
  )
  ```

### Twitter Oficial
- **URL:** https://twitter.com/pathofexile
- **Handle:** @pathofexile
- **Contenido:** League teasers, exact dates

### Reddit
- **URL:** https://reddit.com/r/pathofexile
- **Subs:** 800K+
- **Contenido:** League discussions, patch notes analysis

---

## 🎮 Path of Exile 2

### Sitio Oficial
- **URL:** https://www.pathofexile.com/poe2
- **Tipo:** Dedicated PoE2 news section
- **Frecuencia:** Early Access (nueva IP)
- **Firecrawl Strategy:**
  ```python
  doc = app.scrape(
      url="https://www.pathofexile.com/poe2",
      formats=["json"],
      json_options={
          "prompt": "Extract current league/season info and next release date"
      }
  )
  ```

---

## 🎯 Fortnite

### Sitio Oficial
- **URL:** https://www.fortnite.com/news
- **Tipo:** News feed
- **Frecuencia:** ~10 semanas por season
- **Firecrawl Strategy:**
  ```python
  doc = app.scrape(
      url="https://www.fortnite.com/news",
      formats=["markdown"],
      wait_for=5000  # JS-heavy site
  )
  ```

### Twitter Oficial
- **URL:** https://twitter.com/FortniteGame
- **Handle:** @FortniteGame
- **Contenido:** Season announcements

### Fortnite Status (API-like)
- **URL:** https://status.epicgames.com/
- **Tipo:** Downtime announcements (usually pre-season)

---

## 🔫 Valorant

### Sitio Oficial
- **URL:** https://playvalorant.com/en-us/news/
- **Tipo:** News feed
- **Frecuencia:** ~2 meses por Act, 6 meses por Episode
- **Firecrawl Strategy:**
  ```python
  doc = app.search(
      query="site:playvalorant.com act episode announcement",
      limit=3
  )
  ```

### Twitter Oficial
- **URL:** https://twitter.com/valorant
- **Handle:** @valorant
- **Contenido:** Act/Episode dates

### Valorant Fandom Wiki
- **URL:** https://valorant.fandom.com/wiki/Episode
- **Tipo:** Community-maintained timeline
- **Contenido:** Historical data + upcoming

---

## 🎮 League of Legends

### Sitio Oficial
- **URL:** https://www.leagueoflegends.com/en-us/news/
- **Tipo:** News feed
- **Frecuencia:** Annual seasons + mid-season updates

### Twitter Oficial
- **URL:** https://twitter.com/LeagueOfLegends
- **Handle:** @LeagueOfLegends

### Reddit
- **URL:** https://reddit.com/r/leagueoflegends
- **Subs:** 7M+

---

## ♟️ Teamfight Tactics

### Reddit
- **URL:** https://reddit.com/r/TeamfightTactics
- **Subs:** 500K+
- **Contenido:** Set releases, patch discussions

---

## 🎮 Diablo 4

### Sitio Oficial
- **URL:** https://news.blizzard.com/en-us/diablo4
- **Tipo:** Blizzard News
- **Frecuencia:** ~3 meses por season
- **Firecrawl Strategy:**
  ```python
  doc = app.scrape(
      url="https://news.blizzard.com/en-us/diablo4",
      formats=["markdown", "json"],
      json_options={
          "prompt": "Extract season number, start date, and theme"
      }
  )
  ```

### Twitter Oficial
- **URL:** https://twitter.com/Diablo
- **Handle:** @Diablo

### Reddit
- **URL:** https://reddit.com/r/diablo4
- **Subs:** 500K+

---

## 🎮 Apex Legends

### Sitio Oficial
- **URL:** https://www.ea.com/games/apex-legends/news
- **Tipo:** EA News
- **Frecuencia:** ~3 meses por season

### Twitter Oficial
- **URL:** https://twitter.com/PlayApex
- **Handle:** @PlayApex

### Reddit
- **URL:** https://reddit.com/r/apexlegends
- **Subs:** 3M+

---

## 🎮 Destiny 2

### Sitio Oficial
- **URL:** https://www.bungie.net/7/en/News
- **Tipo:** This Week at Bungie (TWAB)
- **Frecuencia:** Weekly updates, seasonal info

### Twitter Oficial
- **URL:** https://twitter.com/DestinyTheGame
- **Handle:** @DestinyTheGame

### Reddit
- **URL:** https://reddit.com/r/DestinyTheGame
- **Subs:** 3M+

---

## 🎮 Overwatch 2

### Sitio Oficial
- **URL:** https://overwatch.blizzard.com/en-us/news/
- **Tipo:** Blizzard News
- **Frecuencia:** ~2 meses por season

### Twitter Oficial
- **URL:** https://twitter.com/PlayOverwatch
- **Handle:** @PlayOverwatch

---

## 🎮 Warframe

### Sitio Oficial
- **URL:** https://www.warframe.com/news
- **Tipo:** News feed
- **Frecuencia:** Major updates ~3-4 meses

### Twitter Oficial
- **URL:** https://twitter.com/PlayWarframe
- **Handle:** @PlayWarframe

### Reddit
- **URL:** https://reddit.com/r/Warframe
- **Subs:** 1M+

---

## 🎮 Dead by Daylight

### Sitio Oficial
- **URL:** https://deadbydaylight.com/news
- **Tipo:** News feed
- **Frecuencia:** ~3 meses por chapter

### Twitter Oficial
- **URL:** https://twitter.com/DeadByBHVR
- **Handle:** @DeadByBHVR

---

## 🚗 Rocket League

### Sitio Oficial
- **URL:** https://www.rocketleague.com/news/
- **Tipo:** News feed
- **Frecuencia:** Seasons ~3 meses

### Twitter Oficial
- **URL:** https://twitter.com/RocketLeague
- **Handle:** @RocketLeague

---

## 🔫 Rainbow Six Siege

### Sitio Oficial
- **URL:** https://www.ubisoft.com/en-us/game/rainbow-six/siege/news-updates
- **Tipo:** News feed
- **Frecuencia:** ~3 meses por season

### Twitter Oficial
- **URL:** https://twitter.com/Rainbow6Game
- **Handle:** @Rainbow6Game

### Reddit
- **URL:** https://reddit.com/r/Rainbow6
- **Subs:** 3M+

---

## 🎮 Last Epoch

### Sitio Oficial
- **URL:** https://forum.lastepoch.com/
- **Tipo:** Forum oficial
- **Frecuencia:** Cycles ~3-4 meses

### Twitter Oficial
- **URL:** https://twitter.com/LastEpochGame
- **Handle:** @LastEpochGame

### Reddit
- **URL:** https://reddit.com/r/LastEpoch
- **Subs:** 100K+

---

## 🎮 Call of Duty (Black Ops 6, MW3, Warzone)

### Sitio Oficial
- **URL:** https://www.callofduty.com/blog
- **Tipo:** Official blog
- **Frecuencia:** Seasons ~2 meses

### Twitter Oficial
- **URL:** https://twitter.com/CallofDuty
- **Handle:** @CallofDuty

### Reddit
- **URL:** https://reddit.com/r/blackops6
- **URL:** https://reddit.com/r/ModernWarfareIII
- **URL:** https://reddit.com/r/CODWarzone

---

## 🎮 PUBG

### Sitio Oficial
- **URL:** https://pubg.com/news
- **Tipo:** News feed
- **Frecuencia:** Seasons ~2-3 meses

### Steam News
- **URL:** https://store.steampowered.com/news/app/578080
- **Tipo:** Steam news feed

### Twitter Oficial
- **URL:** https://twitter.com/PUBG
- **Handle:** @PUBG

---

# 2. Reddit (Subreddits)

## Top Gaming Subreddits para Wipe Info

| Subreddit | URL | Subs | Juegos |
|-----------|-----|------|--------|
| /r/playrust | https://reddit.com/r/playrust | 500K+ | Rust |
| /r/EscapefromTarkov | https://reddit.com/r/EscapefromTarkov | 1M+ | Tarkov |
| /r/pathofexile | https://reddit.com/r/pathofexile | 800K+ | PoE, PoE2 |
| /r/FortNiteBR | https://reddit.com/r/FortNiteBR | 3M+ | Fortnite |
| /r/VALORANT | https://reddit.com/r/VALORANT | 2M+ | Valorant |
| /r/leagueoflegends | https://reddit.com/r/leagueoflegends | 7M+ | LoL |
| /r/TeamfightTactics | https://reddit.com/r/TeamfightTactics | 500K+ | TFT |
| /r/diablo4 | https://reddit.com/r/diablo4 | 500K+ | Diablo 4 |
| /r/apexlegends | https://reddit.com/r/apexlegends | 3M+ | Apex |
| /r/DestinyTheGame | https://reddit.com/r/DestinyTheGame | 3M+ | Destiny 2 |

### Firecrawl Strategy para Reddit

```python
# Option 1: Search recent posts
results = app.search(
    query="site:reddit.com/r/playrust wipe announcement",
    limit=5,
    tbs="qdr:w"  # Past week
)

# Option 2: Scrape subreddit directly (risky - rate limits)
doc = app.scrape(
    url="https://reddit.com/r/playrust/top/?t=week",
    formats=["markdown"],
    stealth=True,  # Reddit has bot detection
    wait_for=3000
)
```

**IMPORTANTE: Reddit API es mejor opción**
- Reddit tiene API oficial gratuita: https://www.reddit.com/dev/api/
- Rate limits: 60 requests/min
- Más confiable que scraping

```python
# Using PRAW (Python Reddit API Wrapper)
import praw

reddit = praw.Reddit(
    client_id="YOUR_CLIENT_ID",
    client_secret="YOUR_SECRET",
    user_agent="NextWipeTime/1.0"
)

# Get hot posts from /r/playrust
for post in reddit.subreddit("playrust").hot(limit=10):
    if "wipe" in post.title.lower():
        print(f"{post.title} - {post.url}")
```

---

# 3. Twitter/X.com

## Cuentas Oficiales por Juego

| Juego | Handle | URL | Followers |
|-------|--------|-----|-----------|
| Rust | @playrust | https://twitter.com/playrust | 500K+ |
| Tarkov | @bstategames | https://twitter.com/bstategames | 300K+ |
| Path of Exile | @pathofexile | https://twitter.com/pathofexile | 800K+ |
| Fortnite | @FortniteGame | https://twitter.com/FortniteGame | 30M+ |
| Valorant | @valorant | https://twitter.com/valorant | 10M+ |
| League of Legends | @LeagueOfLegends | https://twitter.com/LeagueOfLegends | 15M+ |
| Diablo | @Diablo | https://twitter.com/Diablo | 1M+ |
| Apex Legends | @PlayApex | https://twitter.com/PlayApex | 5M+ |
| Destiny | @DestinyTheGame | https://twitter.com/DestinyTheGame | 3M+ |
| Overwatch | @PlayOverwatch | https://twitter.com/PlayOverwatch | 4M+ |

### Firecrawl Strategy para Twitter

**PROBLEMA:** Twitter/X.com es MUY difícil de scrapear:
- Requiere login para ver tweets
- Rate limits agresivos
- JS-heavy rendering

**MEJOR OPCIÓN:** Twitter API v2
- **URL:** https://developer.twitter.com/en/docs/twitter-api
- **Costo:** Free tier (1,500 tweets/mes)
- **Elevated:** $100/mes (50,000 tweets/mes)

```python
# Using Tweepy (Twitter API wrapper)
import tweepy

client = tweepy.Client(bearer_token="YOUR_BEARER_TOKEN")

# Get recent tweets from @playrust
tweets = client.get_users_tweets(
    id="playrust_user_id",
    max_results=10,
    tweet_fields=["created_at", "text"]
)

for tweet in tweets.data:
    if "wipe" in tweet.text.lower():
        print(f"{tweet.created_at}: {tweet.text}")
```

**ALTERNATIVA:** Usar Firecrawl Agent (experimental)
```python
result = app.agent(
    prompt="Find the latest wipe announcement from @playrust on Twitter",
    model="spark-1-pro"
)
```

---

# 4. Wikis y Bases de Datos

## Wikis por Juego

### Rust Wiki
- **URL:** https://rust.fandom.com/wiki/Rust_Wiki
- **Contenido:** Wipe schedule, historical data
- **Scraping:**
  ```python
  doc = app.scrape(
      url="https://rust.fandom.com/wiki/Wipe",
      formats=["markdown"],
      only_main_content=True
  )
  ```

### Tarkov Wiki
- **URL:** https://escapefromtarkov.fandom.com/wiki/Escape_from_Tarkov_Wiki
- **Contenido:** Wipe history, upcoming info
- **Scraping:** Similar a Rust

### Path of Exile Wiki
- **URL:** https://www.poewiki.net/wiki/League
- **Contenido:** League timeline, historical dates
- **Scraping:**
  ```python
  doc = app.scrape(
      url="https://www.poewiki.net/wiki/League",
      formats=["json"],
      json_options={
          "prompt": "Extract all league names, start dates, and end dates"
      }
  )
  ```

### Valorant Wiki
- **URL:** https://valorant.fandom.com/wiki/Episode
- **Contenido:** Episode/Act timeline
- **Scraping:** Similar

### Fortnite Wiki
- **URL:** https://fortnite.fandom.com/wiki/Battle_Pass
- **Contenido:** Season history

---

# 5. Foros Oficiales

## Foros por Juego

### Escape from Tarkov Forum
- **URL:** https://forum.escapefromtarkov.com/
- **Secciones:**
  - News & Announcements
  - Patch Notes
- **Scraping:**
  ```python
  doc = app.crawl(
      url="https://forum.escapefromtarkov.com/forum/26-news-announcements/",
      limit=10,
      scrape_options={
          "formats": ["markdown"],
          "only_main_content": True
      }
  )
  ```

### Last Epoch Forum
- **URL:** https://forum.lastepoch.com/
- **Secciones:**
  - Announcements
  - Patch Notes
- **Scraping:** Similar a Tarkov

### Warframe Forum
- **URL:** https://forums.warframe.com/
- **Secciones:**
  - News & Announcements
  - Update Notes

---

# 6. APIs Oficiales

## APIs Disponibles

### Steam Web API
- **URL:** https://steamcommunity.com/dev
- **Uso:** Game news, player counts, updates
- **Endpoints:**
  - `ISteamNews/GetNewsForApp` - News feed para un juego
  - `ISteamUser/GetPlayerSummaries` - Player stats

```python
import requests

APP_ID = "252490"  # Rust
API_KEY = "YOUR_STEAM_API_KEY"

response = requests.get(
    f"https://api.steampowered.com/ISteamNews/GetNewsForApp/v2/",
    params={
        "appid": APP_ID,
        "count": 10,
        "maxlength": 300
    }
)

news = response.json()
for item in news["appnews"]["newsitems"]:
    print(f"{item['title']} - {item['url']}")
```

### Riot Games API (Valorant, LoL, TFT)
- **URL:** https://developer.riotgames.com/
- **Uso:** Match history, player stats
- **Limitación:** NO tiene endpoints de seasons/acts (necesitas scraping)

### Bungie API (Destiny 2)
- **URL:** https://bungie-net.github.io/multi/
- **Uso:** Inventory, stats, milestones
- **Endpoints:**
  - `/Destiny2/Manifest/` - Game definitions
  - `/Destiny2/{membershipType}/Profile/{destinyMembershipId}/` - Player profile

### Epic Games Store API (Fortnite)
- **URL:** No official public API
- **Alternativa:** Fortnite-API.com (community)
  - https://fortnite-api.com/
  - Endpoints: Seasons, cosmetics, stats

---

# 7. Estrategia de Scraping con Firecrawl

## 7.1 Scraping por Tipo de Fuente

### A) Sitios Oficiales de Juegos

**Características:**
- JS-heavy (React, Next.js)
- SEO-optimized (server-rendered)
- Actualizados frecuentemente

**Firecrawl Strategy:**
```python
from firecrawl import Firecrawl
import os

app = Firecrawl(api_key=os.environ.get("FIRECRAWL_API_KEY"))

# Strategy 1: Scrape latest news
doc = app.scrape(
    url="https://rust.facepunch.com/blog",
    formats=["markdown", "json"],
    only_main_content=True,
    wait_for=3000,  # Wait for JS
    json_options={
        "prompt": "Extract the title, date, and summary of the most recent blog post about game updates or wipes"
    }
)

print(f"Latest post: {doc.json['title']}")
print(f"Date: {doc.json['date']}")
```

**Caching Strategy:**
```python
# Cache for 1 hour (news changes frequently)
doc = app.scrape(
    url="https://rust.facepunch.com/blog",
    formats=["markdown"],
    max_age=3600000,  # 1 hour in milliseconds
    store_in_cache=True
)
```

---

### B) Reddit Subreddits

**Características:**
- Require auth para scraping completo
- Rate limits estrictos
- Contenido user-generated (menos confiable)

**MEJOR OPCIÓN: Reddit API**

```python
import praw

reddit = praw.Reddit(
    client_id=os.environ.get("REDDIT_CLIENT_ID"),
    client_secret=os.environ.get("REDDIT_CLIENT_SECRET"),
    user_agent="NextWipeTime/1.0"
)

def get_wipe_posts(subreddit_name: str, limit: int = 10):
    subreddit = reddit.subreddit(subreddit_name)
    wipe_posts = []

    for post in subreddit.hot(limit=limit):
        if any(keyword in post.title.lower() for keyword in ["wipe", "reset", "season", "patch"]):
            wipe_posts.append({
                "title": post.title,
                "url": post.url,
                "score": post.score,
                "created": post.created_utc,
                "text": post.selftext
            })

    return wipe_posts

# Usage
rust_posts = get_wipe_posts("playrust")
```

**Firecrawl como Fallback:**
```python
# Si Reddit API falla
doc = app.scrape(
    url="https://old.reddit.com/r/playrust/top/?t=week",
    formats=["markdown"],
    stealth=True,  # Avoid bot detection
    wait_for=5000
)
```

---

### C) Twitter/X.com

**Características:**
- Requiere auth obligatorio
- Rate limits muy estrictos
- Rendering JS complejo

**MEJOR OPCIÓN: Twitter API v2**

```python
import tweepy

client = tweepy.Client(bearer_token=os.environ.get("TWITTER_BEARER_TOKEN"))

def get_recent_tweets(username: str, max_results: int = 10):
    # Get user ID
    user = client.get_user(username=username)
    user_id = user.data.id

    # Get recent tweets
    tweets = client.get_users_tweets(
        id=user_id,
        max_results=max_results,
        tweet_fields=["created_at", "text", "public_metrics"]
    )

    return [
        {
            "text": tweet.text,
            "created_at": tweet.created_at,
            "likes": tweet.public_metrics["like_count"]
        }
        for tweet in tweets.data
    ]

# Usage
rust_tweets = get_recent_tweets("playrust")
```

**Costo:** Twitter API Free Tier = 1,500 tweets/mes (suficiente para 20 juegos × 10 tweets/mes = 200 tweets/mes)

---

### D) Wikis (Fandom, Community)

**Características:**
- Estáticos o semi-estáticos
- Ads pesados
- Tablas estructuradas

**Firecrawl Strategy:**
```python
doc = app.scrape(
    url="https://rust.fandom.com/wiki/Wipe",
    formats=["markdown", "json"],
    only_main_content=True,
    remove_base64_images=True,  # Remove ads
    json_options={
        "schema": {
            "type": "object",
            "properties": {
                "wipe_schedule": {"type": "string"},
                "last_wipe": {"type": "string"},
                "next_wipe": {"type": "string"}
            }
        }
    }
)
```

**Caching Strategy:**
```python
# Wikis change slowly - cache for 24 hours
doc = app.scrape(
    url="https://rust.fandom.com/wiki/Wipe",
    formats=["markdown"],
    max_age=86400000,  # 24 hours
    store_in_cache=True
)
```

---

### E) Foros Oficiales

**Características:**
- Paginados
- Auth a veces requerido
- Contenido oficial pero disperso

**Firecrawl Strategy:**
```python
# Strategy 1: Crawl announcements section
result = app.crawl(
    url="https://forum.escapefromtarkov.com/forum/26-news-announcements/",
    limit=20,
    max_depth=1,  # Only first level
    scrape_options={
        "formats": ["markdown"],
        "only_main_content": True
    }
)

for page in result.data:
    if "wipe" in page.markdown.lower():
        print(f"Found wipe mention: {page.metadata.source_url}")

# Strategy 2: Search specific threads
doc = app.search(
    query="site:forum.escapefromtarkov.com wipe announcement",
    limit=5
)
```

---

## 7.2 Estrategia de Prioridad

### Orden de Scraping (Cascade Model)

```python
async def get_wipe_data(game_id: str) -> WipeData:
    """
    Cascade scraping: Try sources in order of reliability
    """

    # TIER 1: Calculated (if game has predictable schedule)
    if game_id == "rust":
        return calculate_rust_wipe()  # Instant, free

    # TIER 2: Official API (if available)
    try:
        return await scrape_official_api(game_id)
    except Exception as e:
        print(f"API failed: {e}")

    # TIER 3: Official website scraping
    try:
        return await scrape_official_site(game_id)
    except Exception as e:
        print(f"Website scraping failed: {e}")

    # TIER 4: Community sources (Reddit, Twitter)
    try:
        return await scrape_community_sources(game_id)
    except Exception as e:
        print(f"Community scraping failed: {e}")

    # TIER 5: Fallback data
    return get_fallback_data(game_id)
```

---

## 7.3 Caching Strategy por Fuente

| Fuente | TTL (Cache) | Reasoning |
|--------|-------------|-----------|
| **Official sites** | 1 hora | News updates frecuentemente |
| **Wikis** | 24 horas | Cambian lentamente |
| **Reddit** | 30 min | Posts nuevos constantemente |
| **Twitter** | 15 min | Tweets en tiempo real |
| **APIs** | 1 hora | Datos oficiales, cambian poco |
| **Calculated** | No cache | Instant compute |

```python
# Example: Tiered caching
from functools import lru_cache
from datetime import datetime, timedelta

class CachedScraper:
    def __init__(self):
        self.cache = {}

    def get_cached(self, key: str, ttl_seconds: int):
        if key in self.cache:
            data, timestamp = self.cache[key]
            if datetime.now() - timestamp < timedelta(seconds=ttl_seconds):
                print(f"✅ Cache HIT: {key}")
                return data

        print(f"❌ Cache MISS: {key}")
        return None

    def set_cached(self, key: str, data: any):
        self.cache[key] = (data, datetime.now())

# Usage
scraper = CachedScraper()

def scrape_with_cache(game_id: str, source: str):
    cache_key = f"{game_id}:{source}"

    # Try cache first
    cached = scraper.get_cached(cache_key, ttl_seconds=3600)
    if cached:
        return cached

    # Scrape if not cached
    data = firecrawl_scrape(game_id, source)
    scraper.set_cached(cache_key, data)

    return data
```

---

## 7.4 Error Handling & Retry Logic

```python
import asyncio
from typing import Optional

async def scrape_with_retry(
    url: str,
    max_retries: int = 3,
    backoff_factor: int = 2
) -> Optional[dict]:
    """
    Retry scraping with exponential backoff
    """
    for attempt in range(max_retries):
        try:
            doc = app.scrape(
                url=url,
                formats=["markdown"],
                timeout=30000
            )
            return doc

        except Exception as e:
            if attempt == max_retries - 1:
                print(f"❌ All retries failed for {url}")
                return None

            delay = backoff_factor ** attempt
            print(f"⚠️  Retry {attempt + 1}/{max_retries} after {delay}s")
            await asyncio.sleep(delay)

    return None
```

---

## 7.5 Cost Optimization

### Firecrawl Credits por Operación

| Operation | Credits | Use Case |
|-----------|---------|----------|
| **Scrape (basic)** | 1 | Official sites |
| **Scrape (stealth)** | 5 | Protected sites (Reddit, Twitter) |
| **Crawl** | 1 per page | Forums, wiki sections |
| **Search** | 2 per 10 results | Finding announcements |
| **Extract** | 5 per page | Structured data |
| **Agent** | Variable | Complex research |

### Cost-Effective Strategy

```python
# Example: 20 juegos × 1 scrape/hour × 24 hours = 480 scrapes/day
# Cost: 480 credits/day = 14,400 credits/month

# Hobby tier: 3,000 credits/month = NOT ENOUGH
# Standard tier: 100,000 credits/month = PLENTY

# Optimization: Cache + Smart refresh
# - Scrape official sites every 6 hours (not every hour)
# - 20 juegos × 4 scrapes/day = 80 scrapes/day = 2,400 credits/month
# Result: Hobby tier is sufficient! ✅
```

---

# 8. Priorización de Fuentes

## Matriz de Prioridad

| Juego | Tier 1 (Preferido) | Tier 2 (Backup) | Tier 3 (Fallback) |
|-------|-------------------|-----------------|-------------------|
| **Rust** | Calculated | Official blog | Reddit |
| **Tarkov** | Official news | Reddit | Forum |
| **PoE** | Official news | Reddit | Wiki |
| **PoE2** | Official news | Reddit | Twitter |
| **Fortnite** | Official news | Twitter | Wiki |
| **Valorant** | Official news | Wiki | Reddit |
| **LoL** | Official news | Wiki | Reddit |
| **TFT** | Official news | Reddit | - |
| **Diablo 4** | Official news | Reddit | Twitter |
| **Apex** | Official news | Reddit | Wiki |
| **Destiny 2** | Bungie API | Official news | Reddit |
| **Overwatch 2** | Official news | Twitter | - |
| **Warframe** | Official news | Reddit | Forum |
| **Dead by Daylight** | Official news | Reddit | - |
| **Rocket League** | Official news | Twitter | - |
| **Rainbow Six Siege** | Official news | Reddit | - |
| **Last Epoch** | Forum | Reddit | - |
| **CoD (all)** | Official blog | Reddit | Twitter |
| **PUBG** | Steam news | Official news | - |

---

## Implementation Example

```python
# scrapers/configs/rust.config.ts
export const rustConfig: GameScraperConfig = {
  id: "rust",
  name: "Rust",
  strategy: "calculated",  // Tier 1

  // Tier 2 fallback
  fallbackSources: [
    {
      type: "firecrawl",
      url: "https://rust.facepunch.com/blog",
      formats: ["markdown", "json"],
      jsonPrompt: "Extract latest wipe announcement"
    },
    {
      type: "reddit",
      subreddit: "playrust",
      searchKeywords: ["wipe", "announcement"]
    }
  ],

  // Tier 3 static fallback
  fallbackData: {
    frequency: "Monthly (First Thursday at 7PM UTC)",
    announcement: "Rust wipes on the first Thursday of each month"
  }
};
```

---

## Resumen de URLs Críticas

### Sitios Oficiales (Alta prioridad)
```
https://rust.facepunch.com/blog
https://www.escapefromtarkov.com/news
https://www.pathofexile.com/news
https://www.fortnite.com/news
https://playvalorant.com/en-us/news/
https://www.leagueoflegends.com/en-us/news/
https://news.blizzard.com/en-us/diablo4
https://www.ea.com/games/apex-legends/news
https://www.bungie.net/7/en/News
https://overwatch.blizzard.com/en-us/news/
https://www.warframe.com/news
https://deadbydaylight.com/news
https://www.rocketleague.com/news/
https://www.ubisoft.com/en-us/game/rainbow-six/siege/news-updates
https://forum.lastepoch.com/
https://www.callofduty.com/blog
https://pubg.com/news
```

### APIs (Máxima prioridad si disponible)
```
Steam API: https://api.steampowered.com/
Reddit API: https://www.reddit.com/dev/api/
Twitter API: https://developer.twitter.com/en/docs/twitter-api
Bungie API: https://bungie-net.github.io/multi/
```

### Wikis (Datos históricos)
```
https://rust.fandom.com/wiki/Rust_Wiki
https://escapefromtarkov.fandom.com/wiki/
https://www.poewiki.net/wiki/League
https://valorant.fandom.com/wiki/Episode
https://fortnite.fandom.com/wiki/Battle_Pass
```

---

## Próximos Pasos

1. **Implementar Reddit API integration** (más confiable que scraping)
2. **Setup Twitter API** (Free tier suficiente para 20 juegos)
3. **Configurar Firecrawl** para sitios oficiales con caching inteligente
4. **Crear scraper monitor** para detectar fuentes rotas
5. **Build fallback cascade** (Tier 1 → Tier 2 → Tier 3)

---

**Última actualización:** 2026-02-09
**Próxima revisión:** Después de implementar APIs de Reddit y Twitter
