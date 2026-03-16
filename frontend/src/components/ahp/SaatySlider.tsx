"use client";

import { SAATY_LABELS } from "@/types";
import { cn } from "@/lib/utils";

interface SaatySliderProps {
  value: number;
  onChange: (value: number) => void;
  leftLabel: string;
  rightLabel: string;
}

const SCALE_VALUES = [9, 8, 7, 6, 5, 4, 3, 2, 1, 2, 3, 4, 5, 6, 7, 8, 9];
const SCALE_MAP = SCALE_VALUES.map((v, i) => (i < 8 ? 1 / SCALE_VALUES[i] : i === 8 ? 1 : SCALE_VALUES[i]));

const TICK_LABELS = ["9", "", "7", "", "5", "", "3", "", "1", "", "3", "", "5", "", "7", "", "9"];

function valueToIndex(val: number): number {
  if (val === 1) return 8;
  if (val > 1) return 8 + Math.round(val) - 1;
  return 8 - Math.round(1 / val) + 1;
}

function indexToValue(idx: number): number {
  return SCALE_MAP[idx];
}

export function SaatySlider({ value, onChange, leftLabel, rightLabel }: SaatySliderProps) {
  const sliderIndex = valueToIndex(value);
  const displayValue = value >= 1 ? Math.round(value) : Math.round(1 / value);
  const favorsSide = value > 1 ? "right" : value < 1 ? "left" : "equal";

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-sm">
        <span className={cn(
          "max-w-[40%] truncate font-medium",
          favorsSide === "left" && "text-primary",
        )}>
          {leftLabel}
        </span>
        <span className={cn(
          "max-w-[40%] truncate text-right font-medium",
          favorsSide === "right" && "text-primary",
        )}>
          {rightLabel}
        </span>
      </div>

      <div className="relative">
        <input
          type="range"
          min={0}
          max={16}
          step={1}
          value={sliderIndex}
          onChange={(e) => onChange(indexToValue(Number(e.target.value)))}
          className="w-full cursor-pointer accent-primary"
        />
        <div className="flex justify-between px-0.5 text-[10px] text-muted-foreground">
          {TICK_LABELS.map((label, i) => (
            <span
              key={i}
              className={cn(
                "w-3 text-center",
                i === 8 && "font-bold text-foreground",
                i === sliderIndex && i !== 8 && "font-semibold text-primary",
              )}
            >
              {label}
            </span>
          ))}
        </div>
        <div className="mt-0.5 flex justify-between px-0.5">
          <span className="text-[9px] text-muted-foreground/60">← {leftLabel}</span>
          <span className="text-[9px] text-muted-foreground/60">{rightLabel} →</span>
        </div>
      </div>

      <div className="text-center">
        <span className={cn(
          "inline-block rounded-full px-3 py-1 text-xs font-medium",
          favorsSide === "equal" ? "bg-muted text-muted-foreground" : "bg-primary/10 text-primary"
        )}>
          {favorsSide === "equal"
            ? SAATY_LABELS[1]
            : favorsSide === "left"
              ? `${leftLabel} ${SAATY_LABELS[displayValue] || ""} (1/${displayValue})`
              : `${rightLabel} ${SAATY_LABELS[displayValue] || ""} (${displayValue})`}
        </span>
      </div>
    </div>
  );
}
