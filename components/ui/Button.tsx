import { type ButtonHTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/cn";

export const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2",
  {
    variants: {
      variant: {
        primary:
          "bg-ink text-white shadow-xs shadow-black/5 hover:bg-ink-light disabled:hover:bg-ink",
        outline:
          "bg-card text-primary border border-subtle shadow-xs shadow-black/5 hover:bg-app disabled:hover:bg-card",
        ghost: "text-primary hover:bg-app disabled:hover:bg-transparent",
        destructive:
          "bg-danger text-white shadow-xs shadow-black/5 hover:bg-danger/90 disabled:hover:bg-danger",
      },
      size: {
        md: "min-h-11 px-4 py-2.5 text-sm md:px-5 md:py-3 md:text-base",
        sm: "h-9 rounded-md px-3 text-sm",
        icon: "size-9 rounded-md p-0 shrink-0",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  },
);

type Props = ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants> & {
    isLoading?: boolean;
  };

export function Button({
  variant,
  size,
  isLoading = false,
  disabled,
  className,
  children,
  ...props
}: Props) {
  return (
    <button
      className={cn(buttonVariants({ variant, size, className }))}
      disabled={disabled || isLoading}
      aria-busy={isLoading}
      {...props}
    >
      {isLoading && (
        <span
          className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
          aria-hidden="true"
        />
      )}
      {children}
    </button>
  );
}
