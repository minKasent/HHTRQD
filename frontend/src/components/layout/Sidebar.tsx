"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Database,
  GitCompareArrows,
  History,
  LayoutDashboard,
  ListChecks,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Tổng quan", icon: LayoutDashboard },
  { href: "/housing", label: "Dữ liệu nhà trọ", icon: Database },
  { href: "/criteria", label: "Tiêu chí", icon: ListChecks },
  { href: "/comparison", label: "So sánh AHP", icon: GitCompareArrows },
  { href: "/history", label: "Kết quả & Lịch sử", icon: History },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-60 shrink-0 border-r border-border/40 bg-secondary/30 md:block">
      <nav className="flex flex-col gap-1 p-5">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-2xl px-4 py-2.5 text-sm transition-all duration-300 ease-out",
                isActive
                  ? "bg-primary text-primary-foreground shadow-botanical"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              )}
            >
              <item.icon className="h-4 w-4" strokeWidth={1.5} />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-border/40 bg-background/90 backdrop-blur-sm md:hidden">
      <div className="flex items-center justify-around py-2">
        {navItems.slice(0, 5).map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-1 px-2 py-1 text-xs transition-all duration-300",
                isActive ? "text-foreground" : "text-muted-foreground"
              )}
            >
              <item.icon className="h-5 w-5" strokeWidth={1.5} />
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
