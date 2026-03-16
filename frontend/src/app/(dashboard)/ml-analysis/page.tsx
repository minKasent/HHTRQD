"use client";

import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Brain, Database, TrendingUp, Sparkles, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { PageSkeleton } from "@/components/common/LoadingSpinner";
import { mlApi } from "@/lib/api";
import { QUALITY_HEX } from "@/lib/utils";
import type {
  ModelComparisonResponse,
  DatasetStats,
  HybridPrediction,
} from "@/types";

const DIRECTIONS = [
  { value: "Unknown", label: "Không rõ" },
  { value: "East", label: "Đông" },
  { value: "West", label: "Tây" },
  { value: "South", label: "Nam" },
  { value: "North", label: "Bắc" },
  { value: "SE", label: "Đông Nam" },
  { value: "NE", label: "Đông Bắc" },
  { value: "SW", label: "Tây Nam" },
  { value: "NW", label: "Tây Bắc" },
];

export default function MLAnalysisPage() {
  const [area, setArea] = useState("30");
  const [bedrooms, setBedrooms] = useState("1");
  const [toilets, setToilets] = useState("1");
  const [district, setDistrict] = useState("");
  const [direction, setDirection] = useState("Unknown");
  const [views, setViews] = useState("50");
  const [prediction, setPrediction] = useState<HybridPrediction | null>(null);

  const { data: comparison, isLoading: loadingComparison } =
    useQuery<ModelComparisonResponse>({
      queryKey: ["ml-comparison"],
      queryFn: async () => (await mlApi.getModelComparison()).data,
    });

  const { data: stats, isLoading: loadingStats } = useQuery<DatasetStats>({
    queryKey: ["ml-stats"],
    queryFn: async () => (await mlApi.getDatasetStats()).data,
  });

  const { data: districts } = useQuery<string[]>({
    queryKey: ["ml-districts"],
    queryFn: async () => (await mlApi.getDistricts()).data.districts,
  });

  const predictMutation = useMutation({
    mutationFn: async () => {
      const res = await mlApi.predictHybrid({
        area: parseFloat(area),
        bedrooms: parseInt(bedrooms),
        toilets: parseInt(toilets),
        district,
        direction,
        views: parseInt(views),
      });
      return res.data as HybridPrediction;
    },
    onSuccess: (data) => setPrediction(data),
  });

  if (loadingComparison || loadingStats) return <PageSkeleton />;

  const regressionChartData = comparison
    ? Object.entries(comparison.regression.models).map(([name, m]) => ({
        name: name.replace(" Regression", "").replace("Gradient ", "G."),
        R2: m.r2,
        RMSE: m.rmse,
        MAE: m.mae,
      }))
    : [];

  const classificationChartData = comparison
    ? Object.entries(comparison.classification.models).map(([name, m]) => ({
        name: name.replace(" Regression", "").replace("Gradient ", "G."),
        Accuracy: m.accuracy,
        F1: m.f1_score,
        Precision: m.precision,
      }))
    : [];

  const districtChartData = stats
    ? Object.entries(stats.top_districts)
        .slice(0, 8)
        .map(([name, count]) => ({ name: name.replace("Q.", ""), count }))
    : [];

  const qualityPieData = stats
    ? Object.entries(stats.quality_distribution).map(([name, value]) => ({
        name,
        value,
      }))
    : [];

  const canPredict =
    area && bedrooms && toilets && district && parseFloat(area) > 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Brain className="h-6 w-6" />
            ML Analysis
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Dự đoán giá & phân loại chất lượng nhà trọ bằng Machine Learning
          </p>
        </div>
      </div>

      <Tabs defaultValue="predict" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="predict" className="flex items-center gap-1">
            <Sparkles className="h-4 w-4" />
            Dự đoán
          </TabsTrigger>
          <TabsTrigger value="models" className="flex items-center gap-1">
            <TrendingUp className="h-4 w-4" />
            So sánh Models
          </TabsTrigger>
          <TabsTrigger value="dataset" className="flex items-center gap-1">
            <Database className="h-4 w-4" />
            Dataset
          </TabsTrigger>
        </TabsList>

        {/* TAB 1: PREDICTION */}
        <TabsContent value="predict" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Search className="h-5 w-5" />
                  Nhập thông tin nhà trọ
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="area">Diện tích (m²)</Label>
                    <Input
                      id="area"
                      type="number"
                      min="1"
                      max="500"
                      value={area}
                      onChange={(e) => setArea(e.target.value)}
                      placeholder="30"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="bedrooms">Phòng ngủ</Label>
                    <Input
                      id="bedrooms"
                      type="number"
                      min="0"
                      max="20"
                      value={bedrooms}
                      onChange={(e) => setBedrooms(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="toilets">Toilet</Label>
                    <Input
                      id="toilets"
                      type="number"
                      min="0"
                      max="20"
                      value={toilets}
                      onChange={(e) => setToilets(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="views">Lượt xem</Label>
                    <Input
                      id="views"
                      type="number"
                      min="0"
                      value={views}
                      onChange={(e) => setViews(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label>Quận</Label>
                  <Select value={district} onValueChange={setDistrict}>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn quận" />
                    </SelectTrigger>
                    <SelectContent>
                      {districts?.map((d) => (
                        <SelectItem key={d} value={d}>
                          {d}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label>Hướng nhà</Label>
                  <Select value={direction} onValueChange={setDirection}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {DIRECTIONS.map((d) => (
                        <SelectItem key={d.value} value={d.value}>
                          {d.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  type="button"
                  className="w-full"
                  disabled={!canPredict || predictMutation.isPending}
                  onClick={() => predictMutation.mutate()}
                >
                  {predictMutation.isPending ? "Đang dự đoán..." : "Dự đoán"}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Kết quả dự đoán</CardTitle>
              </CardHeader>
              <CardContent>
                {!prediction ? (
                  <div className="flex h-48 items-center justify-center text-muted-foreground text-sm">
                    Nhập thông tin và nhấn &quot;Dự đoán&quot;
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="rounded-lg border bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 p-4 text-center">
                      <p className="text-sm text-muted-foreground mb-1">
                        Giá dự đoán
                      </p>
                      <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                        {prediction.price.predicted_price} Triệu/Tháng
                      </p>
                      <div className="flex items-center justify-center gap-2 mt-2">
                        <Badge variant="secondary">
                          {prediction.price.model_used}
                        </Badge>
                        <Badge variant="outline">
                          R² = {prediction.price.confidence_r2}
                        </Badge>
                      </div>
                    </div>

                    <Separator />

                    <div className="rounded-lg border p-4 text-center">
                      <p className="text-sm text-muted-foreground mb-1">
                        Phân loại chất lượng
                      </p>
                      <Badge
                        className="text-lg px-4 py-1"
                        style={{
                          backgroundColor:
                            QUALITY_HEX[prediction.quality.quality_label] ||
                            "#888",
                          color: "#fff",
                        }}
                      >
                        {prediction.quality.quality_label}
                      </Badge>
                      <div className="flex items-center justify-center gap-2 mt-2">
                        <Badge variant="secondary">
                          {prediction.quality.model_used}
                        </Badge>
                        <Badge variant="outline">
                          F1 = {prediction.quality.confidence_f1}
                        </Badge>
                      </div>
                    </div>

                    <div className="text-xs text-muted-foreground text-center space-y-1">
                      <p>Budget: Phòng giá rẻ, cơ bản</p>
                      <p>Standard: Phòng tiêu chuẩn, đầy đủ tiện nghi</p>
                      <p>Premium: Phòng cao cấp, vượt trội</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* TAB 2: MODEL COMPARISON */}
        <TabsContent value="models" className="space-y-4">
          {comparison && (
            <>
              <div className="grid gap-4 md:grid-cols-3">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">
                      Dataset
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold">
                      {comparison.dataset_size.toLocaleString()}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Train: {comparison.train_size} · Test:{" "}
                      {comparison.test_size}
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">
                      Best Regression
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-lg font-bold text-blue-600">
                      {comparison.regression.best_model}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      R² ={" "}
                      {
                        comparison.regression.models[
                          comparison.regression.best_model
                        ]?.r2
                      }
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">
                      Best Classification
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-lg font-bold text-green-600">
                      {comparison.classification.best_model}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      F1 ={" "}
                      {
                        comparison.classification.models[
                          comparison.classification.best_model
                        ]?.f1_score
                      }
                    </p>
                  </CardContent>
                </Card>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">
                      Regression: So sánh R², RMSE, MAE
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={regressionChartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" fontSize={12} />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="R2" fill="#3b82f6" name="R²" />
                        <Bar dataKey="MAE" fill="#f59e0b" name="MAE" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">
                      Classification: Accuracy, F1, Precision
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <RadarChart data={classificationChartData}>
                        <PolarGrid />
                        <PolarAngleAxis dataKey="name" fontSize={12} />
                        <PolarRadiusAxis
                          angle={30}
                          domain={[0, 1]}
                          fontSize={10}
                        />
                        <Radar
                          name="Accuracy"
                          dataKey="Accuracy"
                          stroke="#3b82f6"
                          fill="#3b82f6"
                          fillOpacity={0.3}
                        />
                        <Radar
                          name="F1"
                          dataKey="F1"
                          stroke="#22c55e"
                          fill="#22c55e"
                          fillOpacity={0.3}
                        />
                        <Legend />
                        <Tooltip />
                      </RadarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">
                    Chi tiết metrics
                  </CardTitle>
                </CardHeader>
                <CardContent className="overflow-x-auto">
                  <h3 className="font-semibold mb-2 text-sm">
                    Price Prediction (Regression)
                  </h3>
                  <table className="w-full text-sm mb-6">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2">Model</th>
                        <th className="text-right py-2">R²</th>
                        <th className="text-right py-2">RMSE</th>
                        <th className="text-right py-2">MAE</th>
                        <th className="text-right py-2">CV R²</th>
                        <th className="text-right py-2">Time (s)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(comparison.regression.models).map(
                        ([name, m]) => (
                          <tr
                            key={name}
                            className={`border-b ${name === comparison.regression.best_model ? "bg-blue-50 dark:bg-blue-950/20 font-medium" : ""}`}
                          >
                            <td className="py-2">
                              {name}
                              {name === comparison.regression.best_model && (
                                <Badge className="ml-2 text-[10px]">Best</Badge>
                              )}
                            </td>
                            <td className="text-right">{m.r2}</td>
                            <td className="text-right">{m.rmse}</td>
                            <td className="text-right">{m.mae}</td>
                            <td className="text-right">
                              {m.cv_r2_mean} ±{m.cv_r2_std}
                            </td>
                            <td className="text-right">{m.train_time_sec}</td>
                          </tr>
                        )
                      )}
                    </tbody>
                  </table>

                  <h3 className="font-semibold mb-2 text-sm">
                    Quality Classification
                  </h3>
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2">Model</th>
                        <th className="text-right py-2">Accuracy</th>
                        <th className="text-right py-2">F1</th>
                        <th className="text-right py-2">Precision</th>
                        <th className="text-right py-2">Recall</th>
                        <th className="text-right py-2">CV Acc</th>
                        <th className="text-right py-2">Time (s)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(comparison.classification.models).map(
                        ([name, m]) => (
                          <tr
                            key={name}
                            className={`border-b ${name === comparison.classification.best_model ? "bg-green-50 dark:bg-green-950/20 font-medium" : ""}`}
                          >
                            <td className="py-2">
                              {name}
                              {name ===
                                comparison.classification.best_model && (
                                <Badge
                                  className="ml-2 text-[10px]"
                                  variant="secondary"
                                >
                                  Best
                                </Badge>
                              )}
                            </td>
                            <td className="text-right">{m.accuracy}</td>
                            <td className="text-right">{m.f1_score}</td>
                            <td className="text-right">{m.precision}</td>
                            <td className="text-right">{m.recall}</td>
                            <td className="text-right">
                              {m.cv_accuracy_mean} ±{m.cv_accuracy_std}
                            </td>
                            <td className="text-right">{m.train_time_sec}</td>
                          </tr>
                        )
                      )}
                    </tbody>
                  </table>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        {/* TAB 3: DATASET */}
        <TabsContent value="dataset" className="space-y-4">
          {stats && (
            <>
              <div className="grid gap-4 md:grid-cols-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Tổng records</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold">
                      {stats.total_records.toLocaleString()}
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Giá (Triệu/th)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-lg font-bold">
                      {stats.price_min} - {stats.price_max}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      TB: {stats.price_mean} · Median: {stats.price_median}
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Diện tích (m²)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-lg font-bold">
                      {stats.area_min} - {stats.area_max}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      TB: {stats.area_mean}
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Số quận</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold">
                      {Object.keys(stats.top_districts).length}
                    </p>
                  </CardContent>
                </Card>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">
                      Top quận có nhiều tin nhất
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart
                        data={districtChartData}
                        layout="vertical"
                        margin={{ left: 20 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" />
                        <YAxis
                          type="category"
                          dataKey="name"
                          fontSize={12}
                          width={80}
                        />
                        <Tooltip />
                        <Bar
                          dataKey="count"
                          fill="#6366f1"
                          name="Số tin"
                          radius={[0, 4, 4, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">
                      Phân bổ chất lượng
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={qualityPieData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) =>
                            `${name} ${(percent * 100).toFixed(0)}%`
                          }
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {qualityPieData.map((entry) => (
                            <Cell
                              key={entry.name}
                              fill={QUALITY_HEX[entry.name] || "#888"}
                            />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">
                    Nguồn dữ liệu
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground space-y-2">
                  <p>
                    Dataset chứa dữ liệu cho thuê nhà thực tế tại TP. Hồ Chí
                    Minh, được thu thập từ các trang rao vặt bất động sản.
                  </p>
                  <p>
                    Sau khi tiền xử lý (loại bỏ giá {">"} 50 triệu, diện tích{" "}
                    {">"} 200m², và các dòng thiếu dữ liệu), dataset còn{" "}
                    <strong>{stats.total_records.toLocaleString()}</strong>{" "}
                    records phù hợp cho phân khúc sinh viên.
                  </p>
                  <p>
                    Các features chính: diện tích, số phòng ngủ, số toilet, quận,
                    hướng nhà, lượt xem, mật độ phòng.
                  </p>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
