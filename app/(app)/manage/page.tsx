import { prisma } from "@/lib/prisma";
import { categoryInclude, serializeCategory } from "@/lib/categories";
import { ManageView } from "@/components/ManageView";

export const dynamic = "force-dynamic";

export default async function ManagePage() {
  const categories = await prisma.itemCategory.findMany({
    include: categoryInclude,
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  });

  return (
    <div className="px-4 pt-6">
      <h1 className="mb-6 text-2xl font-bold tracking-tight text-slate-900">
        Manage
      </h1>
      <ManageView categories={categories.map(serializeCategory)} />
    </div>
  );
}
