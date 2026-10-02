export default function ToursLoading() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6">
      <div className="mb-8 h-10 w-64 animate-pulse rounded bg-obsidian/10" />
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="overflow-hidden rounded-xl border border-gold/20 bg-obsidian/40">
            <div className="aspect-[4/3] animate-pulse bg-obsidian/10" />
            <div className="space-y-3 p-4">
              <div className="h-5 w-3/4 animate-pulse rounded bg-obsidian/10" />
              <div className="h-4 w-full animate-pulse rounded bg-obsidian/10" />
              <div className="h-4 w-1/2 animate-pulse rounded bg-obsidian/10" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}