"use client";

import { Fragment, useEffect, useCallback } from "react";
import { AlertTriangle, X } from "lucide-react";
import FocusTrap from "focus-trap-react";

type ConfirmDialogVariant = "danger" | "warning" | "default";

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  variant?: ConfirmDialogVariant;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  isOpen,
  title,
  message,
  variant = "default",
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  // Handle Escape key to cancel
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === "Escape" && isOpen) {
        onCancel();
      }
    },
    [isOpen, onCancel]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  // Prevent body scroll when dialog is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const variantStyles = {
    danger: {
      icon: "bg-red-100 text-nhs-red",
      button: "bg-nhs-red hover:bg-red-700 focus-visible:ring-nhs-red",
    },
    warning: {
      icon: "bg-amber-100 text-amber-600",
      button: "bg-amber-500 hover:bg-amber-600 focus-visible:ring-amber-500",
    },
    default: {
      icon: "bg-indigo-100 text-indigo-600",
      button: "bg-indigo-600 hover:bg-indigo-700 focus-visible:ring-indigo-600",
    },
  };

  const styles = variantStyles[variant];

  return (
    <Fragment>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-50 transition-opacity"
        onClick={onCancel}
        aria-hidden="true"
      />

      {/* Dialog with Focus Trap */}
      <FocusTrap
        focusTrapOptions={{
          initialFocus: false,
          allowOutsideClick: true,
          returnFocusOnDeactivate: true,
          escapeDeactivates: false,
        }}
      >
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="max-w-md w-full bg-white rounded-xl shadow-xl transform transition-all"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="confirm-dialog-title"
            aria-describedby="confirm-dialog-message"
          >
            {/* Header */}
            <div className="flex items-start gap-4 px-6 pt-6 pb-4">
              {/* Icon */}
              <div className={`p-3 rounded-full ${styles.icon}`}>
                <AlertTriangle className="w-6 h-6" />
              </div>

              <div className="flex-1 min-w-0">
                <h2
                  id="confirm-dialog-title"
                  className="text-lg font-bold text-nhs-black"
                >
                  {title}
                </h2>
                <p
                  id="confirm-dialog-message"
                  className="mt-2 text-sm text-nhs-dark-grey"
                >
                  {message}
                </p>
              </div>

              {/* Close button */}
              <button
                onClick={onCancel}
                className="p-1 rounded-lg text-nhs-mid-grey hover:text-nhs-black hover:bg-nhs-pale-grey transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 px-6 pb-6 pt-2">
              <button
                onClick={onCancel}
                className="px-4 py-2 text-sm font-semibold text-nhs-dark-grey bg-nhs-pale-grey hover:bg-nhs-mid-grey/30 rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-nhs-mid-grey"
              >
                {cancelLabel}
              </button>
              <button
                onClick={onConfirm}
                className={`px-4 py-2 text-sm font-semibold text-white rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${styles.button}`}
                autoFocus
              >
                {confirmLabel}
              </button>
            </div>
          </div>
        </div>
      </FocusTrap>
    </Fragment>
  );
}
