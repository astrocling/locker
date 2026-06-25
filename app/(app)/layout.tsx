import { BottomNav } from "@/components/BottomNav";

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="mx-auto min-h-screen max-w-lg">
      <main className="px-4 pb-24 pt-6">{children}</main>
      <BottomNav />
    </div>
  );
}
