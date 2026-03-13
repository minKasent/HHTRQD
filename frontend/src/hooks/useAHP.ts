"use client";

import { useCallback, useMemo } from "react";
import type { PairwiseValue } from "@/types";

export function useComparisonMatrix(size: number, comparisons: PairwiseValue[]) {
  const matrix = useMemo(() => {
    const m: number[][] = Array.from({ length: size }, () => Array(size).fill(1));
    for (const { i, j, value } of comparisons) {
      m[i][j] = value;
      m[j][i] = 1 / value;
    }
    return m;
  }, [size, comparisons]);

  const weights = useMemo(() => {
    if (size === 0) return [];
    const geoMeans = matrix.map((row) => {
      const product = row.reduce((acc, val) => acc * val, 1);
      return Math.pow(product, 1 / size);
    });
    const total = geoMeans.reduce((a, b) => a + b, 0);
    return geoMeans.map((g) => g / total);
  }, [matrix, size]);

  const consistency = useMemo(() => {
    if (size <= 2) return { cr: 0, isConsistent: true };

    const RI: Record<number, number> = {
      1: 0, 2: 0, 3: 0.58, 4: 0.9, 5: 1.12,
      6: 1.24, 7: 1.32, 8: 1.41, 9: 1.45, 10: 1.49,
    };

    const weightedSums = matrix.map((row, i) =>
      row.reduce((sum, val, j) => sum + val * weights[j], 0)
    );
    const lambdas = weightedSums.map((ws, i) => (weights[i] > 0 ? ws / weights[i] : 0));
    const lambdaMax = lambdas.reduce((a, b) => a + b, 0) / size;
    const ci = (lambdaMax - size) / (size - 1);
    const ri = RI[size] || 1.49;
    const cr = ri > 0 ? ci / ri : 0;

    return { cr, isConsistent: cr < 0.1, lambdaMax, ci, ri };
  }, [matrix, weights, size]);

  const getComparisonValue = useCallback(
    (i: number, j: number): number => {
      if (i === j) return 1;
      const comp = comparisons.find((c) => c.i === i && c.j === j);
      if (comp) return comp.value;
      const inv = comparisons.find((c) => c.i === j && c.j === i);
      if (inv) return 1 / inv.value;
      return 1;
    },
    [comparisons]
  );

  return { matrix, weights, consistency, getComparisonValue };
}
