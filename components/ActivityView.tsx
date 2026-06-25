import {
  formatActivityMessage,
  formatRelativeTime,
  getUserInitials,
  type SerializedActivityLog,
} from "@/lib/activity";

type ActivityViewProps = {
  logs: SerializedActivityLog[];
};

function ActivityRow({ log }: { log: SerializedActivityLog }) {
  const message = formatActivityMessage(log);
  const time = formatRelativeTime(log.createdAt);

  return (
    <div className="flex items-start gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <div
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-700"
        aria-hidden="true"
      >
        {getUserInitials(log.userName)}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm text-gray-900">
          {message}
          <span className="text-gray-500"> · {time}</span>
        </p>
      </div>
    </div>
  );
}

export function ActivityView({ logs }: ActivityViewProps) {
  if (logs.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-gray-300 bg-gray-50 px-4 py-8 text-center text-sm text-gray-500">
        No activity yet — changes will appear here.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {logs.map((log) => (
        <ActivityRow key={log.id} log={log} />
      ))}
    </div>
  );
}
