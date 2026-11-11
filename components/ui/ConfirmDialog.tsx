"use client";

import type { ReactNode } from "react";
import { Modal } from "./Modal";
import { Button } from "./Button";

type Props = {
  title: string;
  description: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  isLoading?: boolean;
  destructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export function ConfirmDialog({
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  isLoading = false,
  destructive = false,
  onConfirm,
  onCancel,
}: Props) {
  return (
    <Modal
      isOpen
      onClose={onCancel}
      title={title}
      widthClassName="max-w-md"
      footer={
        <>
          <Button variant="outline" size="sm" onClick={onCancel} disabled={isLoading} className="w-full sm:w-auto">
            {cancelLabel}
          </Button>
          <Button
            variant={destructive ? "destructive" : "primary"}
            size="sm"
            onClick={onConfirm}
            isLoading={isLoading}
            className="w-full sm:w-auto"
          >
            {confirmLabel}
          </Button>
        </>
      }
    >
      <p className="text-sm text-secondary">{description}</p>
    </Modal>
  );
}
