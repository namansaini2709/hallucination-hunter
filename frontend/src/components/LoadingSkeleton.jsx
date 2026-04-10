export function LoadingSkeleton() {
  return (
    <section className="rounded-3xl border border-stone-800 bg-stone-900/70 p-6">
      <div className="animate-pulse space-y-4">
        <div className="h-8 w-40 rounded-full bg-stone-800" />
        <div className="h-4 w-full rounded bg-stone-800" />
        <div className="h-4 w-4/5 rounded bg-stone-800" />
        <div className="h-28 rounded-2xl bg-stone-950" />
        <div className="h-28 rounded-2xl bg-stone-950" />
      </div>
    </section>
  );
}
