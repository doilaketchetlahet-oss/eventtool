"use server";

import { incrementDownload } from "@/services/apps";
import type { AppRecord } from "@/types/app";

export async function incrementDownloadAction(app: AppRecord) {
  return incrementDownload(app);
}
