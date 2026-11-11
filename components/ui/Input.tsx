import { type InputHTMLAttributes, type ReactNode, useId } from "react";
import { cn } from "@/lib/cn";

type Props = InputHTMLAttributes<HTMLInputElement> & {
  label?: ReactNode;
  icon?: ReactNode;
  rightSlot?: ReactNode;
  error?: string;
};

export function Input({ label, icon, rightSlot, error, id, className, ...props }: Props) {
  const generatedId = useId();
  const inputId = id ?? generatedId;

  return (
    <div className="flex flex-col gap-2">
      {label && (
        <label htmlFor={inputId} className="text-sm font-semibold text-primary">
          {label}
        </label>
      )}
      <div
        className={cn(
          "flex items-center gap-2.5 rounded-lg border bg-card px-3.5 py-2.5 focus-within:border-ink focus-within:ring-1 focus-within:ring-ink has-[:disabled]:cursor-not-allowed has-[:disabled]:bg-app has-[:disabled]:opacity-70",
          error ? "border-danger" : "border-subtle",
        )}
      >
        {icon && (
          <span className="text-secondary" aria-hidden="true">
            {icon}
          </span>
        )}
        <input
          id={inputId}
          className={cn("w-full bg-transparent text-sm text-primary placeholder:text-muted focus:outline-none", className)}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${inputId}-error` : undefined}
          {...props}
        />
        {rightSlot}
      </div>
      {error && (
        <p id={`${inputId}-error`} className="text-sm text-danger">
          {error}
        </p>
      )}
    </div>
  );
}
