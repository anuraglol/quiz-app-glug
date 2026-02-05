"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { useRouter } from "next/navigation";

interface ResultClientProps {
  score: number;
  total: number;
}

export function ResultClient({ score, total }: ResultClientProps) {
  const router = useRouter();
  const percentage = Math.round((score / total) * 100);

  let message = "Keep studying!";
  if (percentage >= 90) {
    message = "Outstanding! You're a true Potterhead!";
  } else if (percentage >= 70) {
    message = "Great job! You know your wizarding world!";
  } else if (percentage >= 50) {
    message = "Not bad! Room for improvement though.";
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="max-w-md w-full text-center">
        <CardHeader>
          <CardTitle className="text-2xl md:text-3xl">Quiz Complete!</CardTitle>
          <CardDescription className="text-sm md:text-base">
            {message}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6">
            <div className="py-8">
              <p className="text-6xl font-bold text-primary">{score}/{total}</p>
              <p className="text-muted-foreground mt-2">{percentage}% correct</p>
            </div>

            <Button onClick={() => router.push("/dashboard")}>
              Back to Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
