import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

export { eq, asc, desc, and, or } from "drizzle-orm";

/**
 * Create a database client for Neon PostgreSQL.
 * Works in both Cloudflare Workers and Node.js environments.
 *
 * @param databaseUrl - Neon PostgreSQL connection string
 * @returns Drizzle database client with schema
 */
export function createDb(databaseUrl: string) {
  const sql = neon(databaseUrl);
  return drizzle(sql, { schema });
}

// Re-export schema for convenience
export * from "./schema";

// Export types
export type Database = ReturnType<typeof createDb>;
export type User = typeof schema.user.$inferSelect;
export type Session = typeof schema.session.$inferSelect;
export type Account = typeof schema.account.$inferSelect;
export type Question = typeof schema.question.$inferSelect;
export type QuizAttempt = typeof schema.quizAttempt.$inferSelect;
