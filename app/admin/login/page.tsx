import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { LockKeyhole, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ADMIN_COOKIE } from "@/lib/admin-auth";

async function login(formData: FormData) {
  "use server";

  const password = String(formData.get("password") ?? "");

  if (!process.env.ADMIN_PASSWORD || password !== process.env.ADMIN_PASSWORD) {
    redirect("/admin/login?error=1");
  }

  const cookieStore = await cookies();
  cookieStore.set(ADMIN_COOKIE, password, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7
  });

  redirect("/admin");
}

export default async function AdminLoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const params = await searchParams;

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#020308] px-5 py-10 text-white">
      <div className="pointer-events-none absolute inset-0 grid-glow opacity-25" />
      <form action={login} className="glass relative w-full max-w-md rounded-[2rem] p-7 shadow-glow">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-slate-950">
            <Sparkles className="h-5 w-5" />
          </span>
          <div>
            <h1 className="text-xl font-semibold tracking-[-0.04em]">Đăng nhập Admin</h1>
            <p className="mt-1 text-sm text-white/50">Truy cập dashboard KhoApp</p>
          </div>
        </div>
        {params.error ? <div className="mt-6 rounded-2xl border border-rose-300/15 bg-rose-300/10 px-4 py-3 text-sm text-rose-100">Mật khẩu không đúng.</div> : null}
        <div className="mt-6 space-y-4">
          <div className="relative">
            <LockKeyhole className="pointer-events-none absolute left-5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35" />
            <Input name="password" type="password" required placeholder="Admin password" className="pl-12" />
          </div>
          <Button type="submit" className="w-full">Đăng nhập</Button>
        </div>
      </form>
    </main>
  );
}
