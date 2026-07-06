"use client";

import { useEffect, useMemo, useState } from "react";
import { MainLayout } from "@/components/layout";
import type { QuizQuestion, QuizDifficulty } from "@/lib/data/quiz";

// PERFORMANCE: the question bank (364 questions, ~300 kB of JSON) is
// dynamic-imported on mount instead of bundled into the route, so /quiz's
// first load ships only the page shell. The bank arrives as its own chunk a
// moment later; the setup screen shows a brief loading state.
type QuizBank = typeof import("@/lib/data/quiz");
import {
  Brain,
  CheckCircle2,
  XCircle,
  ShieldOff,
  RotateCcw,
  ArrowRight,
  Sparkles,
  BookOpen,
} from "lucide-react";

type Mode = "setup" | "playing" | "done";
type DifficultyFilter = "all" | QuizDifficulty;
type LengthFilter = 5 | 10 | 20 | "all";

const DIFF_STYLE: Record<QuizDifficulty, string> = {
  Easy: "bg-emerald-100 text-emerald-700",
  Medium: "bg-amber-100 text-amber-700",
  Hard: "bg-rose-100 text-rose-700",
};

// Fisher-Yates shuffle (returns a new array).
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Privacy strip, shown on every screen
function PrivacyStrip() {
  return (
    <div className="flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-emerald-800">
      <ShieldOff className="mt-0.5 h-5 w-5 flex-shrink-0" />
      <p className="text-sm">
        <span className="font-semibold">Just for you.</span> This is a bit of fun to
        keep your knowledge fresh. Nothing you do here is saved, scored on a record,
        or seen by anyone else - no logins, no tracking, no results sent anywhere.
        Get one wrong? Nobody will ever know but you.
      </p>
    </div>
  );
}

