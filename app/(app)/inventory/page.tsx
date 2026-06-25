import { prisma } from "@/lib/prisma";
import { categoryInclude, serializeCategory } from "@/lib/categories";
import { itemCategoryInclude, serializeItem, sortItemsByCategory } from "@/lib/items";
import { InventoryView } from "@/components/InventoryView";

export const dynamic = "force-dynamic";

export default async function InventoryPage() {
  const [items, categories] = await Promise.all([
    prisma.item.findMany({ include: itemCategoryInclude }),
    prisma.itemCategory.findMany({
      include: categoryInclude,
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    }),
  ]);

  return (
    <InventoryView
      items={sortItemsByCategory(items.map(serializeItem))}
      categories={categories.map(serializeCategory)}
    />
  );
}
