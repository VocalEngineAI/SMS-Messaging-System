import { type ReactNode, type TextareaHTMLAttributes, useId } from "react";
import { cn } from "@/lib/cn";

type Props = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: ReactNode;
  error?: string;
};

export function Textarea({ label, error, id, className, ...props }: Props) {
  const generatedId = useId();
  const textareaId = id ?? generatedId;

  return (
    <div className="flex flex-col gap-2">
      {label && (
        <label htmlFor={textareaId} className="text-sm font-semibold text-primary">
          {label}
        </label>
      )}
      <textarea
        id={textareaId}
        className={cn(
          "w-full resize-none rounded-lg border bg-card px-3.5 py-3 text-sm text-primary placeholder:text-muted focus:outline-none focus:ring-1 focus:ring-ink",
          error ? "border-danger" : "border-subtle focus:border-ink",
          className,
        )}
        aria-invalid={Boolean(error)}
        {...props}
      />
      {error && <p className="text-sm text-danger">{error}</p>}
    </div>
  );
}
