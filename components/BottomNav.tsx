"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Box, History, Plus, Settings, ShoppingCart } from "lucide-react";

const leftTabs = [
  { href: "/inventory", label: "Items", icon: Box },
  { href: "/restock", label: "Restock", icon: ShoppingCart },
] as const;

const rightTabs = [
  { href: "/activity", label: "Activity", icon: History },
  { href: "/manage", label: "Manage", icon: Settings },
] as const;

type BottomNavProps = {
  onAddItem: () => void;
};

function NavTab({
  href,
  label,
  icon: Icon,
  isActive,
}: {
  href: string;
  label: string;
  icon: typeof Box;
  isActive: boolean;
}) {
  return (
    <Link
      href={href}
      className={`flex flex-1 flex-col items-center gap-0.5 py-2.5 text-[10px] font-bold uppercase tracking-wide transition-colors ${
        isActive ? "text-slate-900" : "text-slate-400"
      }`}
    >
      <Icon className="h-6 w-6" strokeWidth={isActive ? 2.25 : 1.75} />
      <span>{label}</span>
    </Link>
  );
}

export function BottomNav({ onAddItem }: BottomNavProps) {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-slate-200 bg-white pb-[env(safe-area-inset-bottom)]">
      <div className="relative mx-auto max-w-lg">
        <div className="absolute left-1/2 top-0 z-10 -translate-x-1/2 -translate-y-1/2">
          <button
            type="button"
            onClick={onAddItem}
            className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-900 text-white shadow-[0_4px_12px_rgba(15,23,42,0.35)] transition-transform active:scale-95"
            aria-label="Add item"
          >
            <Plus className="h-7 w-7" strokeWidth={2.5} />
          </button>
        </div>

        <div className="flex items-end px-1">
          <div className="flex flex-1">
            {leftTabs.map(({ href, label, icon }) => (
              <NavTab
                key={href}
                href={href}
                label={label}
                icon={icon}
                isActive={pathname === href || pathname.startsWith(`${href}/`)}
              />
            ))}
          </div>

          <div className="w-[72px] shrink-0" aria-hidden="true" />

          <div className="flex flex-1">
            {rightTabs.map(({ href, label, icon }) => (
              <NavTab
                key={href}
                href={href}
                label={label}
                icon={icon}
                isActive={pathname === href || pathname.startsWith(`${href}/`)}
              />
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}
