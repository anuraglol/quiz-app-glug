import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/auth-server";
import { ResultClient } from "./result-client";
import { getQuizStatus } from "../../api/quiz/status/route";

export default async function Page() {
  const session = await getServerSession();

  if (!session) {
    redirect("/");
  }

  const data = await getQuizStatus(session.user);

  if (!data.taken) {
    redirect("/quiz");
  }

  return <ResultClient score={data.score!} total={data.total!} />;
}
