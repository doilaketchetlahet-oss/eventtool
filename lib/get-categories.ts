import { supabase } from "@/lib/supabase";
import type { CategoryRecord } from "@/types/app";

export async function getCategories(): Promise<CategoryRecord[]> {
  if (!supabase) {
    return [];
  }

  try {
    const { data, error } = await supabase.from("categories").select("*").order("name", { ascending: true });

    if (error) {
      return [];
    }

    return (data ?? []) as CategoryRecord[];
  } catch {
    return [];
  }
}
