import { formatPercent } from "../utils/formatters";
import { VerdictBadge } from "./VerdictBadge";

export function SentenceCard({ result }) {
  return (
    <article className="rounded-[1.5rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] transition duration-300 hover:-translate-y-1 hover:border-white/20">
      <div className="flex items-start justify-between gap-3">
        <p className="max-w-2xl text-sm leading-7 text-stone-100">{result.sentence}</p>
        <VerdictBadge verdict={result.verdict} />
      </div>
      <div className="mt-4 grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
        <p className="text-sm leading-6 text-stone-300">{result.explanation}</p>
        <div className="rounded-full border border-white/10 bg-black/20 px-4 py-2 text-xs uppercase tracking-[0.2em] text-stone-400">
          Similarity {formatPercent(result.similarity_score)}
        </div>
      </div>
    </article>
  );
}
