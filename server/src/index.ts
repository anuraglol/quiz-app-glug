import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { verifyUserJWT, type UserJWTPayload } from "./lib/jwt";
import quiz from "./routes/quiz";

const CORS_ORIGINS = [
  "http://localhost:3000",
  "https://quiz-app-glug-client.vercel.app",
];

type Variables = {
  user: UserJWTPayload | null;
};

const app = new Hono<{ Bindings: CloudflareBindings; Variables: Variables }>();

app.use("*", logger());

app.use(
  "/api/*",
  cors({
    origin: CORS_ORIGINS,
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
  })
);

app.use("/api/*", async (c, next) => {
  const authHeader = c.req.header("Authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    c.set("user", null);
    return next();
  }

  const token = authHeader.slice(7);

  try {
    const payload = await verifyUserJWT(token, c.env.JWT_SECRET);
    c.set("user", payload);
  } catch {
    c.set("user", null);
  }

  return next();
});

app.get("/", (c) => {
  return c.json({ status: "ok" });
});

app.get("/api/me", (c) => {
  const user = c.get("user");

  if (!user) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  return c.json({ user });
});

app.route("/api/quiz", quiz);

export default app;
