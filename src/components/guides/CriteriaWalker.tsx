"use client";

// A criteria decision drawn as a FLOWCHART, not a quiz.
//
// The first version asked the questions one at a time and revealed an answer at
// the end - Mike's verdict was that it "just took the earlier text and asked the
// same again". It restated the rules instead of showing them. So the whole
// diagram is on screen from the moment it opens: both questions, every branch,
// and where each branch lands. Answering lights your path and dims the rest, so
// you can see WHY you ended up where you did.
//
// Visual language borrowed from the section-papers checker (/guides/mha-checker):
// bordered tiles, a coloured ring on the live choice, muted everything else.
//
// Deliberately NOT persisted and NOT part of the guide's case note: it is a
// thinking aid, and the entitlement decision belongs to the MHA Office.

import { useState } from "react";
import { Modal } from "@/components/ui";
import { HelpCircle, CheckCircle2, MinusCircle, AlertTriangle, RotateCcw, ArrowDown } from "lucide-react";
import type { CriteriaWalk, CriteriaOutcome } from "@/lib/data/guides/criteria-walk";

const TONES = {
  yes: {
    icon: CheckCircle2,
    live: "bg-emerald-500 border-emerald-600 text-white",
    idle: "bg-emerald-50 border-emerald-200 text-emerald-900",
    panel: "bg-emerald-50 border-emerald-300",
    text: "text-emerald-900",
    mark: "text-emerald-600",
  },
  no: {
    icon: MinusCircle,
    live: "bg-gray-600 border-gray-700 text-white",
    idle: "bg-gray-50 border-gray-200 text-gray-700",
    panel: "bg-gray-50 border-gray-300",
    text: "text-gray-800",
    mark: "text-gray-500",
  },
  unsure: {
    icon: AlertTriangle,
    live: "bg-amber-500 border-amber-600 text-white",
    idle: "bg-amber-50 border-amber-200 text-amber-900",
    panel: "bg-amber-50 border-amber-300",
    text: "text-amber-900",
    mark: "text-amber-600",
  },
} as const;

function Connector({ dim }: { dim: boolean }) {
  return (
    <div className={`flex justify-center py-1 ${dim ? "opacity-25" : ""}`}>
      <ArrowDown className="w-5 h-5 text-gray-400" />
    </div>
  );
}

