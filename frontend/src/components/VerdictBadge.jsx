import { verdictMeta } from "../constants/verdicts";

export function VerdictBadge({ verdict }) {
  const meta = verdictMeta[verdict] ?? verdictMeta.unverifiable;

  return (
    <span
      className={`inline-flex rounded-full border px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.24em] shadow-[0_10px_30px_rgba(0,0,0,0.18)] ${meta.className}`}
    >
      {verdict}
    </span>
  );
}
