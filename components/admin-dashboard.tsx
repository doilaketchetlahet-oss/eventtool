"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  Edit3,
  GripVertical,
  ImagePlus,
  LogOut,
  Plus,
  Search,
  Star,
  Trash2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { createCategory, deleteCategory } from "@/services/categories";
import { createApp, deleteApp, updateApp, uploadThumbnail } from "@/services/apps";
import { createSlug, parseTags } from "@/lib/app-utils";
import type { AppRecord, CategoryRecord, DownloadRecord } from "@/types/app";

type AdminDashboardProps = {
  initialApps: AppRecord[];
  initialCategories: CategoryRecord[];
  initialDownloads: DownloadRecord[];
};

type AppStatus = "pending" | "approved" | "rejected";

const pageSize = 6;

function getFallbackTime(app: AppRecord) {
  return new Date(app.created_at ?? 0).getTime();
}

function sortFeaturedApps(apps: AppRecord[]) {
  return [...apps]
    .filter((app) => app.featured)
    .sort((a, b) => (a.featured_order ?? Number.MAX_SAFE_INTEGER) - (b.featured_order ?? Number.MAX_SAFE_INTEGER) || getFallbackTime(b) - getFallbackTime(a));
}

function getSafeTitle(app: AppRecord) {
  return app.title ?? "Ứng dụng";
}

function getSafeDescription(app: AppRecord) {
  return app.description ?? "Đang cập nhật";
}

