export function MetricStrip({ stats }) {
  const items = [
    { label: "Total", value: stats.total },
    { label: "Issues", value: stats.issues },
    { label: "Faithful", value: stats.faithful },
    { label: "Drifting", value: stats.drifting },
  ];

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {items.map((item) => (
        <div
          key={item.label}
          className="rounded-[1.25rem] border border-white/10 bg-white/5 p-4"
        >
          <p className="text-[11px] uppercase tracking-[0.24em] text-stone-500">
            {item.label}
          </p>
          <p className="mt-2 text-3xl font-semibold text-stone-50">{item.value}</p>
        </div>
      ))}
    </div>
  );
}
