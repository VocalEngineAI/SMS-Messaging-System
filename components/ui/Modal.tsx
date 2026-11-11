"use client";

import { type ReactNode, useEffect } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { cn } from "@/lib/cn";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  widthClassName?: string;
};

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  widthClassName = "max-w-2xl",
}: Props) {
  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  if (!isOpen || typeof document === "undefined") return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className={cn("flex max-h-[85vh] w-full flex-col rounded-2xl bg-card shadow-xl sm:max-h-[90vh]", widthClassName)}
      >
        <div className="flex items-start justify-between gap-4 border-b border-subtle px-5 py-4">
          <div>
            <h2 id="modal-title" className="text-lg font-bold text-primary">
              {title}
            </h2>
            {description && <p className="mt-1 text-sm text-secondary">{description}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-secondary hover:bg-app hover:text-primary"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        <div className="overflow-y-auto px-5 py-4">{children}</div>

        {footer && (
          <div className="flex flex-col-reverse gap-3 border-t border-subtle px-5 py-4 sm:flex-row sm:justify-end">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
}
