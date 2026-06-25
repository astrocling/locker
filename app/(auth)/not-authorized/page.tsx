import { signOut } from "@/auth";

export default function NotAuthorizedPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <h1 className="text-xl font-semibold text-slate-900">Access denied</h1>
        <p className="mt-3 text-sm text-slate-600">
          Your Google account isn&apos;t on the approved list. Contact Bruce to
          get access.
        </p>
        <form
          className="mt-6"
          action={async () => {
            "use server";
            await signOut({ redirectTo: "/login" });
          }}
        >
          <button
            type="submit"
            className="text-sm font-medium text-slate-900 hover:text-slate-700"
          >
            Sign out
          </button>
        </form>
      </div>
    </main>
  );
}
