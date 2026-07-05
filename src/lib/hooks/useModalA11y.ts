"use client";

/**
 * useModalA11y - shared keyboard accessibility for INLINE custom modals.
 *
 * The base Modal component (src/components/ui/modal.tsx) already has
 * focus-trap-react + Escape-to-close. Many pages render their own inline
 * overlay divs instead (they got role="dialog" semantics in Session 26b
 * but no trap or Escape). This hook retrofits both without changing JSX:
 *
 *   const ref = useRef<HTMLDivElement>(null);
 *   useModalA11y(ref, onClose);
 *   ...
 *   <div ref={ref} role="dialog" aria-modal="true" ...>
 *
 * What it does while the ref is mounted:
 * - Escape anywhere closes the modal (calls onClose)
 * - Tab / Shift+Tab cycle within the dialog (manual focus trap)
 * - Focus moves into the dialog on open if it is outside
 * - Focus returns to the previously focused element on unmount
 *
 * Pass enabled=false to skip (e.g. while a nested confirm is open).
 */

import { RefObject, useEffect, useRef } from "react";

const FOCUSABLE =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function useModalA11y(
  ref: RefObject<HTMLElement | null>,
  onClose: () => void,
  enabled: boolean = true
) {
  // Keep the latest onClose without re-binding listeners every render
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!enabled) return;
    if (!ref.current) return;

    const previouslyFocused =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;

    // Always read ref.current live - some modals swap their dialog root
    // between screens (e.g. picker -> confirmation) without unmounting
    // the component that owns the ref.
    const getFocusable = () => {
      const node = ref.current;
      if (!node) return [] as HTMLElement[];
      return Array.from(node.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
        (el) => el.offsetParent !== null || el === document.activeElement
      );
    };

    // Move focus inside the dialog if it is not already there
    if (!ref.current.contains(document.activeElement)) {
      const targets = getFocusable();
      if (targets.length > 0) {
        targets[0].focus();
      } else {
        ref.current.setAttribute("tabindex", "-1");
        ref.current.focus();
      }
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      const node = ref.current;
      if (!node) return;

      if (event.key === "Escape") {
        event.stopPropagation();
        onCloseRef.current();
        return;
      }
      if (event.key !== "Tab") return;

      const targets = getFocusable();
      if (targets.length === 0) {
        event.preventDefault();
        return;
      }
      const first = targets[0];
      const last = targets[targets.length - 1];
      const current = document.activeElement;

      if (event.shiftKey) {
        if (current === first || !node.contains(current)) {
          event.preventDefault();
          last.focus();
        }
      } else {
        if (current === last || !node.contains(current)) {
          event.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown, true);
    return () => {
      document.removeEventListener("keydown", handleKeyDown, true);
      // Restore focus to the opener so keyboard users do not lose their place
      if (previouslyFocused && document.contains(previouslyFocused)) {
        previouslyFocused.focus();
      }
    };
  }, [ref, enabled]);
}
