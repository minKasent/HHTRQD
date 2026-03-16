"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ArrowDown, ArrowUp, Edit, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { PageSkeleton } from "@/components/common/LoadingSpinner";
import { criteriaApi } from "@/lib/api";
import type { Criteria } from "@/types";

export default function CriteriaPage() {
  const queryClient = useQueryClient();
  const [editItem, setEditItem] = useState<Criteria | null>(null);
  const [deleteItem, setDeleteItem] = useState<Criteria | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  const [form, setForm] = useState({ name: "", description: "", code: "", is_benefit: true, unit: "" });

  const { data: criteria = [], isLoading } = useQuery<Criteria[]>({
    queryKey: ["criteria"],
    queryFn: async () => (await criteriaApi.getAll()).data,
  });

  const createMutation = useMutation({
    mutationFn: () => criteriaApi.create(form),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["criteria"] });
      toast.success("Đã thêm tiêu chí");
      setShowCreate(false);
      setForm({ name: "", description: "", code: "", is_benefit: true, unit: "" });
    },
    onError: (err: Error & { response?: { data?: { detail?: string } } }) =>
      toast.error(err.response?.data?.detail || "Thêm thất bại"),
  });

  const updateMutation = useMutation({
    mutationFn: () =>
      criteriaApi.update(editItem!.id, { name: form.name, description: form.description, is_benefit: form.is_benefit, unit: form.unit }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["criteria"] });
      toast.success("Đã cập nhật tiêu chí");
      setEditItem(null);
    },
    onError: (err: Error & { response?: { data?: { detail?: string } } }) =>
      toast.error(err.response?.data?.detail || "Cập nhật thất bại"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => criteriaApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["criteria"] });
      toast.success("Đã xóa tiêu chí");
      setDeleteItem(null);
    },
    onError: () => toast.error("Xóa thất bại"),
  });

  const openEdit = (c: Criteria) => {
    setForm({ name: c.name, description: c.description || "", code: c.code, is_benefit: c.is_benefit, unit: c.unit || "" });
    setEditItem(c);
  };

  if (isLoading) return <PageSkeleton />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Quản lý tiêu chí</h1>
        <Button onClick={() => { setForm({ name: "", description: "", code: "", is_benefit: true, unit: "" }); setShowCreate(true); }}>
          <Plus className="mr-2 h-4 w-4" />
          Thêm tiêu chí
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {criteria.map((c) => (
          <Card key={c.id}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-base">{c.name}</CardTitle>
                  <p className="text-xs text-muted-foreground">{c.code}</p>
                </div>
                <Badge variant={c.is_benefit ? "default" : "secondary"}>
                  {c.is_benefit ? (
                    <><ArrowUp className="mr-1 h-3 w-3" />Càng cao càng tốt</>
                  ) : (
                    <><ArrowDown className="mr-1 h-3 w-3" />Càng thấp càng tốt</>
                  )}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              {c.description && <p className="mb-3 text-sm text-muted-foreground">{c.description}</p>}
              {c.unit && <p className="mb-3 text-xs text-muted-foreground">Đơn vị: {c.unit}</p>}
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => openEdit(c)}>
                  <Edit className="mr-1 h-3 w-3" />
                  Sửa
                </Button>
                <Button variant="destructive" size="sm" onClick={() => setDeleteItem(c)}>
                  <Trash2 className="mr-1 h-3 w-3" />
                  Xóa
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Create / Edit Dialog */}
      <Dialog open={showCreate || !!editItem} onOpenChange={(open) => { if (!open) { setShowCreate(false); setEditItem(null); } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editItem ? "Sửa tiêu chí" : "Thêm tiêu chí mới"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Tên tiêu chí</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            {!editItem && (
              <div className="space-y-2">
                <Label>Mã (VD: C7)</Label>
                <Input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} />
              </div>
            )}
            <div className="space-y-2">
              <Label>Mô tả</Label>
              <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Đơn vị</Label>
              <Input value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} placeholder="VD: VNĐ, m², km" />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is_benefit"
                checked={form.is_benefit}
                onChange={(e) => setForm({ ...form, is_benefit: e.target.checked })}
                className="rounded"
              />
              <Label htmlFor="is_benefit">Càng cao càng tốt (benefit)</Label>
            </div>
            <Button
              className="w-full"
              onClick={() => editItem ? updateMutation.mutate() : createMutation.mutate()}
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              {(createMutation.isPending || updateMutation.isPending) ? "Đang lưu..." : "Lưu"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteItem}
        onOpenChange={() => setDeleteItem(null)}
        title="Xóa tiêu chí"
        description={`Bạn có chắc muốn xóa tiêu chí "${deleteItem?.name}"?`}
        onConfirm={() => deleteItem && deleteMutation.mutate(deleteItem.id)}
        loading={deleteMutation.isPending}
      />
    </div>
  );
}
