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

  const payload: Record<string, unknown> = {};

  if ("title" in input) payload.title = input.title;
  if ("description" in input) payload.description = input.description;
  if ("long_description" in input) payload.long_description = input.long_description;
  if ("category" in input) payload.category = input.category;
  if ("version" in input) payload.version = input.version;
  if ("changelog" in input) payload.changelog = input.changelog;
  if ("featured" in input) payload.featured = input.featured;
  if ("featured_order" in input) payload.featured_order = input.featured_order;
  if ("status" in input) payload.status = input.status;
  if ("tags" in input) payload.tags = typeof input.tags === "string" ? serializeTags(input.tags) : input.tags;
  if ("slug" in input || "title" in input) payload.slug = input.slug || (input.title ? createSlug(input.title) : undefined);
  if ("thumbnail_url" in input) payload.thumbnail_url = normalizeText(input.thumbnail_url);
  if ("download_url" in input) payload.download_url = normalizeText(input.download_url);
  if ("file_size" in input) payload.file_size = normalizeText(input.file_size);
  if ("file_type" in input) payload.file_type = normalizeText(input.file_type);
  if ("platform" in input) payload.platform = normalizeText(input.platform);
  if ("source_url" in input) payload.source_url = normalizeText(input.source_url);
  if ("checksum" in input) payload.checksum = normalizeText(input.checksum);
  if ("notes" in input) payload.notes = normalizeText(input.notes);
  if ("license" in input) payload.license = normalizeText(input.license);
  if ("virus_scan_status" in input) payload.virus_scan_status = normalizeText(input.virus_scan_status);
  if ("last_verified_at" in input) payload.last_verified_at = normalizeText(input.last_verified_at);

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

  await supabase.from("downloads").insert([{ app_id: app.id }]);

  const { data, error } = await supabase.rpc("increment_download_count", { row_id: app.id });

  if (error) {
    // Fallback: read current value and increment if RPC not available
    const { data: current } = await supabase.from("apps").select("downloads_count").eq("id", app.id).single();
    const nextCount = ((current?.downloads_count as number) ?? 0) + 1;
    const { data: updated, error: updateError } = await supabase
      .from("apps")
      .update({ downloads_count: nextCount })
      .eq("id", app.id)
      .select("*")
      .single();

    if (updateError) {
      throw updateError;
    }

    return updated as AppRecord;
  }

  // RPC returns the updated row or just the count; re-fetch the full record
  const { data: refreshed, error: fetchError } = await supabase
    .from("apps")
    .select("*")
    .eq("id", app.id)
    .single();

  if (fetchError) {
    throw fetchError;
  }

  return refreshed as AppRecord;
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
