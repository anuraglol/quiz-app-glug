"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { signOut } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import type { ServerSession } from "@/lib/auth-server";

interface QuizStatus {
  taken: boolean;
  score?: number;
  total?: number;
}

interface DashboardClientProps {
  session: NonNullable<ServerSession>;
  quizStatus: QuizStatus;
}

export function DashboardClient({ session, quizStatus }: DashboardClientProps) {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="grid gap-4 max-w-md w-full">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg md:text-xl">Dashboard</CardTitle>
            <CardDescription className="text-xs md:text-sm">
              Welcome back, {session.user.name}!
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              <div className="flex items-center gap-3">
                {session.user.image && (
                  <img
                    src={session.user.image}
                    alt={session.user.name || "User"}
                    className="w-12 h-12 rounded-full"
                  />
                )}
                <div>
                  <p className="font-medium">{session.user.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {session.user.email}
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                onClick={async () => {
                  await signOut({
                    fetchOptions: {
                      onSuccess: () => {
                        router.push("/");
                      },
                    },
                  });
                }}
              >
                Sign Out
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg md:text-xl">
              Harry Potter Quiz
            </CardTitle>
            <CardDescription className="text-xs md:text-sm">
              {quizStatus.taken
                ? `You scored ${quizStatus.score}/${quizStatus.total}`
                : "Test your wizarding knowledge!"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {quizStatus.taken ? (
              <Button
                variant="outline"
                className="w-full"
                onClick={() => router.push("/quiz/result")}
              >
                View Results
              </Button>
            ) : (
              <Button className="w-full" onClick={() => router.push("/quiz")}>
                Take the Quiz
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
