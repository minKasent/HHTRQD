"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface HierarchyTreeProps {
  goal: string;
  criteria: { name: string; code: string; weight?: number }[];
  alternatives: { name: string; score?: number }[];
}

export function HierarchyTree({ goal, criteria, alternatives }: HierarchyTreeProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Cây phân cấp AHP</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center gap-4">
          {/* Goal */}
          <div className="rounded-lg border-2 border-primary bg-primary/10 px-6 py-3 text-center font-semibold">
            {goal}
          </div>

          {/* Connector */}
          <div className="h-6 w-px bg-border" />

          {/* Criteria */}
          <div className="flex flex-wrap items-start justify-center gap-3">
            {criteria.map((c) => (
              <div key={c.code} className="flex flex-col items-center">
                <div className="h-4 w-px bg-border" />
                <div className="rounded-lg border bg-secondary px-3 py-2 text-center text-sm">
                  <div className="font-medium">{c.name}</div>
                  <div className="text-xs text-muted-foreground">{c.code}</div>
                  {c.weight !== undefined && (
                    <div className="mt-1 text-xs font-semibold text-primary">
                      {(c.weight * 100).toFixed(1)}%
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Connector */}
          <div className="h-6 w-px bg-border" />

          {/* Alternatives */}
          <div className="flex flex-wrap items-start justify-center gap-3">
            {alternatives.map((a, i) => (
              <div key={i} className="flex flex-col items-center">
                <div className="h-4 w-px bg-border" />
                <div className={cn(
                  "rounded-lg border px-3 py-2 text-center text-sm",
                  i === 0 && a.score !== undefined && "border-yellow-400 bg-yellow-50 dark:bg-yellow-950"
                )}>
                  <div className="font-medium">{a.name}</div>
                  {a.score !== undefined && (
                    <div className="mt-1 text-xs font-semibold text-primary">
                      {(a.score * 100).toFixed(2)}%
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
