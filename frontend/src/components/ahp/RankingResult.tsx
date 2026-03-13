"use client";

import { Trophy } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { AHPRanking } from "@/types";

interface RankingResultProps {
  rankings: AHPRanking[];
}

const podiumStyle: Record<number, { border: string; bg: string; badge: string; label: string }> = {
  1: {
    border: "border-amber-300/60",
    bg: "bg-amber-50/60",
    badge: "bg-amber-400 text-white",
    label: "1",
  },
  2: {
    border: "border-stone-300/60",
    bg: "bg-stone-50/50",
    badge: "bg-stone-400 text-white",
    label: "2",
  },
  3: {
    border: "border-orange-300/50",
    bg: "bg-orange-50/40",
    badge: "bg-orange-400 text-white",
    label: "3",
  },
};

export function RankingResult({ rankings }: RankingResultProps) {
  return (
    <Card className="hover:translate-y-0">
      <CardHeader>
        <CardTitle className="flex items-center gap-2.5">
          <Trophy className="h-5 w-5 text-amber-500" strokeWidth={1.5} />
          Bảng xếp hạng
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {rankings.map((r) => {
          const style = podiumStyle[r.ranking];
          const isTop3 = r.ranking <= 3;

          return (
            <div
              key={r.housing_id}
              className={cn(
                "group flex items-start gap-4 rounded-2xl border p-5 transition-all duration-300",
                isTop3
                  ? `${style.border} ${style.bg} hover:shadow-botanical-md`
                  : "border-border/50 hover:bg-accent/30 hover:shadow-botanical"
              )}
            >
              {/* Rank badge */}
              <div
                className={cn(
                  "flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold",
                  isTop3 ? style.badge : "bg-secondary text-muted-foreground"
                )}
              >
                {r.ranking}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <h3 className="font-heading text-base font-semibold leading-tight">
                  {r.housing_name}
                </h3>

                {r.alternative_scores && Object.keys(r.alternative_scores).length > 0 && (
                  <div className="mt-2.5 flex flex-wrap gap-x-4 gap-y-1">
                    {Object.entries(r.alternative_scores).map(([key, val]) => (
                      <span key={key} className="text-xs text-muted-foreground">
                        <span className="font-medium text-foreground/70">{key}:</span>{" "}
                        {(val * 100).toFixed(1)}%
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Score */}
              <div className="shrink-0 text-right">
                <div className={cn(
                  "font-heading text-2xl font-bold tabular-nums",
                  isTop3 ? "text-foreground" : "text-foreground/70"
                )}>
                  {(r.final_score * 100).toFixed(2)}%
                </div>
                <div className="text-[11px] text-muted-foreground">Điểm tổng hợp</div>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
