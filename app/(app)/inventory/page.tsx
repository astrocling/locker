import { prisma } from "@/lib/prisma";
import { CATEGORY_ORDER, serializeItem } from "@/lib/items";
import { InventoryView } from "@/components/InventoryView";

export const dynamic = "force-dynamic";

export default async function InventoryPage() {
  const items = await prisma.item.findMany({
    orderBy: [{ category: "asc" }, { name: "asc" }],
  });

  const sorted = [...items].sort((a, b) => {
    const catDiff =
      CATEGORY_ORDER.indexOf(a.category) - CATEGORY_ORDER.indexOf(b.category);
    if (catDiff !== 0) return catDiff;
    return a.name.localeCompare(b.name);
  });

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Inventory</h1>
      <InventoryView items={sorted.map(serializeItem)} />
    </div>
  );
}
