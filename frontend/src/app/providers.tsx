"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { Toaster } from "sonner";
import { useState, useEffect } from "react";

const FIVE_MINUTES = 5 * 60 * 1000;
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

function useKeepAlive() {
  useEffect(() => {
    const ping = () => fetch(`${API_URL}/api/health`, { method: "GET" }).catch(() => {});
    ping();
    const id = setInterval(ping, FIVE_MINUTES);
    return () => clearInterval(id);
  }, []);
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60_000,
            gcTime: 5 * 60_000,
            retry: 2,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  useKeepAlive();

  return (
    <ThemeProvider attribute="class" defaultTheme="light" forcedTheme="light" disableTransitionOnChange>
      <QueryClientProvider client={queryClient}>
        {children}
        <Toaster position="top-right" richColors closeButton />
      </QueryClientProvider>
    </ThemeProvider>
  );
}
