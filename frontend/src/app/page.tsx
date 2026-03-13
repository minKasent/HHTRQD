import Link from "next/link";
import { ArrowRight, BarChart3, Building2, CheckCircle, GitCompareArrows, Leaf } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Footer } from "@/components/layout/Footer";

const features = [
  {
    icon: Building2,
    title: "Dữ liệu nhà trọ",
    description: "Duyệt hơn 11.000 nhà trọ tại TP.HCM với thông tin chi tiết về giá, diện tích, địa chỉ",
  },
  {
    icon: GitCompareArrows,
    title: "So sánh AHP",
    description: "Sử dụng phương pháp AHP của Saaty để so sánh cặp các tiêu chí và phương án",
  },
  {
    icon: BarChart3,
    title: "Kết quả trực quan",
    description: "Xem xếp hạng, biểu đồ trọng số và phân tích đa tiêu chí",
  },
  {
    icon: CheckCircle,
    title: "Kiểm tra nhất quán",
    description: "Tự động kiểm tra tính nhất quán (CR) của các đánh giá",
  },
];

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 border-b border-border/40 bg-background/80 backdrop-blur-sm">
        <div className="flex h-16 items-center px-6">
          <Link href="/" className="flex items-center gap-2.5 group">
            <Leaf className="h-5 w-5 text-sage transition-transform duration-500 group-hover:rotate-12" strokeWidth={1.5} />
            <span className="font-heading text-lg font-semibold tracking-tight">
              Chọn nhà trọ
            </span>
          </Link>
          <div className="ml-auto">
            <Button size="sm" asChild>
              <Link href="/dashboard">
                Bắt đầu <ArrowRight className="ml-1.5 h-4 w-4" strokeWidth={1.5} />
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="flex flex-col items-center justify-center gap-8 px-4 py-24 text-center md:py-32">
          <div className="rounded-full bg-sage/10 px-5 py-2 text-sm font-medium text-foreground/70">
            Phương pháp AHP — Analytic Hierarchy Process
          </div>
          <h1 className="font-heading max-w-3xl text-4xl font-bold tracking-tight md:text-6xl lg:text-7xl">
            Hệ hỗ trợ ra quyết định{" "}
            <em className="text-sage not-italic">chọn nhà trọ</em>{" "}
            cho sinh viên
          </h1>
          <p className="max-w-xl text-lg leading-relaxed text-muted-foreground">
            Sử dụng phương pháp phân tích thứ bậc AHP để so sánh và xếp hạng
            các lựa chọn nhà trọ dựa trên nhiều tiêu chí: giá cả, diện tích,
            khoảng cách, an ninh, tiện nghi và môi trường.
          </p>
          <div className="pt-2">
            <Button size="lg" asChild>
              <Link href="/dashboard">
                Bắt đầu ngay <ArrowRight className="ml-2 h-4 w-4" strokeWidth={1.5} />
              </Link>
            </Button>
          </div>
        </section>

        <section className="mx-auto max-w-5xl px-4 pb-24">
          <div className="grid gap-6 sm:grid-cols-2">
            {features.map((f, i) => (
              <div
                key={f.title}
                className={`rounded-3xl border border-border/50 bg-card/50 p-8 shadow-botanical transition-all duration-500 hover:shadow-botanical-md hover:-translate-y-0.5 ${
                  i % 2 === 1 ? "md:translate-y-6" : ""
                }`}
              >
                <div className="mb-4 inline-flex rounded-2xl bg-sage/10 p-3">
                  <f.icon className="h-6 w-6 text-sage" strokeWidth={1.5} />
                </div>
                <h3 className="font-heading mb-2 text-lg font-semibold">{f.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{f.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-3xl px-4 pb-24">
          <h2 className="font-heading mb-10 text-center text-2xl font-bold md:text-3xl">
            Quy trình ra quyết định
          </h2>
          <div className="space-y-6">
            {[
              { step: "1", title: "Chọn nhà trọ", desc: "Lọc và chọn các nhà trọ muốn so sánh từ bộ dữ liệu" },
              { step: "2", title: "Thiết lập tiêu chí", desc: "Chọn các tiêu chí quan trọng: giá, diện tích, phòng ngủ, WC, lượt xem" },
              { step: "3", title: "So sánh cặp AHP", desc: "Đánh giá mức độ quan trọng giữa các tiêu chí và phương án" },
              { step: "4", title: "Xem kết quả", desc: "Nhận xếp hạng tổng hợp với ma trận, trọng số và kiểm tra nhất quán" },
            ].map((s) => (
              <div key={s.step} className="flex gap-5 rounded-2xl border border-border/40 bg-card/30 p-5 transition-colors hover:bg-card/60">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sage/10 font-heading text-lg font-bold text-sage">
                  {s.step}
                </div>
                <div>
                  <h3 className="font-heading font-semibold">{s.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
