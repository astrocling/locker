import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Owner's Locker",
  description: "Track everything in the Owner's Locker between Disney World visits",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50 text-gray-900 antialiased">
        {children}
      </body>
    </html>
  );
}
