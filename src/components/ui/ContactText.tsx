"use client";

import React from "react";
import { CopyChip } from "./CopyChip";

// Finds phone numbers and email addresses inside ordinary guide prose and gives
// each one a copy button (Mike, 27 Jul). Done by detection rather than by
// hand-tagging every contact in the data, so it also covers guides written
// later or edited in the site editor - nobody has to remember to mark them up.

// Broad candidate match; the digit count is checked afterwards so we do not
// pick up dates, doses, policy numbers or section numbers.
const PHONE_CANDIDATE = /\b(?:0\d[\d\s-]{7,13}\d|116\s?123)\b/g;
const EMAIL = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;

/** A UK dialable number has 10 or 11 digits; 116 123 is the Samaritans short code. */
function isDialable(candidate: string): boolean {
  const digits = candidate.replace(/\D/g, "");
  if (digits === "116123") return true;
  return digits.startsWith("0") && (digits.length === 10 || digits.length === 11);
}

// One regex for the split, so a line containing both an email and a number is
// handled in a single pass and the surrounding text keeps its order.
const COMBINED = new RegExp(`(${EMAIL.source}|${PHONE_CANDIDATE.source})`, "g");

/**
 * Splits `text` into plain strings and contact chips. Returns React nodes.
 * Non-contact text passes through untouched.
 */
export function renderWithContacts(text: string): React.ReactNode {
  if (!text || (!text.includes("@") && !/\d/.test(text))) return text;

  const parts = text.split(COMBINED);
  // Nothing matched - hand back the original string so React renders it as-is.
  if (parts.length === 1) return text;

  return parts.map((part, i) => {
    if (!part) return null;

    const isEmail = new RegExp(`^${EMAIL.source}$`).test(part);
    const isPhone =
      !isEmail && new RegExp(`^(?:${PHONE_CANDIDATE.source})$`).test(part) && isDialable(part);

    if (!isEmail && !isPhone) return <React.Fragment key={i}>{part}</React.Fragment>;

    return (
      <span key={i} className="inline-flex items-center gap-0.5 whitespace-nowrap">
        <a
          href={isEmail ? `mailto:${part}` : `tel:${part.replace(/\s/g, "")}`}
          className="text-nhs-blue hover:text-nhs-dark-blue font-medium"
        >
          {part}
        </a>
        <CopyChip value={part} label={isEmail ? "email address" : "phone number"} />
      </span>
    );
  });
}

/** Convenience wrapper when you just want to render a contact-bearing string. */
export function ContactText({ text, className }: { text: string; className?: string }) {
  return <span className={className}>{renderWithContacts(text)}</span>;
}
