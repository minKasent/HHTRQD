"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, CheckCircle2, AlertTriangle, ChevronDown, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageSkeleton } from "@/components/common/LoadingSpinner";
import dynamic from "next/dynamic";

const WeightChart = dynamic(() => import("@/components/ahp/WeightChart").then((m) => m.WeightChart), {
  loading: () => <div className="h-[360px] animate-pulse rounded-2xl bg-muted" />,
  ssr: false,
});
const ScoreComparisonChart = dynamic(() => import("@/components/ahp/WeightChart").then((m) => m.ScoreComparisonChart), {
  loading: () => <div className="h-[360px] animate-pulse rounded-2xl bg-muted" />,
  ssr: false,
});
const RankingResult = dynamic(() => import("@/components/ahp/RankingResult").then((m) => m.RankingResult), {
  loading: () => <div className="h-[200px] animate-pulse rounded-2xl bg-muted" />,
  ssr: false,
});
import { sessionApi } from "@/lib/api";
import { cn } from "@/lib/utils";
import type { CalculationResult, ConsistencyInfo } from "@/types";

function formatFraction(val: number): string {
  if (val >= 1) return val.toFixed(2);
  const inv = Math.round(1 / val);
  return `1/${inv}`;
}

function ConsistencyCard({ info, label }: { info: ConsistencyInfo; label: string }) {
  return (
    <div
      className={cn(
        "rounded-2xl border p-5 space-y-3",
        info.is_consistent
          ? "border-green-200/60 bg-green-50/50"
          : "border-red-200/60 bg-red-50/50"
      )}
    >
      <div className="flex items-center gap-2">
        {info.is_consistent ? (
          <CheckCircle2 className="h-4 w-4 text-green-600" strokeWidth={1.5} />
        ) : (
          <AlertTriangle className="h-4 w-4 text-red-500" strokeWidth={1.5} />
        )}
        <span className="text-sm font-medium">{label}</span>
      </div>
      <div className="grid grid-cols-2 gap-3 text-xs sm:grid-cols-4">
        <div>
          <span className="text-muted-foreground">λmax = </span>
          <span className="font-mono font-medium">{info.lambda_max.toFixed(4)}</span>
        </div>
        <div>
          <span className="text-muted-foreground">CI = </span>
          <span className="font-mono font-medium">{info.ci.toFixed(4)}</span>
        </div>
        <div>
          <span className="text-muted-foreground">RI = </span>
          <span className="font-mono font-medium">{info.ri.toFixed(2)}</span>
        </div>
        <div>
          <span className="text-muted-foreground">CR = </span>
          <span className={cn("font-mono font-bold", info.is_consistent ? "text-green-700" : "text-red-600")}>
            {(info.cr * 100).toFixed(2)}%
          </span>
          <span className="text-muted-foreground"> {info.is_consistent ? "< 10%" : ">= 10%"}</span>
        </div>
      </div>
    </div>
  );
}

