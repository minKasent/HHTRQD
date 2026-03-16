"use client";

import { create } from "zustand";
import type { User } from "@/types";
import { authApi, ensureGuestAuth } from "@/lib/api";

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  loadUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: false,
  isAuthenticated: false,

  loadUser: async () => {
    await ensureGuestAuth();
    try {
      const res = await authApi.me();
      set({ user: res.data, isAuthenticated: true, isLoading: false });
    } catch {
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },
}));
