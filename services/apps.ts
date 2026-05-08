import { supabase } from "@/lib/supabase";
import { createSlug } from "@/lib/app-utils";
import type { AppFormInput, AppRecord } from "@/types/app";

function serializeTags(tags?: string) {
  return tags?.split(",").map((tag) => tag.trim()).filter(Boolean) ?? [];
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
    thumbnail_url: input.thumbnail_url || null,
    download_url: input.download_url || null,
    file_size: input.file_size || null,
    file_type: input.file_type || null,
    platform: input.platform || null,
    source_url: input.source_url || null,
    checksum: input.checksum || null,
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
    slug: input.slug || (input.title ? createSlug(input.title) : undefined)
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
