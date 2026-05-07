import { supabase } from "@/lib/supabase";
import type { AppRecord } from "@/types/app";

export async function getApps(): Promise<AppRecord[]> {
  if (!supabase) {
    return [];
  }

  try {
    const { data, error } = await supabase.from("apps").select("*");

    if (error) {
      return [];
    }

    return (data ?? []) as AppRecord[];
  } catch {
    return [];
  }
}
