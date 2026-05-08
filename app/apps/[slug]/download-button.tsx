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
  const hasSafeUrl = isSafeHttpUrl(downloadUrl);

  function isSafeHttpUrl(value?: string | null) {
    if (!value) {
      return false;
    }

    try {
      const url = new URL(value.startsWith("http") ? value : `https://${value}`);
      return url.protocol === "http:" || url.protocol === "https:";
    } catch {
      return false;
    }
  }

  async function handleDownload() {
    if (!hasSafeUrl) {
      return;
    }

    setIsLoading(true);

    try {
      const updatedApp = await incrementDownload({ ...app, downloads_count: count });
      setCount(updatedApp.downloads_count ?? count + 1);
    } catch {
      setCount((current) => current + 1);
    } finally {
      setIsLoading(false);
    }

    if (hasSafeUrl) {
      const target = downloadUrl ?? "";
      window.open(target.startsWith("http") ? target : `https://${target}`, "_blank", "noopener,noreferrer");
    }
  }

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
      <button
        type="button"
        onClick={handleDownload}
        disabled={isLoading || !hasSafeUrl}
        className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-white px-6 text-sm font-medium text-slate-950 shadow-[0_0_0_1px_rgba(255,255,255,0.08),0_16px_50px_rgba(255,255,255,0.12)] transition-colors hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <Download className="h-4 w-4" />
        {isLoading ? "Đang mở..." : hasSafeUrl ? "Tải về" : "Chưa có link tải"}
        <ArrowUpRight className="h-4 w-4" />
      </button>
      <span className="text-sm text-white/45">{hasSafeUrl ? `${count} lượt tải · mở tab mới` : "Admin chưa gắn file tải"}</span>
    </div>
  );
}
