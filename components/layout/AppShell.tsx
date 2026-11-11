"use client";

import { useState, type ReactNode } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopBar } from "@/components/layout/TopBar";

export function AppShell({ children }: { children: ReactNode }) {
  const [isNavOpen, setIsNavOpen] = useState(false);

  return (
    <div className="h-screen overflow-hidden bg-app">
      <Sidebar isOpen={isNavOpen} onClose={() => setIsNavOpen(false)} />
      <div className="flex h-full min-h-0 min-w-0 flex-col lg:pl-[var(--sidebar-w)]">
        <TopBar onMenuClick={() => setIsNavOpen(true)} />
        <main className="app-gutter-x app-gutter-y min-h-0 flex-1 overflow-y-auto">{children}</main>
        <footer className="shrink-0 border-t border-subtle px-4 py-3 text-center text-xs text-secondary sm:px-6 lg:px-8">
          © {new Date().getFullYear()} Sparkr. All rights reserved.
        </footer>
      </div>
    </div>
  );
}
