# AGENTS.md

Guidelines for AI agents working in this Next.js repository.

## Project Overview

Next.js 16 + React 19 + TypeScript application for tracking game wipe schedules and events. Uses Biome for linting/formatting, Jest for testing, and Tailwind CSS v4 for styling.

## Build Commands

```bash
# Development
npm run dev              # Start Next.js dev server

# Production
npm run build           # Create production build
npm run start           # Start production server

# Linting & Formatting
npm run lint            # Run Biome linter
npm run format          # Format code with Biome

# Testing
npm run test            # Run all Jest tests
npm run test:watch      # Run tests in watch mode
npm run test:coverage   # Run tests with coverage

# Run single test file
jest src/path/to/file.test.ts

# Run tests matching pattern
jest --testNamePattern="test name"
```

## Code Style Guidelines

### TypeScript

- Enable strict mode - all code must pass TypeScript strict checks
- Use explicit return types on exported functions
- Prefer `type` over `interface` for object shapes
- Use path aliases (`@/*`) instead of relative imports

### Naming Conventions

- **Components**: PascalCase (e.g., `EventCalendar`, `GameGrid`)
- **Files**: kebab-case for pages (`calendar/page.tsx`), camelCase for utilities
- **Types/Interfaces**: PascalCase with descriptive names
- **Constants**: UPPER_SNAKE_CASE with `as const` assertion
- **Hooks**: camelCase starting with `use` (e.g., `useGameData`)
- **Boolean props**: Prefix with verb (e.g., `isLoading`, `hasError`)

### Imports

```typescript
// 1. External libraries
import Link from "next/link";
import { useState, useEffect } from "react";
import { CalendarCheck } from "lucide-react";

// 2. Internal components (path alias)
import { EventCalendar } from "@/components/event-calendar";

// 3. Internal types/utilities
import type { GameEvent } from "@/lib/events/types";
import { formatDate } from "@/utils/date";
```

### Formatting (Biome)

- Indent: 2 spaces
- Line width: default (80)
- Semicolons: required
- Quotes: double
- Trailing commas: default
- Organize imports: enabled

### Component Patterns

```typescript
// Use "use client" only when necessary
"use client";

// Type props interface
interface GameCardProps {
  game: Game;
  isLoading?: boolean;
}

// Export default function
export default function GameCard({ game, isLoading }: GameCardProps) {
  // Component logic
}
```

### Error Handling

```typescript
try {
  const data = await fetchData();
  setData(data);
} catch (error) {
  console.error("Failed to fetch data:", error);
  setError(error instanceof Error ? error.message : "Unknown error");
}
```

### Testing Conventions

- Test files: `*.test.ts` or `*.test.tsx` alongside source files
- Test environment: jsdom
- Use `@testing-library/react` for component tests
- Use `@testing-library/jest-dom` for assertions

## Data Flow

### Server vs Client Components

- **Server Components** (default): Fetch data directly, no "use client"
- **Client Components**: Use when you need useState, useEffect, or browser APIs
- Mark client components with `"use client"` at the top

```typescript
// Server Component - fetch directly
export default async function GamePage() {
  const data = await fetchGameData(); // Runs on server
  return <GameCard data={data} />;
}

// Client Component - use hooks
"use client";
export default function GameCard({ data }: { data: GameData }) {
  const [loading, setLoading] = useState(false);
  // ...
}
```

### Data Fetching Patterns

**Server Components:**
```typescript
async function GameList() {
  const games = await db.query("SELECT * FROM games");
  return <ul>{games.map(g => <li key={g.id}>{g.name}</li>)}</ul>;
}
```

**Client Components with TanStack Query:**
```typescript
"use client";
import { useQuery } from "@tanstack/react-query";

function GameList() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["games"],
    queryFn: () => fetch("/api/games").then(res => res.json()),
  });
  
  if (isLoading) return <Loading />;
  if (error) return <Error message={error.message} />;
  return <ul>{data.map(g => <li key={g.id}>{g.name}</li>)}</ul>;
}
```

### API Routes

Create API endpoints in `app/api/`:

```typescript
// app/api/games/route.ts
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const games = await fetchGames();
    return NextResponse.json(games);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch games" },
      { status: 500 }
    );
  }
}
```

### Validation with Zod

Always validate external data:

```typescript
import { z } from "zod";

const GameSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  nextWipe: z.string().datetime().optional(),
});

// In API route
export async function POST(request: Request) {
  const body = await request.json();
  const result = GameSchema.safeParse(body);
  
  if (!result.success) {
    return NextResponse.json(
      { error: result.error.format() },
      { status: 400 }
    );
  }
  
  // result.data is now typed
  await saveGame(result.data);
  return NextResponse.json({ success: true });
}
```

### Caching Strategy

- **Server Components**: Use `unstable_cache` or `React.cache()` for request deduplication
- **TanStack Query**: Configures automatic caching and refetching
- **API Routes**: Use Next.js `revalidate` for ISR when appropriate

```typescript
// Cache server data
import { unstable_cache } from "next/cache";

const getCachedGames = unstable_cache(
  async () => fetchGames(),
  ["games"],
  { revalidate: 60 } // 60 seconds
);
```

## Project Structure

```
src/
  app/           # Next.js App Router pages
  components/    # Reusable React components
  hooks/         # Custom React hooks
  lib/           # Utility libraries
  schemas/       # Zod validation schemas
  types/         # TypeScript type definitions
  utils/         # Helper functions
```

## Key Dependencies

- Next.js 16, React 19, TypeScript 5
- Tailwind CSS v4 + PostCSS
- Biome 2.2 (linting/formatting)
- Jest 30 + Testing Library
- Zod (validation)
- TanStack Query (data fetching)
