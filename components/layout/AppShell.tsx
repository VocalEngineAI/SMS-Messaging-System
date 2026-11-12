import type { ReactNode } from "react";
import { TopBar } from "@/components/layout/TopBar";
import { ToastProvider } from "@/components/ui/Toast";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <ToastProvider>
      <div className="flex h-screen min-h-0 flex-col overflow-hidden bg-app">
        <TopBar />
        <main className="app-gutter-x app-gutter-y flex min-h-0 flex-1 flex-col overflow-y-auto">{children}</main>
        <footer className="shrink-0 border-t border-subtle px-4 py-3 text-center text-xs text-secondary sm:px-6 lg:px-8">
          © {new Date().getFullYear()} Sparkr. All rights reserved.
        </footer>
      </div>
    </ToastProvider>
  );
}
