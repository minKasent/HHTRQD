"use client";

import Link from "next/link";
import { Leaf } from "lucide-react";

export function Navbar() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/40 bg-background/80 backdrop-blur-sm">
      <div className="flex h-16 items-center px-6">
        <Link href="/dashboard" className="flex items-center gap-2.5 group">
          <Leaf className="h-5 w-5 text-sage transition-transform duration-500 group-hover:rotate-12" strokeWidth={1.5} />
          <span className="font-heading text-lg font-semibold tracking-tight">
            Chọn nhà trọ
          </span>
        </Link>
      </div>
    </header>
  );
}
