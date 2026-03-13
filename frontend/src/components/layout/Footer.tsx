import { Leaf } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border/40 py-8 text-center">
      <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
        <Leaf className="h-4 w-4 text-sage" strokeWidth={1.5} />
        <p>
          <span className="font-heading font-semibold text-foreground/70">Hệ Hỗ Trợ Ra Quyết Định</span>
          {" "}&mdash; Phương pháp AHP
        </p>
      </div>
    </footer>
  );
}
