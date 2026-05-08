import { supabase } from "@/lib/supabase";
import { createSlug } from "@/lib/app-utils";
import type { CategoryRecord } from "@/types/app";

export async function createCategory(name: string) {
  if (!supabase) {
    throw new Error("Supabase chưa được cấu hình.");
  }

  const { data, error } = await supabase
    .from("categories")
    .insert([{ name, slug: createSlug(name) }])
    .select("*")
    .single();

  if (error) {
    throw error;
  }

  return data as CategoryRecord;
}

export async function deleteCategory(id: string | number) {
  if (!supabase) {
    throw new Error("Supabase chưa được cấu hình.");
  }

  const { error } = await supabase.from("categories").delete().eq("id", id);

  if (error) {
    throw error;
  }
}
