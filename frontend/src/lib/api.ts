import axios from "axios";

import type { HousingFilter } from "@/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const api = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    if (error.response?.status === 401 && typeof window !== "undefined") {
      localStorage.removeItem("token");
      try {
        const res = await axios.post(`${API_URL}/api/auth/guest`);
        const { access_token } = res.data;
        localStorage.setItem("token", access_token);
        error.config.headers.Authorization = `Bearer ${access_token}`;
        return api.request(error.config);
      } catch {
        return Promise.reject(error);
      }
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  register: (data: { email: string; full_name: string; password: string }) =>
    api.post("/api/auth/register", data),
  login: (data: { email: string; password: string }) =>
    api.post("/api/auth/login", data),
  guest: () => api.post("/api/auth/guest"),
  me: () => api.get("/api/auth/me"),
};

export async function ensureGuestAuth(): Promise<void> {
  if (typeof window === "undefined") return;
  const token = localStorage.getItem("token");
  if (token) return;
  try {
    const res = await axios.post(`${API_URL}/api/auth/guest`);
    const { access_token } = res.data;
    localStorage.setItem("token", access_token);
  } catch {
    // silently fail
  }
}

export const criteriaApi = {
  getAll: () => api.get("/api/criteria"),
  create: (data: { name: string; description?: string; code: string; is_benefit: boolean; unit?: string }) =>
    api.post("/api/criteria", data),
  update: (id: number, data: Record<string, unknown>) =>
    api.put(`/api/criteria/${id}`, data),
  delete: (id: number) => api.delete(`/api/criteria/${id}`),
};

export const housingApi = {
  getAll: (filter?: HousingFilter) => api.get("/api/housings", { params: filter }),
  getById: (id: number) => api.get(`/api/housings/${id}`),
  getDistricts: () => api.get("/api/housings/districts"),
};

export const sessionApi = {
  getAll: () => api.get("/api/sessions"),
  getById: (id: number) => api.get(`/api/sessions/${id}`),
  create: (data: { name: string; description?: string; housing_ids: number[]; criteria_ids: number[] }) =>
    api.post("/api/sessions", data),
  delete: (id: number) => api.delete(`/api/sessions/${id}`),
  getDashboardStats: () => api.get("/api/sessions/dashboard-stats"),
  saveCriteriaComparison: (sessionId: number, data: Record<string, unknown>) =>
    api.post(`/api/sessions/${sessionId}/criteria-comparison`, data),
  saveAlternativeComparison: (sessionId: number, data: Record<string, unknown>) =>
    api.post(`/api/sessions/${sessionId}/alternative-comparison`, data),
  getComparisons: (sessionId: number) =>
    api.get(`/api/sessions/${sessionId}/comparisons`),
  calculate: (sessionId: number) =>
    api.post(`/api/sessions/${sessionId}/calculate`),
  getResults: (sessionId: number) =>
    api.get(`/api/sessions/${sessionId}/results`),
};

export const mlApi = {
  predictPrice: (data: Record<string, unknown>) =>
    api.post("/api/ml/predict/price", data),
  predictQuality: (data: Record<string, unknown>) =>
    api.post("/api/ml/predict/quality", data),
  predictHybrid: (data: Record<string, unknown>) =>
    api.post("/api/ml/predict/hybrid", data),
  getModelComparison: () => api.get("/api/ml/models/comparison"),
  getDatasetStats: () => api.get("/api/ml/dataset/stats"),
  getDistricts: () => api.get("/api/ml/districts"),
};

export default api;
