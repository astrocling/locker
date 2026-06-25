"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";

type AlertBannerProps = {
  messages: string[];
};

const DISMISS_KEY = "locker-alert-dismissed";

export function AlertBanner({ messages }: AlertBannerProps) {
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem(DISMISS_KEY) === "true") {
      setDismissed(true);
    }
  }, []);

  if (messages.length === 0 || dismissed) {
    return null;
  }

  function dismiss() {
    sessionStorage.setItem(DISMISS_KEY, "true");
    setDismissed(true);
  }

  return (
    <div className="mb-4 flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
      <div className="flex-1 space-y-1">
        <p className="font-medium">Items need attention</p>
        <ul className="list-inside list-disc text-amber-800">
          {messages.slice(0, 3).map((message) => (
            <li key={message}>{message}</li>
          ))}
        </ul>
        {messages.length > 3 && (
          <p className="text-xs text-amber-700">
            +{messages.length - 3} more
          </p>
        )}
      </div>
      <button
        type="button"
        onClick={dismiss}
        className="shrink-0 rounded p-1 text-amber-700 hover:bg-amber-100"
        aria-label="Dismiss alert"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
