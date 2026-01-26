"use client";

import { Fragment, ReactNode, useEffect, useCallback } from "react";
import { X } from "lucide-react";
import FocusTrap from "focus-trap-react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  size?: "sm" | "md" | "lg";
  showClose?: boolean;
}

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = "md",
  showClose = true,
}: ModalProps) {
  // Handle Escape key to close modal
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === "Escape" && isOpen) {
        onClose();
      }
    },
    [isOpen, onClose]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  // Prevent body scroll when modal is open
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

  const sizes = {
    sm: "max-w-sm",
    md: "max-w-lg",
    lg: "max-w-2xl",
  };

  return (
    <Fragment>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40 transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal with Focus Trap */}
      <FocusTrap
        focusTrapOptions={{
          initialFocus: false,
          allowOutsideClick: true,
          returnFocusOnDeactivate: true,
          escapeDeactivates: false, // We handle Escape ourselves
        }}
      >
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className={`${sizes[size]} w-full bg-white rounded-xl shadow-xl transform transition-all`}
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-nhs-pale-grey">
              <h2
                id="modal-title"
                className="text-xl font-bold text-nhs-black"
              >
                {title}
              </h2>
              {showClose && (
                <button
                  onClick={onClose}
                  className="p-1 rounded-lg text-nhs-mid-grey hover:text-nhs-black hover:bg-nhs-pale-grey transition-colors"
                  aria-label="Close modal"
                  autoFocus
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* Content */}
            <div className="px-6 py-4">{children}</div>
          </div>
        </div>
      </FocusTrap>
    </Fragment>
  );
}

interface ModalActionsProps {
  children: ReactNode;
}

export function ModalActions({ children }: ModalActionsProps) {
  return (
    <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-nhs-pale-grey">
      {children}
    </div>
  );
}
