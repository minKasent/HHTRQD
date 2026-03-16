import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(value);
}

export function formatDate(dateString: string): string {
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(dateString));
}

export function formatPercent(value: number): string {
  return `${(value * 100).toFixed(2)}%`;
}

export const QUALITY_COLORS: Record<string, string> = {
  Budget: "bg-blue-100 text-blue-800",
  Standard: "bg-amber-100 text-amber-800",
  Premium: "bg-green-100 text-green-800",
};

export const QUALITY_HEX: Record<string, string> = {
  Budget: "#3b82f6",
  Standard: "#f59e0b",
  Premium: "#22c55e",
};
