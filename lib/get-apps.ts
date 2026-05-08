import { supabase } from "@/lib/supabase";
import type { AppRecord } from "@/types/app";

export type DataSource = "supabase" | "demo";

type GetAppsOptions = {
  includeAll?: boolean;
};

export async function getApps(options: GetAppsOptions = {}): Promise<{ apps: AppRecord[]; source: DataSource }> {
  if (!supabase) {
    return { apps: [], source: "demo" };
  }

  try {
    let query = supabase.from("apps").select("*");

    if (!options.includeAll) {
      query = query.or("status.eq.approved,status.is.null");
    }

    const { data, error } = await query;

    if (error) {
      return { apps: [], source: "demo" };
    }

    const apps = ((data ?? []) as AppRecord[]).sort(
      (a, b) =>
        (a.featured_order ?? Number.MAX_SAFE_INTEGER) - (b.featured_order ?? Number.MAX_SAFE_INTEGER) ||
        new Date(b.created_at ?? 0).getTime() - new Date(a.created_at ?? 0).getTime()
    );

    return { apps, source: "supabase" };
  } catch {
    return { apps: [], source: "demo" };
  }
}
