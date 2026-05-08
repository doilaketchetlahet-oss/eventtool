import { supabase } from "@/lib/supabase";
import type { AppRecord } from "@/types/app";

type GetAppOptions = {
  includeAll?: boolean;
};

export async function getApp(slug: string, options: GetAppOptions = {}): Promise<AppRecord | null> {
  if (!supabase) {
    return null;
  }

  try {
    let slugQuery = supabase.from("apps").select("*").eq("slug", slug);

    if (!options.includeAll) {
      slugQuery = slugQuery.or("status.eq.approved,status.is.null");
    }

    const bySlug = await slugQuery.maybeSingle();

    if (bySlug.data) {
      return bySlug.data as AppRecord;
    }

    let idQuery = supabase.from("apps").select("*").eq("id", slug);

    if (!options.includeAll) {
      idQuery = idQuery.or("status.eq.approved,status.is.null");
    }

    const byId = await idQuery.maybeSingle();

    if (byId.error || !byId.data) {
      return null;
    }

    return byId.data as AppRecord;
  } catch {
    return null;
  }
}
