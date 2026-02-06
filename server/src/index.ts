import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { auth } from "./lib/better-auth";
import type { User, Session } from "./lib/db";
import quiz from "./routes/quiz";

const URIS = ["http://localhost:3000", "https://quiz-app-glug-client.vercel.app"];

type Variables = {
  user: User | null;
  session: Session | null;
};

const app = new Hono<{ Bindings: CloudflareBindings; Variables: Variables }>();

// Logging middleware
app.use("*", logger());

// CORS for frontend
app.use(
  "/api/auth/*",
  cors({
    origin: URIS,
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
  }),
);

app.use(
  "/api/quiz/*",
  cors({
    origin: URIS,
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "OPTIONS"],
    credentials: true,
  }),
);

// Better Auth handler
app.on(["POST", "GET"], "/api/auth/*", (c) => {
  return auth(c.env).handler(c.req.raw);
});

// Session middleware for protected routes
app.use("/api/*", async (c, next) => {
  if (c.req.path.startsWith("/api/auth")) {
    return next();
  }

  const session = await auth(c.env).api.getSession({ headers: c.req.raw.headers });

  if (!session) {
    c.set("user", null);
    c.set("session", null);
  } else {
    c.set("user", session.user as User);
    c.set("session", session.session as Session);
  }

  return next();
});

// Health check
app.get("/", (c) => {
  return c.json({ status: "ok" });
});

// Example protected route
app.get("/api/me", (c) => {
  const user = c.get("user");

  if (!user) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  return c.json({ user });
});

app.route("/api/quiz", quiz);

export default app;
