import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { createDb } from "@quiz-app/db";

export type AuthEnv = {
  DATABASE_URL: string;
  BETTER_AUTH_SECRET: string;
  BETTER_AUTH_URL: string;
  CLIENT_URL: string;
  GOOGLE_CLIENT_ID: string;
  GOOGLE_CLIENT_SECRET: string;
};

/**
 * Create a Better Auth instance.
 * Called per-request in Cloudflare Workers to access environment variables.
 */
export function createAuth(env: AuthEnv) {
  const db = createDb(env.DATABASE_URL);

  return betterAuth({
    database: drizzleAdapter(db, {
      provider: "pg",
    }),
    baseURL: env.BETTER_AUTH_URL,
    secret: env.BETTER_AUTH_SECRET,
    emailAndPassword: {
      enabled: true,
    },
    socialProviders: {
      google: {
        clientId: env.GOOGLE_CLIENT_ID,
        clientSecret: env.GOOGLE_CLIENT_SECRET,
        redirectURI: `${env.BETTER_AUTH_URL}/api/auth/callback/google`,
      },
    },
    trustedOrigins: [env.CLIENT_URL],
    advanced: {
      defaultCookieAttributes: {
        sameSite: "lax",
        secure: false, // Set to true in production with HTTPS
      },
    },
  });
}

export type Auth = ReturnType<typeof createAuth>;
