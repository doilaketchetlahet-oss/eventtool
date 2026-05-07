"use client";
import type { AppRecord } from "@/types/app";
import { FormEvent, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Boxes,
  CheckCircle2,
  Command,
  Layers3,
  Search,
  Send,
  Sparkles,
  ArrowUpRight,
  X,
  Zap,
  Grid3X3,
  Orbit as OrbitIcon,
  ShieldCheck
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

const featuredApps = [
  {
    name: "Pulse",
    category: "Phân tích",
    description: "Theo dõi chỉ số sản phẩm theo thời gian thực với giao diện điều khiển tinh gọn.",
    accent: "from-cyan-400/30 to-blue-500/10",
    meta: "12k lượt cài",
    signal: "Dữ liệu trực tiếp",
    tags: ["AI", "Năng suất"],
    detail: "Phù hợp cho founder, PM và đội growth cần nhìn nhanh chỉ số activation, retention và conversion mà không phải dựng dashboard phức tạp.",
    url: "pulse.app"
  },
  {
    name: "Draft",
    category: "Soạn thảo",
    description: "Không gian viết tập trung cho ghi chú, chia sẻ đoạn nội dung và duyệt nhanh.",
    accent: "from-violet-400/30 to-fuchsia-500/10",
    meta: "8.4k lượt cài",
    signal: "Được chọn",
    tags: ["AI", "Năng suất"],
    detail: "Hỗ trợ đội content và marketing viết bản nháp, gom feedback, lưu template và xuất nội dung nhanh cho nhiều kênh.",
    url: "draft.space"
  },
  {
    name: "Orbit",
    category: "Quản lý dự án",
    description: "Trung tâm dự án nhẹ nhàng cho đội nhóm cần theo dõi rõ ràng mà không rối mắt.",
    accent: "from-emerald-400/25 to-teal-500/10",
    meta: "15k lượt cài",
    signal: "Phù hợp đội nhóm",
    tags: ["Vận hành đội nhóm", "Năng suất"],
    detail: "Một lớp điều phối nhẹ cho sprint, roadmap và checklist vận hành, dành cho đội nhỏ muốn giữ mọi thứ rõ ràng.",
    url: "orbit.team"
  },
  {
    name: "Glyph",
    category: "Thiết kế",
    description: "Quản lý design system, tài liệu hình ảnh và ghi chú phát hành chỉn chu.",
    accent: "from-amber-400/25 to-orange-500/10",
    meta: "9.1k lượt cài",
    signal: "Bản mới",
    tags: ["Thiết kế"],
    detail: "Tạo thư viện component, guideline hình ảnh và changelog thiết kế trong một không gian trình bày đẹp mắt.",
    url: "glyph.design"
  },
  {
    name: "Frame",
    category: "Video",
    description: "Công cụ duyệt nội dung cộng tác cho đội sáng tạo và agency.",
    accent: "from-pink-400/25 to-rose-500/10",
    meta: "6.8k lượt cài",
    signal: "Quy trình studio",
    tags: ["Thiết kế", "Vận hành đội nhóm"],
    detail: "Dành cho studio video, agency và creator team cần duyệt bản dựng, để lại nhận xét theo timeline và chốt phiên bản cuối.",
    url: "frame.studio"
  },
  {
    name: "Relay",
    category: "Công cụ dev",
    description: "Triển khai và chia sẻ công cụ nội bộ với bề mặt vận hành gọn gàng.",
    accent: "from-sky-400/25 to-indigo-500/10",
    meta: "11.6k lượt cài",
    signal: "Ưu tiên API",
    tags: ["Công cụ dev", "Tự động hóa"],
    detail: "Giúp đội kỹ thuật đóng gói internal tools, chia sẻ endpoint nội bộ và theo dõi trạng thái vận hành trên một giao diện sạch.",
    url: "relay.dev"
  }
];

const categories = [
  { name: "Năng suất", count: "128 ứng dụng" },
  { name: "AI", count: "94 ứng dụng" },
  { name: "Công cụ dev", count: "76 ứng dụng" },
  { name: "Thiết kế", count: "58 ứng dụng" },
  { name: "Tự động hóa", count: "41 ứng dụng" },
  { name: "Vận hành đội nhóm", count: "33 ứng dụng" }
];

const stats = [
  { label: "Ứng dụng được chọn lọc", value: "1.2k" },
  { label: "Nhà phát triển", value: "340" },
  { label: "Lượt cài mỗi ngày", value: "18k" }
];

type FeaturedApp = (typeof featuredApps)[number];

type HomePageClientProps = {
  apps: AppRecord[];
};

function mapSupabaseApp(app: AppRecord, index: number): FeaturedApp {
  const category = app.category ?? "Ứng dụng";
  const tags = Array.isArray(app.tags)
    ? app.tags
    : typeof app.tags === "string"
      ? app.tags.split(",").map((tag) => tag.trim()).filter(Boolean)
      : [];

  return {
    name: app.title ?? "Ứng dụng chưa đặt tên",
    category,
    description: app.description ?? "Mô tả ứng dụng đang được cập nhật.",
    accent: [
      "from-cyan-400/30 to-blue-500/10",
      "from-violet-400/30 to-fuchsia-500/10",
      "from-emerald-400/25 to-teal-500/10",
      "from-amber-400/25 to-orange-500/10",
      "from-pink-400/25 to-rose-500/10",
      "from-sky-400/25 to-indigo-500/10"
    ][index % 6],
    meta: app.meta ?? "Đang cập nhật",
    signal: app.signal ?? "Nổi bật",
    tags: tags.length > 0 ? tags : [category],
    detail: app.detail ?? "Chi tiết đang được cập nhật từ dữ liệu Supabase.",
    url: app.url ?? "demo.app"
  };
}

export default function HomePageClient({ apps }: HomePageClientProps) {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("Tất cả");
  const [selectedApp, setSelectedApp] = useState<FeaturedApp | null>(null);
  const [isSubmitOpen, setIsSubmitOpen] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const displayApps = useMemo(() => {
    if (apps.length > 0) {
      return apps.map(mapSupabaseApp);
    }

    return featuredApps;
  }, [apps]);

  const categoryOptions = useMemo(() => {
    const names = displayApps.flatMap((app) => [app.category, ...app.tags]);

    return ["Tất cả", ...Array.from(new Set(names))];
  }, [displayApps]);

  const visibleCategories = useMemo(
    () =>
      categoryOptions
        .filter((category) => category !== "Tất cả")
        .map((category) => ({
          name: category,
          count: `${displayApps.filter((app) => app.category === category || app.tags.includes(category)).length} ứng dụng`
        })),
    [categoryOptions, displayApps]
  );

  const normalizedQuery = query.trim().toLowerCase();
  const filteredApps = displayApps.filter((app) => {
    const matchesSearch =
      !normalizedQuery ||
      [app.name, app.category, app.description, app.signal, ...app.tags].some((value) =>
        value.toLowerCase().includes(normalizedQuery)
      );
    const matchesCategory = activeCategory === "Tất cả" || app.tags.includes(activeCategory) || app.category === activeCategory;

    return matchesSearch && matchesCategory;
  });

  function scrollToSection(id: string) {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function handleSearch() {
    scrollToSection("featured");
  }

  function handleSubmitApp(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitted(true);
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#020308]">
      <div className="pointer-events-none absolute inset-0 grid-glow opacity-25" />
      <div className="pointer-events-none absolute inset-0 noise opacity-[0.035]" />
      <div className="pointer-events-none absolute inset-0 cinematic-vignette" />
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-0 h-px w-[52rem] -translate-x-1/2 aurora-line opacity-80" />
        <div className="absolute -top-44 left-1/2 h-[34rem] w-[58rem] -translate-x-1/2 rounded-full bg-cyan-300/10 blur-3xl" />
        <div className="absolute -top-32 left-[-10%] h-[28rem] w-[28rem] rounded-full bg-violet-500/18 blur-3xl animate-float" />
        <div className="absolute top-36 right-[-12%] h-[34rem] w-[34rem] rounded-full bg-cyan-500/12 blur-3xl animate-float [animation-delay:1.5s]" />
        <div className="absolute bottom-20 left-1/3 h-80 w-80 rounded-full bg-fuchsia-500/10 blur-3xl animate-float [animation-delay:3s]" />
      </div>

      <div className="relative mx-auto flex min-h-screen w-full max-w-7xl flex-col px-5 pb-10 pt-5 sm:px-6 lg:px-8">
        <motion.header
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="sticky top-5 z-50"
        >
          <nav className="glass flex items-center justify-between rounded-full px-4 py-3 ring-1 ring-white/5 sm:px-5">
            <a href="#top" className="flex items-center gap-3 text-sm font-semibold tracking-tight text-white">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-slate-950 shadow-[0_0_40px_rgba(255,255,255,0.24)]">
                <Sparkles className="h-4 w-4" />
              </span>
              <span>KhoApp</span>
            </a>

            <div className="hidden items-center gap-8 text-sm text-white/60 md:flex">
              <a href="#featured" className="transition-colors hover:text-white">
                Nổi bật
              </a>
              <a href="#categories" className="transition-colors hover:text-white">
                Danh mục
              </a>
              <a href="#footer" className="transition-colors hover:text-white">
                Tài nguyên
              </a>
            </div>

            <Button variant="outline" size="sm" className="border-white/15 bg-white/5" onClick={() => setIsSubmitOpen(true)}>
              Gửi ứng dụng
            </Button>
          </nav>
        </motion.header>

        <section id="top" className="relative flex flex-1 flex-col justify-center py-20 sm:py-24 lg:py-28">
          <div className="absolute inset-x-0 top-28 mx-auto h-px w-3/4 bg-gradient-to-r from-transparent via-cyan-200/25 to-transparent" />
          <div className="grid gap-16 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
            <div className="max-w-3xl">
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="mb-7 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-medium text-white/70 shadow-[0_0_32px_rgba(34,211,238,0.08)] backdrop-blur-xl"
              >
                <span className="h-2 w-2 rounded-full bg-cyan-300 shadow-[0_0_18px_rgba(103,232,249,0.9)]" />
                Hệ thống khám phá ứng dụng mang phong cách điện ảnh
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.65, delay: 0.05 }}
                className="max-w-3xl text-5xl font-semibold tracking-[-0.06em] text-white sm:text-6xl lg:text-7xl"
              >
                Chia sẻ ứng dụng với diện mạo xứng tầm.
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.65, delay: 0.12 }}
                className="mt-7 max-w-2xl text-base leading-8 text-white/60 sm:text-lg"
              >
                Một không gian giới thiệu tinh gọn để khám phá phần mềm được chọn lọc, duyệt theo nhu cầu sử dụng và trình bày từng sản phẩm với chiều sâu điện ảnh cùng cảm hứng tương lai nhẹ nhàng.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.65, delay: 0.18 }}
                className="mt-9 flex flex-wrap gap-3"
              >
                <Button size="lg" className="group" onClick={() => scrollToSection("featured")}>
                  Khám phá ứng dụng
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </Button>
                <Button variant="secondary" size="lg" onClick={() => scrollToSection("categories")}>
                  Xem danh mục
                </Button>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.65, delay: 0.24 }}
                className="mt-12 grid max-w-2xl grid-cols-1 gap-3 sm:grid-cols-3"
              >
                {stats.map((item) => (
                  <div key={item.label} className="glass rounded-3xl px-5 py-4">
                    <div className="text-2xl font-semibold tracking-[-0.03em] text-white">{item.value}</div>
                    <div className="mt-1 text-xs uppercase tracking-[0.18em] text-white/45">{item.label}</div>
                  </div>
                ))}
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.96, x: 18 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.15 }}
              className="relative lg:pl-2"
            >
              <div className="absolute -inset-8 rounded-[2.5rem] bg-gradient-to-tr from-violet-500/25 via-cyan-300/10 to-transparent blur-3xl" />
              <div className="absolute -right-4 top-12 hidden h-24 w-24 rounded-full border border-cyan-200/15 bg-cyan-200/5 blur-[1px] lg:block" />
              <Card className="relative overflow-hidden rounded-[2.25rem] border-white/10 bg-white/[0.045] shadow-glow">
                <div className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-cyan-200/50 to-transparent" />
                <CardHeader className="border-b border-white/10 p-6 pb-5 sm:p-7">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">Nổi bật tuần này</CardTitle>
                      <CardDescription>Ứng dụng được tuyển chọn với cách trình bày cao cấp</CardDescription>
                    </div>
                    <div className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 shadow-[0_0_28px_rgba(34,211,238,0.12)]">
                      <Layers3 className="h-5 w-5 text-white/70" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4 p-5 sm:p-6">
                  {displayApps.slice(0, 3).map((app, index) => (
                    <div
                      key={app.name}
                      role="button"
                      tabIndex={0}
                      onClick={() => setSelectedApp(app)}
                      onKeyDown={(event) => event.key === "Enter" && setSelectedApp(app)}
                      className="group rounded-[1.5rem] border border-white/[0.08] bg-white/[0.035] p-4 transition-all duration-300 hover:border-cyan-200/20 hover:bg-white/[0.055]"
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${app.accent} border border-white/10`}
                        >
                          <span className="text-sm font-semibold text-white">{app.name.slice(0, 2)}</span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-4">
                            <div>
                              <div className="text-sm font-medium text-white">{app.name}</div>
                              <div className="text-xs uppercase tracking-[0.16em] text-white/45">{app.category}</div>
                            </div>
                            <ArrowUpRight className="h-4 w-4 text-white/30 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-white/60" />
                          </div>
                          <p className="mt-2 text-sm leading-6 text-white/55">{app.description}</p>
                        </div>
                      </div>
                      <div className="mt-4 flex items-center justify-between text-xs text-white/45">
                        <span>{app.meta}</span>
                        <span>{app.signal}</span>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </section>

        <section className="pb-20 sm:pb-24">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.55 }}
            className="glass mx-auto max-w-5xl rounded-[2rem] p-3 ring-1 ring-cyan-200/5 sm:p-4"
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="hidden h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/50 sm:flex">
                <Command className="h-4 w-4" />
              </div>
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35" />
                <Input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  onKeyDown={(event) => event.key === "Enter" && handleSearch()}
                  placeholder="Tìm ứng dụng, danh mục hoặc nhà phát triển"
                  className="pl-12"
                />
              </div>
              <Button size="lg" className="shrink-0" onClick={handleSearch}>
                Tìm kiếm
              </Button>
            </div>
          </motion.div>
        </section>

        <section id="featured" className="pb-24 sm:pb-28">
          <div className="mb-10 flex items-end justify-between gap-6">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-white/40">Ứng dụng nổi bật</p>
              <h2 className="mt-4 max-w-2xl text-3xl font-semibold tracking-[-0.045em] text-white sm:text-4xl">Một vòng tròn sản phẩm được chọn lọc, không chỉ là danh sách.</h2>
            </div>
            <div className="hidden items-center gap-2 text-sm text-white/45 md:flex">
              <Grid3X3 className="h-4 w-4" />
              {filteredApps.length} ứng dụng phù hợp
            </div>
          </div>

          <div className="mb-6 flex flex-wrap gap-2">
            {categoryOptions.map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`rounded-full border px-4 py-2 text-sm transition-all duration-200 ${
                  activeCategory === category
                    ? "border-cyan-200/40 bg-cyan-200/10 text-white shadow-[0_0_28px_rgba(125,211,252,0.12)]"
                    : "border-white/10 bg-white/[0.035] text-white/50 hover:border-white/20 hover:text-white"
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {filteredApps.map((app, index) => (
              <motion.div
                key={app.name}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.25 }}
                transition={{ duration: 0.45, delay: index * 0.04 }}
                whileHover={{ y: -6 }}
                className="group"
              >
                <Card className="relative h-full overflow-hidden rounded-[1.8rem] border-white/10 bg-white/[0.04] transition-all duration-300 group-hover:border-cyan-200/20 group-hover:bg-white/[0.06]">
                  <div className={`absolute inset-x-0 top-0 h-px bg-gradient-to-r ${app.accent}`} />
                  <div className="absolute -right-16 -top-16 h-36 w-36 rounded-full bg-white/[0.035] blur-2xl transition-opacity group-hover:opacity-100" />
                  <CardHeader className="p-6 pb-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <CardTitle className="text-xl">{app.name}</CardTitle>
                        <CardDescription className="mt-1">{app.category}</CardDescription>
                      </div>
                      <div className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/45 transition-colors group-hover:text-white/75">
                        <Zap className="h-4 w-4" />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6 pt-0">
                    <div className={`mb-5 h-24 rounded-[1.25rem] border border-white/[0.08] bg-gradient-to-br ${app.accent} relative overflow-hidden`}>
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.20),transparent_28%),linear-gradient(135deg,transparent,rgba(255,255,255,0.06))]" />
                      <div className="absolute bottom-3 left-3 flex items-center gap-2 text-xs text-white/65">
                        <span className="h-1.5 w-1.5 rounded-full bg-cyan-200 shadow-[0_0_12px_rgba(125,211,252,0.9)]" />
                        {app.signal}
                      </div>
                    </div>
                    <p className="text-sm leading-7 text-white/60">{app.description}</p>
                    <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-4 text-xs text-white/45">
                      <span>{app.meta}</span>
                      <button
                        onClick={() => setSelectedApp(app)}
                        className="inline-flex items-center gap-1 text-white/70 transition-colors hover:text-white"
                      >
                        Xem ứng dụng
                        <ArrowUpRight className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {filteredApps.length === 0 ? (
            <div className="glass mt-6 rounded-[1.75rem] p-8 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/55">
                <Search className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-white">Chưa tìm thấy ứng dụng phù hợp</h3>
              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-white/55">
                Thử nhập từ khóa ngắn hơn hoặc chọn lại danh mục để xem các ứng dụng demo khác.
              </p>
              <Button
                variant="secondary"
                className="mt-5"
                onClick={() => {
                  setQuery("");
                  setActiveCategory("Tất cả");
                }}
              >
                Xóa bộ lọc
              </Button>
            </div>
          ) : null}
        </section>

        <section id="categories" className="pb-24 sm:pb-28">
          <div className="mb-10 grid gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
            <div className="max-w-2xl">
              <p className="text-xs uppercase tracking-[0.24em] text-white/40">Danh mục</p>
              <h2 className="mt-4 text-3xl font-semibold tracking-[-0.045em] text-white sm:text-4xl">Khám phá theo nhu cầu, đội nhóm hoặc quy trình làm việc.</h2>
            </div>
            <div className="glass rounded-[1.75rem] p-5 text-sm leading-7 text-white/55">
              Các danh mục được sắp theo mục đích sử dụng, không theo kiểu phân loại khô cứng. Chuyển từ nhu cầu chung sang ứng dụng phù hợp chỉ trong một cú nhấp.
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {visibleCategories.map((category, index) => (
              <motion.div
                key={category.name}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.35 }}
                transition={{ duration: 0.45, delay: index * 0.05 }}
              >
                <Card
                role="button"
                tabIndex={0}
                onClick={() => {
                  setActiveCategory(category.name);
                  scrollToSection("featured");
                }}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    setActiveCategory(category.name);
                    scrollToSection("featured");
                  }
                }}
                className={`rounded-[1.5rem] border-white/10 bg-white/[0.04] transition-all duration-300 hover:border-cyan-200/20 hover:bg-white/[0.06] ${
                  activeCategory === category.name ? "border-cyan-200/30 bg-cyan-200/[0.06]" : ""
                }`}
              >
                <CardContent className="flex items-center justify-between p-5">
                    <div>
                      <div className="flex items-center gap-3 text-base font-medium text-white">
                        <span className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/50">
                          {index % 2 === 0 ? <OrbitIcon className="h-3.5 w-3.5" /> : <Boxes className="h-3.5 w-3.5" />}
                        </span>
                        {category.name}
                      </div>
                      <div className="mt-1 text-sm text-white/50">{category.count}</div>
                    </div>
                    <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/55">
                      <ArrowRight className="h-4 w-4" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </section>

        <footer id="footer" className="mt-auto border-t border-white/10 py-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2 text-sm font-semibold text-white">
                <ShieldCheck className="h-4 w-4 text-cyan-200/70" />
                KhoApp
              </div>
              <div className="mt-2 text-sm text-white/45">Khám phá ứng dụng tối giản, tinh tế dành cho sản phẩm cao cấp.</div>
            </div>
            <div className="flex flex-wrap items-center gap-4 text-sm text-white/45">
              <a href="#featured" className="transition-colors hover:text-white">
                Nổi bật
              </a>
              <a href="#categories" className="transition-colors hover:text-white">
                Danh mục
              </a>
              <a href="#top" className="transition-colors hover:text-white">
                Lên đầu trang
              </a>
            </div>
          </div>
        </footer>
      </div>

      {selectedApp ? (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
          <button
            aria-label="Đóng chi tiết ứng dụng"
            className="absolute inset-0 bg-slate-950/75 backdrop-blur-xl"
            onClick={() => setSelectedApp(null)}
          />
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.96 }}
            className="glass relative w-full max-w-2xl overflow-hidden rounded-[2rem] p-6 shadow-glow sm:p-7"
          >
            <div className={`absolute inset-x-0 top-0 h-px bg-gradient-to-r ${selectedApp.accent}`} />
            <button
              aria-label="Đóng"
              onClick={() => setSelectedApp(null)}
              className="absolute right-5 top-5 flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/50 transition-colors hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
            <div className="pr-12">
              <p className="text-xs uppercase tracking-[0.24em] text-cyan-100/50">Chi tiết ứng dụng</p>
              <h3 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-white">{selectedApp.name}</h3>
              <p className="mt-2 text-sm text-white/45">{selectedApp.category} · {selectedApp.meta}</p>
            </div>
            <div className={`mt-6 h-36 rounded-[1.5rem] border border-white/10 bg-gradient-to-br ${selectedApp.accent} relative overflow-hidden`}>
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_18%,rgba(255,255,255,0.22),transparent_30%),linear-gradient(135deg,transparent,rgba(255,255,255,0.08))]" />
              <div className="absolute bottom-4 left-4 rounded-full border border-white/10 bg-black/20 px-3 py-1.5 text-xs text-white/70 backdrop-blur-md">
                {selectedApp.signal}
              </div>
            </div>
            <p className="mt-6 text-sm leading-7 text-white/65">{selectedApp.description}</p>
            <p className="mt-3 text-sm leading-7 text-white/55">{selectedApp.detail}</p>
            <div className="mt-6 flex flex-wrap gap-2">
              {selectedApp.tags.map((tag) => (
                <span key={tag} className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/55">
                  {tag}
                </span>
              ))}
            </div>
            <div className="mt-7 flex flex-col gap-3 border-t border-white/10 pt-5 sm:flex-row sm:items-center sm:justify-between">
              <span className="text-sm text-white/45">Website demo: {selectedApp.url}</span>
              <Button onClick={() => setSelectedApp(null)}>
                Đã hiểu
                <CheckCircle2 className="h-4 w-4" />
              </Button>
            </div>
          </motion.div>
        </div>
      ) : null}

      {isSubmitOpen ? (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
          <button
            aria-label="Đóng form gửi ứng dụng"
            className="absolute inset-0 bg-slate-950/75 backdrop-blur-xl"
            onClick={() => {
              setIsSubmitOpen(false);
              setIsSubmitted(false);
            }}
          />
          <motion.form
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            onSubmit={handleSubmitApp}
            className="glass relative w-full max-w-xl overflow-hidden rounded-[2rem] p-6 shadow-glow sm:p-7"
          >
            <div className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-cyan-200/60 to-transparent" />
            <button
              type="button"
              aria-label="Đóng"
              onClick={() => {
                setIsSubmitOpen(false);
                setIsSubmitted(false);
              }}
              className="absolute right-5 top-5 flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/50 transition-colors hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>

            {isSubmitted ? (
              <div className="py-8 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-emerald-300/20 bg-emerald-300/10 text-emerald-200 shadow-[0_0_40px_rgba(110,231,183,0.12)]">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <h3 className="mt-5 text-2xl font-semibold tracking-[-0.04em] text-white">Đã nhận thông tin ứng dụng</h3>
                <p className="mx-auto mt-3 max-w-sm text-sm leading-7 text-white/55">
                  Đây là form demo phía giao diện. Khi có backend, dữ liệu này có thể được lưu vào database hoặc gửi về email quản trị.
                </p>
                <Button
                  className="mt-6"
                  onClick={() => {
                    setIsSubmitOpen(false);
                    setIsSubmitted(false);
                  }}
                >
                  Hoàn tất
                </Button>
              </div>
            ) : (
              <>
                <p className="text-xs uppercase tracking-[0.24em] text-cyan-100/50">Gửi ứng dụng</p>
                <h3 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-white">Đưa sản phẩm của bạn lên KhoApp.</h3>
                <p className="mt-3 text-sm leading-7 text-white/55">
                  Điền thông tin cơ bản để mô phỏng luồng submit app. Form này hiện là demo trên frontend.
                </p>

                <div className="mt-6 space-y-4">
                  <Input name="appName" required placeholder="Tên ứng dụng" />
                  <Input name="website" required type="url" placeholder="Website hoặc landing page" />
                  <Input name="category" required placeholder="Danh mục, ví dụ: AI, Thiết kế, Công cụ dev" />
                  <textarea
                    name="description"
                    required
                    rows={4}
                    placeholder="Mô tả ngắn về ứng dụng"
                    className="min-h-28 w-full rounded-[1.5rem] border border-white/10 bg-white/5 px-5 py-4 text-sm text-white placeholder:text-white/40 shadow-sm backdrop-blur-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400/40 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
                  />
                </div>

                <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => {
                      setIsSubmitOpen(false);
                      setIsSubmitted(false);
                    }}
                  >
                    Hủy
                  </Button>
                  <Button type="submit">
                    Gửi demo
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </>
            )}
          </motion.form>
        </div>
      ) : null}
    </main>
  );
}
