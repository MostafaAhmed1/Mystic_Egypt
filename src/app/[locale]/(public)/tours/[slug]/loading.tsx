export default function TourDetailLoading() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
      <div className="mb-8 h-4 w-48 animate-pulse rounded bg-obsidian/10" />
      <div className="aspect-[16/9] w-full animate-pulse rounded-xl bg-obsidian/10" />
      <div className="mt-8 space-y-4">
        <div className="h-8 w-2/3 animate-pulse rounded bg-obsidian/10" />
        <div className="h-4 w-full animate-pulse rounded bg-obsidian/10" />
        <div className="h-4 w-full animate-pulse rounded bg-obsidian/10" />
        <div className="h-4 w-3/4 animate-pulse rounded bg-obsidian/10" />
      </div>
    </div>
  );
}