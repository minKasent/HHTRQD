"use client";

import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Housing } from "@/types";

interface HousingTableProps {
  housings: Housing[];
  selectable?: boolean;
  selectedIds?: number[];
  onToggle?: (id: number) => void;
}

const QUALITY_COLORS: Record<string, string> = {
  Budget: "bg-blue-100 text-blue-800",
  Standard: "bg-amber-100 text-amber-800",
  Premium: "bg-green-100 text-green-800",
};

export function HousingTable({ housings, selectable, selectedIds = [], onToggle }: HousingTableProps) {
  if (housings.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed p-8 text-center text-muted-foreground">
        Không tìm thấy nhà trọ phù hợp.
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border/50 overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            {selectable && <TableHead className="w-10" />}
            <TableHead>Quận</TableHead>
            <TableHead>Đường</TableHead>
            <TableHead className="text-right">Giá (tr)</TableHead>
            <TableHead className="text-right">Diện tích</TableHead>
            <TableHead className="text-center">PN</TableHead>
            <TableHead className="text-center">WC</TableHead>
            <TableHead>Hướng</TableHead>
            <TableHead className="text-right">Lượt xem</TableHead>
            <TableHead>Chất lượng</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {housings.map((h) => {
            const isSelected = selectedIds.includes(h.id);
            return (
              <TableRow
                key={h.id}
                className={selectable ? `cursor-pointer ${isSelected ? "bg-sage/5" : ""}` : ""}
                onClick={selectable && onToggle ? () => onToggle(h.id) : undefined}
              >
                {selectable && (
                  <TableCell>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      readOnly
                      className="h-4 w-4 rounded border-border accent-sage"
                    />
                  </TableCell>
                )}
                <TableCell className="font-medium">{h.district}</TableCell>
                <TableCell className="text-muted-foreground text-xs max-w-[160px] truncate" title={h.street}>
                  {h.street || "—"}
                </TableCell>
                <TableCell className="text-right">{h.price}</TableCell>
                <TableCell className="text-right">{h.area} m²</TableCell>
                <TableCell className="text-center">{h.bedrooms}</TableCell>
                <TableCell className="text-center">{h.toilets}</TableCell>
                <TableCell>{h.direction}</TableCell>
                <TableCell className="text-right">{h.views}</TableCell>
                <TableCell>
                  <Badge className={QUALITY_COLORS[h.quality_label] || ""}>
                    {h.quality_label}
                  </Badge>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
