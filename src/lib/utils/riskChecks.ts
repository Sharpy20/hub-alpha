// Consistency checks run over a finished risk plan, before it is copied out.
//
// ⛔ THESE NEVER DECIDE WHICH ENTRY IS CORRECT. They point at two things that sit
// oddly together and hand it back to the person writing the plan. A tool that
// resolved the contradiction would be making a clinical judgement, which is the
// one thing this one does not do.
//
// Everything here is derived from what the nurse selected. Nothing is inferred
// about the patient.

import type { AllState, DatedExample } from "@/components/guides/risk-capture";
import { RMP_QUESTIONS } from "@/lib/data/guides/risk-questions";
import {
  NOT_ASSESSED, NOT_APPLICABLE, INCOMPLETE_OPTIONS, WHAT_HELPS, REDUCTION_TIMEFRAMES,
} from "@/lib/data/guides/rmp-chips";

export interface RiskCheck {
  /** Where to look - the domain, and the question number when it is one question. */
  where: string;
  message: string;
}

/** The standing wording, so every check reads the same way. */
export const CHECK_PREAMBLE =
  "Possible inconsistency. Selected information may describe different time periods or presentations. Review the wording before copying - the tool cannot tell which entry is right.";

const NOT_ESTABLISHED = new Set<string>([
  NOT_ASSESSED, NOT_APPLICABLE, ...Object.values(INCOMPLETE_OPTIONS),
]);

// An absence claim is only a measure once it says over what period. "No further
// incidents" on its own is the example Copilot gave, and it is a common one.
const ABSENCE = /^(no further|no aggressive|no property damage|no attempts|no current|no incidents|no further falls)/i;
const HAS_PERIOD = /(period|shift|since|compared|weekly|daily|hours|days|weeks)/i;

const NOT_IDENTIFIED = "Has not yet identified what helps";

export interface DomainCheckInput {
  /** Shown to the user - the domain title. */
  title: string;
  /** The six answers, keyed by question id. */
  answers: AllState | undefined;
  /** Sub-domains ticked on this domain. */
  subs: string[];
  /** Every dated event filed under this domain, current and historical. */
  events: DatedExample[];
  /** What is set in the plan header - who reviews it, when, and what brings that forward. */
  review?: { by?: string; when?: string; triggers?: string[] };
}

export function checkDomain(input: DomainCheckInput): RiskCheck[] {
  const out: RiskCheck[] = [];
  const { title, answers, subs, events } = input;

  let anyAnswered = false;

  for (const q of RMP_QUESTIONS) {
    const st = answers?.[q.id];
    if (!st) continue;
    const chips = st.chips || [];
    const text = (st.text || "").trim();
    const examples = (st.examples || []).filter((e) => e.text.trim());
    const filled = chips.length > 0 || text !== "" || examples.length > 0 || st.na;
    if (filled) anyAnswered = true;

    const gaps = chips.filter((c) => NOT_ESTABLISHED.has(c));
    const real = chips.filter((c) => !NOT_ESTABLISHED.has(c));

    // 1. Says it could not be established, and then establishes something.
    if (gaps.length && (real.length || text || examples.length)) {
      out.push({
        where: `${title}, question ${q.n}`,
        message: `"${gaps[0]}" is selected alongside content that has been established.`,
      });
    }

    // 2. More than one reason the section is empty. They mean different things.
    if (gaps.length > 1) {
      out.push({
        where: `${title}, question ${q.n}`,
        message: `More than one reason is given for this section being incomplete: ${gaps.join("; ")}.`,
      });
    }

    // 3. An absence claim with nothing saying over what period.
    if (q.timeframes) {
      const absence = chips.filter((c) => ABSENCE.test(c));
      const period = chips.some((c) => REDUCTION_TIMEFRAMES.includes(c) || HAS_PERIOD.test(c)) || HAS_PERIOD.test(text);
      if (absence.length && !period) {
        out.push({
          where: `${title}, question ${q.n}`,
          message: `"${absence[0]}" does not say over what period. An absence of incidents is not by itself proof the risk has reduced.`,
        });
      }
    }

    // 4. Says nothing helps has been identified, and then identifies something.
    if (q.helps && chips.includes(NOT_IDENTIFIED)) {
      const others = chips.filter((c) => c !== NOT_IDENTIFIED && WHAT_HELPS.includes(c));
      if (others.length) {
        out.push({
          where: `${title}, question ${q.n}`,
          message: `"${NOT_IDENTIFIED}" is selected alongside ${others.length === 1 ? "a preference" : "preferences"} the person has identified.`,
        });
      }
    }
  }

  // 5. Sub-domains ticked but the plan is untouched - it would generate five
  //    "not yet completed" lines and read as a plan.
  if (subs.length && !anyAnswered) {
    out.push({
      where: title,
      message: `${subs.length} ${subs.length === 1 ? "sub-domain is" : "sub-domains are"} ticked but none of the six questions has been answered, so this plan would be empty.`,
    });
  }

  // 6. Events with no source. Not a contradiction - a gap that changes how the
  //    event reads later. An allegation and an observation are not the same.
  const unsourced = events.filter((e) => e.text.trim() && !e.source);
  if (unsourced.length) {
    out.push({
      where: title,
      message: `${unsourced.length} ${unsourced.length === 1 ? "event has" : "events have"} no source recorded. Where an account came from changes how it should be read.`,
    });
  }

  // 7. A plan that nobody is going to look at again. A plan can be sound when it
  //    is written and out of date within a shift, and it is usually an event
  //    rather than the calendar that makes it stale - so triggers count as a
  //    review arrangement in their own right.
  if (anyAnswered) {
    const r = input.review || {};
    if (!r.by && !r.when && !(r.triggers || []).length) {
      out.push({
        where: title,
        message: "No review arrangement is recorded - nobody is named to review this plan, no interval is set, and nothing is listed that would bring a review forward.",
      });
    }
  }

  return out;
}
