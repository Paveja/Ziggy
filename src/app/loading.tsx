const skeletonIds = ["saffron", "dough", "wok", "bun", "leaf", "sugar"];

export default function Loading() {
  return (
    <main
      id="main"
      aria-label="Loading restaurants"
      role="status"
      className="mx-auto max-w-7xl space-y-8 p-8"
    >
      <div className="h-12 w-64 rounded-control bg-muted motion-safe:animate-pulse" />
      <div className="h-24 rounded-container bg-muted motion-safe:animate-pulse" />
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {skeletonIds.map((id) => (
          <div
            key={id}
            className="h-80 rounded-container bg-muted motion-safe:animate-pulse"
          />
        ))}
      </div>
      <span className="sr-only">Loading restaurants…</span>
    </main>
  );
}
