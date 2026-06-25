import { prisma } from "@/lib/prisma";
import { itemCategoryInclude, serializeItem, sortItemsByCategory } from "@/lib/items";
import { RestockView } from "@/components/RestockView";

export const dynamic = "force-dynamic";

export default async function RestockPage() {
  const items = await prisma.item.findMany({
    include: itemCategoryInclude,
  });

  return (
    <div className="px-4 pt-6">
      <h1 className="mb-6 text-2xl font-bold tracking-tight text-slate-900">Restock</h1>
      <RestockView items={sortItemsByCategory(items.map(serializeItem))} />
    </div>
  );
}
