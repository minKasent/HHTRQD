"use client";

import { useAuth } from "@/hooks/useAuth";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar, MobileNav } from "@/components/layout/Sidebar";
import { ErrorBoundary } from "@/components/common/ErrorBoundary";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  useAuth();

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 overflow-auto pb-20 md:pb-0">
          <div className="mx-auto max-w-6xl px-6 py-8 md:px-8 md:py-10">
            <ErrorBoundary>{children}</ErrorBoundary>
          </div>
        </main>
      </div>
      <MobileNav />
    </div>
  );
}
