"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, LogOut, Menu } from "lucide-react";

type Props = {
  onMenuClick: () => void;
};

export function TopBar({ onMenuClick }: Props) {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  return (
    <header className="topbar-h flex shrink-0 items-center gap-3 border-b border-subtle bg-card px-4 sm:gap-4 sm:px-6 lg:px-8">
      <button
        type="button"
        onClick={onMenuClick}
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-subtle text-secondary hover:text-primary lg:hidden"
        aria-label="Open menu"
      >
        <Menu size={20} />
      </button>

      <div className="ml-auto flex items-center gap-3">
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsUserMenuOpen((open) => !open)}
            className="flex min-h-10 items-center gap-2 rounded-lg px-2 hover:bg-app"
            aria-haspopup="menu"
            aria-expanded={isUserMenuOpen}
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-ink text-sm font-semibold text-white">
              SM
            </span>
            <span className="hidden text-sm font-semibold text-primary sm:inline">Sparkr Marketing</span>
            <ChevronDown size={16} className="hidden text-secondary sm:inline" />
          </button>

          {isUserMenuOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setIsUserMenuOpen(false)} aria-hidden="true" />
              <div
                role="menu"
                className="absolute right-0 top-full z-50 mt-2 w-56 rounded-xl border border-subtle bg-card p-2 shadow-lg"
              >
                <div className="border-b border-subtle px-3 py-2">
                  <p className="truncate text-sm font-semibold text-primary">Sparkr Marketing</p>
                  <p className="truncate text-xs text-secondary">team@sparkr.com</p>
                </div>
                <Link
                  href="/login"
                  role="menuitem"
                  className="mt-2 flex min-h-10 w-full items-center gap-2 rounded-lg px-3 text-sm font-semibold text-danger hover:bg-danger/10"
                >
                  <LogOut size={16} />
                  Log out
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
