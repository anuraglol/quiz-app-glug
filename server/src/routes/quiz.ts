import { Hono } from "hono";
import { createDb, question, quizAttempt, eq, asc } from "../lib/db";
import type { UserJWTPayload } from "../lib/jwt";

type Env = {
  Bindings: CloudflareBindings;
  Variables: {
    user: UserJWTPayload | null;
  };
};

const quiz = new Hono<Env>();

quiz.get("/status", async (c) => {
  const user = c.get("user");
  if (!user) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const db = createDb(c.env.DATABASE_URL);
  const attempt = await db.query.quizAttempt.findFirst({
    where: eq(quizAttempt.userId, user.sub),
  });

  if (attempt) {
    return c.json({
      taken: true,
      score: attempt.score,
      total: attempt.totalQuestions,
    });
  }

  return c.json({ taken: false });
});

quiz.get("/questions", async (c) => {
  const user = c.get("user");
  if (!user) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const db = createDb(c.env.DATABASE_URL);

  const attempt = await db.query.quizAttempt.findFirst({
    where: eq(quizAttempt.userId, user.sub),
  });

  if (attempt) {
    return c.json({ error: "Quiz already taken" }, 403);
  }

  const questions = await db
    .select({
      id: question.id,
      text: question.text,
      options: question.options,
      order: question.order,
    })
    .from(question)
    .orderBy(asc(question.order));

  return c.json({ questions });
});

quiz.post("/submit", async (c) => {
  const user = c.get("user");
  if (!user) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const db = createDb(c.env.DATABASE_URL);

  const existingAttempt = await db.query.quizAttempt.findFirst({
    where: eq(quizAttempt.userId, user.sub),
  });

  if (existingAttempt) {
    return c.json({ error: "Quiz already taken" }, 403);
  }

  const body = await c.req.json<{ answers: number[] }>();

  if (!body.answers || !Array.isArray(body.answers)) {
    return c.json({ error: "Invalid answers format" }, 400);
  }

  const questions = await db
    .select({
      id: question.id,
      correctIndex: question.correctIndex,
      order: question.order,
    })
    .from(question)
    .orderBy(asc(question.order));

  if (body.answers.length !== questions.length) {
    return c.json({ error: "Answer count mismatch" }, 400);
  }

  let score = 0;
  for (let i = 0; i < questions.length; i++) {
    if (body.answers[i] === questions[i].correctIndex) {
      score++;
    }
  }

  const attemptId = crypto.randomUUID();

  try {
    await db.insert(quizAttempt).values({
      id: attemptId,
      userId: user.sub,
      score,
      totalQuestions: questions.length,
    });
  } catch {
    return c.json({ error: "Quiz already taken" }, 403);
  }

  return c.json({ score, total: questions.length });
});

export default quiz;
