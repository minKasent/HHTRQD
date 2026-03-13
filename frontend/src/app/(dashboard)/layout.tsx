"use client";

import { useAuth } from "@/hooks/useAuth";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar, MobileNav } from "@/components/layout/Sidebar";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 overflow-auto pb-20 md:pb-0">
          <div className="mx-auto max-w-6xl px-6 py-8 md:px-8 md:py-10">
            {children}
          </div>
        </main>
      </div>
      <MobileNav />
    </div>
  );
}
