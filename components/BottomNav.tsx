"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ClipboardList, History, Package } from "lucide-react";

const tabs = [
  { href: "/inventory", label: "Inventory", icon: Package },
  { href: "/restock", label: "Restock", icon: ClipboardList },
  { href: "/activity", label: "Activity", icon: History },
] as const;

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-gray-200 bg-white pb-[env(safe-area-inset-bottom)]">
      <div className="mx-auto flex max-w-lg items-stretch justify-around">
        {tabs.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-1 flex-col items-center gap-1 px-2 py-3 text-xs font-medium transition-colors ${
                isActive ? "text-blue-600" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <Icon className="h-5 w-5" strokeWidth={isActive ? 2.5 : 2} />
              <span>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
