import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Leaf } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 text-center px-4">
      <Leaf className="h-12 w-12 text-sage" strokeWidth={1.5} />
      <div>
        <h1 className="font-heading text-4xl font-bold">404</h1>
        <p className="mt-2 text-muted-foreground">
          Trang bạn tìm kiếm không tồn tại.
        </p>
      </div>
      <Button asChild>
        <Link href="/">Về trang chủ</Link>
      </Button>
    </div>
  );
}
