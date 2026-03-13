"use client";

import { useCallback, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SaatySlider } from "./SaatySlider";
import { ConsistencyCheck } from "./ConsistencyCheck";
import { useComparisonMatrix } from "@/hooks/useAHP";
import type { PairwiseValue } from "@/types";
import { cn } from "@/lib/utils";

interface ComparisonMatrixProps {
  items: { id: number; name: string; code?: string }[];
  comparisons: PairwiseValue[];
  onComparisonsChange: (comparisons: PairwiseValue[]) => void;
  title: string;
}

export function ComparisonMatrix({
  items,
  comparisons,
  onComparisonsChange,
  title,
}: ComparisonMatrixProps) {
  const size = items.length;
  const { matrix, weights, consistency, getComparisonValue } = useComparisonMatrix(size, comparisons);

  const pairs: { i: number; j: number }[] = [];
  for (let i = 0; i < size; i++) {
    for (let j = i + 1; j < size; j++) {
      pairs.push({ i, j });
    }
  }

  const handleChange = useCallback(
    (i: number, j: number, value: number) => {
      const updated = comparisons.filter((c) => !(c.i === i && c.j === j));
      updated.push({ i, j, value });
      onComparisonsChange(updated);
    },
    [comparisons, onComparisonsChange]
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {pairs.map(({ i, j }) => (
            <div key={`${i}-${j}`} className="rounded-lg border p-4">
              <SaatySlider
                value={getComparisonValue(i, j)}
                onChange={(val) => handleChange(i, j, val)}
                leftLabel={items[i].code || items[i].name}
                rightLabel={items[j].code || items[j].name}
              />
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Ma trận so sánh cặp</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr>
                    <th className="border p-2 bg-muted" />
                    {items.map((item) => (
                      <th key={item.id} className="border p-2 bg-muted text-center font-medium">
                        {item.code || item.name}
                      </th>
                    ))}
                    <th className="border p-2 bg-primary/10 text-center font-medium">Trọng số</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, i) => (
                    <tr key={item.id}>
                      <td className="border p-2 bg-muted font-medium">{item.code || item.name}</td>
                      {matrix[i].map((val, j) => (
                        <td
                          key={j}
                          className={cn(
                            "border p-2 text-center",
                            i === j && "bg-muted/50",
                            val > 1 && i < j && "text-primary font-medium",
                            val < 1 && i < j && "text-muted-foreground"
                          )}
                        >
                          {val >= 1 ? val.toFixed(2) : `1/${(1 / val).toFixed(0)}`}
                        </td>
                      ))}
                      <td className="border p-2 text-center font-semibold text-primary">
                        {(weights[i] * 100).toFixed(1)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <ConsistencyCheck
          cr={consistency.cr}
          isConsistent={consistency.isConsistent}
          weights={weights}
          labels={items.map((it) => it.code || it.name)}
        />
      </div>
    </div>
  );
}
