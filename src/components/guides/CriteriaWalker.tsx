"use client";

// Turns a criteria section into a few short questions with a clear answer at the
// end. Data-driven from CriteriaWalk, so adding one to another guide is a data
// change, not a new component.
//
// Deliberately NOT persisted and NOT part of the guide's case note: this is a
// thinking aid, and the entitlement decision belongs to the MHA Office, not to a
// pop-up. Reopening always starts fresh.

import { useState } from "react";
import { Modal } from "@/components/ui";
import { HelpCircle, CheckCircle2, XCircle, AlertTriangle, RotateCcw, ChevronLeft } from "lucide-react";
import type { CriteriaWalk } from "@/lib/data/guides/criteria-walk";

const TONES = {
  yes: {
    icon: CheckCircle2,
    box: "bg-emerald-50 border-emerald-300",
    text: "text-emerald-900",
    icontone: "text-emerald-600",
  },
  no: {
    icon: XCircle,
    box: "bg-gray-50 border-gray-300",
    text: "text-gray-800",
    icontone: "text-gray-500",
  },
  unsure: {
    icon: AlertTriangle,
    box: "bg-amber-50 border-amber-300",
    text: "text-amber-900",
    icontone: "text-amber-600",
  },
} as const;

export function CriteriaWalker({ walk }: { walk: CriteriaWalk }) {
  const [open, setOpen] = useState(false);
  // Trail of question ids visited, so Back is possible without a history stack.
  const [trail, setTrail] = useState<string[]>([walk.startId]);
  const [outcomeId, setOutcomeId] = useState<string | null>(null);

  const reset = () => {
    setTrail([walk.startId]);
    setOutcomeId(null);
  };

  const close = () => {
    setOpen(false);
    reset();
  };

  const currentId = trail[trail.length - 1];
  const question = walk.questions.find((q) => q.id === currentId);
  const outcome = outcomeId ? walk.outcomes.find((o) => o.id === outcomeId) : null;

  const back = () => {
    if (outcome) {
      setOutcomeId(null);
      return;
    }
    if (trail.length > 1) setTrail(trail.slice(0, -1));
  };

  const answered = trail.length > 1 || outcome;

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
        <div className="space-y-5">
          {walk.intro && !answered && (
            <p className="text-sm text-gray-500">{walk.intro}</p>
          )}

          {outcome ? (
            (() => {
              const tone = TONES[outcome.tone];
              const ToneIcon = tone.icon;
              return (
                <div className={`rounded-xl border-2 p-5 ${tone.box}`}>
                  <div className="flex items-start gap-3">
                    <ToneIcon className={`w-6 h-6 flex-shrink-0 mt-0.5 ${tone.icontone}`} />
                    <div>
                      <h3 className={`font-bold text-lg ${tone.text}`}>{outcome.title}</h3>
                      <p className={`mt-1 ${tone.text}`}>{outcome.detail}</p>
                    </div>
                  </div>
                  {outcome.actions && outcome.actions.length > 0 && (
                    <ul className="mt-4 space-y-2">
                      {outcome.actions.map((a, i) => (
                        <li key={i} className={`flex items-start gap-2 text-sm ${tone.text}`}>
                          <span className="w-1.5 h-1.5 rounded-full bg-current opacity-50 mt-1.5 flex-shrink-0" />
                          <span>{a}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              );
            })()
          ) : question ? (
            <div className="space-y-4">
              <div>
                <h3 className="font-bold text-lg text-gray-900">{question.question}</h3>
                {question.help && (
                  <p className="text-sm text-gray-500 mt-2">{question.help}</p>
                )}
              </div>
              <div className="space-y-2">
                {question.answers.map((a) => (
                  <button
                    key={a.label}
                    onClick={() => {
                      if (a.outcome) setOutcomeId(a.outcome);
                      else if (a.next) setTrail([...trail, a.next]);
                    }}
                    className="w-full text-left p-4 rounded-xl border-2 border-gray-200 bg-white hover:border-purple-400 hover:bg-purple-50 transition-colors"
                  >
                    <p className="font-bold text-gray-900">{a.label}</p>
                    {a.description && (
                      <p className="text-sm text-gray-500 mt-0.5">{a.description}</p>
                    )}
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          {walk.footnote && (outcome || question) && (
            <p className="text-xs text-gray-400 border-t border-gray-100 pt-3">{walk.footnote}</p>
          )}

          <div className="flex items-center gap-2">
            {answered && (
              <button
                onClick={back}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold text-gray-600 hover:bg-gray-100 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                Back
              </button>
            )}
            {answered && (
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
