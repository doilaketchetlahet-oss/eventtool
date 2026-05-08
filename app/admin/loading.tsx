export default function LoadingAdmin() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#020308] px-5 py-6 text-white sm:px-6 lg:px-8">
      <div className="relative mx-auto max-w-7xl animate-pulse space-y-6">
        <div className="glass h-16 rounded-full" />
        <div className="grid gap-4 md:grid-cols-4">
          <div className="h-28 rounded-[1.5rem] bg-white/5" />
          <div className="h-28 rounded-[1.5rem] bg-white/5" />
          <div className="h-28 rounded-[1.5rem] bg-white/5" />
          <div className="h-28 rounded-[1.5rem] bg-white/5" />
        </div>
        <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
          <div className="h-[42rem] rounded-[2rem] bg-white/5" />
          <div className="space-y-4">
            <div className="h-40 rounded-[2rem] bg-white/5" />
            <div className="h-40 rounded-[2rem] bg-white/5" />
            <div className="h-40 rounded-[2rem] bg-white/5" />
          </div>
        </div>
      </div>
    </main>
  );
}
