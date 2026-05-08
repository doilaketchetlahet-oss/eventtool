"use client";

import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";
import { ArrowLeft, Edit3, Plus, Star, Trash2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { createApp, deleteApp, updateApp, uploadThumbnail } from "@/services/apps";
import { createSlug, parseTags } from "@/lib/app-utils";
import type { AppRecord } from "@/types/app";

type AdminDashboardProps = {
  initialApps: AppRecord[];
};

export default function AdminDashboard({ initialApps }: AdminDashboardProps) {
  const [apps, setApps] = useState(initialApps);
  const [editingApp, setEditingApp] = useState<AppRecord | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const analytics = useMemo(
    () => ({
      total: apps.length,
      featured: apps.filter((app) => app.featured).length,
      downloads: apps.reduce((total, app) => total + (app.downloads_count ?? 0), 0)
    }),
    [apps]
  );

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setError(null);

    const form = event.currentTarget;
    const formData = new FormData(form);
    const title = String(formData.get("title") ?? "").trim();
    const input = {
      title,
      slug: String(formData.get("slug") ?? "").trim() || createSlug(title),
      description: String(formData.get("description") ?? "").trim(),
      long_description: String(formData.get("long_description") ?? "").trim(),
      category: String(formData.get("category") ?? "").trim(),
      version: String(formData.get("version") ?? "").trim(),
      changelog: String(formData.get("changelog") ?? "").trim(),
      thumbnail_url: String(formData.get("thumbnail_url") ?? "").trim(),
      download_url: String(formData.get("download_url") ?? "").trim(),
      tags: String(formData.get("tags") ?? "").trim(),
      status: String(formData.get("status") ?? "approved").trim(),
      featured: formData.get("featured") === "on"
    };
    const thumbnailFile = formData.get("thumbnail_file");

    try {
      let thumbnailUrl = input.thumbnail_url;

      if (thumbnailFile instanceof File && thumbnailFile.size > 0) {
        setIsUploading(true);
        thumbnailUrl = await uploadThumbnail(thumbnailFile);
      }

      const payload = { ...input, thumbnail_url: thumbnailUrl };

      if (editingApp) {
        const updatedApp = await updateApp(editingApp.id, payload);
        setApps((current) => current.map((app) => (app.id === updatedApp.id ? updatedApp : app)));
      } else {
        const createdApp = await createApp(payload);
        setApps((current) => [createdApp, ...current]);
      }

      form.reset();
      setEditingApp(null);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Không thể lưu ứng dụng.");
    } finally {
      setIsSaving(false);
      setIsUploading(false);
    }
  }

  async function handleDelete(app: AppRecord) {
    try {
      await deleteApp(app.id);
      setApps((current) => current.filter((item) => item.id !== app.id));
    } catch (error) {
      setError(error instanceof Error ? error.message : "Không thể xóa ứng dụng.");
    }
  }

  async function handleToggleFeatured(app: AppRecord) {
    try {
      const updatedApp = await updateApp(app.id, {
        title: app.title ?? "Ứng dụng",
        description: app.description ?? "Đang cập nhật",
        featured: !app.featured
      });
      setApps((current) => current.map((item) => (item.id === updatedApp.id ? updatedApp : item)));
    } catch (error) {
      setError(error instanceof Error ? error.message : "Không thể cập nhật featured.");
    }
  }

  async function handleStatus(app: AppRecord, status: "pending" | "approved" | "rejected") {
    try {
      const updatedApp = await updateApp(app.id, {
        title: app.title ?? "Ứng dụng",
        description: app.description ?? "Đang cập nhật",
        status
      });
      setApps((current) => current.map((item) => (item.id === updatedApp.id ? updatedApp : item)));
    } catch (error) {
      setError(error instanceof Error ? error.message : "Không thể cập nhật trạng thái.");
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#020308] px-5 py-6 text-white sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0 grid-glow opacity-25" />
      <div className="pointer-events-none absolute inset-0 cinematic-vignette" />
      <div className="relative mx-auto max-w-7xl">
        <nav className="glass flex items-center justify-between rounded-full px-4 py-3 ring-1 ring-white/5 sm:px-5">
          <div>
            <div className="text-sm font-semibold text-white">KhoApp Admin</div>
            <div className="text-xs text-white/45">Quản lý dữ liệu ứng dụng</div>
          </div>
          <Link href="/" className="inline-flex h-9 items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 text-sm font-medium text-white hover:bg-white/10">
            <ArrowLeft className="h-4 w-4" />
            Về trang chủ
          </Link>
        </nav>

        <section className="grid gap-4 py-10 md:grid-cols-3">
          <Card className="rounded-[1.5rem]"><CardContent className="p-5"><div className="text-3xl font-semibold">{analytics.total}</div><div className="mt-1 text-sm text-white/45">Tổng ứng dụng</div></CardContent></Card>
          <Card className="rounded-[1.5rem]"><CardContent className="p-5"><div className="text-3xl font-semibold">{analytics.featured}</div><div className="mt-1 text-sm text-white/45">Đang featured</div></CardContent></Card>
          <Card className="rounded-[1.5rem]"><CardContent className="p-5"><div className="text-3xl font-semibold">{analytics.downloads}</div><div className="mt-1 text-sm text-white/45">Tổng downloads</div></CardContent></Card>
        </section>

        {error ? <div className="mb-6 rounded-2xl border border-rose-300/15 bg-rose-300/10 px-4 py-3 text-sm text-rose-100">{error}</div> : null}

        <section className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
          <Card className="rounded-[2rem]">
            <CardHeader>
              <CardTitle>{editingApp ? "Sửa ứng dụng" : "Thêm ứng dụng"}</CardTitle>
              <CardDescription>Lưu dữ liệu vào Supabase.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input name="title" required placeholder="Title" defaultValue={editingApp?.title ?? ""} />
                <Input name="slug" placeholder="Slug" defaultValue={editingApp?.slug ?? ""} />
                <Input name="description" required placeholder="Short description" defaultValue={editingApp?.description ?? ""} />
                <Input name="category" placeholder="Category" defaultValue={editingApp?.category ?? ""} />
                <Input name="version" placeholder="Version" defaultValue={editingApp?.version ?? ""} />
                <Input name="thumbnail_url" placeholder="Thumbnail URL" defaultValue={editingApp?.thumbnail_url ?? ""} />
                <Input name="download_url" placeholder="Download URL" defaultValue={editingApp?.download_url ?? editingApp?.url ?? ""} />
                <Input name="thumbnail_file" type="file" accept="image/*" />
                <Input name="tags" placeholder="Tags, cách nhau bằng dấu phẩy" defaultValue={parseTags(editingApp?.tags, "").join(", ")} />
                <textarea name="long_description" rows={4} placeholder="Long description" defaultValue={editingApp?.long_description ?? editingApp?.detail ?? ""} className="min-h-28 w-full rounded-[1.5rem] border border-white/10 bg-white/5 px-5 py-4 text-sm text-white placeholder:text-white/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400/40" />
                <textarea name="changelog" rows={3} placeholder="Changelog" defaultValue={editingApp?.changelog ?? ""} className="min-h-24 w-full rounded-[1.5rem] border border-white/10 bg-white/5 px-5 py-4 text-sm text-white placeholder:text-white/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400/40" />
                <select name="status" defaultValue={editingApp?.status ?? "approved"} className="h-12 w-full rounded-[1.5rem] border border-white/10 bg-white/5 px-5 text-sm text-white outline-none">
                  <option value="approved">Approved</option>
                  <option value="pending">Pending</option>
                  <option value="rejected">Rejected</option>
                </select>
                <label className="flex items-center gap-3 text-sm text-white/60"><input name="featured" type="checkbox" defaultChecked={Boolean(editingApp?.featured)} /> Featured</label>
                <div className="flex gap-3">
                  <Button type="submit" disabled={isSaving || isUploading}>{isSaving || isUploading ? "Đang lưu..." : editingApp ? "Cập nhật" : "Thêm app"}<Plus className="h-4 w-4" /></Button>
                  {editingApp ? <Button type="button" variant="secondary" onClick={() => setEditingApp(null)}>Hủy</Button> : null}
                </div>
              </form>
            </CardContent>
          </Card>

          <div className="space-y-4">
            {apps.length === 0 ? <Card className="rounded-[2rem]"><CardContent className="p-8 text-center text-white/55">Chưa có ứng dụng nào.</CardContent></Card> : null}
            {apps.map((app) => (
              <Card key={String(app.id)} className="rounded-[1.5rem]">
                <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="flex items-center gap-2 text-base font-medium text-white">{app.title}{app.featured ? <Star className="h-4 w-4 fill-amber-200 text-amber-200" /> : null}</div>
                    <div className="mt-1 text-sm text-white/50">{app.category ?? "Ứng dụng"} · {app.status ?? "approved"} · {app.downloads_count ?? 0} downloads</div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button size="sm" variant="secondary" onClick={() => setEditingApp(app)}><Edit3 className="h-4 w-4" />Sửa</Button>
                    <Button size="sm" variant="outline" onClick={() => handleToggleFeatured(app)}><Star className="h-4 w-4" />Featured</Button>
                    <Button size="sm" variant="outline" onClick={() => handleStatus(app, "approved")}>Approve</Button>
                    <Button size="sm" variant="outline" onClick={() => handleStatus(app, "pending")}>Pending</Button>
                    <Button size="sm" variant="outline" onClick={() => handleDelete(app)}><Trash2 className="h-4 w-4" />Xóa</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
