"use client";

import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface ConsistencyCheckProps {
  cr: number;
  isConsistent: boolean;
  weights: number[];
  labels: string[];
}

export function ConsistencyCheck({ cr, isConsistent, weights, labels }: ConsistencyCheckProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm">
          {isConsistent ? (
            <CheckCircle2 className="h-5 w-5 text-green-500" />
          ) : (
            <AlertTriangle className="h-5 w-5 text-destructive" />
          )}
          Kiểm tra tính nhất quán
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div
          className={cn(
            "rounded-lg p-3 text-sm",
            isConsistent ? "bg-green-50 text-green-800 dark:bg-green-950 dark:text-green-200" : "bg-red-50 text-red-800 dark:bg-red-950 dark:text-red-200"
          )}
        >
          <p className="font-medium">
            CR = {(cr * 100).toFixed(2)}%{" "}
            {isConsistent ? "(< 10% — Nhất quán)" : "(≥ 10% — Không nhất quán!)"}
          </p>
          {!isConsistent && (
            <p className="mt-1 text-xs">
              Các đánh giá chưa nhất quán. Hãy xem xét điều chỉnh lại các so sánh.
            </p>
          )}
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium">Trọng số các yếu tố:</p>
          {labels.map((label, i) => (
            <div key={label} className="flex items-center gap-2">
              <span className="w-16 text-xs text-muted-foreground">{label}</span>
              <div className="flex-1">
                <div className="h-4 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary transition-all"
                    style={{ width: `${(weights[i] || 0) * 100}%` }}
                  />
                </div>
              </div>
              <span className="w-14 text-right text-xs font-medium">
                {((weights[i] || 0) * 100).toFixed(1)}%
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
