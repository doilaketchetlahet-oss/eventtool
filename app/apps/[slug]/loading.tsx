export default function LoadingAppDetail() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#020308] px-5 py-6 text-white sm:px-6 lg:px-8">
      <div className="relative mx-auto max-w-6xl animate-pulse">
        <div className="glass h-16 rounded-full" />
        <div className="grid gap-8 py-14 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
          <div>
            <div className="h-9 w-56 rounded-full bg-white/10" />
            <div className="mt-8 h-20 max-w-2xl rounded-3xl bg-white/10" />
            <div className="mt-6 h-24 max-w-xl rounded-3xl bg-white/5" />
            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <div className="h-20 rounded-2xl bg-white/5" />
              <div className="h-20 rounded-2xl bg-white/5" />
              <div className="h-20 rounded-2xl bg-white/5" />
            </div>
          </div>
          <div className="space-y-4 rounded-[2rem] border border-white/10 bg-white/5 p-6">
            <div className="h-72 rounded-[1.75rem] bg-white/10" />
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="h-20 rounded-2xl bg-white/5" />
              <div className="h-20 rounded-2xl bg-white/5" />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
