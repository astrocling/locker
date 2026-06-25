import { prisma } from "@/lib/prisma";
import { serializeActivityLog } from "@/lib/activity";
import { ActivityView } from "@/components/ActivityView";

export const dynamic = "force-dynamic";

export default async function ActivityPage() {
  const logs = await prisma.activityLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Activity</h1>
      <ActivityView logs={logs.map(serializeActivityLog)} />
    </div>
  );
}