export function CriteriaWalker({ walk }: { walk: CriteriaWalk }) {
  const [open, setOpen] = useState(false);
  // Answer label chosen per question id. Order of walk.questions is the spine.
  const [chosen, setChosen] = useState<Record<string, string>>({});

  const reset = () => setChosen({});
  const close = () => {
    setOpen(false);
    reset();
  };

  const outcomeById = (id?: string): CriteriaOutcome | undefined =>
    id ? walk.outcomes.find((o) => o.id === id) : undefined;

  // Walk the spine to work out which questions are live and where we landed.
  const reached: string[] = [];
  let cursor: string | undefined = walk.startId;
  let landed: CriteriaOutcome | undefined;
  while (cursor) {
    reached.push(cursor);
    const q = walk.questions.find((x) => x.id === cursor);
    const pick = q?.answers.find((a) => a.label === chosen[cursor as string]);
    if (!pick) break;
    if (pick.outcome) {
      landed = outcomeById(pick.outcome);
      break;
    }
    cursor = pick.next;
  }

  const choose = (qid: string, label: string) => {
    // Clear anything downstream so changing your mind cannot leave a stale tail.
    const idx = walk.questions.findIndex((q) => q.id === qid);
    const kept: Record<string, string> = {};
    walk.questions.forEach((q, i) => {
      if (i < idx && chosen[q.id]) kept[q.id] = chosen[q.id];
    });
    kept[qid] = label;
    setChosen(kept);
  };

  const anyAnswer = Object.keys(chosen).length > 0;

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white border-2 border-purple-300 text-purple-800 font-semibold hover:border-purple-500 hover:bg-purple-50 transition-colors text-sm"
      >
        <HelpCircle className="w-4 h-4" />
        {walk.trigger}
      </button>

      <Modal isOpen={open} onClose={close} title={walk.title} size="lg">
        <div className="space-y-4">
          {walk.intro && <p className="text-sm text-gray-500">{walk.intro}</p>}

          {walk.questions.map((q, qi) => {
            const live = reached.includes(q.id);
            const answer = chosen[q.id];
            const major = q.answers.filter((a) => !a.minor);
            const minor = q.answers.filter((a) => a.minor);

            return (
              <div key={q.id}>
                {qi > 0 && <Connector dim={!live} />}

                <div
                  className={`rounded-xl border-2 transition-all ${
                    live ? "border-indigo-300 bg-white" : "border-gray-100 bg-gray-50 opacity-50"
                  }`}
                >
                  <div className="px-4 pt-3 pb-2 flex items-start gap-2.5">
                    <span
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                        live ? "bg-indigo-500 text-white" : "bg-gray-300 text-white"
                      }`}
                    >
                      {qi + 1}
                    </span>
                    <div className="min-w-0">
                      <p className="font-bold text-gray-900 leading-snug">{q.question}</p>
                      {q.help && <p className="text-xs text-gray-500 mt-1">{q.help}</p>}
                    </div>
                  </div>

                  {/* Branches. Each shows where it lands, before you pick it. */}
                  <div className="px-4 pb-3 grid grid-cols-2 gap-3">
                    {major.map((a) => {
                      const out = outcomeById(a.outcome);
                      const picked = answer === a.label;
                      const faded = !!answer && !picked;
                      const tone = out ? TONES[out.tone] : null;
                      const ToneIcon = tone?.icon;
                      return (
                        <button
                          key={a.label}
                          onClick={() => live && choose(q.id, a.label)}
                          disabled={!live}
                          aria-pressed={picked}
                          className={`rounded-lg border-2 p-2.5 text-left transition-all ${
                            picked ? "border-indigo-500 ring-2 ring-indigo-300" : "border-gray-200 hover:border-indigo-300"
                          } ${faded ? "opacity-40" : ""} ${live ? "cursor-pointer bg-white" : "cursor-default bg-white"}`}
                        >
                          <span className="block font-bold text-gray-900 text-sm">{a.label}</span>
                          <span className="flex justify-center py-1">
                            <ArrowDown className="w-3.5 h-3.5 text-gray-300" />
                          </span>
                          {out && tone ? (
                            <span
                              className={`flex items-center gap-1.5 rounded-md border px-2 py-1 text-xs font-bold ${
                                picked ? tone.live : tone.idle
                              }`}
                            >
                              {ToneIcon && <ToneIcon className="w-3.5 h-3.5 flex-shrink-0" />}
                              {out.short}
                            </span>
                          ) : (
                            <span className="block rounded-md border border-dashed border-gray-300 px-2 py-1 text-xs font-semibold text-gray-500">
                              Go to question {qi + 2}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {minor.length > 0 && (
                    <div className="px-4 pb-3 -mt-1 flex flex-wrap gap-3">
                      {minor.map((a) => {
                        const picked = answer === a.label;
                        return (
                          <button
                            key={a.label}
                            onClick={() => live && choose(q.id, a.label)}
                            disabled={!live}
                            className={`text-xs font-semibold underline-offset-2 transition-colors ${
                              picked ? "text-amber-700 underline" : "text-gray-500 hover:text-amber-700 hover:underline"
                            }`}
                          >
                            {a.label}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* What the landing box actually means. */}
          {landed &&
            (() => {
              const tone = TONES[landed.tone];
              const ToneIcon = tone.icon;
              return (
                <>
                  <Connector dim={false} />
                  <div className={`rounded-xl border-2 p-4 ${tone.panel}`}>
                    <div className="flex items-start gap-2.5">
                      <ToneIcon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${tone.mark}`} />
                      <div>
                        <h3 className={`font-bold ${tone.text}`}>{landed.title}</h3>
                        <p className={`text-sm mt-1 ${tone.text}`}>{landed.detail}</p>
                      </div>
                    </div>
                    {landed.actions && landed.actions.length > 0 && (
                      <ul className="mt-3 space-y-1.5">
                        {landed.actions.map((a, i) => (
                          <li key={i} className={`flex items-start gap-2 text-sm ${tone.text}`}>
                            <span className="w-1.5 h-1.5 rounded-full bg-current opacity-50 mt-1.5 flex-shrink-0" />
                            <span>{a}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </>
              );
            })()}

          {walk.footnote && <p className="text-xs text-gray-400">{walk.footnote}</p>}

          <div className="flex items-center gap-2 border-t border-gray-100 pt-3">
            {anyAnswer && (
              <button
                onClick={reset}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold text-gray-600 hover:bg-gray-100 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Start over
              </button>
            )}
            <button
              onClick={close}
              className="ml-auto px-4 py-2 rounded-lg bg-purple-600 text-white font-semibold hover:bg-purple-700 transition-colors text-sm"
            >
              Close
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}
