"use client";

import { useState } from "react";
import { BottomNav } from "@/components/BottomNav";
import { ItemSheet } from "@/components/ItemSheet";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [addSheetOpen, setAddSheetOpen] = useState(false);

  return (
    <>
      <div className="mx-auto min-h-screen max-w-lg">
        <main className="pb-24">{children}</main>
        <BottomNav onAddItem={() => setAddSheetOpen(true)} />
      </div>
      {addSheetOpen && (
        <ItemSheet mode="add" onClose={() => setAddSheetOpen(false)} />
      )}
    </>
  );
}
