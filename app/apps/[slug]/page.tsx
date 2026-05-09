import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Script from "next/script";
import { notFound } from "next/navigation";
import {
  Archive,
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Download,
  HardDrive,
  Layers3,
  Sparkles,
  Tag
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { parseTags } from "@/lib/app-utils";
import { getApp } from "@/lib/get-app";
import { getApps } from "@/lib/get-apps";
import DownloadButton from "./download-button";

type AppDetailPageProps = {
  params: Promise<{ slug: string }>;
};

export const dynamic = "force-dynamic";

const numberFormatter = new Intl.NumberFormat("vi-VN");

function formatDate(value?: string | null) {
  if (!value) {
    return "Đang cập nhật";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Đang cập nhật";
  }

  return new Intl.DateTimeFormat("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" }).format(date);
}

function formatNumber(value: number) {
  return numberFormatter.format(value);
}

function isSafeHttpUrl(value?: string | null) {
  if (!value) {
    return false;
  }

  try {
    const url = new URL(value.startsWith("http") ? value : `https://${value}`);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export async function generateMetadata({ params }: AppDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const app = await getApp(slug);

  if (!app) {
    return { title: "Không tìm thấy ứng dụng - KhoApp" };
  }

  const title = `${app.title ?? "Ứng dụng"} | KhoApp`;
  const description = app.description ?? "Xem thông tin và tải ứng dụng trong KhoApp.";

  return {
    title,
    description,
    alternates: { canonical: `/apps/${slug}` },
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
  const [app, relatedData] = await Promise.all([getApp(slug), getApps({ includeAll: true })]);

  if (!app) {
    notFound();
  }

  const title = app.title ?? "Ứng dụng chưa đặt tên";
  const description = app.description ?? "Mô tả ứng dụng đang được cập nhật.";
  const longDescription = app.long_description ?? app.detail ?? description;
  const category = app.category ?? "Ứng dụng";
  const signal = app.featured ? "Ứng dụng được ghim trong kho" : "Ứng dụng trong kho lưu trữ";
  const version = app.version ?? "1.0.0";
  const changelog = app.changelog ?? "Changelog đang được cập nhật.";
  const downloadUrl = app.download_url ?? app.url ?? null;
  const tags = parseTags(app.tags, category);
  const createdDate = formatDate(app.created_at);
  const downloadCount = app.downloads_count ?? 0;
  const statusLabel = app.status === "pending" ? "Chờ duyệt" : app.status === "rejected" ? "Bị từ chối" : "Đã lưu trữ";
  const hasDownloadLink = isSafeHttpUrl(downloadUrl);
  const fileSize = app.file_size ?? "Chưa rõ";
  const fileType = app.file_type ?? "Chưa rõ";
  const platform = app.platform ?? "Đa nền tảng";
  const sourceUrl = app.source_url ?? null;
  const checksum = app.checksum ?? null;
  const notes = app.notes ?? null;
  const license = app.license ?? null;
  const virusScanStatus = app.virus_scan_status ?? null;
  const lastVerifiedAt = app.last_verified_at ? formatDate(app.last_verified_at) : "Chưa xác minh";

  const relatedApps = (relatedData.apps ?? [])
    .filter((item) => item.id !== app.id)
    .filter((item) => (item.status ?? "approved") === "approved")
    .filter((item) => (item.category ?? "Ứng dụng") === category || parseTags(item.tags, "").includes(category))
    .slice(0, 3);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: title,
    description,
    applicationCategory: category,
    operatingSystem: platform,
    softwareVersion: version,
    license: license ?? undefined,
    downloadUrl: hasDownloadLink ? downloadUrl : undefined,
    datePublished: app.created_at ?? undefined,
    aggregateRating: app.downloads_count ? { "@type": "AggregateRating", ratingValue: 5, ratingCount: app.downloads_count } : undefined,
    image: app.thumbnail_url ?? undefined
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#020308] px-5 py-6 text-white sm:px-6 lg:px-8">
      <Script id="app-jsonld" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="pointer-events-none absolute inset-0 grid-glow opacity-25" />
      <div className="pointer-events-none absolute inset-0 noise opacity-[0.035]" />
      <div className="pointer-events-none absolute inset-0 cinematic-vignette" />
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-0 h-px w-[52rem] -translate-x-1/2 aurora-line opacity-80" />
        <div className="absolute -top-44 left-1/2 h-[34rem] w-[58rem] -translate-x-1/2 rounded-full bg-cyan-300/10 blur-3xl" />
        <div className="absolute top-36 right-[-12%] h-[34rem] w-[34rem] rounded-full bg-cyan-500/12 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-6xl pb-24 sm:pb-28">
        <nav className="glass flex items-center justify-between rounded-full px-4 py-3 ring-1 ring-white/5 sm:px-5">
          <Link href="/" className="flex items-center gap-3 text-sm font-semibold tracking-tight text-white">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-slate-950 shadow-[0_0_40px_rgba(255,255,255,0.24)]">
              <Sparkles className="h-4 w-4" />
            </span>
            <span>KhoApp</span>
          </Link>
          <Link href="/" className="inline-flex h-9 items-center justify-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 text-sm font-medium text-white transition-colors hover:bg-white/10">
            <ArrowLeft className="h-4 w-4" />
            Quay lại kho
          </Link>
        </nav>

        <div className="mt-6 flex flex-wrap items-center gap-2 text-xs text-white/45">
          <Link href="/" className="transition-colors hover:text-white">KhoApp</Link>
          <span>/</span>
          <Link href={`/?category=${encodeURIComponent(category)}`} className="transition-colors hover:text-white">{category}</Link>
          <span>/</span>
          <span className="text-white/70">{title}</span>
        </div>

        <section className="grid gap-8 py-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-start lg:py-14">
          <div>
            <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-medium text-white/70 backdrop-blur-xl">
              <span className="h-2 w-2 rounded-full bg-emerald-300 shadow-[0_0_18px_rgba(110,231,183,0.9)]" />
              {signal}
            </div>

            <h1 className="max-w-3xl text-5xl font-semibold tracking-[-0.06em] text-white sm:text-6xl lg:text-7xl">{title}</h1>
            <p className="mt-7 max-w-2xl text-base leading-8 text-white/60 sm:text-lg">{description}</p>

            <div className="mt-8 flex flex-wrap gap-2">
              <span className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-xs font-medium text-white/55 backdrop-blur-xl">{category}</span>
              <span className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-xs font-medium text-white/55 backdrop-blur-xl">{statusLabel}</span>
              <span className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-xs font-medium text-white/55 backdrop-blur-xl">v{version}</span>
              <span className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-xs font-medium text-white/55 backdrop-blur-xl">{formatNumber(downloadCount)} lượt tải</span>
            </div>

            <div className="mt-9">
              <DownloadButton app={app} downloadUrl={downloadUrl} />
            </div>

            <div className="mt-10 grid gap-3 sm:grid-cols-3">
              {[
                { label: "Cập nhật", value: createdDate, icon: CalendarDays },
                { label: "Nguồn tải", value: hasDownloadLink ? "Có link tải" : "Chưa có link", icon: Download },
                { label: "Tag", value: `${tags.length} mục`, icon: Tag }
              ].map(({ label, value, icon: Icon }) => (
                <div key={label} className="rounded-[1.25rem] border border-white/10 bg-white/[0.04] p-4">
                  <div className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-white/35">
                    <Icon className="h-4 w-4 text-cyan-200/70" />
                    {label}
                  </div>
                  <div className="mt-2 text-sm text-white/75">{String(value)}</div>
                </div>
              ))}
            </div>
          </div>

          <Card className="relative overflow-hidden rounded-[2.25rem] border-white/10 bg-white/[0.045] shadow-glow">
            <div className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-cyan-200/50 to-transparent" />
            <CardContent className="space-y-6 p-6 sm:p-7">
              <div className="relative overflow-hidden rounded-[1.75rem] border border-white/10 bg-gradient-to-br from-cyan-400/25 via-violet-500/10 to-blue-500/10">
                {app.thumbnail_url ? (
                  <Image src={app.thumbnail_url} alt={title} width={1200} height={720} className="h-72 w-full object-cover opacity-95" unoptimized />
                ) : (
                  <div className="flex h-72 items-end justify-between p-6">
                    <div>
                      <div className="text-xs uppercase tracking-[0.22em] text-white/55">Archive preview</div>
                      <div className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-white">{title}</div>
                    </div>
                    <Archive className="h-8 w-8 text-white/60" />
                  </div>
                )}
                <div className="absolute bottom-5 left-5 rounded-full border border-white/10 bg-black/20 px-4 py-2 text-xs text-white/70 backdrop-blur-md">v{version}</div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-[1.25rem] border border-white/10 bg-white/[0.035] p-4">
                  <div className="text-xs uppercase tracking-[0.18em] text-white/35">Trạng thái</div>
                  <div className="mt-2 flex items-center gap-2 text-sm text-white/75">
                    <CheckCircle2 className="h-4 w-4 text-emerald-200" />
                    {statusLabel}
                  </div>
                </div>
                <div className="rounded-[1.25rem] border border-white/10 bg-white/[0.035] p-4">
                  <div className="text-xs uppercase tracking-[0.18em] text-white/35">Ngày tạo</div>
                  <div className="mt-2 flex items-center gap-2 text-sm text-white/75">
                    <CalendarDays className="h-4 w-4 text-cyan-200" />
                    {createdDate}
                  </div>
                </div>
                <div className="rounded-[1.25rem] border border-white/10 bg-white/[0.035] p-4">
                  <div className="text-xs uppercase tracking-[0.18em] text-white/35">Dung lượng</div>
                  <div className="mt-2 text-sm text-white/75">{fileSize}</div>
                </div>
                <div className="rounded-[1.25rem] border border-white/10 bg-white/[0.035] p-4">
                  <div className="text-xs uppercase tracking-[0.18em] text-white/35">Loại file</div>
                  <div className="mt-2 text-sm text-white/75">{fileType}</div>
                </div>
                <div className="rounded-[1.25rem] border border-white/10 bg-white/[0.035] p-4 sm:col-span-2">
                  <div className="text-xs uppercase tracking-[0.18em] text-white/35">Nền tảng</div>
                  <div className="mt-2 text-sm text-white/75">{platform}</div>
                </div>
                <div className="rounded-[1.25rem] border border-white/10 bg-white/[0.035] p-4 sm:col-span-2">
                  <div className="text-xs uppercase tracking-[0.18em] text-white/35">Checksum</div>
                  <div className="mt-2 break-all text-sm text-white/75">{checksum ?? "Chưa có"}</div>
                </div>
                <div className="rounded-[1.25rem] border border-white/10 bg-white/[0.035] p-4 sm:col-span-2">
                  <div className="text-xs uppercase tracking-[0.18em] text-white/35">Nguồn gốc</div>
                  {sourceUrl ? (
                    <a href={sourceUrl} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex break-all text-sm text-cyan-200 transition-colors hover:text-cyan-100">
                      {sourceUrl}
                    </a>
                  ) : (
                    <div className="mt-2 text-sm text-white/75">Chưa có nguồn gốc</div>
                  )}
                </div>
                <div className="rounded-[1.25rem] border border-white/10 bg-white/[0.035] p-4">
                  <div className="text-xs uppercase tracking-[0.18em] text-white/35">License</div>
                  <div className="mt-2 text-sm text-white/75">{license ?? "Chưa rõ"}</div>
                </div>
                <div className="rounded-[1.25rem] border border-white/10 bg-white/[0.035] p-4">
                  <div className="text-xs uppercase tracking-[0.18em] text-white/35">Scan status</div>
                  <div className="mt-2 text-sm text-white/75">{virusScanStatus ?? "Chưa quét"}</div>
                </div>
                <div className="rounded-[1.25rem] border border-white/10 bg-white/[0.035] p-4 sm:col-span-2">
                  <div className="text-xs uppercase tracking-[0.18em] text-white/35">Last verified</div>
                  <div className="mt-2 text-sm text-white/75">{lastVerifiedAt}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="grid gap-5 pb-16 sm:pb-20 lg:grid-cols-[1.1fr_0.9fr]">
          <Card className="rounded-[2rem] border-white/10 bg-white/[0.04]">
            <CardContent className="p-6 sm:p-8">
              <p className="text-xs uppercase tracking-[0.24em] text-white/40">Mô tả chi tiết</p>
              <h2 className="mt-4 text-3xl font-semibold tracking-[-0.045em] text-white">Mở app trong kho và tải khi cần.</h2>
              <p className="mt-5 text-sm leading-7 text-white/60 sm:text-base sm:leading-8">{longDescription}</p>

              <div className="mt-6 flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <span key={tag} className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/55">
                    {tag}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-[2rem] border-white/10 bg-white/[0.04]">
            <CardContent className="p-6 sm:p-8">
              <div className="flex items-center gap-2 text-xs uppercase tracking-[0.24em] text-white/40">
                <Clock3 className="h-4 w-4 text-cyan-200/70" />
                Changelog
              </div>
              <h2 className="mt-4 text-2xl font-semibold tracking-[-0.04em] text-white">Phiên bản {version}</h2>
              <p className="mt-5 whitespace-pre-line text-sm leading-7 text-white/60">{changelog}</p>
              {notes ? (
                <div className="mt-6 rounded-[1.5rem] border border-white/10 bg-white/[0.035] p-4 text-sm leading-7 text-white/55">
                  <div className="text-xs uppercase tracking-[0.18em] text-white/35">Trust notes</div>
                  <p className="mt-3 whitespace-pre-line">{notes}</p>
                </div>
              ) : null}
            </CardContent>
          </Card>
        </section>

        {relatedApps.length > 0 ? (
          <section className="pb-16 sm:pb-20">
            <div className="mb-6 flex items-center gap-2 text-xs uppercase tracking-[0.24em] text-white/40">
              <Layers3 className="h-4 w-4 text-cyan-200/70" />
              Cùng danh mục
            </div>
            <div className="grid gap-5 md:grid-cols-3">
              {relatedApps.map((item) => (
                <Link key={String(item.id)} href={`/apps/${item.slug ?? item.id}`} className="group rounded-[1.75rem] border border-white/10 bg-white/[0.04] p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-cyan-200/20 hover:bg-white/[0.06]">
                  <div className="flex items-center gap-4">
                    <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-white/5">
                      {item.thumbnail_url ? (
                        <Image src={item.thumbnail_url} alt={item.title ?? "thumbnail"} width={96} height={96} className="h-full w-full object-cover" unoptimized />
                      ) : (
                        <span className="text-sm font-semibold text-white/60">{String(item.title ?? "AA").slice(0, 2).toUpperCase()}</span>
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="truncate text-base font-medium text-white">{item.title}</div>
                      <div className="mt-1 text-xs uppercase tracking-[0.16em] text-white/45">{item.category ?? "Ứng dụng"}</div>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center justify-between text-xs text-white/45">
                    <span>{formatNumber(item.downloads_count ?? 0)} tải</span>
                    <span className="inline-flex items-center gap-1 text-white/70 group-hover:text-white">
                      Mở
                      <ArrowLeft className="h-3.5 w-3.5 rotate-180" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        ) : null}
      </div>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-slate-950/80 px-4 py-3 backdrop-blur-xl lg:hidden">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-xs text-white/45">
            {hasDownloadLink ? "Sẵn sàng tải xuống" : "Chưa có link tải"}
          </div>
          <DownloadButton app={app} downloadUrl={downloadUrl} />
        </div>
      </div>
    </main>
  );
}
