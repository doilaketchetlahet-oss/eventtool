"use client";

import { useState } from "react";
import { ArrowUpRight, Download } from "lucide-react";
import { incrementDownload } from "@/services/apps";
import type { AppRecord } from "@/types/app";

type DownloadButtonProps = {
  app: AppRecord;
  downloadUrl: string | null;
};

export default function DownloadButton({ app, downloadUrl }: DownloadButtonProps) {
  const [count, setCount] = useState(app.downloads_count ?? 0);
  const [isLoading, setIsLoading] = useState(false);

  async function handleDownload() {
    setIsLoading(true);

    try {
      const updatedApp = await incrementDownload({ ...app, downloads_count: count });
      setCount(updatedApp.downloads_count ?? count + 1);
    } catch {
      setCount((current) => current + 1);
    } finally {
      setIsLoading(false);
    }

    if (downloadUrl) {
      window.open(downloadUrl.startsWith("http") ? downloadUrl : `https://${downloadUrl}`, "_blank", "noopener,noreferrer");
    }
  }

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
      <button
        type="button"
        onClick={handleDownload}
        disabled={isLoading}
        className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-white px-6 text-sm font-medium text-slate-950 shadow-[0_0_0_1px_rgba(255,255,255,0.08),0_16px_50px_rgba(255,255,255,0.12)] transition-colors hover:bg-white/90 disabled:opacity-70"
      >
        <Download className="h-4 w-4" />
        {isLoading ? "Đang xử lý..." : "Tải ứng dụng"}
        <ArrowUpRight className="h-4 w-4" />
      </button>
      <span className="text-sm text-white/45">{count} lượt tải</span>
    </div>
  );
}
