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

let auth: ReturnType<typeof betterAuth> | null = null;

export function createAuth(env: AuthEnv) {
  if (!auth) {
    const db = createDb(env.DATABASE_URL);

    auth = betterAuth({
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
          secure: true, // Workers = HTTPS
          advanced: {
            defaultCookieAttributes: {
              sameSite: "lax",
              secure: env.BETTER_AUTH_URL.startsWith("https"),
            },
          },
        },
      },
    });
  }

  return auth;
}
