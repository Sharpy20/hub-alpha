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
  Flag,
  Check,
} from "lucide-react";

type Mode = "setup" | "playing" | "done";
type DifficultyFilter = "all" | QuizDifficulty;
type LengthFilter = 5 | 10 | 20 | "all";

// Reporting a question. 942 questions, 61% mined from trust policies, and until
// now no way to say "this one is wrong" at the moment you are looking at it -
// which is the only moment anyone ever would.
//
// Pick a reason, no free text: the same rule the hand-back sheet follows. It
// keeps a clinical claim out of a feedback post, and a fixed list is something
// you can count, which "it's wrong" is not.
const REPORT_REASONS = [
  { id: "wrong_answer", label: "The marked answer is wrong" },
  { id: "out_of_date", label: "Out of date - policy has changed" },
  { id: "unclear", label: "Question or options are unclear" },
  { id: "source", label: "Source looks wrong or is missing" },
  { id: "typo", label: "Typo or formatting" },
] as const;

// Lands on the feedback board, same shape and key the board already reads.
const FEEDBACK_KEY = "wardhub_feedback";

function fileQuizReport(question: QuizQuestion, reasonId: string, reasonLabel: string) {
  try {
    const raw = localStorage.getItem(FEEDBACK_KEY);
    const store = raw ? JSON.parse(raw) : { posts: [], comments: [], votes: [] };
    const now = new Date().toISOString();
    store.posts = [
      {
        id: `quiz-${question.id}-${reasonId}-${now}`,
        title: `Quiz question flagged: ${reasonLabel}`,
        // The question is quoted so it can be found again; the source is
        // carried because "out of date" is only actionable against a document.
        content: `Question: ${question.question}\nReason: ${reasonLabel}\nSource given: ${question.source}${question.sourceDate ? ` (${question.sourceDate})` : ""}\nQuestion id: ${question.id}`,
        category: "Report a problem",
        sub_category: "Quiz",
        author_name: "Reported from the quiz",
        author_id: "quiz-reporter",
        upvotes: 0,
        created_at: now,
        updated_at: now,
      },
      ...(store.posts ?? []),
    ];
    localStorage.setItem(FEEDBACK_KEY, JSON.stringify(store));
    return true;
  } catch {
    // A full or blocked localStorage should not break the quiz someone is
    // halfway through - the button just will not confirm.
    return false;
  }
}

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

  // Round state. An "endless" round is the default landing experience: every
  // question, shuffled, reshuffled when exhausted - you stop when you stop.
  const [round, setRound] = useState<QuizQuestion[]>([]);
  const [endless, setEndless] = useState(true);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);
  // Per-question report state. Keyed by nothing - it resets on `next()` - so a
  // report never carries over to the question after it.
  const [reportOpen, setReportOpen] = useState(false);
  const [reportSent, setReportSent] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [answeredCount, setAnsweredCount] = useState(0);

  // Fetch the question bank as a lazy chunk on mount (see note above), then
  // drop straight into a mixed endless round - no setup screen in the way.
  useEffect(() => {
    let alive = true;
    import("@/lib/data/quiz").then((m) => {
      if (!alive) return;
      setBank(m);
      setRound(shuffle(m.QUIZ_QUESTIONS));
      setEndless(true);
      setMode("playing");
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
    setEndless(false);
    setIndex(0);
    setSelected(null);
    setAnswered(false);
    setCorrectCount(0);
    setAnsweredCount(0);
    setMode("playing");
  };

  const startEndless = () => {
    if (!bank) return;
    setRound(shuffle(bank.QUIZ_QUESTIONS));
    setEndless(true);
    setIndex(0);
    setSelected(null);
    setAnswered(false);
    setCorrectCount(0);
    setAnsweredCount(0);
    setMode("playing");
  };

  const answer = (i: number) => {
    if (answered) return;
    setSelected(i);
    setAnswered(true);
    setAnsweredCount((c) => c + 1);
    if (i === round[index].correctIndex) setCorrectCount((c) => c + 1);
  };

  const next = () => {
    // Always clear the report control, whichever branch we take below.
    setReportOpen(false);
    setReportSent(false);
    if (index + 1 >= round.length) {
      if (endless) {
        // Ran the whole bank - reshuffle and keep going
        setRound(shuffle(round));
        setIndex(0);
        setSelected(null);
        setAnswered(false);
        return;
      }
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
    setAnsweredCount(0);
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
            <h1 className="text-3xl font-black text-foreground">Customise your quiz</h1>
            <p className="mt-1 diary-muted">
              Pick a topic, difficulty and length - or{" "}
              <button onClick={startEndless} className="font-semibold text-purple-700 underline-offset-2 hover:underline">
                jump back into the mixed quiz
              </button>
              .
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
    const total = endless ? answeredCount : round.length;
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
              onClick={endless ? startEndless : startRound}
              className="inline-flex items-center gap-2 rounded-xl bg-purple-600 px-6 py-3 font-bold text-white shadow-md transition-all hover:scale-105"
            >
              <RotateCcw className="h-5 w-5" /> {endless ? "Another mixed round" : "Same topic again"}
            </button>
            <button
              onClick={restart}
              className="inline-flex items-center gap-2 rounded-xl bg-gray-100 px-6 py-3 font-bold text-gray-700 transition-colors hover:bg-gray-200"
            >
              <BookOpen className="h-5 w-5" /> Customise quiz
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
            {endless
              ? `Question ${answered ? answeredCount : answeredCount + 1} · Score ${correctCount}/${answeredCount}`
              : `Question ${index + 1} of ${round.length}`}
          </span>
          <span className="flex items-center gap-2">
            {endless && (
              <span className="rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-bold text-purple-700">
                Mixed · unlimited
              </span>
            )}
            <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${DIFF_STYLE[q.difficulty]}`}>
              {q.difficulty}
            </span>
          </span>
        </div>
        {!endless && (
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
            <div
              className="h-full rounded-full bg-gradient-to-r from-fuchsia-500 to-purple-700 transition-all"
              style={{ width: `${((index + (answered ? 1 : 0)) / round.length) * 100}%` }}
            />
          </div>
        )}

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
              {q.reviewFlag && (
                <p className="mt-1 text-xs text-gray-500">
                  Our copy of this document was near or past its stated review date when the
                  question was written, so it may since have been reissued. Check FOCUS for the
                  current version.
                </p>
              )}

              {/* Report a problem. Only offered after answering, so nobody uses
                  it to see the answer, and it sits beside the source because
                  that is what most reports will be about. */}
              <div className="mt-3 border-t border-black/5 pt-2">
                {reportSent ? (
                  <p className="flex items-center gap-1.5 text-xs font-medium text-emerald-700">
                    <Check className="h-3.5 w-3.5" />
                    Thanks - flagged for review. It is on the feedback board.
                  </p>
                ) : reportOpen ? (
                  <div>
                    <p className="text-xs font-semibold text-gray-700">
                      What is wrong with this question?
                    </p>
                    <div className="mt-1.5 flex flex-wrap gap-1.5">
                      {REPORT_REASONS.map((r) => (
                        <button
                          key={r.id}
                          onClick={() => {
                            fileQuizReport(q, r.id, r.label);
                            setReportSent(true);
                            setReportOpen(false);
                          }}
                          className="rounded-lg border border-gray-300 bg-white px-2.5 py-1 text-xs font-medium text-gray-700 transition-colors hover:border-purple-400 hover:bg-purple-50"
                        >
                          {r.label}
                        </button>
                      ))}
                      <button
                        onClick={() => setReportOpen(false)}
                        className="rounded-lg px-2.5 py-1 text-xs font-medium text-gray-500 hover:text-gray-700"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setReportOpen(true)}
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-600 hover:text-purple-700"
                    title="Something wrong with this question? Flag it for review"
                  >
                    <Flag className="h-3.5 w-3.5" />
                    Report an issue with this question
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {answered && (
          <div className="flex justify-end">
            <button
              onClick={next}
              className="inline-flex items-center gap-2 rounded-xl bg-purple-600 px-6 py-3 font-bold text-white shadow-md transition-all hover:scale-105"
            >
              {!endless && index + 1 >= round.length ? "See results" : "Next question"}
              <ArrowRight className="h-5 w-5" />
            </button>
          </div>
        )}

        {/* Customise / finish */}
        <div className="flex flex-wrap justify-center gap-3 border-t border-gray-100 pt-4">
          <button
            onClick={restart}
            className="inline-flex items-center gap-2 rounded-xl bg-gray-100 px-5 py-2.5 text-sm font-bold text-gray-700 transition-colors hover:bg-gray-200"
          >
            <BookOpen className="h-4 w-4" /> Customise quiz
          </button>
          {endless && answeredCount > 0 && (
            <button
              onClick={() => setMode("done")}
              className="inline-flex items-center gap-2 rounded-xl bg-gray-100 px-5 py-2.5 text-sm font-bold text-gray-700 transition-colors hover:bg-gray-200"
            >
              <CheckCircle2 className="h-4 w-4" /> Finish and see score
            </button>
          )}
        </div>

        <PrivacyStrip />
      </div>
    </MainLayout>
  );
}
