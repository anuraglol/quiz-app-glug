import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/auth-server";
import { DashboardClient } from "./dashboard-client";

export default async function Page() {
  const session = await getServerSession(await headers());

  if (!session) {
    redirect("/");
  }

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8787";
  let quizStatus = { taken: false };

  try {
    const res = await fetch(`${apiUrl}/api/quiz/status`, {
      headers: {
        cookie: (await headers()).get("cookie") || "",
      },
      cache: "no-store",
    });

    if (res.ok) {
      quizStatus = await res.json();
    }
  } catch {
    // Default to not taken if fetch fails
  }

  return <DashboardClient session={session} quizStatus={quizStatus} />;
}
