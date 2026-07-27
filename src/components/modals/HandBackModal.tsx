"use client";

// The hand-back sheet (BACKLOG Section M, item 1).
//
// Three questions, all dropdowns, all one tap. NO FREE TEXT ANYWHERE - that is
// the reason the feature is defensible, not a compromise: nothing to type means
// nothing clinical can land in the wrong record. The structured answers still
// generate a case-note line for SystmOne, so a progress update reaches the
// clinical record even when the job is not done.
//
// Two doors, one component: the job diary, and the end of a patient-linked
// guide ("not finished" alongside "mark complete").

import { useState, useMemo } from "react";
import { Modal } from "@/components/ui";
import { Copy, Check, ArrowRight } from "lucide-react";
import type { DiaryTask, HandbackState, HandbackNext, HandbackDestination, TaskHandback } from "@/lib/types";
import {
  HANDBACK_STATES,
  HANDBACK_NEXT,
  HANDBACK_DESTINATIONS,
  WAITING_ON_PINNED,
  WAITING_ON_GROUPS,
  handbackCaseNote,
} from "@/lib/data/tasks/handback";
import { toLocalDateStr } from "@/lib/utils/date";

const addDays = (n: number) => {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return toLocalDateStr(d);
};

export function HandBackModal({
  isOpen,
  onClose,
  task,
  taskTitle,
  patientName,
  staffName,
  onConfirm,
}: {
  isOpen: boolean;
  onClose: () => void;
  /** Optional - the guide door hands back a job it only knows the title of. */
  task?: DiaryTask;
  taskTitle: string;
  patientName?: string;
  staffName?: string;
  onConfirm: (handback: TaskHandback) => void;
}) {
  const [state, setState] = useState<HandbackState | null>(null);
  const [next, setNext] = useState<HandbackNext | null>(null);
  const [destination, setDestination] = useState<HandbackDestination | null>(null);
  const [waitingOn, setWaitingOn] = useState<string>("");
  const [chaseDate, setChaseDate] = useState<string>(addDays(2));
  const [copied, setCopied] = useState(false);

  const isWaiting = state === "waiting";
  // Waiting needs no machinery of its own: it is a reason plus a date, reusing
  // the scheduling from question 3.
  const needsDate = destination === "scheduled" || isWaiting;

  const ready =
    !!state && !!next && !!destination && (!isWaiting || !!waitingOn) && (!needsDate || !!chaseDate);

  const draft: TaskHandback | null = useMemo(() => {
    if (!ready) return null;
    return {
      state: state as HandbackState,
      next: next as HandbackNext,
      destination: destination as HandbackDestination,
      waitingOn: isWaiting ? waitingOn : undefined,
      chaseDate: needsDate ? chaseDate : undefined,
      by: staffName || "Unknown",
      at: toLocalDateStr(),
    };
  }, [ready, state, next, destination, isWaiting, waitingOn, needsDate, chaseDate, staffName]);

  const caseNote = draft
    ? handbackCaseNote(draft, { taskTitle, patientName, staffName })
    : "";

  const reset = () => {
    setState(null);
    setNext(null);
    setDestination(null);
    setWaitingOn("");
    setChaseDate(addDays(2));
    setCopied(false);
  };

  const close = () => {
    reset();
    onClose();
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(caseNote);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = caseNote;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      ta.remove();
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const confirm = () => {
    if (!draft) return;
    onConfirm(draft);
    reset();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={close} title="Hand this job back" size="lg">
      <div className="space-y-5">
        <div>
          <p className="font-semibold text-gray-900">{taskTitle}</p>
          {patientName && <p className="text-sm text-gray-500">{patientName}</p>}
          {!!task?.handbackCount && task.handbackCount > 1 && (
            <p className="text-xs font-semibold text-amber-700 mt-1">
              Handed back {task.handbackCount} times already
            </p>
          )}
        </div>

        {/* 1. What state is it in? */}
        <div>
          <p className="font-bold text-gray-800 mb-2">
            <span className="text-gray-400 mr-1.5">1.</span>What state is it in?
          </p>
          <div className="space-y-2">
            {HANDBACK_STATES.map((s) => (
              <button
                key={s.value}
                onClick={() => setState(s.value)}
                className={`w-full text-left rounded-xl border-2 px-4 py-2.5 transition-all ${
                  state === s.value
                    ? "border-indigo-500 bg-indigo-50"
                    : "border-gray-200 bg-white hover:border-indigo-300"
                }`}
              >
                <span className="block font-bold text-gray-900 text-sm">{s.label}</span>
                <span className="block text-xs text-gray-500">{s.hint}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Waiting on who - only when it applies */}
        {isWaiting && (
          <div className="rounded-xl border-2 border-sky-200 bg-sky-50 p-4">
            <p className="font-bold text-sky-900 mb-2">Who are you waiting on?</p>
            <div className="flex flex-wrap gap-2 mb-3">
              {WAITING_ON_PINNED.map((w) => (
                <button
                  key={w}
                  onClick={() => setWaitingOn(w)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border-2 transition-colors ${
                    waitingOn === w
                      ? "border-sky-500 bg-sky-500 text-white"
                      : "border-sky-200 bg-white text-sky-800 hover:border-sky-400"
                  }`}
                >
                  {w}
                </button>
              ))}
            </div>
            <select
              value={waitingOn}
              onChange={(e) => setWaitingOn(e.target.value)}
              aria-label="Who are you waiting on"
              className="w-full rounded-lg border-2 border-sky-200 bg-white px-3 py-2 text-sm"
            >
              <option value="">Or pick from the full list...</option>
              {WAITING_ON_GROUPS.map((g) => (
                <optgroup key={g.group} label={g.group}>
                  {g.options.map((o) => (
                    <option key={o} value={o}>
                      {o}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
            {waitingOn === "Other" && (
              <p className="text-xs text-sky-800 mt-2">
                This one cannot write its own case note - document it on SystmOne yourself.
              </p>
            )}
          </div>
        )}

        {/* 2. What's next? */}
        <div>
          <p className="font-bold text-gray-800 mb-2">
            <span className="text-gray-400 mr-1.5">2.</span>What&apos;s next?
          </p>
          <div className="flex flex-wrap gap-2">
            {HANDBACK_NEXT.map((n) => (
              <button
                key={n.value}
                onClick={() => setNext(n.value)}
                className={`px-3.5 py-2 rounded-lg text-sm font-semibold border-2 transition-colors ${
                  next === n.value
                    ? "border-indigo-500 bg-indigo-500 text-white"
                    : "border-gray-200 bg-white text-gray-700 hover:border-indigo-300"
                }`}
              >
                {n.label}
              </button>
            ))}
          </div>
        </div>

        {/* 3. Where does it go? */}
        <div>
          <p className="font-bold text-gray-800 mb-2">
            <span className="text-gray-400 mr-1.5">3.</span>Where does it go?
          </p>
          <div className="space-y-2">
            {HANDBACK_DESTINATIONS.map((d) => (
              <button
                key={d.value}
                onClick={() => setDestination(d.value)}
                className={`w-full text-left rounded-xl border-2 px-4 py-2.5 transition-all ${
                  destination === d.value
                    ? "border-indigo-500 bg-indigo-50"
                    : "border-gray-200 bg-white hover:border-indigo-300"
                }`}
              >
                <span className="block font-bold text-gray-900 text-sm">{d.label}</span>
                <span className="block text-xs text-gray-500">{d.hint}</span>
              </button>
            ))}
          </div>
          {needsDate && (
            <div className="mt-3">
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                {isWaiting ? "Chase it on" : "Bring it back on"}
              </label>
              <input
                type="date"
                value={chaseDate}
                min={toLocalDateStr()}
                onChange={(e) => setChaseDate(e.target.value)}
                className="rounded-lg border-2 border-gray-200 px-3 py-2 text-sm"
              />
            </div>
          )}
        </div>

        {/* The case note the answers generate. Nobody typed a word of it. */}
        {draft && (
          <div className="rounded-xl border-2 border-emerald-200 bg-emerald-50 p-4">
            <p className="font-bold text-emerald-900 text-sm mb-1">
              Case note for SystmOne
            </p>
            <p className="text-xs text-emerald-800 mb-2">
              Built from your answers - paste it into the patient&apos;s notes.
            </p>
            <pre className="whitespace-pre-wrap text-sm bg-white border border-emerald-200 rounded-lg p-3 text-gray-800">
              {caseNote}
            </pre>
            <button
              onClick={copy}
              aria-live="polite"
              className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-500 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? "Copied" : "Copy"}
            </button>
          </div>
        )}

        <div className="flex items-center gap-2 border-t border-gray-100 pt-3">
          <button
            onClick={close}
            className="px-4 py-2 rounded-lg text-sm font-semibold text-gray-600 hover:bg-gray-100 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={confirm}
            disabled={!ready}
            className={`ml-auto inline-flex items-center gap-1.5 px-4 py-2 rounded-lg font-semibold text-sm transition-colors ${
              ready
                ? "bg-indigo-600 text-white hover:bg-indigo-700"
                : "bg-gray-200 text-gray-400 cursor-not-allowed"
            }`}
          >
            Hand it back
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </Modal>
  );
}
