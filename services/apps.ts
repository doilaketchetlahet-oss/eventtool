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
    tags: serializeTags(input.tags),
    featured: input.featured ?? false
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
  const { data, error } = await supabase
    .from("apps")
    .update({ downloads_count: nextCount })
    .eq("id", app.id)
    .select("*")
    .single();

  if (error) {
    throw error;
  }

  await supabase.from("downloads").insert([{ app_id: app.id }]);

  return data as AppRecord;
}
