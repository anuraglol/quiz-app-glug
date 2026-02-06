"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

type Question = {
  id: string;
  text: string;
  options: string[];
  order: number;
};

export function QuizClient() {
  const router = useRouter();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchQuestions() {
      try {
        const res = await fetch("/api/quiz/questions", {
          credentials: "include",
        });

        if (res.status === 403) {
          router.push("/quiz/result");
          return;
        }

        if (!res.ok) {
          throw new Error("Failed to fetch questions");
        }

        const data = await res.json();
        setQuestions(data.questions);
        setAnswers(new Array(data.questions.length).fill(null));
      } catch {
        setError("Failed to load quiz");
      } finally {
        setLoading(false);
      }
    }

    fetchQuestions();
  }, [router]);

  const handleSelect = (optionIndex: number) => {
    const newAnswers = [...answers];
    newAnswers[currentIndex] = optionIndex;
    setAnswers(newAnswers);
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleSubmit = async () => {
    if (answers.includes(null)) {
      setError("Please answer all questions");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/quiz/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ answers }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to submit");
      }

      router.push("/quiz/result");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading quiz...</p>
      </div>
    );
  }

  if (error && questions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];
  const answeredCount = answers.filter((a) => a !== null).length;
  const allAnswered = answeredCount === questions.length;

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full">
        <CardHeader>
          <CardTitle className="text-lg md:text-xl">
            Question {currentIndex + 1} of {questions.length}
          </CardTitle>
          <CardDescription className="text-xs md:text-sm">
            {answeredCount} of {questions.length} answered
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6">
            <p className="text-base md:text-lg font-medium">
              {currentQuestion.text}
            </p>

            <div className="grid gap-2">
              {currentQuestion.options.map((option, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelect(idx)}
                  className={`p-3 text-left rounded-lg border transition-colors ${
                    answers[currentIndex] === idx
                      ? "border-primary bg-primary/10"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <span className="font-medium mr-2">
                    {String.fromCharCode(65 + idx)}.
                  </span>
                  {option}
                </button>
              ))}
            </div>

            {error && <p className="text-red-500 text-sm">{error}</p>}

            <div className="flex justify-between gap-2">
              <Button
                variant="outline"
                onClick={handlePrev}
                disabled={currentIndex === 0}
              >
                Previous
              </Button>

              <div className="flex gap-2">
                {currentIndex < questions.length - 1 ? (
                  <Button onClick={handleNext}>Next</Button>
                ) : (
                  <Button
                    onClick={handleSubmit}
                    disabled={!allAnswered || submitting}
                  >
                    {submitting ? "Submitting..." : "Submit Quiz"}
                  </Button>
                )}
              </div>
            </div>

            <div className="flex flex-wrap gap-1 justify-center">
              {questions.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentIndex(idx)}
                  className={`w-8 h-8 rounded text-sm font-medium transition-colors ${
                    idx === currentIndex
                      ? "bg-primary text-primary-foreground"
                      : answers[idx] !== null
                        ? "bg-primary/20 text-primary"
                        : "bg-muted text-muted-foreground"
                  }`}
                >
                  {idx + 1}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
