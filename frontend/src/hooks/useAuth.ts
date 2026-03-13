"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/stores/authStore";
import { ensureGuestAuth } from "@/lib/api";

export function useAuth() {
  const { user, isAuthenticated, isLoading, loadUser } = useAuthStore();

  useEffect(() => {
    const init = async () => {
      await ensureGuestAuth();
      await loadUser();
    };
    init();
  }, [loadUser]);

  return { user, isAuthenticated, isLoading };
}
