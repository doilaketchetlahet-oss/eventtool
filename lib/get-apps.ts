import { supabase } from "@/lib/supabase";
import type { AppRecord } from "@/types/app";

export type DataSource = "supabase" | "demo";

export async function getApps(): Promise<{ apps: AppRecord[]; source: DataSource }> {
  if (!supabase) {
    return { apps: [], source: "demo" };
  }

  try {
    const { data, error } = await supabase.from("apps").select("*");

    if (error) {
      return { apps: [], source: "demo" };
    }

    return { apps: (data ?? []) as AppRecord[], source: "supabase" };
  } catch {
    return { apps: [], source: "demo" };
  }
}
