"use client";

import { Bath, BedDouble, Eye, MapPin, Ruler } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Housing } from "@/types";

interface HousingCardProps {
  housing: Housing;
  selectable?: boolean;
  selected?: boolean;
  onSelect?: () => void;
}

const QUALITY_COLORS: Record<string, string> = {
  Budget: "bg-blue-100 text-blue-800",
  Standard: "bg-amber-100 text-amber-800",
  Premium: "bg-green-100 text-green-800",
};

export function HousingCard({ housing, selectable, selected, onSelect }: HousingCardProps) {
  return (
    <Card
      className={
        selectable
          ? `cursor-pointer transition-all duration-300 ${selected ? "border-sage ring-2 ring-sage/20" : "hover:border-sage/50"}`
          : ""
      }
      onClick={selectable ? onSelect : undefined}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <CardTitle className="flex items-center gap-2 text-base">
              <MapPin className="h-4 w-4 shrink-0 text-sage" strokeWidth={1.5} />
              {housing.district}
            </CardTitle>
            {housing.street && (
              <p className="mt-1 truncate text-xs text-muted-foreground pl-6" title={housing.address}>
                {housing.street}
              </p>
            )}
          </div>
          <div className="flex shrink-0 gap-1.5">
            <Badge className={QUALITY_COLORS[housing.quality_label] || ""}>
              {housing.quality_label}
            </Badge>
            {selected && <Badge variant="default">Đã chọn</Badge>}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-3 font-heading text-lg font-semibold">
          {housing.price} triệu/tháng
        </div>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="flex items-center gap-1.5">
            <Ruler className="h-3.5 w-3.5 text-muted-foreground" strokeWidth={1.5} />
            <span>{housing.area} m²</span>
          </div>
          <div className="flex items-center gap-1.5">
            <BedDouble className="h-3.5 w-3.5 text-muted-foreground" strokeWidth={1.5} />
            <span>{housing.bedrooms} PN</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Bath className="h-3.5 w-3.5 text-muted-foreground" strokeWidth={1.5} />
            <span>{housing.toilets} WC</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Eye className="h-3.5 w-3.5 text-muted-foreground" strokeWidth={1.5} />
            <span>{housing.views} lượt xem</span>
          </div>
        </div>
        {housing.address && (
          <p className="mt-3 text-xs leading-relaxed text-muted-foreground line-clamp-2" title={housing.address}>
            {housing.address}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
