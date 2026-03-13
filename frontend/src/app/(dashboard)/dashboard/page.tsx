"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { BarChart3, Database, GitCompareArrows, History } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageSkeleton } from "@/components/common/LoadingSpinner";
import { sessionApi } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import type { DashboardStats } from "@/types";

export default function DashboardPage() {
  const { data: stats, isLoading } = useQuery<DashboardStats>({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      const res = await sessionApi.getDashboardStats();
      return res.data;
    },
  });

  if (isLoading) return <PageSkeleton />;

  return (
    <div className="space-y-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-3xl font-bold tracking-tight md:text-4xl">
            Tổng quan
          </h1>
          <p className="mt-1.5 text-muted-foreground">
            Quản lý và phân tích lựa chọn nhà trọ
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" asChild>
            <Link href="/housing">
              <Database className="mr-2 h-4 w-4" strokeWidth={1.5} />
              Xem dữ liệu
            </Link>
          </Button>
          <Button asChild>
            <Link href="/comparison">
              <GitCompareArrows className="mr-2 h-4 w-4" strokeWidth={1.5} />
              Tạo so sánh mới
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium normal-case tracking-normal font-body">
              Nhà trọ trong dataset
            </CardTitle>
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-sage/10">
              <Database className="h-4 w-4 text-sage" strokeWidth={1.5} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="font-heading text-3xl font-bold">
              {stats?.housing_count?.toLocaleString("vi-VN") || 0}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">Dữ liệu tham khảo có sẵn</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium normal-case tracking-normal font-body">
              Phiên quyết định
            </CardTitle>
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-sage/10">
              <BarChart3 className="h-4 w-4 text-sage" strokeWidth={1.5} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="font-heading text-3xl font-bold">
              {stats?.session_count || 0}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">Tổng phiên</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium normal-case tracking-normal font-body">
              Hoàn thành
            </CardTitle>
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-sage/10">
              <History className="h-4 w-4 text-sage" strokeWidth={1.5} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="font-heading text-3xl font-bold">
              {stats?.completed_count || 0}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">Phiên đã hoàn thành</p>
          </CardContent>
        </Card>
      </div>

      <Card className="hover:translate-y-0">
        <CardHeader>
          <CardTitle>Phiên gần đây</CardTitle>
        </CardHeader>
        <CardContent>
          {!stats?.recent_sessions?.length ? (
            <p className="text-sm text-muted-foreground py-4">Chưa có phiên quyết định nào.</p>
          ) : (
            <div className="space-y-3">
              {stats.recent_sessions.map((s) => (
                <Link
                  key={s.id}
                  href={s.status === "completed" ? `/decision/${s.id}` : `/comparison`}
                  className="flex items-center justify-between rounded-2xl border border-border/50 p-4 transition-all duration-300 hover:bg-accent/50 hover:shadow-botanical"
                >
                  <div>
                    <p className="font-medium">{s.name}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {s.housing_count} nhà trọ · {s.criteria_count} tiêu chí · {formatDate(s.created_at)}
                    </p>
                  </div>
                  <Badge variant={s.status === "completed" ? "default" : "secondary"}>
                    {s.status === "completed" ? "Hoàn thành" : s.status === "in_progress" ? "Đang xử lý" : "Nháp"}
                  </Badge>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
