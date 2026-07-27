"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";

// Small copy-to-clipboard button that sits beside a value. Used everywhere a
// phone number or email address is shown (Mike, 27 Jul) - on a ward you are
// nearly always about to type the thing into SystmOne, a form or a handset,
// and reading it off the screen is where transcription errors come from.
export function CopyChip({
  value,
  label,
  className = "",
}: {
  value: string;
  /** What is being copied, for the tooltip and screen readers. */
  label?: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      // Clipboard blocked (insecure context or permission) - fail quietly
      // rather than throwing an error at someone mid-referral.
    }
  };

  const what = label || value;

  return (
    <button
      type="button"
      onClick={(e) => {
        // Contacts often sit inside a card that is itself clickable.
        e.preventDefault();
        e.stopPropagation();
        copy();
      }}
      aria-label={copied ? `${what} copied` : `Copy ${what}`}
      title={copied ? "Copied" : `Copy ${what}`}
      className={`print-hide inline-flex items-center justify-center align-middle rounded-md p-1 transition-colors ${
        copied
          ? "bg-emerald-100 text-emerald-700"
          : "text-gray-400 hover:bg-gray-100 hover:text-gray-700"
      } ${className}`}
    >
      {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
    </button>
  );
}
