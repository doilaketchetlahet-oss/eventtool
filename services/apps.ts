import { supabase } from "@/lib/supabase";
import { createSlug } from "@/lib/app-utils";
import type { AppFormInput, AppRecord } from "@/types/app";

function serializeTags(tags?: string) {
  return tags?.split(",").map((tag) => tag.trim()).filter(Boolean) ?? [];
}

function normalizeText(value?: string) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

export async function createApp(input: AppFormInput) {
  if (!supabase) {
    throw new Error("Supabase chưa được cấu hình.");
  }

  const payload = {
    title: input.title,
    slug: input.slug || createSlug(input.title),
    description: input.description,
    long_description: input.long_description || input.description,
    category: input.category || "Ứng dụng",
    version: input.version || "1.0.0",
    changelog: input.changelog || "Đang cập nhật changelog.",
    thumbnail_url: normalizeText(input.thumbnail_url),
    download_url: normalizeText(input.download_url),
    file_size: normalizeText(input.file_size),
    file_type: normalizeText(input.file_type),
    platform: normalizeText(input.platform),
    source_url: normalizeText(input.source_url),
    checksum: normalizeText(input.checksum),
    notes: normalizeText(input.notes),
    license: normalizeText(input.license),
    virus_scan_status: normalizeText(input.virus_scan_status),
    last_verified_at: normalizeText(input.last_verified_at),
    tags: serializeTags(input.tags),
    featured: input.featured ?? false,
    featured_order: input.featured_order,
    status: input.status || "approved"
  };

  const { data, error } = await supabase.from("apps").insert([payload]).select("*").single();

  if (!error) {
    return data as AppRecord;
  }

  const fallback = await supabase
    .from("apps")
    .insert([{ title: input.title, description: input.description }])
    .select("*")
    .single();

  if (fallback.error) {
    throw fallback.error;
  }

  return fallback.data as AppRecord;
}

export async function updateApp(id: string | number, input: Partial<AppFormInput>) {
  if (!supabase) {
    throw new Error("Supabase chưa được cấu hình.");
  }

  const payload = {
    ...input,
    tags: typeof input.tags === "string" ? serializeTags(input.tags) : undefined,
    slug: input.slug || (input.title ? createSlug(input.title) : undefined),
    thumbnail_url: normalizeText(input.thumbnail_url),
    download_url: normalizeText(input.download_url),
    file_size: normalizeText(input.file_size),
    file_type: normalizeText(input.file_type),
    platform: normalizeText(input.platform),
    source_url: normalizeText(input.source_url),
    checksum: normalizeText(input.checksum),
    notes: normalizeText(input.notes),
    license: normalizeText(input.license),
    virus_scan_status: normalizeText(input.virus_scan_status),
    last_verified_at: normalizeText(input.last_verified_at)
  };

  const { data, error } = await supabase.from("apps").update(payload).eq("id", id).select("*").single();

  if (error) {
    throw error;
  }

  return data as AppRecord;
}

export async function deleteApp(id: string | number) {
  if (!supabase) {
    throw new Error("Supabase chưa được cấu hình.");
  }

  const { error } = await supabase.from("apps").delete().eq("id", id);

  if (error) {
    throw error;
  }
}

export async function incrementDownload(app: AppRecord) {
  if (!supabase) {
    throw new Error("Supabase chưa được cấu hình.");
  }

  const nextCount = (app.downloads_count ?? 0) + 1;

  await supabase.from("downloads").insert([{ app_id: app.id }]);

  const { data, error } = await supabase
    .from("apps")
    .update({ downloads_count: nextCount })
    .eq("id", app.id)
    .select("*")
    .single();

  if (error) {
    throw error;
  }

  return data as AppRecord;
}

export async function uploadThumbnail(file: File) {
  if (!supabase) {
    throw new Error("Supabase chưa được cấu hình.");
  }

  const extension = file.name.split(".").pop() || "jpg";
  const path = `thumbnails/${crypto.randomUUID()}.${extension}`;
  const { error } = await supabase.storage.from("app-assets").upload(path, file, { upsert: false });

  if (error) {
    throw error;
  }

  const { data } = supabase.storage.from("app-assets").getPublicUrl(path);

  return data.publicUrl;
}
