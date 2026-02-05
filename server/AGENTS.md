# AGENTS.md - Server

Development guidelines for agentic coding agents working in the server directory.

## Project Overview

Hono.js API server running on Cloudflare Workers:
- **Framework**: Hono.js 4.11.7
- **Runtime**: Cloudflare Workers
- **Build Tool**: Wrangler 4.4.0
- **Language**: TypeScript (ESNext, strict mode)

## Build/Lint/Test Commands

```bash
npm run dev        # Start Wrangler dev server (localhost:8787)
npm run deploy     # Deploy to Cloudflare Workers (minified)
npm run cf-typegen # Generate Cloudflare bindings types
```

### Testing (Not Yet Configured)
When adding tests, use Vitest with Hono's test helpers:

```bash
# Add to package.json scripts:
"test": "vitest",
"test:run": "vitest run"

# Run single test:
npm test -- src/routes/quiz.test.ts

# Run tests matching pattern:
npm test -- --grep "should create quiz"
```

### Linting (Not Yet Configured)
When adding ESLint:

```bash
# Add to package.json scripts:
"lint": "eslint src/",
"lint:fix": "eslint src/ --fix"
```

## TypeScript Configuration

- **Target**: ESNext with ES modules
- **Strict mode**: Enabled - no `any` or `@ts-ignore` without justification
- **JSX**: Hono JSX (`jsxImportSource: "hono/jsx"`)
- **Module resolution**: Bundler

## Code Style Guidelines

### Import/Export Patterns

```typescript
// Named imports from hono
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { HTTPException } from 'hono/http-exception'
import { zValidator } from '@hono/zod-validator'

// Type imports
import type { Context, Next } from 'hono'

// Default export for app entry
export default app

// Named exports for routes/middleware
export { userRoutes, authMiddleware }
```

### Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Files | kebab-case | `quiz-routes.ts`, `auth-middleware.ts` |
| Functions | camelCase | `createQuiz`, `validateToken` |
| Constants | UPPER_SNAKE_CASE | `MAX_QUESTIONS`, `API_VERSION` |
| Types/Interfaces | PascalCase | `Quiz`, `UserResponse` |
| Route files | kebab-case | `src/routes/quiz.ts` |

### Route Handlers

```typescript
import { Hono } from 'hono'

const app = new Hono()

// Basic route with context
app.get('/quiz/:id', async (c) => {
  const id = c.req.param('id')
  const query = c.req.query('limit')
  return c.json({ id, limit: query })
})

// POST with JSON body
app.post('/quiz', async (c) => {
  const body = await c.req.json()
  return c.json({ created: true }, 201)
})

// Multiple HTTP methods
app.on(['GET', 'POST'], '/resource', (c) => {
  return c.json({ method: c.req.method })
})

export default app
```

### Middleware Patterns

```typescript
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { timing } from 'hono/timing'
import type { Context, Next } from 'hono'

const app = new Hono()

// Built-in middleware
app.use('*', logger())
app.use('*', timing())
app.use('/api/*', cors({
  origin: ['https://example.com'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE'],
}))

// Custom middleware
const authMiddleware = async (c: Context, next: Next) => {
  const token = c.req.header('Authorization')
  if (!token) {
    return c.json({ error: 'Unauthorized' }, 401)
  }
  await next()
}

app.use('/api/*', authMiddleware)
```

### Input Validation

```typescript
import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'

const createQuizSchema = z.object({
  title: z.string().min(1).max(100),
  questions: z.array(z.object({
    text: z.string(),
    options: z.array(z.string()).min(2).max(6),
    correctIndex: z.number().int().min(0),
  })).min(1),
})

app.post('/quiz',
  zValidator('json', createQuizSchema),
  async (c) => {
    const data = c.req.valid('json')
    // data is fully typed
    return c.json({ id: '123', ...data }, 201)
  }
)
```

### Response Patterns

```typescript
// JSON response
return c.json({ data: result })
return c.json({ error: 'Not found' }, 404)

// Text response
return c.text('Hello World')

// HTML response (with Hono JSX)
return c.html(<div>Hello</div>)

// Redirect
return c.redirect('/new-path')
return c.redirect('/new-path', 301)

// No content
return c.body(null, 204)

// Headers
c.header('X-Custom-Header', 'value')
return c.json({ data })
```

### Error Handling

```typescript
import { Hono } from 'hono'
import { HTTPException } from 'hono/http-exception'

const app = new Hono()

// Throw HTTP exceptions in handlers
app.get('/quiz/:id', async (c) => {
  const quiz = await findQuiz(c.req.param('id'))
  if (!quiz) {
    throw new HTTPException(404, { message: 'Quiz not found' })
  }
  return c.json(quiz)
})

// Global error handler
app.onError((err, c) => {
  console.error('Error:', err)
  if (err instanceof HTTPException) {
    return c.json({ error: err.message }, err.status)
  }
  return c.json({ error: 'Internal server error' }, 500)
})

// 404 handler
app.notFound((c) => {
  return c.json({ error: 'Not found' }, 404)
})
```

## File Organization

Recommended structure as the app grows:

```
server/
├── src/
│   ├── index.ts          # App entry, middleware setup
│   ├── routes/
│   │   ├── index.ts      # Route aggregator
│   │   ├── quiz.ts       # Quiz endpoints
│   │   └── user.ts       # User endpoints
│   ├── middleware/
│   │   ├── auth.ts       # Authentication
│   │   └── validate.ts   # Request validation
│   ├── services/
│   │   ├── quiz.ts       # Quiz business logic
│   │   └── user.ts       # User business logic
│   └── types/
│       └── index.ts      # Shared types
├── wrangler.jsonc
├── package.json
└── tsconfig.json
```

## Testing

When setting up tests, use Vitest with Hono's testing utilities:

```typescript
// src/routes/quiz.test.ts
import { describe, it, expect } from 'vitest'
import app from '../index'

describe('Quiz API', () => {
  it('should return quiz by id', async () => {
    const res = await app.request('/quiz/123')
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.id).toBe('123')
  })

  it('should create a quiz', async () => {
    const res = await app.request('/quiz', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'Test Quiz', questions: [] }),
    })
    expect(res.status).toBe(201)
  })
})
```

## Notes for Agents

1. **Minimal codebase** - only `src/index.ts` exists currently; expect to create new files
2. **Strict TypeScript** - no type suppressions without justification
3. **ES Modules** - use `import`/`export`, not `require`
4. **No path aliases** - use relative imports (`./routes/quiz`)
5. **Hono context** - always use `c` parameter for request/response handling
6. **Environment variables** - use `.dev.vars` for local dev, never commit secrets
7. **Generate types** - run `npm run cf-typegen` after modifying `wrangler.jsonc` bindings
