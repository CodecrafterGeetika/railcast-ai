export default function Loading() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="animate-pulse space-y-6">
        <div className="h-8 w-64 rounded bg-secondary/60" />
        <div className="h-4 w-40 rounded bg-secondary/40" />
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-16 rounded-lg bg-secondary/40" />
          ))}
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="h-64 rounded-lg bg-secondary/30 lg:col-span-2" />
          <div className="h-64 rounded-lg bg-secondary/30" />
        </div>
      </div>
    </div>
  );
}
