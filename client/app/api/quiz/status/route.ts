import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth-server";
import { signUserJWT } from "@/lib/jwt";
import type { User } from "@/lib/db";

export type QuizStatus = {
  taken: boolean;
  score?: number;
  total?: number;
};

const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8787";

export async function getQuizStatus(user: User): Promise<QuizStatus> {
  const token = await signUserJWT({
    id: user.id,
    email: user.email,
    name: user.name,
  });

  const res = await fetch(`${apiUrl}/api/quiz/status`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });

  if (!res.ok) {
    return { taken: false };
  }

  return res.json();
}

export async function GET() {
  const session = await getServerSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const status = await getQuizStatus(session.user);

  return NextResponse.json(status);
}