function MatrixTable({
  matrix,
  rowLabels,
  colLabels,
  title,
  weights,
  showFraction,
}: {
  matrix: number[][];
  rowLabels: string[];
  colLabels: string[];
  title: string;
  weights?: number[];
  showFraction?: boolean;
}) {
  return (
    <Card className="hover:translate-y-0">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm normal-case tracking-normal font-body font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto rounded-xl border border-border/40">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr>
                <th className="border-b border-r border-border/40 p-3 bg-secondary/50 font-medium text-left min-w-[100px]" />
                {colLabels.map((label) => (
                  <th key={label} className="border-b border-r border-border/40 p-3 bg-secondary/50 text-center font-medium min-w-[70px] text-xs">
                    {label}
                  </th>
                ))}
                {weights && (
                  <th className="border-b border-border/40 p-3 bg-sage/10 text-center font-semibold text-foreground min-w-[80px] text-xs">
                    Trọng số
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {matrix.map((row, i) => (
                <tr key={i} className="transition-colors duration-200 hover:bg-accent/20">
                  <td className="border-b border-r border-border/40 p-3 bg-secondary/30 font-medium text-xs">{rowLabels[i]}</td>
                  {row.map((val, j) => (
                    <td
                      key={j}
                      className={cn(
                        "border-b border-r border-border/40 p-3 text-center font-mono text-xs",
                        i === j && "bg-secondary/20 font-semibold"
                      )}
                    >
                      {showFraction ? formatFraction(val) : val.toFixed(4)}
                    </td>
                  ))}
                  {weights && (
                    <td className="border-b border-border/40 p-3 text-center font-mono text-xs font-semibold text-sage">
                      {(weights[i] * 100).toFixed(2)}%
                    </td>
                  )}
                </tr>
              ))}
              {!showFraction && (
                <tr className="bg-secondary/30">
                  <td className="border-r border-border/40 p-3 font-medium text-xs">Tổng cột</td>
                  {matrix[0].map((_, j) => {
                    const colSum = matrix.reduce((sum, row) => sum + row[j], 0);
                    return (
                      <td key={j} className="border-r border-border/40 p-3 text-center font-mono text-xs font-semibold">
                        {colSum.toFixed(4)}
                      </td>
                    );
                  })}
                  {weights && (
                    <td className="p-3 text-center font-mono text-xs font-semibold text-sage">
                      {(weights.reduce((a, b) => a + b, 0) * 100).toFixed(2)}%
                    </td>
                  )}
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

export default function DecisionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = Number(params.id);
  const [expandedCriteria, setExpandedCriteria] = useState<string | null>(null);

  const { data: results, isLoading } = useQuery<CalculationResult>({
    queryKey: ["results", sessionId],
    queryFn: async () => (await sessionApi.getResults(sessionId)).data,
  });

  if (isLoading) return <PageSkeleton />;
  if (!results) return <p className="p-6 text-muted-foreground">Không tìm thấy kết quả.</p>;

  const { criteria_names, housing_names } = results;

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()} aria-label="Quay lại">
          <ArrowLeft className="h-4 w-4" strokeWidth={1.5} />
        </Button>
        <div className="flex-1">
          <h1 className="font-heading text-2xl font-bold md:text-3xl">{results.session_name}</h1>
          <div className="flex items-center gap-2 mt-2">
            {results.overall_consistent ? (
              <Badge className="bg-green-100 text-green-800 border-green-200">
                <CheckCircle2 className="mr-1 h-3 w-3" strokeWidth={1.5} /> Nhất quán
              </Badge>
            ) : (
              <Badge variant="destructive">
                <AlertTriangle className="mr-1 h-3 w-3" strokeWidth={1.5} /> Không nhất quán
              </Badge>
            )}
            <Badge variant="outline">{criteria_names.length} tiêu chí</Badge>
            <Badge variant="outline">{housing_names.length} phương án</Badge>
          </div>
        </div>
      </div>

      {/* === Bước 1 === */}
      <section className="space-y-5">
        <h2 className="font-heading text-xl font-semibold border-b border-border/40 pb-3">
          Bước 1: Ma trận so sánh cặp tiêu chí
        </h2>

        <MatrixTable
          matrix={results.criteria_matrix}
          rowLabels={criteria_names}
          colLabels={criteria_names}
          title="Ma trận so sánh cặp (Pairwise Comparison Matrix)"
          showFraction
        />

        <MatrixTable
          matrix={results.normalized_criteria_matrix}
          rowLabels={criteria_names}
          colLabels={criteria_names}
          title="Ma trận chuẩn hóa (Normalized Matrix)"
          weights={Object.values(results.criteria_weights)}
        />

        <ConsistencyCard info={results.criteria_consistency} label="Kiểm tra tính nhất quán tiêu chí" />
      </section>

      {/* === Bước 2 === */}
      <section className="space-y-5">
        <h2 className="font-heading text-xl font-semibold border-b border-border/40 pb-3">
          Bước 2: Ma trận so sánh phương án theo từng tiêu chí
        </h2>

        {criteria_names.length <= 4 ? (
          <Tabs defaultValue={criteria_names[0]} className="space-y-4">
            <TabsList className="flex flex-wrap h-auto gap-1">
              {criteria_names.map((name) => (
                <TabsTrigger key={name} value={name} className="text-xs">
                  {name}
                </TabsTrigger>
              ))}
            </TabsList>
            {criteria_names.map((name) => {
              const detail = results.alternative_matrices[name];
              if (!detail) return null;
              return (
                <TabsContent key={name} value={name} className="space-y-4">
                  <MatrixTable
                    matrix={detail.matrix}
                    rowLabels={housing_names}
                    colLabels={housing_names}
                    title={`Ma trận so sánh cặp theo "${name}"`}
                    showFraction
                  />
                  <MatrixTable
                    matrix={detail.normalized_matrix}
                    rowLabels={housing_names}
                    colLabels={housing_names}
                    title={`Ma trận chuẩn hóa theo "${name}"`}
                    weights={detail.weights}
                  />
                  <ConsistencyCard info={detail.consistency} label={`Tính nhất quán - ${name}`} />
                </TabsContent>
              );
            })}
          </Tabs>
        ) : (
          <div className="space-y-3">
            {criteria_names.map((name) => {
              const detail = results.alternative_matrices[name];
              if (!detail) return null;
              const isOpen = expandedCriteria === name;
              return (
                <Card key={name} className="hover:translate-y-0">
                  <button
                    type="button"
                    className="flex w-full items-center justify-between p-5 text-left transition-colors duration-200 hover:bg-accent/20 rounded-3xl"
                    onClick={() => setExpandedCriteria(isOpen ? null : name)}
                  >
                    <span className="font-heading font-medium">{name}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-muted-foreground font-mono hidden sm:inline">
                        W = [{detail.weights.map((w) => (w * 100).toFixed(1) + "%").join(", ")}]
                      </span>
                      {detail.consistency.is_consistent ? (
                        <CheckCircle2 className="h-4 w-4 text-green-500" strokeWidth={1.5} />
                      ) : (
                        <AlertTriangle className="h-4 w-4 text-red-500" strokeWidth={1.5} />
                      )}
                      {isOpen ? (
                        <ChevronDown className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
                      )}
                    </div>
                  </button>
                  {isOpen && (
                    <CardContent className="pt-0 space-y-4">
                      <MatrixTable
                        matrix={detail.matrix}
                        rowLabels={housing_names}
                        colLabels={housing_names}
                        title={`Ma trận so sánh cặp theo "${name}"`}
                        showFraction
                      />
                      <MatrixTable
                        matrix={detail.normalized_matrix}
                        rowLabels={housing_names}
                        colLabels={housing_names}
                        title={`Ma trận chuẩn hóa theo "${name}"`}
                        weights={detail.weights}
                      />
                      <ConsistencyCard info={detail.consistency} label={`Tính nhất quán - ${name}`} />
                    </CardContent>
                  )}
                </Card>
              );
            })}
          </div>
        )}
      </section>

      {/* === Bước 3 === */}
      <section className="space-y-5">
        <h2 className="font-heading text-xl font-semibold border-b border-border/40 pb-3">
          Bước 3: Tổng hợp kết quả
        </h2>

        <Card className="hover:translate-y-0">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm normal-case tracking-normal font-body font-semibold">
              Bảng tổng hợp điểm (Synthesis Matrix)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto rounded-xl border border-border/40">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr>
                    <th className="border-b border-r border-border/40 p-3 bg-secondary/50 font-medium text-left min-w-[120px] text-xs">
                      Phương án
                    </th>
                    {criteria_names.map((c) => (
                      <th key={c} className="border-b border-r border-border/40 p-3 bg-secondary/50 text-center font-medium min-w-[80px]">
                        <div className="text-xs">{c}</div>
                        <div className="text-[10px] font-normal text-muted-foreground mt-0.5">
                          ({(results.criteria_weights[c] * 100).toFixed(2)}%)
                        </div>
                      </th>
                    ))}
                    <th className="border-b border-r border-border/40 p-3 bg-sage/10 text-center font-semibold min-w-[80px] text-xs">
                      Điểm tổng hợp
                    </th>
                    <th className="border-b border-border/40 p-3 bg-amber-50/50 text-center font-semibold min-w-[60px] text-xs">
                      Hạng
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {results.rankings.map((r) => (
                    <tr
                      key={r.housing_id}
                      className={cn(
                        "transition-colors duration-200 hover:bg-accent/20",
                        r.ranking === 1 && "bg-amber-50/30"
                      )}
                    >
                      <td className="border-b border-r border-border/40 p-3 font-medium text-xs">{r.housing_name}</td>
                      {criteria_names.map((c) => (
                        <td key={c} className="border-b border-r border-border/40 p-3 text-center font-mono text-xs">
                          {((r.alternative_scores[c] || 0) * 100).toFixed(2)}%
                        </td>
                      ))}
                      <td className="border-b border-r border-border/40 p-3 text-center font-mono text-xs font-bold text-sage">
                        {(r.final_score * 100).toFixed(2)}%
                      </td>
                      <td className="border-b border-border/40 p-3 text-center">
                        <span className={cn(
                          "inline-flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold",
                          r.ranking === 1 ? "bg-amber-400 text-white" :
                          r.ranking === 2 ? "bg-stone-400 text-white" :
                          r.ranking === 3 ? "bg-orange-400 text-white" :
                          "bg-secondary text-muted-foreground"
                        )}>
                          {r.ranking}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* === Bước 4 === */}
      <section className="space-y-5">
        <h2 className="font-heading text-xl font-semibold border-b border-border/40 pb-3">
          Bước 4: Xếp hạng cuối cùng
        </h2>
        <RankingResult rankings={results.rankings} />
      </section>

      {/* === Biểu đồ === */}
      <section className="space-y-5">
        <h2 className="font-heading text-xl font-semibold border-b border-border/40 pb-3">Biểu đồ trực quan</h2>
        <WeightChart weights={results.criteria_weights} />
        <ScoreComparisonChart
          rankings={results.rankings.map((r) => ({
            housing_name: r.housing_name,
            final_score: r.final_score,
            alternative_scores: r.alternative_scores,
          }))}
          criteriaNames={criteria_names}
        />
      </section>
    </div>
  );
}
