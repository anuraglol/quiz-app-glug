# AGENTS.md

Development guidelines for agentic coding agents working in this repository.

## Project Overview

Full-stack quiz application:
- **Frontend**: Next.js 16 + React 19, TypeScript, Tailwind CSS v4, shadcn/ui (Base UI + Huge Icons)
- **Backend**: Hono.js on Cloudflare Workers with Wrangler

## Build/Lint/Test Commands

### Frontend (client/)
```bash
npm run dev       # Start Next.js dev server
npm run build     # Production build
npm run start     # Start production server
npm run lint      # Run ESLint
```

### Backend (server/)
```bash
npm run dev        # Start Wrangler dev server
npm run deploy     # Deploy to Cloudflare Workers (minified)
npm run cf-typegen # Generate Cloudflare bindings types
```

### Running Tests
No test framework is currently configured. When adding tests:
- **Frontend**: Use Vitest or Jest with React Testing Library
- **Backend**: Use Vitest or Hono's built-in test helpers
- Single test: `npm test -- path/to/file.test.ts` (once configured)

## Code Style Guidelines

### TypeScript
- **Strict mode enabled** in both frontend and backend
- Frontend: ES2017 target, bundler module resolution
- Backend: ESNext target with Hono JSX support
- Never use type suppressions (`@ts-ignore`, `any`) without justification
- Never add comments unless specified

### Import Patterns
```typescript
// Named imports preferred, type imports explicit
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { Metadata } from "next"

// Path aliases (frontend only)
"@/*" -> "./*"
"@/components/*", "@/lib/*", "@/ui/*" -> respective directories
```

### Export Patterns
```typescript
// Default exports for page components
export default function Page() {}

// Named exports for reusable components and utilities
export { Button, buttonVariants }
export function cn(...inputs: ClassValue[]) {}
```

### Naming Conventions
| Type | Convention | Example |
|------|------------|---------|
| Components | PascalCase | `QuizCard`, `Button` |
| Component files | kebab-case | `quiz-card.tsx` |
| Utility files | kebab-case | `utils.ts` |
| Functions | camelCase | `handleSubmit`, `fetchQuiz` |
| Constants | UPPER_SNAKE_CASE | `MAX_RETRIES` |
| Types/Interfaces | PascalCase | `QuizQuestion`, `UserProps` |

### Component Structure (shadcn/ui pattern)
```typescript
"use client"

import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const componentVariants = cva("base-classes", {
  variants: {
    variant: { default: "...", destructive: "..." },
    size: { default: "...", sm: "..." }
  },
  defaultVariants: { variant: "default", size: "default" }
})

interface ComponentProps extends VariantProps<typeof componentVariants> {
  className?: string
  children: React.ReactNode
}

function Component({ className, variant, size, children, ...props }: ComponentProps) {
  return (
    <div className={cn(componentVariants({ variant, size, className }))} {...props}>
      {children}
    </div>
  )
}

export { Component, componentVariants }
```

### Styling
- Use Tailwind CSS v4 classes
- Use `cn()` utility for conditional/merged classes
- CSS variables enabled for theming (shadcn/ui config)
- Base color: neutral

### Error Handling
```typescript
// Async operations: use try-catch with typed errors
try {
  const data = await fetchData()
} catch (error) {
  if (error instanceof CustomError) {
    // Handle specific error
  }
  throw error
}

// React: use error boundaries for component errors
// Hono: use middleware for API error handling
```

### Backend Patterns (Hono)
```typescript
import { Hono } from 'hono'

const app = new Hono()

// Route handlers use context parameter
app.get('/api/quiz/:id', async (c) => {
  const id = c.req.param('id')
  return c.json({ id })
})

export default app
```

## File Organization

```
client/
├── app/                 # Next.js App Router pages
├── components/
│   ├── ui/             # shadcn/ui components (DO NOT manually edit)
│   └── [feature]/      # Feature-specific components
├── lib/                # Utilities (utils.ts, etc.)
├── hooks/              # Custom React hooks
└── public/             # Static assets

server/
├── src/
│   └── index.ts        # Main entry point
└── wrangler.jsonc      # Cloudflare Workers config
```

## ESLint Configuration

Frontend uses Next.js recommended config with:
- Core Web Vitals rules
- TypeScript rules
- Ignores: `.next/`, `out/`, `build/`

## Key Dependencies

### Frontend
- next@16.1.6, react@19.2.3
- @base-ui/react, shadcn, class-variance-authority
- @hugeicons/react for icons
- tailwindcss@4, tailwind-merge, clsx

### Backend
- hono@4.11.7
- wrangler@4.4.0

## Notes for Agents

1. **No test framework yet** - add Vitest if tests are needed
2. **Strict TypeScript** - no type suppressions allowed
3. **shadcn/ui components** - use existing patterns, don't modify ui/ directly
4. **Server is minimal** - expect significant development needed
5. **Use `"use client"`** directive for interactive components
6. **Path aliases** only work in frontend, not server
