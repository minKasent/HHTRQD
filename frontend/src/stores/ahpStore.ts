"use client";

import { create } from "zustand";
import type { CalculationResult, PairwiseValue } from "@/types";

interface AHPState {
  currentStep: number;
  selectedHousingIds: number[];
  selectedCriteriaIds: number[];
  criteriaComparisons: PairwiseValue[];
  alternativeComparisons: Record<number, PairwiseValue[]>;
  result: CalculationResult | null;
  sessionId: number | null;

  setStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  setSelectedHousings: (ids: number[]) => void;
  setSelectedCriteria: (ids: number[]) => void;
  setCriteriaComparisons: (comps: PairwiseValue[]) => void;
  setAlternativeComparisons: (criteriaId: number, comps: PairwiseValue[]) => void;
  setResult: (result: CalculationResult) => void;
  setSessionId: (id: number) => void;
  reset: () => void;
}

const initialState = {
  currentStep: 0,
  selectedHousingIds: [] as number[],
  selectedCriteriaIds: [] as number[],
  criteriaComparisons: [] as PairwiseValue[],
  alternativeComparisons: {} as Record<number, PairwiseValue[]>,
  result: null as CalculationResult | null,
  sessionId: null as number | null,
};

export const useAHPStore = create<AHPState>((set) => ({
  ...initialState,

  setStep: (step) => set({ currentStep: step }),
  nextStep: () => set((s) => ({ currentStep: s.currentStep + 1 })),
  prevStep: () => set((s) => ({ currentStep: Math.max(0, s.currentStep - 1) })),
  setSelectedHousings: (ids) => set({ selectedHousingIds: ids }),
  setSelectedCriteria: (ids) => set({ selectedCriteriaIds: ids }),
  setCriteriaComparisons: (comps) => set({ criteriaComparisons: comps }),
  setAlternativeComparisons: (criteriaId, comps) =>
    set((s) => ({
      alternativeComparisons: { ...s.alternativeComparisons, [criteriaId]: comps },
    })),
  setResult: (result) => set({ result }),
  setSessionId: (id) => set({ sessionId: id }),
  reset: () => set(initialState),
}));
