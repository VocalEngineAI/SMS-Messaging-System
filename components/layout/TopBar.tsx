"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, LogOut, Menu, Send, Users, X } from "lucide-react";
import { cn } from "@/lib/cn";
import { Logo } from "@/components/ui/Logo";

const NAV_ITEMS = [
  { href: "/contacts", label: "Contacts", icon: Users },
  { href: "/send", label: "Send SMS", icon: Send },
];

export function TopBar() {
  const pathname = usePathname();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isNavOpen, setIsNavOpen] = useState(false);

  return (
    <header className="topbar-h relative flex shrink-0 items-center gap-3 border-b border-subtle bg-card px-4 sm:gap-6 sm:px-6 lg:px-8">
      <Link href="/contacts" className="flex shrink-0 items-center">
        <Logo size={48} />
      </Link>

      <nav className="absolute inset-x-0 hidden items-center justify-center gap-2 lg:flex">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex min-h-10 items-center gap-2 border-b-2 px-3 text-sm font-medium transition-colors",
                isActive ? "border-ink text-primary" : "border-transparent text-secondary hover:text-primary",
              )}
            >
              <Icon size={16} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <button
        type="button"
        onClick={() => setIsNavOpen((open) => !open)}
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-subtle text-secondary hover:text-primary lg:hidden"
        aria-label={isNavOpen ? "Close menu" : "Open menu"}
        aria-expanded={isNavOpen}
      >
        {isNavOpen ? <X size={20} /> : <Menu size={20} />}
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

      {isNavOpen && (
        <>
          <div className="fixed inset-0 z-40 bg-black/40 lg:hidden" onClick={() => setIsNavOpen(false)} aria-hidden="true" />
          <nav className="absolute inset-x-0 top-full z-50 flex flex-col gap-1 border-b border-subtle bg-card p-3 shadow-lg lg:hidden">
            {NAV_ITEMS.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsNavOpen(false)}
                  className={cn(
                    "flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm font-medium transition-colors",
                    isActive ? "bg-ink text-white" : "text-secondary hover:bg-app hover:text-primary",
                  )}
                >
                  <Icon size={18} />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </>
      )}
    </header>
  );
}
