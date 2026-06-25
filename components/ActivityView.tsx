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
    <div className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-sm font-semibold text-slate-700"
        aria-hidden="true"
      >
        {getUserInitials(log.userName)}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm text-slate-900">
          {message}
          <span className="text-slate-500"> · {time}</span>
        </p>
      </div>
    </div>
  );
}

export function ActivityView({ logs }: ActivityViewProps) {
  if (logs.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
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
