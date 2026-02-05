# Database & Authentication Setup

This guide walks you through setting up the PostgreSQL database (Neon) and authentication (better-auth).

## Prerequisites

- [Bun](https://bun.sh) installed
- A [Neon](https://neon.tech) account (free tier available)
- A [Google Cloud Console](https://console.cloud.google.com) project for OAuth

---

## 1. Neon Database Setup

### Create a Neon Project

1. Go to [Neon Console](https://console.neon.tech)
2. Click **"New Project"**
3. Choose a project name (e.g., `quiz-app`)
4. Select a region close to your users
5. Click **"Create Project"**

### Get the Connection String

1. After creation, you'll see your connection details
2. Copy the **Connection string** (it looks like):
   ```
   postgresql://user:password@ep-xxx-123456.us-east-2.aws.neon.tech/neondb?sslmode=require
   ```
3. Save this - you'll need it for both server and client

---

## 2. Google OAuth Setup

### Create OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select an existing one
3. Navigate to **APIs & Services > Credentials**
4. Click **"Create Credentials" > "OAuth client ID"**
5. If prompted, configure the OAuth consent screen:
   - User Type: **External**
   - App name: `Quiz App`
   - User support email: Your email
   - Developer contact: Your email
   - Save and continue through scopes (default is fine)
   - Add test users if in testing mode
6. Back in Credentials, create OAuth client ID:
   - Application type: **Web application**
   - Name: `Quiz App`
   - Authorized JavaScript origins:
     - `http://localhost:3000`
     - `http://localhost:8787`
   - Authorized redirect URIs:
     - `http://localhost:8787/api/auth/callback/google`
7. Copy the **Client ID** and **Client Secret**

---

## 3. Environment Variables

### Server (`server/.dev.vars`)

Create this file (it's gitignored):

```bash
cp server/.dev.vars.example server/.dev.vars
```

Fill in the values:

```env
DATABASE_URL=postgresql://your-neon-connection-string
BETTER_AUTH_SECRET=generate-a-32-char-secret-here
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

Generate a secret with:
```bash
openssl rand -base64 32
```

### Client (`client/.env.local`)

Create this file:

```bash
cp client/.env.local.example client/.env.local
```

Fill in the values:

```env
NEXT_PUBLIC_API_URL=http://localhost:8787
DATABASE_URL=postgresql://your-neon-connection-string
```

---

## 4. Install Dependencies

From the project root:

```bash
bun install
```

This installs all dependencies for:
- Root workspace
- `packages/db` (shared database)
- `client` (Next.js)
- `server` (Hono)

---

## 5. Database Migration

### Push Schema to Neon

For development, push the schema directly:

```bash
bun run db:push
```

Or generate and run migrations:

```bash
bun run db:generate  # Creates migration files
bun run db:migrate   # Applies migrations
```

### View Database

Open Drizzle Studio to view/edit data:

```bash
bun run db:studio
```

---

## 6. Run the Development Servers

### Both servers (recommended)

```bash
bun run dev
```

This starts:
- **Client**: http://localhost:3000
- **Server**: http://localhost:8787

### Individual servers

```bash
bun run dev:client  # Just Next.js
bun run dev:server  # Just Hono
```

---

## 7. Test Authentication

### Sign Up (Email/Password)

```typescript
import { signUp } from "@/lib/auth-client";

await signUp.email({
  email: "user@example.com",
  password: "password123",
  name: "Test User",
});
```

### Sign In (Email/Password)

```typescript
import { signIn } from "@/lib/auth-client";

await signIn.email({
  email: "user@example.com",
  password: "password123",
});
```

### Sign In (Google)

```typescript
import { signIn } from "@/lib/auth-client";

await signIn.social({
  provider: "google",
  callbackURL: "/dashboard", // Where to redirect after login
});
```

### Get Session (Client Component)

```typescript
"use client";
import { useSession } from "@/lib/auth-client";

export function UserProfile() {
  const { data: session, isPending } = useSession();

  if (isPending) return <div>Loading...</div>;
  if (!session) return <div>Not logged in</div>;

  return <div>Hello, {session.user.name}!</div>;
}
```

### Get Session (Server Component)

```typescript
import { headers } from "next/headers";
import { getServerSession } from "@/lib/auth-server";

export default async function Dashboard() {
  const session = await getServerSession(await headers());

  if (!session) {
    redirect("/login");
  }

  return <div>Welcome, {session.user.name}!</div>;
}
```

### Sign Out

```typescript
import { signOut } from "@/lib/auth-client";

await signOut();
```

---

## Troubleshooting

### "DATABASE_URL is not set"

Make sure you've created the `.dev.vars` (server) and `.env.local` (client) files with your Neon connection string.

### "Invalid redirect URI" from Google

Ensure your redirect URI in Google Console matches exactly:
```
http://localhost:8787/api/auth/callback/google
```

### CORS errors

The server is configured to allow `http://localhost:3000`. If you're using a different port, update `trustedOrigins` in `server/src/lib/auth.ts`.

### Session not persisting

Ensure:
1. Both servers are running
2. `credentials: true` is set in CORS config (already done)
3. You're accessing the client at `http://localhost:3000` (not 127.0.0.1)

---

## Production Deployment

### Environment Variables

Set these in your deployment platform:

**Cloudflare Workers (Server)**:
- `DATABASE_URL`
- `BETTER_AUTH_SECRET`
- `BETTER_AUTH_URL` (your production URL)
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`

**Vercel/Netlify (Client)**:
- `NEXT_PUBLIC_API_URL` (your server URL)
- `DATABASE_URL` (if using server-side DB access)

### Update OAuth Redirect URIs

Add your production URLs to Google Console:
- Authorized JavaScript origins: `https://your-app.com`
- Authorized redirect URIs: `https://your-api.workers.dev/api/auth/callback/google`

### Update Trusted Origins

In `server/src/lib/auth.ts`, add your production client URL to `trustedOrigins`.
