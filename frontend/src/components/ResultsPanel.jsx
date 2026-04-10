import { ConfidenceBar } from "./ConfidenceBar";
import { LoadingSkeleton } from "./LoadingSkeleton";
import { MetricStrip } from "./MetricStrip";
import { SentenceCard } from "./SentenceCard";
import { VerdictBadge } from "./VerdictBadge";

export function ResultsPanel({ status, data }) {
  if (status === "loading") {
    return <LoadingSkeleton />;
  }

  if (!data) {
    return (
      <section className="panel-shell rounded-[2rem] p-6 lg:p-8">
        <div className="flex h-full min-h-[520px] flex-col justify-between rounded-[1.75rem] border border-dashed border-white/10 bg-black/20 p-6">
          <div>
            <p className="eyebrow">Analysis Deck</p>
            <h2 className="mt-2 text-3xl font-semibold text-stone-50">
              No verdict yet
            </h2>
            <p className="mt-4 max-w-lg text-sm leading-6 text-stone-400">
              Run an analysis to populate sentence cards, an overall verdict,
              confidence scoring, and issue counts. This panel is designed to
              feel like a live audit board once data arrives.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <PlaceholderCard title="Sentence map" body="Each sentence appears as an evidence card with explanation and similarity score." />
            <PlaceholderCard title="Overall signal" body="The top section summarizes whether the answer is faithful, partial, drifting, or hallucinated." />
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="panel-shell rounded-[2rem] p-6 lg:p-8">
      <div className="rounded-[1.75rem] border border-white/10 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.06),_rgba(255,255,255,0.02)_35%,_transparent_70%)] p-6">
        <div className="flex flex-col gap-4 border-b border-white/10 pb-6 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="eyebrow">Analysis Deck</p>
            <h2 className="mt-2 text-3xl font-semibold text-stone-50">
              Verdict snapshot
            </h2>
          </div>
          <VerdictBadge verdict={data.overall_verdict} />
        </div>

        <p className="mt-5 max-w-2xl text-sm leading-7 text-stone-300">
          {data.summary}
        </p>

        <div className="mt-6 grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-[1.5rem] border border-white/10 bg-black/20 p-5">
            <ConfidenceBar value={data.overall_confidence} />
          </div>
          <div className="rounded-[1.5rem] border border-white/10 bg-black/20 p-4">
            <MetricStrip stats={data.stats} />
          </div>
        </div>
      </div>

      <div className="mt-6 space-y-4">
        {data.sentences.map((sentence, index) => (
          <SentenceCard key={`${sentence.sentence}-${index}`} result={sentence} />
        ))}
      </div>
    </section>
  );
}

function PlaceholderCard({ title, body }) {
  return (
    <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-5">
      <p className="text-sm font-semibold text-stone-100">{title}</p>
      <p className="mt-2 text-sm leading-6 text-stone-400">{body}</p>
    </div>
  );
}
