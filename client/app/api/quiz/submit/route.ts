import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth-server";
import { signUserJWT } from "@/lib/jwt";

const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8787";

export async function POST(request: NextRequest) {
  const session = await getServerSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();

  const token = await signUserJWT({
    id: session.user.id,
    email: session.user.email,
    name: session.user.name,
  });

  const res = await fetch(`${apiUrl}/api/quiz/submit`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const error = await res.json();
    return NextResponse.json(error, { status: res.status });
  }

  const data = await res.json();
  return NextResponse.json(data);
}