export default function AdminDashboard({ initialApps, initialCategories, initialDownloads }: AdminDashboardProps) {
  const [apps, setApps] = useState(initialApps);
  const [categories, setCategories] = useState(initialCategories);
  const [editingApp, setEditingApp] = useState<AppRecord | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [adminQuery, setAdminQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortMode, setSortMode] = useState("newest");
  const [page, setPage] = useState(1);
  const [selectedApp, setSelectedApp] = useState<AppRecord | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<AppRecord["id"]>>(new Set());
  const [draggedFeaturedId, setDraggedFeaturedId] = useState<AppRecord["id"] | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (thumbnailPreview?.startsWith("blob:")) {
        URL.revokeObjectURL(thumbnailPreview);
      }
    };
  }, [thumbnailPreview]);

  const analytics = useMemo(
    () => ({
      total: apps.length,
      approved: apps.filter((app) => (app.status ?? "approved") === "approved").length,
      featured: apps.filter((app) => app.featured).length,
      pending: apps.filter((app) => app.status === "pending").length,
      downloads: apps.reduce((total, app) => total + (app.downloads_count ?? 0), 0)
    }),
    [apps]
  );

  const filteredAdminApps = useMemo(() => {
    const query = adminQuery.trim().toLowerCase();

    return apps
      .filter((app) => {
        const matchesSearch =
          !query ||
          [app.title, app.description, app.category, app.slug, app.status]
            .filter(Boolean)
            .some((value) => String(value).toLowerCase().includes(query));
        const matchesStatus = statusFilter === "all" || (app.status ?? "approved") === statusFilter;

        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => {
        if (sortMode === "downloads") {
          return (b.downloads_count ?? 0) - (a.downloads_count ?? 0);
        }

        if (sortMode === "title") {
          return String(a.title ?? "").localeCompare(String(b.title ?? ""));
        }

        if (sortMode === "featured") {
          return Number(Boolean(b.featured)) - Number(Boolean(a.featured)) || (a.featured_order ?? 9999) - (b.featured_order ?? 9999);
        }

        return getFallbackTime(b) - getFallbackTime(a);
      });
  }, [adminQuery, apps, sortMode, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredAdminApps.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const paginatedApps = filteredAdminApps.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const selectedApps = useMemo(() => apps.filter((app) => selectedIds.has(app.id)), [apps, selectedIds]);
  const allPageSelected = paginatedApps.length > 0 && paginatedApps.every((app) => selectedIds.has(app.id));
  const featuredApps = useMemo(() => sortFeaturedApps(apps), [apps]);

  const topDownloadedApps = useMemo(
    () => [...apps].sort((a, b) => (b.downloads_count ?? 0) - (a.downloads_count ?? 0)).slice(0, 5),
    [apps]
  );

  const categoryStats = useMemo(() => {
    const counts = new Map<string, number>();

    apps.forEach((app) => {
      const category = app.category || "Ứng dụng";
      counts.set(category, (counts.get(category) ?? 0) + 1);
    });

    return [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);
  }, [apps]);

  const downloadTimeline = useMemo(() => {
    const days = Array.from({ length: 14 }, (_, index) => {
      const date = new Date();
      date.setDate(date.getDate() - (13 - index));
      return date.toISOString().slice(0, 10);
    });

    const counts = new Map<string, number>();

    initialDownloads.forEach((download) => {
      if (!download.created_at) {
        return;
      }

      const key = new Date(download.created_at).toISOString().slice(0, 10);
      counts.set(key, (counts.get(key) ?? 0) + 1);
    });

    return days.map((day) => ({
      day,
      count: counts.get(day) ?? 0
    }));
  }, [initialDownloads]);

  const maxDownloadDay = Math.max(1, ...downloadTimeline.map((item) => item.count));
  const lineChartPoints = downloadTimeline
    .map((item, index) => {
      const x = 12 + (index / Math.max(1, downloadTimeline.length - 1)) * 296;
      const y = 112 - (item.count / maxDownloadDay) * 92;
      return `${x},${y}`;
    })
    .join(" ");
  const lineChartArea = lineChartPoints ? `M ${lineChartPoints.replaceAll(" ", " L ")} L 308,120 L 12,120 Z` : "";
  const previewUrl = thumbnailPreview ?? editingApp?.thumbnail_url ?? "";

  function getStatusClass(status?: string | null) {
    if (status === "pending") {
      return "border-amber-200/20 bg-amber-300/10 text-amber-100";
    }

    if (status === "rejected") {
      return "border-rose-200/20 bg-rose-300/10 text-rose-100";
    }

    return "border-emerald-200/20 bg-emerald-300/10 text-emerald-100";
  }

  function editApp(app: AppRecord) {
    setEditingApp(app);
    setThumbnailPreview(null);
  }

  function cancelEdit() {
    setEditingApp(null);
    setThumbnailPreview(null);
  }

  function toggleSelected(id: AppRecord["id"]) {
    setSelectedIds((current) => {
      const next = new Set(current);

      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }

      return next;
    });
  }

  function togglePageSelection() {
    setSelectedIds((current) => {
      const next = new Set(current);

      paginatedApps.forEach((app) => {
        if (allPageSelected) {
          next.delete(app.id);
        } else {
          next.add(app.id);
        }
      });

      return next;
    });
  }

  async function handleCreateCategory(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const form = event.currentTarget;
    const formData = new FormData(form);
    const name = String(formData.get("categoryName") ?? "").trim();

    if (!name) {
      return;
    }

    try {
      const category = await createCategory(name);
      setCategories((current) => [...current, category].sort((a, b) => a.name.localeCompare(b.name)));
      form.reset();
    } catch (error) {
      setError(error instanceof Error ? error.message : "Không thể thêm danh mục.");
    }
  }

  async function handleDeleteCategory(category: CategoryRecord) {
    try {
      await deleteCategory(category.id);
      setCategories((current) => current.filter((item) => item.id !== category.id));
    } catch (error) {
      setError(error instanceof Error ? error.message : "Không thể xóa danh mục.");
    }
  }

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

      const payload = {
        ...input,
        thumbnail_url: thumbnailUrl,
        featured_order: input.featured ? editingApp?.featured_order ?? featuredApps.length + 1 : undefined
      };

      if (editingApp) {
        const updatedApp = await updateApp(editingApp.id, payload);
        setApps((current) => current.map((app) => (app.id === updatedApp.id ? updatedApp : app)));
      } else {
        const createdApp = await createApp(payload);
        setApps((current) => [createdApp, ...current]);
      }

      form.reset();
      setEditingApp(null);
      setThumbnailPreview(null);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Không thể lưu ứng dụng.");
    } finally {
      setIsSaving(false);
      setIsUploading(false);
    }
  }

  function handleThumbnailChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      setThumbnailPreview(null);
      return;
    }

    setThumbnailPreview(URL.createObjectURL(file));
  }

  async function handleDelete(app: AppRecord) {
    try {
      await deleteApp(app.id);
      setApps((current) => current.filter((item) => item.id !== app.id));
      setSelectedIds((current) => {
        const next = new Set(current);
        next.delete(app.id);
        return next;
      });
    } catch (error) {
      setError(error instanceof Error ? error.message : "Không thể xóa ứng dụng.");
    }
  }

  async function handleToggleFeatured(app: AppRecord) {
    const nextFeatured = !app.featured;

    try {
      const updatedApp = await updateApp(app.id, {
        title: getSafeTitle(app),
        description: getSafeDescription(app),
        featured: nextFeatured,
        featured_order: nextFeatured ? app.featured_order ?? featuredApps.length + 1 : undefined
      });
      setApps((current) => current.map((item) => (item.id === updatedApp.id ? updatedApp : item)));
    } catch (error) {
      setError(error instanceof Error ? error.message : "Không thể cập nhật featured.");
    }
  }

  async function handleStatus(app: AppRecord, status: AppStatus) {
    try {
      const updatedApp = await updateApp(app.id, {
        title: getSafeTitle(app),
        description: getSafeDescription(app),
        status
      });
      setApps((current) => current.map((item) => (item.id === updatedApp.id ? updatedApp : item)));
    } catch (error) {
      setError(error instanceof Error ? error.message : "Không thể cập nhật trạng thái.");
    }
  }

  async function handleBulkStatus(status: AppStatus) {
    try {
      await Promise.all(
        selectedApps.map((app) =>
          updateApp(app.id, {
            title: getSafeTitle(app),
            description: getSafeDescription(app),
            status
          })
        )
      );

      setApps((current) => current.map((app) => (selectedIds.has(app.id) ? { ...app, status } : app)));
      setSelectedIds(new Set());
    } catch (error) {
      setError(error instanceof Error ? error.message : "Không thể cập nhật hàng loạt.");
    }
  }

  async function handleBulkFeatured(featured: boolean) {
    try {
      await Promise.all(
        selectedApps.map((app, index) =>
          updateApp(app.id, {
            title: getSafeTitle(app),
            description: getSafeDescription(app),
            featured,
            featured_order: featured ? app.featured_order ?? featuredApps.length + index + 1 : undefined
          })
        )
      );

      setApps((current) =>
        current.map((app) =>
          selectedIds.has(app.id)
            ? { ...app, featured, featured_order: featured ? app.featured_order ?? featuredApps.length + 1 : app.featured_order }
            : app
        )
      );
      setSelectedIds(new Set());
    } catch (error) {
      setError(error instanceof Error ? error.message : "Không thể cập nhật featured hàng loạt.");
    }
  }

  async function handleBulkDelete() {
    if (!window.confirm(`Xóa ${selectedApps.length} ứng dụng đã chọn?`)) {
      return;
    }

    try {
      await Promise.all(selectedApps.map((app) => deleteApp(app.id)));
      setApps((current) => current.filter((app) => !selectedIds.has(app.id)));
      setSelectedIds(new Set());
    } catch (error) {
      setError(error instanceof Error ? error.message : "Không thể xóa hàng loạt.");
    }
  }

  async function handleFeaturedDrop(targetId: AppRecord["id"]) {
    if (!draggedFeaturedId || draggedFeaturedId === targetId) {
      setDraggedFeaturedId(null);
      return;
    }

    const fromIndex = featuredApps.findIndex((app) => app.id === draggedFeaturedId);
    const toIndex = featuredApps.findIndex((app) => app.id === targetId);

    if (fromIndex < 0 || toIndex < 0) {
      setDraggedFeaturedId(null);
      return;
    }

    const reordered = [...featuredApps];
    const [moved] = reordered.splice(fromIndex, 1);
    reordered.splice(toIndex, 0, moved);
    const previousApps = apps;

    setDraggedFeaturedId(null);
    setApps((current) =>
      current.map((app) => {
        const orderIndex = reordered.findIndex((item) => item.id === app.id);
        return orderIndex >= 0 ? { ...app, featured_order: orderIndex + 1 } : app;
      })
    );

    try {
      await Promise.all(
        reordered.map((app, index) =>
          updateApp(app.id, {
            title: getSafeTitle(app),
            description: getSafeDescription(app),
            featured: true,
            featured_order: index + 1
          })
        )
      );
    } catch (error) {
      setApps(previousApps);
      setError(error instanceof Error ? error.message : "Không thể lưu thứ tự featured. Chạy SQL upgrade nếu thiếu cột featured_order.");
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#020308] px-4 py-5 text-white sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0 grid-glow opacity-25" />
      <div className="pointer-events-none absolute inset-0 noise opacity-[0.035]" />
      <div className="pointer-events-none absolute inset-0 cinematic-vignette" />
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-0 h-px w-[52rem] -translate-x-1/2 aurora-line opacity-80" />
        <div className="absolute -top-44 left-1/2 h-[34rem] w-[58rem] -translate-x-1/2 rounded-full bg-cyan-300/10 blur-3xl" />
        <div className="absolute -left-32 top-40 h-96 w-96 rounded-full bg-violet-500/12 blur-3xl" />
        <div className="absolute bottom-10 right-[-12rem] h-[28rem] w-[28rem] rounded-full bg-cyan-500/10 blur-3xl" />
      </div>

      <div className="relative mx-auto flex min-h-[calc(100vh-2.5rem)] max-w-7xl flex-col gap-5">
        <nav className="glass flex flex-col gap-3 rounded-[1.5rem] px-4 py-3 ring-1 ring-white/5 sm:flex-row sm:items-center sm:justify-between sm:rounded-full sm:px-5">
          <div>
            <div className="text-sm font-semibold text-white">KhoApp Admin</div>
            <div className="text-xs text-white/45">Split console quản lý apps, analytics, featured order</div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Link href="/" className="inline-flex h-9 items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 text-sm font-medium text-white hover:bg-white/10">
              <ArrowLeft className="h-4 w-4" />
              Trang chủ
            </Link>
            <form action="/admin/logout" method="post">
              <button className="inline-flex h-9 items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 text-sm font-medium text-white hover:bg-white/10">
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </form>
          </div>
        </nav>

        {error ? <div className="rounded-2xl border border-rose-300/15 bg-rose-300/10 px-4 py-3 text-sm text-rose-100">{error}</div> : null}

        <section className="grid flex-1 gap-5 lg:h-[calc(100vh-7.25rem)] lg:grid-cols-[25rem_minmax(0,1fr)] lg:overflow-hidden">
          <aside className="space-y-5 lg:h-full lg:overflow-y-auto lg:pr-1">
            <Card className="overflow-hidden rounded-[2rem] border-white/10 bg-white/[0.045] shadow-glow">
              <div className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-cyan-200/50 to-transparent" />
              <CardHeader className="p-6 pb-4">
                <CardTitle className="text-2xl tracking-[-0.04em]">{editingApp ? "Sửa ứng dụng" : "Thêm ứng dụng"}</CardTitle>
                <CardDescription>Form cố định bên trái. Upload preview hiển thị trước khi save.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <Input name="title" required placeholder="Title" defaultValue={editingApp?.title ?? ""} />
                  <Input name="slug" placeholder="Slug" defaultValue={editingApp?.slug ?? ""} />
                  <Input name="description" required placeholder="Short description" defaultValue={editingApp?.description ?? ""} />
                  <Input name="category" list="category-options" placeholder="Category" defaultValue={editingApp?.category ?? ""} />
                  <datalist id="category-options">
                    {categories.map((category) => <option key={String(category.id)} value={category.name} />)}
                  </datalist>
                  <Input name="version" placeholder="Version" defaultValue={editingApp?.version ?? ""} />
                  <Input name="thumbnail_url" placeholder="Thumbnail URL" defaultValue={editingApp?.thumbnail_url ?? ""} />
                  <Input name="download_url" placeholder="Download URL" defaultValue={editingApp?.download_url ?? editingApp?.url ?? ""} />
                  <label className="block rounded-[1.5rem] border border-dashed border-white/15 bg-white/[0.035] p-4">
                    <span className="mb-3 flex items-center gap-2 text-sm text-white/65">
                      <ImagePlus className="h-4 w-4 text-cyan-200" />
                      Upload thumbnail
                    </span>
                    <Input name="thumbnail_file" type="file" accept="image/*" onChange={handleThumbnailChange} />
                    <div className="mt-4 overflow-hidden rounded-[1.25rem] border border-white/10 bg-white/5">
                      {previewUrl ? (
                        <img src={previewUrl} alt="Thumbnail preview" className="h-40 w-full object-cover" />
                      ) : (
                        <div className="flex h-40 items-center justify-center text-sm text-white/35">Chưa có preview</div>
                      )}
                    </div>
                  </label>
                  <Input name="tags" placeholder="Tags, cách nhau bằng dấu phẩy" defaultValue={parseTags(editingApp?.tags, "").join(", ")} />
                  <textarea name="long_description" rows={4} placeholder="Long description" defaultValue={editingApp?.long_description ?? editingApp?.detail ?? ""} className="min-h-28 w-full rounded-[1.5rem] border border-white/10 bg-white/5 px-5 py-4 text-sm text-white placeholder:text-white/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400/40" />
                  <textarea name="changelog" rows={3} placeholder="Changelog" defaultValue={editingApp?.changelog ?? ""} className="min-h-24 w-full rounded-[1.5rem] border border-white/10 bg-white/5 px-5 py-4 text-sm text-white placeholder:text-white/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400/40" />
                  <select name="status" defaultValue={editingApp?.status ?? "approved"} className="h-12 w-full rounded-[1.5rem] border border-white/10 bg-white/5 px-5 text-sm text-white outline-none">
                    <option value="approved">Approved</option>
                    <option value="pending">Pending</option>
                    <option value="rejected">Rejected</option>
                  </select>
                  <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/60">
                    <input name="featured" type="checkbox" defaultChecked={Boolean(editingApp?.featured)} /> Featured
                  </label>
                  <div className="flex flex-wrap gap-3">
                    <Button type="submit" disabled={isSaving || isUploading}>{isSaving || isUploading ? "Đang lưu..." : editingApp ? "Cập nhật" : "Thêm app"}<Plus className="h-4 w-4" /></Button>
                    {editingApp ? <Button type="button" variant="secondary" onClick={cancelEdit}>Hủy</Button> : null}
                  </div>
                </form>
              </CardContent>
            </Card>

            <Card className="overflow-hidden rounded-[2rem] border-white/10 bg-white/[0.045]">
              <CardHeader>
                <CardTitle>Featured order</CardTitle>
                <CardDescription>Kéo thả để đổi thứ tự hiển thị ở trang chủ.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {featuredApps.length === 0 ? <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/45">Chưa có app featured.</div> : null}
                {featuredApps.map((app, index) => (
                  <div
                    key={String(app.id)}
                    draggable
                    onDragStart={() => setDraggedFeaturedId(app.id)}
                    onDragOver={(event) => event.preventDefault()}
                    onDrop={() => handleFeaturedDrop(app.id)}
                    className={`flex cursor-grab items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-3 transition-colors active:cursor-grabbing ${draggedFeaturedId === app.id ? "border-cyan-200/40 bg-cyan-200/10" : "hover:bg-white/10"}`}
                  >
                    <GripVertical className="h-4 w-4 text-white/35" />
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/10 text-xs text-white/55">{index + 1}</span>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-medium text-white">{app.title}</div>
                      <div className="text-xs text-white/40">{app.category ?? "Ứng dụng"}</div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="overflow-hidden rounded-[2rem] border-white/10 bg-white/[0.045]">
              <CardHeader>
                <CardTitle>Danh mục</CardTitle>
                <CardDescription>Filter trang chủ dùng danh mục này.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateCategory} className="flex gap-2">
                  <Input name="categoryName" placeholder="Tên danh mục" />
                  <Button type="submit"><Plus className="h-4 w-4" />Thêm</Button>
                </form>
                <div className="mt-4 flex flex-wrap gap-2">
                  {categories.map((category) => (
                    <button key={String(category.id)} onClick={() => handleDeleteCategory(category)} className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/60 transition-all hover:-translate-y-0.5 hover:border-rose-300/30 hover:text-rose-100">
                      {category.name} x
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </aside>

          <div className="space-y-5 lg:h-full lg:overflow-y-auto lg:pl-1">
            <section className="grid gap-4 md:grid-cols-4">
              {[
                ["Tổng ứng dụng", analytics.total, "from-cyan-300/45 to-blue-500/10"],
                ["Approved", analytics.approved, "from-emerald-300/45 to-teal-500/10"],
                ["Featured", analytics.featured, "from-violet-300/45 to-fuchsia-500/10"],
                ["Pending", analytics.pending, "from-amber-300/45 to-orange-500/10"]
              ].map(([label, value, accent]) => (
                <Card key={label} className="relative overflow-hidden rounded-[1.5rem] border-white/10 bg-white/[0.045] transition-colors hover:border-cyan-200/20">
                  <div className={`absolute inset-x-0 top-0 h-px bg-gradient-to-r ${accent}`} />
                  <CardContent className="p-5">
                    <div className="text-3xl font-semibold tracking-[-0.04em] text-white">{value}</div>
                    <div className="mt-1 text-sm text-white/45">{label}</div>
                  </CardContent>
                </Card>
              ))}
            </section>

            <section className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
              <Card className="overflow-hidden rounded-[2rem] border-white/10 bg-white/[0.045]">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <BarChart3 className="h-4 w-4 text-cyan-200" />
                    <CardTitle>Downloads theo ngày</CardTitle>
                  </div>
                  <CardDescription>{analytics.downloads} tổng downloads, chart 14 ngày gần nhất.</CardDescription>
                </CardHeader>
                <CardContent>
                  <svg viewBox="0 0 320 130" className="h-48 w-full overflow-visible">
                    <defs>
                      <linearGradient id="downloadLine" x1="0" x2="1" y1="0" y2="0">
                        <stop offset="0%" stopColor="#67e8f9" />
                        <stop offset="100%" stopColor="#c084fc" />
                      </linearGradient>
                      <linearGradient id="downloadArea" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0%" stopColor="#67e8f9" stopOpacity="0.22" />
                        <stop offset="100%" stopColor="#67e8f9" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    {[20, 43, 66, 89, 112].map((y) => (
                      <line key={y} x1="12" x2="308" y1={y} y2={y} stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
                    ))}
                    <path d={lineChartArea} fill="url(#downloadArea)" />
                    <polyline points={lineChartPoints} fill="none" stroke="url(#downloadLine)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" />
                    {downloadTimeline.map((item, index) => {
                      const x = 12 + (index / Math.max(1, downloadTimeline.length - 1)) * 296;
                      const y = 112 - (item.count / maxDownloadDay) * 92;

                      return <circle key={item.day} cx={x} cy={y} r="3" fill="#e0f2fe" />;
                    })}
                  </svg>
                  <div className="mt-3 grid grid-cols-7 gap-2 text-center text-[10px] text-white/35">
                    {downloadTimeline.filter((_, index) => index % 2 === 0).map((item) => <span key={item.day}>{item.day.slice(5)}</span>)}
                  </div>
                </CardContent>
              </Card>

              <Card className="overflow-hidden rounded-[2rem] border-white/10 bg-white/[0.045]">
                <CardHeader>
                  <CardTitle>Top downloads</CardTitle>
                  <CardDescription>Apps tải nhiều nhất.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="space-y-3">
                    {topDownloadedApps.map((app) => {
                      const maxDownloads = Math.max(1, topDownloadedApps[0]?.downloads_count ?? 1);
                      const width = `${Math.max(6, ((app.downloads_count ?? 0) / maxDownloads) * 100)}%`;

                      return (
                        <div key={String(app.id)}>
                          <div className="mb-1 flex justify-between text-xs text-white/50">
                            <span>{app.title}</span>
                            <span>{app.downloads_count ?? 0}</span>
                          </div>
                          <div className="h-2 rounded-full bg-white/5">
                            <div className="h-2 rounded-full bg-gradient-to-r from-cyan-300/70 to-violet-300/70" style={{ width }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div>
                    <div className="mb-3 text-sm font-medium text-white/75">Danh mục nhiều app</div>
                    <div className="flex flex-wrap gap-2">
                      {categoryStats.map(([category, count]) => (
                        <span key={category} className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/55">
                          {category}: {count}
                        </span>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>

            <Card className="overflow-hidden rounded-[2rem] border-white/10 bg-white/[0.045]">
              <div className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-cyan-200/40 to-transparent" />
              <CardHeader>
                <CardTitle>Danh sách ứng dụng</CardTitle>
                <CardDescription>Tìm kiếm, lọc, bulk actions, duyệt trạng thái.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-3 md:grid-cols-[1fr_0.7fr_0.7fr]">
                  <div className="relative">
                    <Search className="pointer-events-none absolute left-5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35" />
                    <Input
                      value={adminQuery}
                      onChange={(event) => {
                        setAdminQuery(event.target.value);
                        setPage(1);
                      }}
                      placeholder="Tìm app, category, slug..."
                      className="pl-12"
                    />
                  </div>
                  <select
                    value={statusFilter}
                    onChange={(event) => {
                      setStatusFilter(event.target.value);
                      setPage(1);
                    }}
                    className="h-12 rounded-full border border-white/10 bg-white/5 px-5 text-sm text-white outline-none"
                  >
                    <option value="all">Tất cả status</option>
                    <option value="approved">Approved</option>
                    <option value="pending">Pending</option>
                    <option value="rejected">Rejected</option>
                  </select>
                  <select
                    value={sortMode}
                    onChange={(event) => {
                      setSortMode(event.target.value);
                      setPage(1);
                    }}
                    className="h-12 rounded-full border border-white/10 bg-white/5 px-5 text-sm text-white outline-none"
                  >
                    <option value="newest">Mới nhất</option>
                    <option value="featured">Featured order</option>
                    <option value="downloads">Downloads</option>
                    <option value="title">Tên A-Z</option>
                  </select>
                </div>

                <div className="flex flex-col gap-3 rounded-[1.5rem] border border-white/10 bg-white/[0.035] p-3 text-sm text-white/55 xl:flex-row xl:items-center xl:justify-between">
                  <label className="flex items-center gap-3">
                    <input type="checkbox" checked={allPageSelected} onChange={togglePageSelection} />
                    Chọn trang này
                    <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs">{selectedApps.length} đã chọn</span>
                  </label>
                  <div className="flex flex-wrap gap-2">
                    <Button size="sm" variant="outline" disabled={selectedApps.length === 0} onClick={() => handleBulkStatus("approved")}>Approve</Button>
                    <Button size="sm" variant="outline" disabled={selectedApps.length === 0} onClick={() => handleBulkStatus("pending")}>Pending</Button>
                    <Button size="sm" variant="outline" disabled={selectedApps.length === 0} onClick={() => handleBulkStatus("rejected")}>Reject</Button>
                    <Button size="sm" variant="outline" disabled={selectedApps.length === 0} onClick={() => handleBulkFeatured(true)}>Featured</Button>
                    <Button size="sm" variant="outline" disabled={selectedApps.length === 0} onClick={() => handleBulkFeatured(false)}>Unfeatured</Button>
                    <Button size="sm" variant="outline" disabled={selectedApps.length === 0} onClick={handleBulkDelete}><Trash2 className="h-4 w-4" />Xóa</Button>
                    <Button size="sm" variant="ghost" disabled={selectedApps.length === 0} onClick={() => setSelectedIds(new Set())}>Bỏ chọn</Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {filteredAdminApps.length === 0 ? <Card className="rounded-[2rem]"><CardContent className="p-8 text-center text-white/55">Không có ứng dụng phù hợp.</CardContent></Card> : null}

            {paginatedApps.map((app) => (
              <Card key={String(app.id)} className="group overflow-hidden rounded-[1.5rem] border-white/10 bg-white/[0.04] transition-all duration-300 hover:-translate-y-0.5 hover:border-cyan-200/20 hover:bg-white/[0.06]">
                <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex min-w-0 flex-1 items-center gap-4">
                    <input type="checkbox" checked={selectedIds.has(app.id)} onChange={() => toggleSelected(app.id)} className="h-4 w-4 shrink-0" />
                    <button type="button" onClick={() => setSelectedApp(app)} className="flex min-w-0 flex-1 items-center gap-4 text-left">
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-white/5">
                        {app.thumbnail_url ? (
                          <img src={app.thumbnail_url} alt={app.title ?? "thumbnail"} className="h-full w-full object-cover" />
                        ) : (
                          <span className="text-sm font-semibold text-white/60">{String(app.title ?? "AA").slice(0, 2).toUpperCase()}</span>
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 text-base font-medium text-white">
                          <span className="truncate">{app.title}</span>
                          {app.featured ? <Star className="h-4 w-4 shrink-0 fill-amber-200 text-amber-200" /> : null}
                        </div>
                        <div className="mt-2 flex flex-wrap gap-2 text-xs">
                          <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-white/50">{app.category ?? "Ứng dụng"}</span>
                          <span className={`rounded-full border px-2.5 py-1 ${getStatusClass(app.status)}`}>{app.status ?? "approved"}</span>
                          <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-white/50">{app.downloads_count ?? 0} downloads</span>
                        </div>
                      </div>
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button size="sm" variant="secondary" onClick={() => editApp(app)}><Edit3 className="h-4 w-4" />Sửa</Button>
                    <Button size="sm" variant="outline" onClick={() => handleToggleFeatured(app)}><Star className="h-4 w-4" />Featured</Button>
                    <Button size="sm" variant="outline" onClick={() => handleStatus(app, "approved")}>Approve</Button>
                    <Button size="sm" variant="outline" onClick={() => handleStatus(app, "pending")}>Pending</Button>
                    <Button size="sm" variant="outline" onClick={() => handleDelete(app)}><Trash2 className="h-4 w-4" />Xóa</Button>
                  </div>
                </CardContent>
              </Card>
            ))}

            {filteredAdminApps.length > pageSize ? (
              <div className="flex items-center justify-between rounded-full border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/55">
                <span>Trang {currentPage}/{totalPages}</span>
                <div className="flex gap-2">
                  <button onClick={() => setPage((current) => Math.max(1, current - 1))} disabled={currentPage === 1} className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/5 disabled:opacity-40">
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button onClick={() => setPage((current) => Math.min(totalPages, current + 1))} disabled={currentPage === totalPages} className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/5 disabled:opacity-40">
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </section>

        {selectedApp ? (
          <div className="fixed inset-0 z-[90] flex items-end justify-end bg-slate-950/65 p-4 backdrop-blur-xl">
            <button aria-label="Đóng" className="absolute inset-0" onClick={() => setSelectedApp(null)} />
            <div className="glass relative z-[91] w-full max-w-lg overflow-hidden rounded-[2rem] border-white/10 bg-white/[0.06] p-6 shadow-glow">
              <div className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-cyan-200/50 to-transparent" />
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-white/40">Quick edit</p>
                  <h3 className="mt-3 text-3xl font-semibold tracking-[-0.045em] text-white">{selectedApp.title}</h3>
                </div>
                <button onClick={() => setSelectedApp(null)} className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/60">Đóng</button>
              </div>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div className="rounded-[1.25rem] border border-white/10 bg-white/5 p-4">
                  <div className="text-xs uppercase tracking-[0.18em] text-white/35">Slug</div>
                  <div className="mt-2 text-sm text-white/75">{selectedApp.slug ?? "-"}</div>
                </div>
                <div className="rounded-[1.25rem] border border-white/10 bg-white/5 p-4">
                  <div className="text-xs uppercase tracking-[0.18em] text-white/35">Ngày tạo</div>
                  <div className="mt-2 text-sm text-white/75">{selectedApp.created_at ?? "-"}</div>
                </div>
              </div>
              <div className="mt-4 rounded-[1.5rem] border border-white/10 bg-white/5 p-4 text-sm leading-7 text-white/60">
                {selectedApp.long_description ?? selectedApp.description}
              </div>
              <div className="mt-6 flex flex-wrap gap-2">
                <span className={`rounded-full border px-3 py-1.5 text-xs ${getStatusClass(selectedApp.status)}`}>{selectedApp.status ?? "approved"}</span>
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/55">{selectedApp.downloads_count ?? 0} downloads</span>
                {selectedApp.featured ? <span className="rounded-full border border-amber-200/20 bg-amber-300/10 px-3 py-1.5 text-xs text-amber-100">Featured</span> : null}
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </main>
  );
}
