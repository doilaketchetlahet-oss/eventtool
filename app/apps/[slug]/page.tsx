import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarDays, CheckCircle2, Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { parseTags } from "@/lib/app-utils";
import { getApp } from "@/lib/get-app";
import DownloadButton from "./download-button";

type AppDetailPageProps = {
  params: Promise<{ slug: string }>;
};

export const dynamic = "force-dynamic";

function formatDate(value?: string | null) {
  if (!value) {
    return "Đang cập nhật";
  }

  return new Intl.DateTimeFormat("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" }).format(new Date(value));
}

export async function generateMetadata({ params }: AppDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const app = await getApp(slug);

  if (!app) {
    return { title: "Không tìm thấy ứng dụng - KhoApp" };
  }

  const title = `${app.title ?? "Ứng dụng"} - KhoApp`;
  const description = app.description ?? "Khám phá ứng dụng trên KhoApp.";

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      images: app.thumbnail_url ? [{ url: app.thumbnail_url }] : undefined
    }
  };
}

export default async function AppDetailPage({ params }: AppDetailPageProps) {
  const { slug } = await params;
  const app = await getApp(slug);

  if (!app) {
    notFound();
  }

  const title = app.title ?? "Ứng dụng chưa đặt tên";
  const description = app.description ?? "Mô tả ứng dụng đang được cập nhật.";
  const longDescription = app.long_description ?? app.detail ?? description;
  const category = app.category ?? "Ứng dụng";
  const signal = app.featured ? "Ứng dụng nổi bật" : "Đã kết nối Supabase";
  const version = app.version ?? "1.0.0";
  const changelog = app.changelog ?? "Changelog đang được cập nhật.";
  const downloadUrl = app.download_url ?? app.url ?? null;
  const tags = parseTags(app.tags, category);
  const createdDate = formatDate(app.created_at);

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#020308] px-5 py-6 text-white sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0 grid-glow opacity-25" />
      <div className="pointer-events-none absolute inset-0 noise opacity-[0.035]" />
      <div className="pointer-events-none absolute inset-0 cinematic-vignette" />
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-0 h-px w-[52rem] -translate-x-1/2 aurora-line opacity-80" />
        <div className="absolute -top-44 left-1/2 h-[34rem] w-[58rem] -translate-x-1/2 rounded-full bg-cyan-300/10 blur-3xl" />
        <div className="absolute top-36 right-[-12%] h-[34rem] w-[34rem] rounded-full bg-cyan-500/12 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-6xl">
        <nav className="glass flex items-center justify-between rounded-full px-4 py-3 ring-1 ring-white/5 sm:px-5">
          <Link href="/" className="flex items-center gap-3 text-sm font-semibold tracking-tight text-white">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-slate-950 shadow-[0_0_40px_rgba(255,255,255,0.24)]">
              <Sparkles className="h-4 w-4" />
            </span>
            <span>KhoApp</span>
          </Link>
          <Link href="/" className="inline-flex h-9 items-center justify-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 text-sm font-medium text-white transition-colors hover:bg-white/10">
            <ArrowLeft className="h-4 w-4" />
            Quay lại
          </Link>
        </nav>

        <section className="grid gap-8 py-16 sm:py-20 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:py-24">
          <div>
            <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-medium text-white/70 backdrop-blur-xl">
              <span className="h-2 w-2 rounded-full bg-emerald-300 shadow-[0_0_18px_rgba(110,231,183,0.9)]" />
              {signal}
            </div>
            <h1 className="max-w-3xl text-5xl font-semibold tracking-[-0.06em] text-white sm:text-6xl lg:text-7xl">{title}</h1>
            <p className="mt-7 max-w-2xl text-base leading-8 text-white/60 sm:text-lg">{description}</p>
            <div className="mt-8 flex flex-wrap gap-2">
              <span className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-xs font-medium text-white/55 backdrop-blur-xl">{category}</span>
              {tags.map((tag) => (
                <span key={tag} className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-xs font-medium text-white/55 backdrop-blur-xl">
                  {tag}
                </span>
              ))}
            </div>
            <div className="mt-9">
              <DownloadButton app={app} downloadUrl={downloadUrl} />
            </div>
          </div>

          <Card className="relative overflow-hidden rounded-[2.25rem] border-white/10 bg-white/[0.045] shadow-glow">
            <div className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-cyan-200/50 to-transparent" />
            <CardContent className="p-6 sm:p-7">
              <div className="relative h-64 overflow-hidden rounded-[1.75rem] border border-white/10 bg-gradient-to-br from-cyan-400/25 via-violet-500/10 to-blue-500/10">
                {app.thumbnail_url ? (
                  <img src={app.thumbnail_url} alt={title} className="h-full w-full object-cover opacity-90" />
                ) : null}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_28%_18%,rgba(255,255,255,0.22),transparent_32%),linear-gradient(135deg,transparent,rgba(255,255,255,0.08))]" />
                <div className="absolute bottom-5 left-5 rounded-full border border-white/10 bg-black/20 px-4 py-2 text-xs text-white/70 backdrop-blur-md">v{version}</div>
              </div>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div className="rounded-[1.25rem] border border-white/10 bg-white/[0.035] p-4">
                  <div className="text-xs uppercase tracking-[0.18em] text-white/35">Trạng thái</div>
                  <div className="mt-2 flex items-center gap-2 text-sm text-white/75">
                    <CheckCircle2 className="h-4 w-4 text-emerald-200" />
                    {signal}
                  </div>
                </div>
                <div className="rounded-[1.25rem] border border-white/10 bg-white/[0.035] p-4">
                  <div className="text-xs uppercase tracking-[0.18em] text-white/35">Ngày tạo</div>
                  <div className="mt-2 flex items-center gap-2 text-sm text-white/75">
                    <CalendarDays className="h-4 w-4 text-cyan-200" />
                    {createdDate}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="grid gap-5 pb-16 sm:pb-20 lg:grid-cols-[1.1fr_0.9fr]">
          <Card className="rounded-[2rem] border-white/10 bg-white/[0.04]">
            <CardContent className="p-6 sm:p-8">
              <p className="text-xs uppercase tracking-[0.24em] text-white/40">Mô tả chi tiết</p>
              <h2 className="mt-4 text-3xl font-semibold tracking-[-0.045em] text-white">Vì sao nên thử {title}?</h2>
              <p className="mt-5 text-sm leading-7 text-white/60 sm:text-base sm:leading-8">{longDescription}</p>
            </CardContent>
          </Card>
          <Card className="rounded-[2rem] border-white/10 bg-white/[0.04]">
            <CardContent className="p-6 sm:p-8">
              <p className="text-xs uppercase tracking-[0.24em] text-white/40">Changelog</p>
              <h2 className="mt-4 text-2xl font-semibold tracking-[-0.04em] text-white">Phiên bản {version}</h2>
              <p className="mt-5 whitespace-pre-line text-sm leading-7 text-white/60">{changelog}</p>
            </CardContent>
          </Card>
        </section>
      </div>
    </main>
  );
}
