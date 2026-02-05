import { createDb, type User, type Session } from "@quiz-app/db";

/**
 * Server-side database client for Next.js Server Components and Server Actions.
 * Uses the same Neon PostgreSQL database as the Hono backend.
 */
export function getDb() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error("DATABASE_URL environment variable is not set");
  }

  return createDb(databaseUrl);
}

export type ServerSession = {
  session: Session;
  user: User;
} | null;

/**
 * Fetch session from the backend API.
 * Use this in Server Components to get the current user session.
 */
export async function getServerSession(headers: Headers): Promise<ServerSession> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8787";

  try {
    const response = await fetch(`${apiUrl}/api/auth/get-session`, {
      headers: {
        cookie: headers.get("cookie") || "",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    
    // Check if session exists and has required fields
    if (!data || !data.session || !data.user) {
      return null;
    }

    return data as ServerSession;
  } catch {
    return null;
  }
}
