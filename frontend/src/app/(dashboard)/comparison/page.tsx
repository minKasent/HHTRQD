"use client";

import { useEffect, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { HousingCard } from "@/components/housing/HousingCard";
import { ComparisonMatrix } from "@/components/ahp/ComparisonMatrix";
import { criteriaApi, housingApi, sessionApi } from "@/lib/api";
import { useAHPStore } from "@/stores/ahpStore";
import type { Criteria, Housing, HousingFilter, HousingListResponse } from "@/types";

const STEPS = [
  "Thông tin phiên",
  "Chọn nhà trọ",
  "Chọn tiêu chí",
  "So sánh tiêu chí",
  "So sánh phương án",
  "Tính toán kết quả",
];

export default function ComparisonPage() {
  const router = useRouter();
  const store = useAHPStore();
  const [sessionName, setSessionName] = useState("");
  const [sessionDesc, setSessionDesc] = useState("");
  const [currentCriteriaTab, setCurrentCriteriaTab] = useState(0);

  const [housingFilter, setHousingFilter] = useState<HousingFilter>({ page: 1, page_size: 12 });
  const [selectedHousings, setSelectedHousings] = useState<Housing[]>([]);

  const { data: housingData } = useQuery<HousingListResponse>({
    queryKey: ["housings-comparison", housingFilter],
    queryFn: async () => (await housingApi.getAll(housingFilter)).data,
  });

  const { data: districtsData } = useQuery<{ districts: string[] }>({
    queryKey: ["housing-districts"],
    queryFn: async () => (await housingApi.getDistricts()).data,
  });

  const { data: criteria = [] } = useQuery<Criteria[]>({
    queryKey: ["criteria"],
    queryFn: async () => (await criteriaApi.getAll()).data,
  });

  const selectedCriteria = criteria.filter((c) => store.selectedCriteriaIds.includes(c.id));

  useEffect(() => {
    store.reset();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const toggleHousing = (housing: Housing) => {
    const exists = selectedHousings.find((h) => h.id === housing.id);
    if (exists) {
      const updated = selectedHousings.filter((h) => h.id !== housing.id);
      setSelectedHousings(updated);
      store.setSelectedHousings(updated.map((h) => h.id));
    } else {
      if (selectedHousings.length >= 7) {
        toast.error("Tối đa 7 nhà trọ");
        return;
      }
      const updated = [...selectedHousings, housing];
      setSelectedHousings(updated);
      store.setSelectedHousings(updated.map((h) => h.id));
    }
  };

  const toggleCriteria = (id: number) => {
    const ids = store.selectedCriteriaIds.includes(id)
      ? store.selectedCriteriaIds.filter((x) => x !== id)
      : [...store.selectedCriteriaIds, id];
    store.setSelectedCriteria(ids);
  };

  const createSessionMutation = useMutation({
    mutationFn: async () => {
      const res = await sessionApi.create({
        name: sessionName,
        description: sessionDesc || undefined,
        housing_ids: store.selectedHousingIds,
        criteria_ids: store.selectedCriteriaIds,
      });
      return res.data;
    },
    onSuccess: (data) => {
      store.setSessionId(data.id);
      store.nextStep();
    },
    onError: (err: any) => toast.error(err.response?.data?.detail || "Tạo phiên thất bại"),
  });

  const saveCriteriaMutation = useMutation({
    mutationFn: async () => {
      await sessionApi.saveCriteriaComparison(store.sessionId!, {
        criteria_ids: store.selectedCriteriaIds,
        comparisons: store.criteriaComparisons,
      });
    },
    onSuccess: () => {
      setCurrentCriteriaTab(0);
      store.nextStep();
    },
    onError: (err: any) => toast.error(err.response?.data?.detail || "Lưu thất bại"),
  });

  const saveAlternativesMutation = useMutation({
    mutationFn: async () => {
      const comparisons_by_criteria = store.selectedCriteriaIds.map((cid) => ({
        criteria_id: cid,
        housing_ids: store.selectedHousingIds,
        comparisons: store.alternativeComparisons[cid] || [],
      }));
      await sessionApi.saveAlternativeComparison(store.sessionId!, {
        housing_ids: store.selectedHousingIds,
        comparisons_by_criteria,
      });
    },
    onSuccess: () => store.nextStep(),
    onError: (err: any) => toast.error(err.response?.data?.detail || "Lưu thất bại"),
  });

  const calculateMutation = useMutation({
    mutationFn: async () => {
      const res = await sessionApi.calculate(store.sessionId!);
      return res.data;
    },
    onSuccess: (data) => {
      store.setResult(data);
      toast.success("Tính toán hoàn tất!");
      router.push(`/decision/${store.sessionId}`);
    },
    onError: (err: any) => toast.error(err.response?.data?.detail || "Tính toán thất bại"),
  });

  const canProceed = (): boolean => {
    switch (store.currentStep) {
      case 0: return sessionName.trim().length > 0;
      case 1: return selectedHousings.length >= 2 && selectedHousings.length <= 7;
      case 2: return store.selectedCriteriaIds.length >= 2 && store.selectedCriteriaIds.length <= 10;
      case 3: return store.criteriaComparisons.length > 0;
      case 4: return Object.keys(store.alternativeComparisons).length === store.selectedCriteriaIds.length;
      default: return false;
    }
  };

  const handleNext = () => {
    switch (store.currentStep) {
      case 2:
        createSessionMutation.mutate();
        break;
      case 3:
        saveCriteriaMutation.mutate();
        break;
      case 4:
        saveAlternativesMutation.mutate();
        break;
      case 5:
        calculateMutation.mutate();
        break;
      default:
        store.nextStep();
    }
  };

  const currentPage = housingFilter.page ?? 1;
  const totalPages = housingData?.total_pages ?? 0;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">So sánh AHP</h1>

      {/* Stepper */}
      <div className="flex items-center gap-1 overflow-x-auto pb-2">
        {STEPS.map((step, i) => (
          <div key={i} className="flex items-center">
            <div className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium whitespace-nowrap ${
              i === store.currentStep
                ? "bg-primary text-primary-foreground"
                : i < store.currentStep
                  ? "bg-primary/20 text-primary"
                  : "bg-muted text-muted-foreground"
            }`}>
              {i < store.currentStep ? <Check className="h-3 w-3" /> : <span>{i + 1}</span>}
              <span className="hidden sm:inline">{step}</span>
            </div>
            {i < STEPS.length - 1 && <div className="mx-1 h-px w-4 bg-border" />}
          </div>
        ))}
      </div>

      {/* Step 0: Session Info */}
      {store.currentStep === 0 && (
        <Card>
          <CardHeader><CardTitle>Thông tin phiên quyết định</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Tên phiên *</Label>
              <Input value={sessionName} onChange={(e) => setSessionName(e.target.value)} placeholder='VD: "Tìm trọ quận Thủ Đức"' />
            </div>
            <div className="space-y-2">
              <Label>Mô tả</Label>
              <Textarea value={sessionDesc} onChange={(e) => setSessionDesc(e.target.value)} placeholder="Mô tả thêm..." />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 1: Select Housing from Dataset */}
      {store.currentStep === 1 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Chọn từ 2 đến 7 nhà trọ từ bộ dữ liệu ({selectedHousings.length} đã chọn)
            </p>
          </div>

          {/* Selected items */}
          {selectedHousings.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Đã chọn ({selectedHousings.length}/7)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {selectedHousings.map((h) => (
                    <Badge
                      key={h.id}
                      variant="secondary"
                      className="cursor-pointer gap-1.5 px-3 py-1.5"
                      onClick={() => toggleHousing(h)}
                    >
                      {h.district} - {h.area}m² - {h.price}tr
                      <span className="text-destructive">×</span>
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Filter bar */}
          <Card>
            <CardContent className="pt-4">
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <div className="space-y-1">
                  <Label className="text-xs">Quận/Huyện</Label>
                  <Select
                    value={housingFilter.district ?? "__all__"}
                    onValueChange={(v) => setHousingFilter((f) => ({ ...f, district: v === "__all__" ? undefined : v, page: 1 }))}
                  >
                    <SelectTrigger><SelectValue placeholder="Tất cả" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__all__">Tất cả</SelectItem>
                      {districtsData?.districts?.map((d) => (
                        <SelectItem key={d} value={d}>{d}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Chất lượng</Label>
                  <Select
                    value={housingFilter.quality_label ?? "__all__"}
                    onValueChange={(v) => setHousingFilter((f) => ({ ...f, quality_label: v === "__all__" ? undefined : v, page: 1 }))}
                  >
                    <SelectTrigger><SelectValue placeholder="Tất cả" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__all__">Tất cả</SelectItem>
                      <SelectItem value="Budget">Budget</SelectItem>
                      <SelectItem value="Standard">Standard</SelectItem>
                      <SelectItem value="Premium">Premium</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Giá (triệu)</Label>
                  <div className="flex gap-1.5">
                    <Input
                      type="number" placeholder="Từ" className="h-9"
                      value={housingFilter.min_price ?? ""}
                      onChange={(e) => setHousingFilter((f) => ({ ...f, min_price: e.target.value ? Number(e.target.value) : undefined, page: 1 }))}
                    />
                    <Input
                      type="number" placeholder="Đến" className="h-9"
                      value={housingFilter.max_price ?? ""}
                      onChange={(e) => setHousingFilter((f) => ({ ...f, max_price: e.target.value ? Number(e.target.value) : undefined, page: 1 }))}
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Diện tích (m²)</Label>
                  <div className="flex gap-1.5">
                    <Input
                      type="number" placeholder="Từ" className="h-9"
                      value={housingFilter.min_area ?? ""}
                      onChange={(e) => setHousingFilter((f) => ({ ...f, min_area: e.target.value ? Number(e.target.value) : undefined, page: 1 }))}
                    />
                    <Input
                      type="number" placeholder="Đến" className="h-9"
                      value={housingFilter.max_area ?? ""}
                      onChange={(e) => setHousingFilter((f) => ({ ...f, max_area: e.target.value ? Number(e.target.value) : undefined, page: 1 }))}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Housing grid */}
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {housingData?.items?.map((h) => (
              <HousingCard
                key={h.id}
                housing={h}
                selectable
                selected={selectedHousings.some((s) => s.id === h.id)}
                onSelect={() => toggleHousing(h)}
              />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                Trang {currentPage}/{totalPages} ({housingData?.total?.toLocaleString("vi-VN")} kết quả)
              </p>
              <div className="flex gap-1.5">
                <Button
                  variant="outline" size="sm"
                  disabled={currentPage <= 1}
                  onClick={() => setHousingFilter((f) => ({ ...f, page: currentPage - 1 }))}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline" size="sm"
                  disabled={currentPage >= totalPages}
                  onClick={() => setHousingFilter((f) => ({ ...f, page: currentPage + 1 }))}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Step 2: Select Criteria */}
      {store.currentStep === 2 && (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Chọn từ 2 đến 10 tiêu chí ({store.selectedCriteriaIds.length} đã chọn)
          </p>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {criteria.map((c) => (
              <Card
                key={c.id}
                className={`cursor-pointer transition-all ${
                  store.selectedCriteriaIds.includes(c.id) ? "border-primary ring-2 ring-primary/20" : "hover:border-primary/50"
                }`}
                onClick={() => toggleCriteria(c.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{c.name}</p>
                      <p className="text-xs text-muted-foreground">{c.code} · {c.unit}</p>
                    </div>
                    {store.selectedCriteriaIds.includes(c.id) && <Check className="h-5 w-5 text-primary" />}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Step 3: Criteria Comparison */}
      {store.currentStep === 3 && (
        <ComparisonMatrix
          items={selectedCriteria.map((c) => ({ id: c.id, name: c.name, code: c.code }))}
          comparisons={store.criteriaComparisons}
          onComparisonsChange={store.setCriteriaComparisons}
          title="So sánh cặp tiêu chí"
        />
      )}

      {/* Step 4: Alternative Comparison */}
      {store.currentStep === 4 && (
        <div className="space-y-6">
          <div className="flex flex-wrap gap-2">
            {selectedCriteria.map((c, i) => (
              <Button
                key={c.id}
                variant={currentCriteriaTab === i ? "default" : "outline"}
                size="sm"
                onClick={() => setCurrentCriteriaTab(i)}
              >
                {c.code}: {c.name}
                {store.alternativeComparisons[c.id]?.length ? (
                  <Check className="ml-1 h-3 w-3" />
                ) : null}
              </Button>
            ))}
          </div>

          {selectedCriteria[currentCriteriaTab] && (
            <ComparisonMatrix
              items={selectedHousings.map((h) => ({
                id: h.id,
                name: `${h.district}${h.street ? ` - ${h.street}` : ""} - ${h.area}m² - ${h.price}tr`,
              }))}
              comparisons={store.alternativeComparisons[selectedCriteria[currentCriteriaTab].id] || []}
              onComparisonsChange={(comps) =>
                store.setAlternativeComparisons(selectedCriteria[currentCriteriaTab].id, comps)
              }
              title={`So sánh nhà trọ theo: ${selectedCriteria[currentCriteriaTab].name}`}
            />
          )}
        </div>
      )}

      {/* Step 5: Calculate */}
      {store.currentStep === 5 && (
        <Card>
          <CardContent className="flex flex-col items-center gap-4 py-12">
            <h2 className="text-xl font-semibold">Sẵn sàng tính toán!</h2>
            <p className="text-muted-foreground">
              {selectedHousings.length} nhà trọ × {selectedCriteria.length} tiêu chí
            </p>
            <Button size="lg" onClick={() => calculateMutation.mutate()} disabled={calculateMutation.isPending}>
              {calculateMutation.isPending ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Đang tính toán...</>
              ) : (
                "Chạy thuật toán AHP"
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Navigation */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={store.prevStep} disabled={store.currentStep === 0}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Quay lại
        </Button>
        {store.currentStep < 5 && (
          <Button
            onClick={handleNext}
            disabled={!canProceed() || createSessionMutation.isPending || saveCriteriaMutation.isPending || saveAlternativesMutation.isPending}
          >
            {(createSessionMutation.isPending || saveCriteriaMutation.isPending || saveAlternativesMutation.isPending) ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            Tiếp theo
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
