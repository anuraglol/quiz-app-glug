import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/auth-server";
import { QuizClient } from "./quiz-client";
import { getQuizStatus } from "../api/quiz/status/route";

export default async function Page() {
  const session = await getServerSession();

  if (!session) {
    redirect("/");
  }

  const data = await getQuizStatus(session.user);

  if (data.taken) {
    redirect("/quiz/result");
  }

  return <QuizClient />;
}
