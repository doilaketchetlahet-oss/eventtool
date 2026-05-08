import { supabase } from "@/lib/supabase";
import type { AppRecord } from "@/types/app";

export async function getApp(slug: string): Promise<AppRecord | null> {
  if (!supabase) {
    return null;
  }

  try {
    const bySlug = await supabase.from("apps").select("*").eq("slug", slug).maybeSingle();

    if (bySlug.data) {
      return bySlug.data as AppRecord;
    }

    const byId = await supabase.from("apps").select("*").eq("id", slug).maybeSingle();

    if (byId.error || !byId.data) {
      return null;
    }

    return byId.data as AppRecord;
  } catch {
    return null;
  }
}
