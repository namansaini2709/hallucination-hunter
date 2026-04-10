import { formatPercent } from "../utils/formatters";

export function ConfidenceBar({ value }) {
  const width = `${Math.round(value * 100)}%`;

  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-xs uppercase tracking-[0.2em] text-stone-400">
        <span>Confidence</span>
        <span>{formatPercent(value)}</span>
      </div>
      <div className="h-3 overflow-hidden rounded-full bg-stone-800">
        <div
          className="h-full rounded-full bg-gradient-to-r from-amber-300 via-orange-300 to-red-300 transition-all duration-700"
          style={{ width }}
        />
      </div>
    </div>
  );
}
