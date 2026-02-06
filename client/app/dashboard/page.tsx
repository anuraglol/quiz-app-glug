import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/auth-server";
import { DashboardClient } from "./dashboard-client";
import { getQuizStatus } from "../api/quiz/status/route";

export default async function Page() {
  const session = await getServerSession();

  if (!session) {
    redirect("/");
  }

  const quizStatus = await getQuizStatus(session.user);

  return <DashboardClient session={session} quizStatus={quizStatus} />;
}
