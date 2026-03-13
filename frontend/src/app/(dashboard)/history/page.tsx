"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { toast } from "sonner";
import { Calendar, Eye, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { PageSkeleton } from "@/components/common/LoadingSpinner";
import { sessionApi } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import type { SessionListItem } from "@/types";

const STATUS_MAP: Record<string, { label: string; variant: "default" | "secondary" | "destructive" }> = {
  completed: { label: "Hoàn thành", variant: "default" },
  in_progress: { label: "Đang xử lý", variant: "secondary" },
  draft: { label: "Nháp", variant: "secondary" },
};

export default function HistoryPage() {
  const queryClient = useQueryClient();
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const { data: sessions = [], isLoading } = useQuery<SessionListItem[]>({
    queryKey: ["sessions"],
    queryFn: async () => (await sessionApi.getAll()).data,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => sessionApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sessions"] });
      toast.success("Đã xóa phiên");
      setDeleteId(null);
    },
    onError: () => toast.error("Xóa thất bại"),
  });

  if (isLoading) return <PageSkeleton />;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Lịch sử phiên quyết định</h1>

      {sessions.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-4 py-12">
            <Calendar className="h-12 w-12 text-muted-foreground" />
            <p className="text-muted-foreground">Chưa có phiên nào.</p>
            <Button asChild>
              <Link href="/comparison">Tạo phiên mới</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {sessions.map((s) => {
            const status = STATUS_MAP[s.status] || STATUS_MAP.draft;
            return (
              <Card key={s.id}>
                <CardContent className="flex items-center justify-between p-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{s.name}</p>
                      <Badge variant={status.variant}>{status.label}</Badge>
                    </div>
                    {s.description && <p className="text-sm text-muted-foreground">{s.description}</p>}
                    <p className="text-xs text-muted-foreground">
                      {s.housing_count} nhà trọ · {s.criteria_count} tiêu chí · {formatDate(s.created_at)}
                      {s.completed_at && ` · Hoàn thành: ${formatDate(s.completed_at)}`}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    {s.status === "completed" && (
                      <Button variant="ghost" size="icon" asChild aria-label="Xem kết quả">
                        <Link href={`/decision/${s.id}`}>
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                    )}
                    <Button variant="ghost" size="icon" onClick={() => setDeleteId(s.id)} aria-label="Xóa">
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <ConfirmDialog
        open={deleteId !== null}
        onOpenChange={() => setDeleteId(null)}
        title="Xóa phiên"
        description="Bạn có chắc muốn xóa phiên quyết định này? Tất cả dữ liệu liên quan sẽ bị xóa."
        onConfirm={() => deleteId && deleteMutation.mutate(deleteId)}
        loading={deleteMutation.isPending}
      />
    </div>
  );
}
