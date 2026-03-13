"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight, Grid3X3, List, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HousingCard } from "@/components/housing/HousingCard";
import { HousingTable } from "@/components/housing/HousingTable";
import { PageSkeleton } from "@/components/common/LoadingSpinner";
import { housingApi } from "@/lib/api";
import type { HousingFilter, HousingListResponse } from "@/types";

export default function HousingPage() {
  const [viewMode, setViewMode] = useState<"grid" | "table">("table");
  const [filter, setFilter] = useState<HousingFilter>({ page: 1, page_size: 20 });

  const { data: districtsData } = useQuery<{ districts: string[] }>({
    queryKey: ["housing-districts"],
    queryFn: async () => (await housingApi.getDistricts()).data,
  });

  const { data, isLoading } = useQuery<HousingListResponse>({
    queryKey: ["housings", filter],
    queryFn: async () => (await housingApi.getAll(filter)).data,
  });

  const housings = data?.items ?? [];
  const totalPages = data?.total_pages ?? 0;
  const total = data?.total ?? 0;
  const currentPage = filter.page ?? 1;

  const updateFilter = (updates: Partial<HousingFilter>) => {
    setFilter((prev) => ({ ...prev, ...updates, page: updates.page ?? 1 }));
  };

  const resetFilters = () => {
    setFilter({ page: 1, page_size: 20 });
  };

  if (isLoading && !data) return <PageSkeleton />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dữ liệu nhà trọ</h1>
          <p className="text-sm text-muted-foreground">
            Duyệt {total.toLocaleString("vi-VN")} nhà trọ từ bộ dữ liệu
          </p>
        </div>
        <div className="flex rounded-lg border">
          <Button
            variant={viewMode === "grid" ? "default" : "ghost"}
            size="icon"
            onClick={() => setViewMode("grid")}
            aria-label="Xem dạng lưới"
          >
            <Grid3X3 className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === "table" ? "default" : "ghost"}
            size="icon"
            onClick={() => setViewMode("table")}
            aria-label="Xem dạng bảng"
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Search className="h-4 w-4" />
            Bộ lọc
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-1.5">
              <Label>Quận/Huyện</Label>
              <Select
                value={filter.district ?? "__all__"}
                onValueChange={(v) => updateFilter({ district: v === "__all__" ? undefined : v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Tất cả" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__all__">Tất cả</SelectItem>
                  {districtsData?.districts?.map((d) => (
                    <SelectItem key={d} value={d}>{d}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>Chất lượng</Label>
              <Select
                value={filter.quality_label ?? "__all__"}
                onValueChange={(v) => updateFilter({ quality_label: v === "__all__" ? undefined : v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Tất cả" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__all__">Tất cả</SelectItem>
                  <SelectItem value="Budget">Budget</SelectItem>
                  <SelectItem value="Standard">Standard</SelectItem>
                  <SelectItem value="Premium">Premium</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>Giá (triệu VNĐ)</Label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder="Từ"
                  value={filter.min_price ?? ""}
                  onChange={(e) => updateFilter({ min_price: e.target.value ? Number(e.target.value) : undefined })}
                />
                <Input
                  type="number"
                  placeholder="Đến"
                  value={filter.max_price ?? ""}
                  onChange={(e) => updateFilter({ max_price: e.target.value ? Number(e.target.value) : undefined })}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Diện tích (m²)</Label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder="Từ"
                  value={filter.min_area ?? ""}
                  onChange={(e) => updateFilter({ min_area: e.target.value ? Number(e.target.value) : undefined })}
                />
                <Input
                  type="number"
                  placeholder="Đến"
                  value={filter.max_area ?? ""}
                  onChange={(e) => updateFilter({ max_area: e.target.value ? Number(e.target.value) : undefined })}
                />
              </div>
            </div>
          </div>

          <div className="mt-3 flex items-center gap-3">
            <div className="space-y-1.5">
              <Label>Phòng ngủ</Label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder="Từ"
                  className="w-20"
                  value={filter.min_bedrooms ?? ""}
                  onChange={(e) => updateFilter({ min_bedrooms: e.target.value ? Number(e.target.value) : undefined })}
                />
                <Input
                  type="number"
                  placeholder="Đến"
                  className="w-20"
                  value={filter.max_bedrooms ?? ""}
                  onChange={(e) => updateFilter({ max_bedrooms: e.target.value ? Number(e.target.value) : undefined })}
                />
              </div>
            </div>
            <div className="ml-auto self-end">
              <Button variant="outline" onClick={resetFilters}>
                Xóa bộ lọc
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {housings.length === 0 ? (
        <div className="rounded-lg border border-dashed p-12 text-center">
          <p className="text-muted-foreground">Không tìm thấy nhà trọ phù hợp với bộ lọc.</p>
          <Button className="mt-4" variant="outline" onClick={resetFilters}>
            Xóa bộ lọc
          </Button>
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {housings.map((h) => (
            <HousingCard key={h.id} housing={h} />
          ))}
        </div>
      ) : (
        <HousingTable housings={housings} />
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Trang {currentPage} / {totalPages} ({total.toLocaleString("vi-VN")} kết quả)
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage <= 1}
              onClick={() => setFilter((prev) => ({ ...prev, page: currentPage - 1 }))}
            >
              <ChevronLeft className="mr-1 h-4 w-4" />
              Trước
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage >= totalPages}
              onClick={() => setFilter((prev) => ({ ...prev, page: currentPage + 1 }))}
            >
              Sau
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
