import { supabase } from "@/lib/supabase";
import type { DownloadRecord } from "@/types/app";

export async function getDownloads(): Promise<DownloadRecord[]> {
  if (!supabase) {
    return [];
  }

  try {
    const { data, error } = await supabase.from("downloads").select("*").order("created_at", { ascending: false });

    if (error) {
      return [];
    }

    return (data ?? []) as DownloadRecord[];
  } catch {
    return [];
  }
}