export default function QuizPage() {
  const [mode, setMode] = useState<Mode>("setup");
  const [category, setCategory] = useState<string>("all");
  const [difficulty, setDifficulty] = useState<DifficultyFilter>("all");
  const [length, setLength] = useState<LengthFilter>(10);
  const [bank, setBank] = useState<QuizBank | null>(null);

  // Round state
  const [round, setRound] = useState<QuizQuestion[]>([]);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);

  // Fetch the question bank as a lazy chunk on mount (see note above)
  useEffect(() => {
    let alive = true;
    import("@/lib/data/quiz").then((m) => {
      if (alive) setBank(m);
    });
    return () => { alive = false; };
  }, []);

  const counts = useMemo(() => (bank ? bank.quizCountByCategory() : {}), [bank]);

  // How many questions match the current filters (for the Start button label).
  const available = useMemo(() => {
    if (!bank) return [];
    return bank.QUIZ_QUESTIONS.filter(
      (q) =>
        (category === "all" || q.category === category) &&
        (difficulty === "all" || q.difficulty === difficulty)
    );
  }, [bank, category, difficulty]);

  const startRound = () => {
    const pool = shuffle(available);
    const take = length === "all" ? pool.length : Math.min(length, pool.length);
    setRound(pool.slice(0, take));
    setIndex(0);
    setSelected(null);
    setAnswered(false);
    setCorrectCount(0);
    setMode("playing");
  };

  const answer = (i: number) => {
    if (answered) return;
    setSelected(i);
    setAnswered(true);
    if (i === round[index].correctIndex) setCorrectCount((c) => c + 1);
  };

  const next = () => {
    if (index + 1 >= round.length) {
      setMode("done");
      return;
    }
    setIndex((n) => n + 1);
    setSelected(null);
    setAnswered(false);
  };

  const restart = () => {
    setMode("setup");
    setRound([]);
    setIndex(0);
    setSelected(null);
    setAnswered(false);
    setCorrectCount(0);
  };

  // =========================================================================
  // SETUP
  // =========================================================================
  if (mode === "setup") {
    return (
      <MainLayout>
        <div className="mx-auto max-w-3xl space-y-6">
          <div className="text-center">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-fuchsia-500 to-purple-700 shadow-md">
              <Brain className="h-7 w-7 text-white" />
            </div>
            <h1 className="text-3xl font-black text-foreground">Quiz</h1>
            <p className="mt-1 diary-muted">
              A quick, no-pressure knowledge refresher for ward staff.
            </p>
          </div>

          <PrivacyStrip />

          {!bank ? (
            <p className="py-10 text-center text-sm text-gray-500" role="status">
              Loading the question bank&hellip;
            </p>
          ) : (
          <>


          {/* Topic */}
          <section className="rounded-2xl border border-gray-200 bg-white p-5">
            <h2 className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-gray-500">
              <BookOpen className="h-4 w-4" /> Pick a topic
            </h2>
            <div className="grid gap-2 sm:grid-cols-2">
              <button
                onClick={() => setCategory("all")}
                className={`rounded-xl border p-3 text-left transition-colors ${
                  category === "all"
                    ? "border-purple-400 bg-purple-50 ring-2 ring-purple-300"
                    : "border-gray-200 hover:bg-gray-50"
                }`}
              >
                <p className="font-semibold text-gray-900">Mixed - a bit of everything</p>
                <p className="text-xs text-gray-500">{bank.QUIZ_QUESTIONS.length} questions</p>
              </button>
              {bank.QUIZ_CATEGORIES.map((c) => (
                <button
                  key={c}
                  onClick={() => setCategory(c)}
                  className={`rounded-xl border p-3 text-left transition-colors ${
                    category === c
                      ? "border-purple-400 bg-purple-50 ring-2 ring-purple-300"
                      : "border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  <p className="font-semibold text-gray-900">{c}</p>
                  <p className="text-xs text-gray-500">{counts[c]} {counts[c] === 1 ? "question" : "questions"}</p>
                </button>
              ))}
            </div>
          </section>

          {/* Difficulty + length */}
          <section className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-gray-200 bg-white p-5">
              <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-gray-500">
                Difficulty
              </h2>
              <div className="flex flex-wrap gap-2">
                {(["all", ...bank.QUIZ_DIFFICULTIES] as DifficultyFilter[]).map((d) => (
                  <button
                    key={d}
                    onClick={() => setDifficulty(d)}
                    className={`rounded-lg px-3 py-1.5 text-sm font-medium capitalize transition-colors ${
                      difficulty === d
                        ? "bg-purple-600 text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {d === "all" ? "Any" : d}
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-5">
              <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-gray-500">
                How many questions?
              </h2>
              <div className="flex flex-wrap gap-2">
                {([5, 10, 20, "all"] as LengthFilter[]).map((l) => (
                  <button
                    key={String(l)}
                    onClick={() => setLength(l)}
                    className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                      length === l
                        ? "bg-purple-600 text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {l === "all" ? "All" : l}
                  </button>
                ))}
              </div>
            </div>
          </section>

          <div className="text-center">
            <button
              onClick={startRound}
              disabled={available.length === 0}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-fuchsia-500 to-purple-700 px-8 py-3 text-lg font-bold text-white shadow-md transition-all hover:scale-105 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Sparkles className="h-5 w-5" />
              Start
              <span className="text-sm font-normal opacity-90">
                ({(length === "all" ? available.length : Math.min(length, available.length)) === 1
                  ? "1 question"
                  : `${length === "all" ? available.length : Math.min(length, available.length)} questions`})
              </span>
            </button>
            {available.length === 0 && (
              <p className="mt-2 text-sm text-rose-600">
                No questions match that combination yet - try a different difficulty.
              </p>
            )}
          </div>
          </>
          )}
        </div>
      </MainLayout>
    );
  }

  // =========================================================================
  // DONE
  // =========================================================================
  if (mode === "done") {
    const total = round.length;
    const pct = total ? Math.round((correctCount / total) * 100) : 0;
    const msg =
      pct >= 80
        ? "Nice one - that knowledge is sharp."
        : pct >= 50
        ? "Solid effort. Have another go to top it up."
        : "Every go is practice - the rationales are where the learning is.";
    return (
      <MainLayout>
        <div className="mx-auto max-w-2xl space-y-6 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-fuchsia-500 to-purple-700 shadow-md">
            <Brain className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-black text-foreground">Round complete</h1>
          <div className="rounded-2xl border border-gray-200 bg-white p-8">
            <p className="text-5xl font-black text-purple-700">
              {correctCount}
              <span className="text-2xl font-bold text-gray-400"> / {total}</span>
            </p>
            <p className="mt-3 diary-muted">{msg}</p>
          </div>
          <PrivacyStrip />
          <div className="flex flex-wrap justify-center gap-3">
            <button
              onClick={startRound}
              className="inline-flex items-center gap-2 rounded-xl bg-purple-600 px-6 py-3 font-bold text-white shadow-md transition-all hover:scale-105"
            >
              <RotateCcw className="h-5 w-5" /> Same topic again
            </button>
            <button
              onClick={restart}
              className="inline-flex items-center gap-2 rounded-xl bg-gray-100 px-6 py-3 font-bold text-gray-700 transition-colors hover:bg-gray-200"
            >
              <BookOpen className="h-5 w-5" /> Pick a new topic
            </button>
          </div>
        </div>
      </MainLayout>
    );
  }

  // =========================================================================
  // PLAYING
  // =========================================================================
  const q = round[index];
  const isCorrect = selected === q.correctIndex;

  return (
    <MainLayout>
      <div className="mx-auto max-w-2xl space-y-5">
        {/* Progress */}
        <div className="flex items-center justify-between text-sm">
          <span className="font-semibold diary-muted">
            Question {index + 1} of {round.length}
          </span>
          <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${DIFF_STYLE[q.difficulty]}`}>
            {q.difficulty}
          </span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
          <div
            className="h-full rounded-full bg-gradient-to-r from-fuchsia-500 to-purple-700 transition-all"
            style={{ width: `${((index + (answered ? 1 : 0)) / round.length) * 100}%` }}
          />
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-6">
          <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-purple-600">
            {q.category}
          </p>
          {q.scenario && (
            <p className="mb-3 rounded-lg bg-gray-50 p-3 text-sm italic text-gray-600">
              {q.scenario}
            </p>
          )}
          <h2 className="mb-4 text-lg font-bold text-gray-900">{q.question}</h2>

          <div className="space-y-2">
            {q.options.map((opt, i) => {
              const showCorrect = answered && i === q.correctIndex;
              const showWrong = answered && i === selected && i !== q.correctIndex;
              return (
                <button
                  key={i}
                  onClick={() => answer(i)}
                  disabled={answered}
                  className={`flex w-full items-center gap-3 rounded-xl border p-3 text-left transition-colors ${
                    showCorrect
                      ? "border-emerald-400 bg-emerald-50"
                      : showWrong
                      ? "border-rose-400 bg-rose-50"
                      : answered
                      ? "border-gray-200 opacity-60"
                      : "border-gray-200 hover:border-purple-300 hover:bg-purple-50"
                  }`}
                >
                  <span
                    className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                      showCorrect
                        ? "bg-emerald-500 text-white"
                        : showWrong
                        ? "bg-rose-500 text-white"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {String.fromCharCode(65 + i)}
                  </span>
                  <span className="flex-1 text-gray-800">{opt}</span>
                  {showCorrect && <CheckCircle2 aria-label="Correct answer" className="h-5 w-5 text-emerald-500" />}
                  {showWrong && <XCircle aria-label="Your answer, incorrect" className="h-5 w-5 text-rose-500" />}
                </button>
              );
            })}
          </div>

          {/* Feedback */}
          {answered && (
            <div
              role="status"
              className={`mt-4 rounded-xl border p-4 ${
                isCorrect ? "border-emerald-200 bg-emerald-50" : "border-amber-200 bg-amber-50"
              }`}
            >
              <p className={`font-bold ${isCorrect ? "text-emerald-700" : "text-amber-700"}`}>
                {isCorrect ? "Correct" : "Not quite"}
              </p>
              <p className="mt-1 text-sm text-gray-700">{q.rationale}</p>
              <p className="mt-2 text-xs text-gray-500">
                Source: {q.source}
                {q.sourceDate && q.sourceDate !== "current" ? ` (${q.sourceDate})` : ""}
              </p>
            </div>
          )}
        </div>

        {answered && (
          <div className="flex justify-end">
            <button
              onClick={next}
              className="inline-flex items-center gap-2 rounded-xl bg-purple-600 px-6 py-3 font-bold text-white shadow-md transition-all hover:scale-105"
            >
              {index + 1 >= round.length ? "See results" : "Next question"}
              <ArrowRight className="h-5 w-5" />
            </button>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
