import { type InputHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export function Checkbox({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      type="checkbox"
      className={cn(
        "h-4 w-4 shrink-0 cursor-pointer rounded border-subtle text-ink accent-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-ink",
        className,
      )}
      {...props}
    />
  );
}
