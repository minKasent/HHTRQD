"use client";

import { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const BOTANICAL_COLORS = [
  "#8C9A84", // sage
  "#C27B66", // terracotta
  "#2D3A31", // forest
  "#DCCFC2", // clay
  "#6B8F71", // fern
  "#B5838D", // rose
  "#A98467", // sienna
  "#7C9885", // moss
  "#D4A574", // wheat
];

const TOOLTIP_STYLE = {
  contentStyle: {
    backgroundColor: "#F9F8F4",
    border: "1px solid #E6E2DA",
    borderRadius: "12px",
    fontSize: "13px",
    padding: "8px 12px",
    boxShadow: "0 4px 6px -1px rgba(45,58,49,0.05)",
  },
};

interface WeightChartProps {
  weights: Record<string, number>;
  title?: string;
}

export function WeightChart({ weights, title = "Trọng số tiêu chí" }: WeightChartProps) {
  const data = Object.entries(weights).map(([name, value]) => ({
    name,
    value: Number((value * 100).toFixed(2)),
  }));

  return (
    <Card className="hover:translate-y-0">
      <CardHeader>
        <CardTitle className="text-sm normal-case tracking-normal font-body font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="bar">
          <TabsList className="mb-4">
            <TabsTrigger value="bar">Cột</TabsTrigger>
            <TabsTrigger value="pie">Tròn</TabsTrigger>
          </TabsList>
          <TabsContent value="bar">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E6E2DA" />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#2D3A31" }} />
                <YAxis unit="%" tick={{ fontSize: 12, fill: "#2D3A31" }} />
                <Tooltip formatter={(val: number) => `${val}%`} {...TOOLTIP_STYLE} />
                <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                  {data.map((_, i) => (
                    <Cell key={i} fill={BOTANICAL_COLORS[i % BOTANICAL_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </TabsContent>
          <TabsContent value="pie">
            <ResponsiveContainer width="100%" height={320}>
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  innerRadius={40}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}%`}
                  paddingAngle={2}
                >
                  {data.map((_, i) => (
                    <Cell key={i} fill={BOTANICAL_COLORS[i % BOTANICAL_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(val: number) => `${val}%`} {...TOOLTIP_STYLE} />
                <Legend
                  wrapperStyle={{ fontSize: "12px" }}
                  iconType="circle"
                  iconSize={8}
                />
              </PieChart>
            </ResponsiveContainer>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

interface ScoreComparisonChartProps {
  rankings: { housing_name: string; final_score: number; alternative_scores: Record<string, number> }[];
  criteriaNames: string[];
}

function truncateName(name: string, maxLen: number = 20): string {
  return name.length > maxLen ? name.slice(0, maxLen) + "…" : name;
}

export function ScoreComparisonChart({ rankings, criteriaNames }: ScoreComparisonChartProps) {
  const [radarCount, setRadarCount] = useState(3);
  const topN = rankings.slice(0, radarCount);

  const barData = rankings.map((r, i) => ({
    name: truncateName(r.housing_name, 18),
    fullName: r.housing_name,
    score: Number((r.final_score * 100).toFixed(2)),
    fill: BOTANICAL_COLORS[i % BOTANICAL_COLORS.length],
    rank: i + 1,
  }));

  const radarData = criteriaNames.map((c) => {
    const entry: Record<string, string | number> = { criteria: c };
    topN.forEach((r) => {
      entry[r.housing_name] = Number(((r.alternative_scores[c] || 0) * 100).toFixed(2));
    });
    return entry;
  });

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Horizontal bar - all rankings */}
      <Card className="hover:translate-y-0">
        <CardHeader>
          <CardTitle className="text-sm normal-case tracking-normal font-body font-semibold">
            Điểm tổng hợp
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={Math.max(250, rankings.length * 40 + 40)}>
            <BarChart data={barData} layout="vertical" margin={{ top: 5, right: 30, bottom: 5, left: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E6E2DA" horizontal={false} />
              <XAxis type="number" unit="%" tick={{ fontSize: 11, fill: "#2D3A31" }} />
              <YAxis
                dataKey="name"
                type="category"
                width={130}
                tick={{ fontSize: 11, fill: "#2D3A31" }}
              />
              <Tooltip
                formatter={(val: number) => `${val}%`}
                labelFormatter={(label) => {
                  const item = barData.find((d) => d.name === label);
                  return item ? `#${item.rank} ${item.fullName}` : label;
                }}
                {...TOOLTIP_STYLE}
              />
              <Bar dataKey="score" radius={[0, 6, 6, 0]} barSize={24}>
                {barData.map((entry, i) => (
                  <Cell key={i} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Radar - top N only */}
      <Card className="hover:translate-y-0">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-sm normal-case tracking-normal font-body font-semibold">
            So sánh đa tiêu chí (Radar)
          </CardTitle>
          <div className="flex items-center gap-1">
            {[3, 5].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setRadarCount(n)}
                className={`rounded-full px-3 py-1 text-xs font-medium transition-all duration-200 ${
                  radarCount === n
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-muted-foreground hover:bg-accent"
                }`}
              >
                Top {n}
              </button>
            ))}
          </div>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={340}>
            <RadarChart data={radarData} cx="50%" cy="45%">
              <PolarGrid stroke="#E6E2DA" />
              <PolarAngleAxis
                dataKey="criteria"
                tick={{ fontSize: 12, fill: "#2D3A31" }}
              />
              <PolarRadiusAxis tick={{ fontSize: 10, fill: "#8C9A84" }} />
              {topN.map((r, i) => (
                <Radar
                  key={r.housing_name}
                  name={truncateName(r.housing_name, 22)}
                  dataKey={r.housing_name}
                  stroke={BOTANICAL_COLORS[i % BOTANICAL_COLORS.length]}
                  fill={BOTANICAL_COLORS[i % BOTANICAL_COLORS.length]}
                  fillOpacity={0.12}
                  strokeWidth={2}
                />
              ))}
              <Legend
                wrapperStyle={{ fontSize: "11px", paddingTop: "12px" }}
                iconType="circle"
                iconSize={8}
              />
              <Tooltip {...TOOLTIP_STYLE} />
            </RadarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
