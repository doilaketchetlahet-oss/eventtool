import Link from "next/link";
import { ArrowLeft, Archive } from "lucide-react";

export default function AppNotFound() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#020308] px-5 py-6 text-white sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0 grid-glow opacity-25" />
      <div className="pointer-events-none absolute inset-0 noise opacity-[0.035]" />
      <div className="relative mx-auto flex min-h-screen max-w-4xl flex-col items-center justify-center text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/50">
          <Archive className="h-7 w-7" />
        </div>
        <h1 className="mt-6 text-4xl font-semibold tracking-[-0.05em]">App không còn trong kho</h1>
        <p className="mt-4 max-w-xl text-sm leading-7 text-white/55 sm:text-base">File có thể đã bị gỡ hoặc slug không còn hợp lệ. Quay lại kho để tìm app khác.</p>
        <Link href="/" className="mt-8 inline-flex h-12 items-center gap-2 rounded-full bg-white px-6 text-sm font-medium text-slate-950 hover:bg-white/90">
          <ArrowLeft className="h-4 w-4" />
          Quay lại kho
        </Link>
      </div>
    </main>
  );
}
