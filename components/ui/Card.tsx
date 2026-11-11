import { type HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "flex flex-col rounded-xl border border-subtle bg-card shadow-xs shadow-black/5",
        className,
      )}
      {...props}
    />
  );
}

function CardHeader({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "flex min-h-14 flex-wrap items-center justify-between gap-2.5 border-b border-subtle px-5 py-3",
        className,
      )}
      {...props}
    />
  );
}

function CardHeading({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("space-y-1", className)} {...props} />;
}

function CardTitle({ className, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={cn("text-base font-semibold leading-none text-primary", className)} {...props} />;
}

function CardDescription({ className, ...props }: HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn("text-sm text-secondary", className)} {...props} />;
}

function CardToolbar({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex items-center gap-2.5", className)} {...props} />;
}

function CardContent({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("grow p-5", className)} {...props} />;
}

function CardFooter({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex min-h-14 items-center border-t border-subtle px-5", className)} {...props} />;
}

export { Card, CardContent, CardDescription, CardFooter, CardHeader, CardHeading, CardTitle, CardToolbar };
