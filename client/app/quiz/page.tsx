import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/auth-server";
import { QuizClient } from "./quiz-client";

export default async function Page() {
  const session = await getServerSession(await headers());

  if (!session) {
    redirect("/");
  }

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8787";
  const res = await fetch(`${apiUrl}/api/quiz/status`, {
    headers: {
      cookie: (await headers()).get("cookie") || "",
    },
    cache: "no-store",
  });

  if (res.ok) {
    const data = await res.json();
    if (data.taken) {
      redirect("/quiz/result");
    }
  }

  return <QuizClient />;
}
