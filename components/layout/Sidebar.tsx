"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, LogOut, MessageSquareText, Send, Users, X } from "lucide-react";
import { cn } from "@/lib/cn";
import { Logo } from "@/components/ui/Logo";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/contacts", label: "Contacts", icon: Users },
  { href: "/send", label: "Send SMS", icon: Send },
  { href: "/history", label: "SMS History", icon: MessageSquareText },
];

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

export function Sidebar({ isOpen, onClose }: Props) {
  const pathname = usePathname();

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 z-40 bg-black/40 lg:hidden" onClick={onClose} aria-hidden="true" />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex h-screen w-64 shrink-0 flex-col overflow-hidden bg-ink transition-transform duration-200 ease-in-out",
          "lg:w-[var(--sidebar-w)] lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="topbar-h relative flex shrink-0 items-center justify-start px-5">
          <Logo size={32} light />
          <button
            type="button"
            onClick={onClose}
            className="absolute right-4 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-lg text-white/70 hover:bg-white/10 hover:text-white lg:hidden"
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex flex-1 flex-col overflow-y-auto px-4 py-4">
          <nav className="flex flex-1 flex-col gap-1">
            {NAV_ITEMS.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={cn(
                    "flex min-h-11 items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                    isActive ? "bg-white text-ink" : "text-white/70 hover:bg-white/10 hover:text-white",
                  )}
                >
                  <Icon size={18} />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <Link
            href="/login"
            className="mt-2 flex min-h-11 items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-white/70 hover:bg-white/10 hover:text-white"
          >
            <LogOut size={18} />
            Logout
          </Link>
        </div>
      </aside>
    </>
  );
}
