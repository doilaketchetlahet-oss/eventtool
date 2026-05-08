"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  Archive,
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  Grid3X3,
  HardDrive,
  Search,
  ShieldCheck,
  Sparkles,
  X,
  Download,
  Clock3
} from "lucide-react";
import type { AppRecord, CategoryRecord } from "@/types/app";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getAppUrl, parseTags } from "@/lib/app-utils";
import type { DataSource } from "@/lib/get-apps";

const fallbackApps = [
  {
    id: "pulse",
    name: "Pulse",
    category: "Phân tích",
    description: "Theo dõi chỉ số sản phẩm theo thời gian thực với giao diện điều khiển tinh gọn.",
    accent: "from-cyan-400/30 to-blue-500/10",
    meta: "12k lượt cài",
    signal: "Dữ liệu trực tiếp",
    tags: ["AI", "Năng suất"],
    detail: "Phù hợp cho founder, PM và đội growth cần nhìn nhanh chỉ số activation, retention và conversion mà không phải dựng dashboard phức tạp.",
    url: "pulse.app",
    downloadUrl: null,
    thumbnailUrl: null,
    downloadsCount: 12000,
    version: "1.8.4",
    featured: true,
    createdAt: "2026-04-29"
  },
  {
    id: "draft",
    name: "Draft",
    category: "Soạn thảo",
    description: "Không gian viết tập trung cho ghi chú, chia sẻ đoạn nội dung và duyệt nhanh.",
    accent: "from-violet-400/30 to-fuchsia-500/10",
    meta: "8.4k lượt cài",
    signal: "Được chọn",
    tags: ["AI", "Năng suất"],
    detail: "Hỗ trợ đội content và marketing viết bản nháp, gom feedback, lưu template và xuất nội dung nhanh cho nhiều kênh.",
    url: "draft.space",
    downloadUrl: null,
    thumbnailUrl: null,
    downloadsCount: 8400,
    version: "2.1.0",
    featured: true,
    createdAt: "2026-04-24"
  },
  {
    id: "orbit",
    name: "Orbit",
    category: "Quản lý dự án",
    description: "Trung tâm dự án nhẹ nhàng cho đội nhóm cần theo dõi rõ ràng mà không rối mắt.",
    accent: "from-emerald-400/25 to-teal-500/10",
    meta: "15k lượt cài",
    signal: "Phù hợp đội nhóm",
    tags: ["Vận hành đội nhóm", "Năng suất"],
    detail: "Một lớp điều phối nhẹ cho sprint, roadmap và checklist vận hành, dành cho đội nhỏ muốn giữ mọi thứ rõ ràng.",
    url: "orbit.team",
    downloadUrl: null,
    thumbnailUrl: null,
    downloadsCount: 15000,
    version: "3.0.1",
    featured: true,
    createdAt: "2026-04-20"
  },
  {
    id: "glyph",
    name: "Glyph",
    category: "Thiết kế",
    description: "Quản lý design system, tài liệu hình ảnh và ghi chú phát hành chỉn chu.",
    accent: "from-amber-400/25 to-orange-500/10",
    meta: "9.1k lượt cài",
    signal: "Bản mới",
    tags: ["Thiết kế"],
    detail: "Tạo thư viện component, guideline hình ảnh và changelog thiết kế trong một không gian trình bày đẹp mắt.",
    url: "glyph.design",
    downloadUrl: null,
    thumbnailUrl: null,
    downloadsCount: 9100,
    version: "1.4.2",
    featured: false,
    createdAt: "2026-04-30"
  },
  {
    id: "frame",
    name: "Frame",
    category: "Video",
    description: "Công cụ duyệt nội dung cộng tác cho đội sáng tạo và agency.",
    accent: "from-pink-400/25 to-rose-500/10",
    meta: "6.8k lượt cài",
    signal: "Quy trình studio",
    tags: ["Thiết kế", "Vận hành đội nhóm"],
    detail: "Dành cho studio video, agency và creator team cần duyệt bản dựng, để lại nhận xét theo timeline và chốt phiên bản cuối.",
    url: "frame.studio",
    downloadUrl: null,
    thumbnailUrl: null,
    downloadsCount: 6800,
    version: "0.9.8",
    featured: false,
    createdAt: "2026-04-18"
  },
  {
    id: "relay",
    name: "Relay",
    category: "Công cụ dev",
    description: "Triển khai và chia sẻ công cụ nội bộ với bề mặt vận hành gọn gàng.",
    accent: "from-sky-400/25 to-indigo-500/10",
    meta: "11.6k lượt cài",
    signal: "Ưu tiên API",
    tags: ["Công cụ dev", "Tự động hóa"],
    detail: "Giúp đội kỹ thuật đóng gói internal tools, chia sẻ endpoint nội bộ và theo dõi trạng thái vận hành trên một giao diện sạch.",
    url: "relay.dev",
    downloadUrl: null,
    thumbnailUrl: null,
    downloadsCount: 11600,
    version: "2.3.0",
    featured: false,
    createdAt: "2026-04-16"
  }
];

