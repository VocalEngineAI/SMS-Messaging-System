import { type ReactNode, type SelectHTMLAttributes, useId } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/cn";

type Props = SelectHTMLAttributes<HTMLSelectElement> & {
  label?: ReactNode;
};

export function Select({ label, id, className, children, ...props }: Props) {
  const generatedId = useId();
  const selectId = id ?? generatedId;

  return (
    <div className="flex flex-col gap-2">
      {label && (
        <label htmlFor={selectId} className="text-sm font-semibold text-primary">
          {label}
        </label>
      )}
      <div className="relative flex items-center rounded-lg border border-subtle bg-card focus-within:border-ink focus-within:ring-1 focus-within:ring-ink">
        <select
          id={selectId}
          className={cn(
            "w-full appearance-none bg-transparent px-3.5 py-2.5 pr-9 text-sm text-primary focus:outline-none",
            className,
          )}
          {...props}
        >
          {children}
        </select>
        <ChevronDown size={16} className="pointer-events-none absolute right-3 text-secondary" aria-hidden="true" />
      </div>
    </div>
  );
}