const fallbackCategories = [
  { name: "Năng suất", count: "128 ứng dụng" },
  { name: "AI", count: "94 ứng dụng" },
  { name: "Công cụ dev", count: "76 ứng dụng" },
  { name: "Thiết kế", count: "58 ứng dụng" },
  { name: "Tự động hóa", count: "41 ứng dụng" },
  { name: "Vận hành đội nhóm", count: "33 ứng dụng" }
];

type ArchiveApp = {
  id: string;
  name: string;
  category: string;
  description: string;
  accent: string;
  meta: string;
  signal: string;
  tags: string[];
  detail: string;
  url: string;
  downloadUrl: string | null;
  thumbnailUrl: string | null;
  downloadsCount: number;
  version: string | null;
  featured: boolean;
  createdAt: string | null;
};

type HomePageClientProps = {
  apps: AppRecord[];
  categories: CategoryRecord[];
  dataSource: DataSource;
};

const numberFormatter = new Intl.NumberFormat("vi-VN");
const dateFormatter = new Intl.DateTimeFormat("vi-VN", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric"
});

function formatDownloads(count: number) {
  return numberFormatter.format(count);
}

function formatDate(value?: string | null) {
  if (!value) {
    return "-";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return dateFormatter.format(date);
}

function mapSupabaseApp(app: AppRecord, index: number): ArchiveApp {
  const category = app.category ?? "Ứng dụng";
  const tags = parseTags(app.tags, category);

  return {
    id: String(app.id),
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
    meta: app.meta ?? `${formatDownloads(app.downloads_count ?? 0)} lượt tải`,
    signal: app.signal ?? (app.featured ? "Nổi bật" : "Đã lưu trữ"),
    tags,
    detail: app.long_description ?? app.detail ?? "Chi tiết đang được cập nhật từ dữ liệu Supabase.",
    url: getAppUrl(app),
    downloadUrl: app.download_url ?? null,
    thumbnailUrl: app.thumbnail_url ?? null,
    downloadsCount: app.downloads_count ?? 0,
    version: app.version ?? null,
    featured: Boolean(app.featured),
    createdAt: app.created_at ?? null
  };
}

type AppCardProps = {
  app: ArchiveApp;
  onSelect: (app: ArchiveApp) => void;
};

function AppCard({ app, onSelect }: AppCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.45 }}
      whileHover={{ y: -6 }}
      className="group"
    >
      <Card
        role="button"
        tabIndex={0}
        onClick={() => onSelect(app)}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            onSelect(app);
          }
        }}
        className="relative h-full overflow-hidden rounded-[1.8rem] border-white/10 bg-white/[0.04] transition-all duration-300 group-hover:border-cyan-200/20 group-hover:bg-white/[0.06]"
      >
        <div className={`absolute inset-x-0 top-0 h-px bg-gradient-to-r ${app.accent}`} />
        <div className="absolute -right-16 -top-16 h-36 w-36 rounded-full bg-white/[0.035] blur-2xl transition-opacity group-hover:opacity-100" />
        <CardContent className="p-5 sm:p-6">
          <div className="mb-4 overflow-hidden rounded-[1.5rem] border border-white/[0.08] bg-white/[0.035]">
            {app.thumbnailUrl ? (
              <img src={app.thumbnailUrl} alt={app.name} className="h-44 w-full object-cover" />
            ) : (
              <div className={`flex h-44 items-end justify-between bg-gradient-to-br ${app.accent} p-4`}>
                <div>
                  <div className="text-xs uppercase tracking-[0.2em] text-white/55">Archive</div>
                  <div className="mt-2 text-lg font-semibold text-white">{app.name}</div>
                </div>
                <Archive className="h-6 w-6 text-white/60" />
              </div>
            )}
          </div>

          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <CardTitle className="truncate text-xl">{app.name}</CardTitle>
              <CardDescription className="mt-1">{app.category}</CardDescription>
            </div>
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/45 transition-colors group-hover:text-white/75">
              <ArrowUpRight className="h-4 w-4" />
            </div>
          </div>

          <p className="mt-4 line-clamp-3 text-sm leading-7 text-white/60">{app.description}</p>

          <div className="mt-5 flex flex-wrap gap-2 text-[11px] text-white/55">
            <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1">{app.signal}</span>
            <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1">v{app.version ?? "-"}</span>
            <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1">{formatDownloads(app.downloadsCount)} tải</span>
            {app.featured ? <span className="rounded-full border border-cyan-200/20 bg-cyan-200/10 px-2.5 py-1 text-cyan-100">Nổi bật</span> : null}
          </div>

          <div className="mt-5 flex items-center justify-between border-t border-white/10 pt-4 text-xs text-white/45">
            <span>{app.meta}</span>
            <Link href={app.url} onClick={(event) => event.stopPropagation()} className="inline-flex items-center gap-1 text-white/70 transition-colors hover:text-white">
              Trang app
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default function HomePageClient({ apps, categories: supabaseCategories, dataSource }: HomePageClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [activeCategory, setActiveCategory] = useState(searchParams.get("category") || "Tất cả");
  const [selectedApp, setSelectedApp] = useState<ArchiveApp | null>(null);
  const [liveApps] = useState<ArchiveApp[]>(() =>
    apps.length > 0 ? apps.map(mapSupabaseApp) : dataSource === "supabase" ? [] : fallbackApps
  );

  const displayApps = liveApps;

  const categoryOptions = useMemo(() => {
    if (supabaseCategories.length > 0) {
      return ["Tất cả", ...supabaseCategories.map((category) => category.name)];
    }

    const names = displayApps.flatMap((app) => [app.category, ...app.tags]).filter(Boolean);

    return ["Tất cả", ...Array.from(new Set(names))];
  }, [displayApps, supabaseCategories]);

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
      [app.name, app.category, app.description, app.signal, ...app.tags].some((value) => value.toLowerCase().includes(normalizedQuery));
    const matchesCategory = activeCategory === "Tất cả" || app.tags.includes(activeCategory) || app.category === activeCategory;

    return matchesSearch && matchesCategory;
  });

  const featuredSectionApps = (filteredApps.filter((app) => app.featured).length > 0 ? filteredApps.filter((app) => app.featured) : [...filteredApps])
    .sort((a, b) => Number(Boolean(b.featured)) - Number(Boolean(a.featured)) || b.downloadsCount - a.downloadsCount)
    .slice(0, 4);

  const latestApps = [...filteredApps]
    .sort((a, b) => new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime())
    .slice(0, 6);

  const popularApps = [...filteredApps]
    .sort((a, b) => b.downloadsCount - a.downloadsCount)
    .slice(0, 6);

  const spotlightApp = selectedApp ?? filteredApps[0] ?? displayApps[0] ?? null;
  const totalDownloads = displayApps.reduce((total, app) => total + app.downloadsCount, 0);
  const latestUpdate = [...displayApps].sort((a, b) => new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime())[0]?.createdAt ?? null;
  const latestVersion = [...displayApps].sort((a, b) => new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime())[0]?.version ?? "-";

  function scrollToSection(id: string) {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function handleSearch() {
    const params = new URLSearchParams(searchParams.toString());

    if (query.trim()) {
      params.set("q", query.trim());
    } else {
      params.delete("q");
    }

    router.replace(`/?${params.toString()}`, { scroll: false });
    scrollToSection("library");
  }

  function handleCategoryChange(category: string) {
    const params = new URLSearchParams(searchParams.toString());

    setActiveCategory(category);

    if (category === "Tất cả") {
      params.delete("category");
    } else {
      params.set("category", category);
    }

    router.replace(`/?${params.toString()}`, { scroll: false });
    scrollToSection("library");
  }

  function clearFilters() {
    setQuery("");
    handleCategoryChange("Tất cả");
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
              <a href="#library" className="transition-colors hover:text-white">
                Kho lưu trữ
              </a>
              <a href="#categories" className="transition-colors hover:text-white">
                Danh mục
              </a>
              <a href="#footer" className="transition-colors hover:text-white">
                Tài nguyên
              </a>
            </div>

            <Link href="/admin" className="inline-flex h-9 items-center justify-center rounded-full border border-white/15 bg-white/5 px-4 text-sm font-medium text-white transition-colors hover:bg-white/10">
              Admin
            </Link>
          </nav>
        </motion.header>

        <section id="top" className="relative flex flex-1 flex-col justify-center py-18 sm:py-22 lg:py-26">
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
                Kho lưu trữ ứng dụng để xem nhanh, tải gọn, không quảng cáo bán hàng
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.04 }}
                className="mb-8 flex flex-wrap gap-2 text-xs font-medium text-white/60"
              >
                <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 backdrop-blur-xl">
                  <span
                    className={`h-2 w-2 rounded-full ${
                      dataSource === "supabase"
                        ? "bg-emerald-300 shadow-[0_0_18px_rgba(110,231,183,0.9)]"
                        : "bg-amber-300 shadow-[0_0_18px_rgba(253,224,71,0.9)]"
                    }`}
                  />
                  {dataSource === "supabase" ? "Dữ liệu live từ Supabase" : "Dữ liệu demo đang chạy"}
                </span>
                <span className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 backdrop-blur-xl">
                  {displayApps.length} ứng dụng
                </span>
                <span className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 backdrop-blur-xl">
                  {formatDownloads(totalDownloads)} lượt tải
                </span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.65, delay: 0.05 }}
                className="max-w-3xl text-5xl font-semibold tracking-[-0.06em] text-white sm:text-6xl lg:text-7xl"
              >
                Kho ứng dụng gọn, sạch, tải về nhanh.
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.65, delay: 0.12 }}
                className="mt-7 max-w-2xl text-base leading-8 text-white/60 sm:text-lg"
              >
                Tập trung vào lưu trữ, tìm kiếm và tải ứng dụng. Mỗi app có mô tả ngắn, tag, version, lượt tải và đường dẫn rõ ràng để mở chi tiết hoặc tải ngay.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.65, delay: 0.18 }}
                className="mt-9 flex flex-wrap gap-3"
              >
                <Button size="lg" className="group" onClick={() => scrollToSection("library")}> 
                  Xem kho lưu trữ
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </Button>
                <Button variant="secondary" size="lg" onClick={() => scrollToSection("featured")}>
                  Xem app nổi bật
                </Button>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.65, delay: 0.24 }}
                className="mt-12 grid max-w-2xl grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4"
              >
                {[
                  { label: "Ứng dụng lưu trữ", value: formatDownloads(displayApps.length) },
                  { label: "Danh mục", value: formatDownloads(visibleCategories.length) },
                  { label: "Lượt tải", value: formatDownloads(totalDownloads) },
                  { label: "Bản mới nhất", value: latestVersion }
                ].map((item) => (
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
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <CardTitle className="text-lg">App đang được xem</CardTitle>
                      <CardDescription>Spotlight cho app trong kho lưu trữ</CardDescription>
                    </div>
                    <div className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 shadow-[0_0_28px_rgba(34,211,238,0.12)]">
                      <HardDrive className="h-5 w-5 text-white/70" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4 p-5 sm:p-6">
                  {spotlightApp ? (
                    <>
                      <div className={`relative overflow-hidden rounded-[1.5rem] border border-white/[0.08] bg-gradient-to-br ${spotlightApp.accent}`}>
                        {spotlightApp.thumbnailUrl ? (
                          <img src={spotlightApp.thumbnailUrl} alt={spotlightApp.name} className="h-48 w-full object-cover" />
                        ) : (
                          <div className="flex h-48 items-end justify-between p-5">
                            <div>
                              <div className="text-xs uppercase tracking-[0.22em] text-white/55">Archive preview</div>
                              <div className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-white">{spotlightApp.name}</div>
                            </div>
                            <Archive className="h-7 w-7 text-white/60" />
                          </div>
                        )}
                        <div className="absolute bottom-4 left-4 flex flex-wrap gap-2 text-[11px] text-white/75">
                          <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1.5 backdrop-blur-md">v{spotlightApp.version ?? "-"}</span>
                          <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1.5 backdrop-blur-md">{formatDownloads(spotlightApp.downloadsCount)} tải</span>
                          {spotlightApp.featured ? <span className="rounded-full border border-cyan-200/20 bg-cyan-200/10 px-3 py-1.5 text-cyan-100 backdrop-blur-md">Nổi bật</span> : null}
                        </div>
                      </div>

                      <div>
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <div className="text-xs uppercase tracking-[0.18em] text-white/35">{spotlightApp.category}</div>
                            <h3 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-white">{spotlightApp.name}</h3>
                          </div>
                          <ArrowUpRight className="mt-1 h-4 w-4 text-white/35" />
                        </div>
                        <p className="mt-3 text-sm leading-7 text-white/60">{spotlightApp.description}</p>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {spotlightApp.tags.map((tag) => (
                          <span key={tag} className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/55">
                            {tag}
                          </span>
                        ))}
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-sm text-white/55">
                        <div className="rounded-[1.25rem] border border-white/10 bg-white/5 p-4">
                          <div className="text-xs uppercase tracking-[0.18em] text-white/35">Signal</div>
                          <div className="mt-2 text-white">{spotlightApp.signal}</div>
                        </div>
                        <div className="rounded-[1.25rem] border border-white/10 bg-white/5 p-4">
                          <div className="text-xs uppercase tracking-[0.18em] text-white/35">Cập nhật</div>
                          <div className="mt-2 text-white">{formatDate(spotlightApp.createdAt)}</div>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-3 pt-2">
                        <Button size="lg" onClick={() => setSelectedApp(spotlightApp)}>
                          Xem chi tiết
                          <CheckCircle2 className="h-4 w-4" />
                        </Button>
                        <Button variant="secondary" size="lg" onClick={() => scrollToSection("library")}>
                          Duyệt kho
                        </Button>
                      </div>
                    </>
                  ) : (
                    <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-6 text-sm text-white/55">
                      Chưa có app trong kho. Vào admin để thêm dữ liệu.
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </section>

        <section className="sticky top-24 z-40 pb-8 pt-2">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.55 }}
            className="glass mx-auto max-w-5xl rounded-[2rem] p-3 ring-1 ring-cyan-200/5 sm:p-4"
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="hidden h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/50 sm:flex">
                <Search className="h-4 w-4" />
              </div>
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35" />
                <Input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  onKeyDown={(event) => event.key === "Enter" && handleSearch()}
                  placeholder="Tìm app, tag, version hoặc mô tả"
                  className="pl-12"
                />
              </div>
              <Button size="lg" className="shrink-0" onClick={handleSearch}>
                Tìm kiếm
              </Button>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {categoryOptions.map((category) => (
                <button
                  key={category}
                  onClick={() => handleCategoryChange(category)}
                  className={`rounded-full border px-4 py-2 text-sm transition-all duration-200 ${
                    activeCategory === category
                      ? "border-cyan-200/40 bg-cyan-200/10 text-white shadow-[0_0_28px_rgba(125,211,252,0.12)]"
                      : "border-white/10 bg-white/[0.035] text-white/50 hover:border-white/20 hover:text-white"
                  }`}
                >
                  {category}
                </button>
              ))}
              <button onClick={clearFilters} className="rounded-full border border-white/10 bg-white/[0.035] px-4 py-2 text-sm text-white/50 transition-all duration-200 hover:border-white/20 hover:text-white">
                Xóa bộ lọc
              </button>
            </div>
          </motion.div>
        </section>

        <section id="featured" className="pb-20 sm:pb-24">
          <div className="mb-10 flex items-end justify-between gap-6">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-white/40">Nổi bật</p>
              <h2 className="mt-4 max-w-2xl text-3xl font-semibold tracking-[-0.045em] text-white sm:text-4xl">App được ghim lên đầu kho lưu trữ.</h2>
            </div>
            <div className="hidden items-center gap-2 text-sm text-white/45 md:flex">
              <Grid3X3 className="h-4 w-4" />
              {featuredSectionApps.length} ứng dụng
            </div>
          </div>

          {featuredSectionApps.length > 0 ? (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
              {featuredSectionApps.map((app) => (
                <AppCard key={app.id} app={app} onSelect={setSelectedApp} />
              ))}
            </div>
          ) : (
            <div className="glass rounded-[1.75rem] p-8 text-center text-white/55">Chưa có app nổi bật phù hợp bộ lọc.</div>
          )}
        </section>

        <section id="library" className="pb-20 sm:pb-24">
          <div className="mb-10 grid gap-6 lg:grid-cols-[0.95fr_1.05fr] lg:items-end">
            <div className="max-w-2xl">
              <p className="text-xs uppercase tracking-[0.24em] text-white/40">Kho lưu trữ</p>
              <h2 className="mt-4 text-3xl font-semibold tracking-[-0.045em] text-white sm:text-4xl">Tìm app, mở chi tiết và tải về theo nhu cầu.</h2>
            </div>
            <div className="glass rounded-[1.75rem] p-5 text-sm leading-7 text-white/55">
              Hệ thống này ưu tiên lưu trữ và truy cập nhanh. Mỗi thẻ có version, lượt tải, tag và đường dẫn sang trang chi tiết để tải hoặc kiểm tra thông tin.
            </div>
          </div>

          {filteredApps.length === 0 ? (
            <div className="glass rounded-[1.75rem] p-8 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/55">
                <Search className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-white">Chưa tìm thấy app phù hợp</h3>
              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-white/55">
                Thử đổi từ khóa hoặc chọn lại danh mục để mở rộng kết quả.
              </p>
              <Button variant="secondary" className="mt-5" onClick={clearFilters}>
                Xóa bộ lọc
              </Button>
            </div>
          ) : (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {filteredApps.map((app) => (
                <AppCard key={app.id} app={app} onSelect={setSelectedApp} />
              ))}
            </div>
          )}
        </section>

        <section className="pb-20 sm:pb-24">
          <div className="mb-10 grid gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
            <div className="max-w-2xl">
              <p className="text-xs uppercase tracking-[0.24em] text-white/40">Mới cập nhật</p>
              <h2 className="mt-4 text-3xl font-semibold tracking-[-0.045em] text-white sm:text-4xl">Bản mới gần đây trong kho.</h2>
            </div>
            <div className="glass rounded-[1.75rem] p-5 text-sm leading-7 text-white/55">
              Các app này được sắp theo thời gian thêm gần nhất để bạn thấy nhanh phần mềm nào vừa được cập nhật.
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {latestApps.map((app) => (
              <AppCard key={app.id} app={app} onSelect={setSelectedApp} />
            ))}
          </div>
        </section>

        <section className="pb-20 sm:pb-24">
          <div className="mb-10 grid gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
            <div className="max-w-2xl">
              <p className="text-xs uppercase tracking-[0.24em] text-white/40">Tải nhiều</p>
              <h2 className="mt-4 text-3xl font-semibold tracking-[-0.045em] text-white sm:text-4xl">App có lượt tải cao nhất.</h2>
            </div>
            <div className="glass rounded-[1.75rem] p-5 text-sm leading-7 text-white/55">
              Danh sách này cho thấy app nào đang được mở nhiều nhất trong kho.
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {popularApps.map((app) => (
              <AppCard key={app.id} app={app} onSelect={setSelectedApp} />
            ))}
          </div>
        </section>

        <section id="categories" className="pb-20 sm:pb-24">
          <div className="mb-10 grid gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
            <div className="max-w-2xl">
              <p className="text-xs uppercase tracking-[0.24em] text-white/40">Danh mục</p>
              <h2 className="mt-4 text-3xl font-semibold tracking-[-0.045em] text-white sm:text-4xl">Lọc theo mục đích sử dụng.</h2>
            </div>
            <div className="glass rounded-[1.75rem] p-5 text-sm leading-7 text-white/55">
              Danh mục được sắp theo nhóm nhu cầu. Chọn một tag để rút gọn kho ngay lập tức.
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
                  onClick={() => handleCategoryChange(category.name)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      handleCategoryChange(category.name);
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
                          {index % 2 === 0 ? <Archive className="h-3.5 w-3.5" /> : <Clock3 className="h-3.5 w-3.5" />}
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
              <div className="mt-2 text-sm text-white/45">Kho ứng dụng để lưu trữ, duyệt nhanh và tải gọn.</div>
            </div>
            <div className="flex flex-wrap items-center gap-4 text-sm text-white/45">
              <a href="#featured" className="transition-colors hover:text-white">
                Nổi bật
              </a>
              <a href="#library" className="transition-colors hover:text-white">
                Kho lưu trữ
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
        <div className="fixed inset-0 z-[80] flex items-stretch justify-end bg-slate-950/75 p-3 backdrop-blur-xl sm:p-4">
          <button aria-label="Đóng chi tiết ứng dụng" className="absolute inset-0" onClick={() => setSelectedApp(null)} />
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 24 }}
            className="glass relative z-[81] flex w-full max-w-xl flex-col overflow-hidden rounded-[2rem] border-white/10 bg-white/[0.06] shadow-glow"
          >
            <div className={`absolute inset-x-0 top-0 h-px bg-gradient-to-r ${selectedApp.accent}`} />
            <div className="flex items-start justify-between gap-4 p-6 pb-4 sm:p-7">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-cyan-100/50">Chi tiết app</p>
                <h3 className="mt-3 text-3xl font-semibold tracking-[-0.045em] text-white">{selectedApp.name}</h3>
                <p className="mt-2 text-sm text-white/45">{selectedApp.category} · v{selectedApp.version ?? "-"} · {formatDownloads(selectedApp.downloadsCount)} tải</p>
              </div>
              <button onClick={() => setSelectedApp(null)} className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/60">
                Đóng
              </button>
            </div>

            <div className="px-6 sm:px-7">
              <div className={`relative overflow-hidden rounded-[1.6rem] border border-white/10 bg-gradient-to-br ${selectedApp.accent}`}>
                {selectedApp.thumbnailUrl ? (
                  <img src={selectedApp.thumbnailUrl} alt={selectedApp.name} className="h-56 w-full object-cover" />
                ) : (
                  <div className="flex h-56 items-end justify-between p-6">
                    <div>
                      <div className="text-xs uppercase tracking-[0.2em] text-white/55">Archive preview</div>
                      <div className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-white">{selectedApp.name}</div>
                    </div>
                    <Archive className="h-8 w-8 text-white/60" />
                  </div>
                )}
                <div className="absolute bottom-4 left-4 flex flex-wrap gap-2 text-[11px] text-white/75">
                  <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1.5 backdrop-blur-md">{selectedApp.signal}</span>
                  <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1.5 backdrop-blur-md">{selectedApp.meta}</span>
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

              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                <div className="rounded-[1.25rem] border border-white/10 bg-white/5 p-4">
                  <div className="text-xs uppercase tracking-[0.18em] text-white/35">Version</div>
                  <div className="mt-2 text-sm text-white">v{selectedApp.version ?? "-"}</div>
                </div>
                <div className="rounded-[1.25rem] border border-white/10 bg-white/5 p-4">
                  <div className="text-xs uppercase tracking-[0.18em] text-white/35">Lượt tải</div>
                  <div className="mt-2 text-sm text-white">{formatDownloads(selectedApp.downloadsCount)}</div>
                </div>
                <div className="rounded-[1.25rem] border border-white/10 bg-white/5 p-4">
                  <div className="text-xs uppercase tracking-[0.18em] text-white/35">Cập nhật</div>
                  <div className="mt-2 text-sm text-white">{formatDate(selectedApp.createdAt)}</div>
                </div>
              </div>

              <div className="mt-7 flex flex-col gap-3 border-t border-white/10 pt-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="text-sm text-white/45">Mở app để tải hoặc xem chi tiết đầy đủ.</div>
                <div className="flex flex-wrap gap-3">
                  <a
                    href={selectedApp.downloadUrl || selectedApp.url}
                    target={selectedApp.downloadUrl ? "_blank" : undefined}
                    rel={selectedApp.downloadUrl ? "noopener noreferrer" : undefined}
                    className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-white px-6 text-sm font-medium text-slate-950 shadow-[0_0_0_1px_rgba(255,255,255,0.08),0_16px_50px_rgba(255,255,255,0.12)] transition-colors hover:bg-white/90"
                  >
                    <Download className="h-4 w-4" />
                    Tải về
                  </a>
                  <Link href={selectedApp.url} className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-white/15 bg-white/5 px-6 text-sm font-medium text-white transition-colors hover:bg-white/10">
                    Xem trang app
                    <ArrowUpRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      ) : null}

    </main>
  );
}
