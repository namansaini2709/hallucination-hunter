import { useState } from "react";

import { ExampleLoader } from "./components/ExampleLoader";
import { InputPanel } from "./components/InputPanel";
import { ResultsPanel } from "./components/ResultsPanel";
import { useAnalysis } from "./hooks/useAnalysis";

const initialForm = {
  passage: "",
  question: "",
  aiResponse: "",
};

export default function App() {
  const [form, setForm] = useState(initialForm);
  const { status, data, error, analyze, reset } = useAnalysis();

  const handleChange = (key, value) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const handleExample = (example) => {
    setForm(example);
    reset();
  };

  const handleReset = () => {
    setForm(initialForm);
    reset();
  };

  return (
    <main className="relative min-h-screen overflow-hidden px-4 py-6 text-stone-100 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0">
        <div className="ambient-orb ambient-orb-left" />
        <div className="ambient-orb ambient-orb-right" />
        <div className="grid-haze" />
      </div>

      <div className="relative mx-auto flex max-w-7xl flex-col gap-6">
        <section className="panel-shell rounded-[2rem] p-6 lg:p-8">
          <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
            <div className="space-y-5">
              <p className="eyebrow">Hallucination Hunter</p>
              <div className="space-y-4">
                <h1 className="max-w-4xl text-5xl font-semibold leading-[0.95] text-stone-50 sm:text-6xl">
                  Audit AI answers like a forensic evidence board.
                </h1>
                <p className="max-w-2xl text-base leading-7 text-stone-300 sm:text-lg">
                  Feed in the source passage, the user question, and the model
                  response. The interface breaks the answer into claims, flags
                  drift, and surfaces possible hallucinations sentence by
                  sentence.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <FeatureCard
                  label="Hybrid pipeline"
                  value="Embed first"
                  description="Cheap similarity triage before the model judge runs."
                />
                <FeatureCard
                  label="Verdict system"
                  value="5 labels"
                  description="Faithful, partial, drifting, hallucinated, unverifiable."
                />
                <FeatureCard
                  label="Output style"
                  value="Sentence-level"
                  description="Readable evidence instead of one opaque trust score."
                />
              </div>
            </div>

            <div className="signal-card">
              <p className="text-xs uppercase tracking-[0.35em] text-amber-200/70">
                Live rubric
              </p>
              <div className="mt-5 space-y-4">
                <SignalRow
                  title="Faithfulness"
                  body="Measures whether a sentence is supported by the passage."
                />
                <SignalRow
                  title="Relevance"
                  body="Checks whether the answer actually addresses the question."
                />
                <SignalRow
                  title="Criticality"
                  body="Escalates major factual errors that should dominate the verdict."
                />
              </div>
            </div>
          </div>
        </section>

        <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
          <section className="panel-shell rounded-[2rem] p-6 lg:p-8">
            <div className="mb-6 flex flex-col gap-4 border-b border-white/10 pb-6 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="eyebrow">Input Console</p>
                <h2 className="mt-2 text-3xl font-semibold text-stone-50">
                  Build the evidence packet
                </h2>
              </div>
              <p className="max-w-md text-sm leading-6 text-stone-400">
                Use a demo scenario or paste your own material. The frontend is
                already wired to the API contract, so this can be tested against
                mock or real backend responses.
              </p>
            </div>

            <ExampleLoader onLoad={handleExample} />

            <InputPanel
              form={form}
              onChange={handleChange}
              onAnalyze={() => analyze(form)}
              onClear={handleReset}
              loading={status === "loading"}
            />

            {error ? (
              <p className="mt-4 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                {error}
              </p>
            ) : null}
          </section>

          <ResultsPanel status={status} data={data} />
        </div>
      </div>
    </main>
  );
}

function FeatureCard({ label, value, description }) {
  return (
    <article className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur">
      <p className="text-xs uppercase tracking-[0.28em] text-stone-400">{label}</p>
      <p className="mt-3 text-2xl font-semibold text-stone-50">{value}</p>
      <p className="mt-2 text-sm leading-6 text-stone-300">{description}</p>
    </article>
  );
}

function SignalRow({ title, body }) {
  return (
    <div className="rounded-[1.25rem] border border-white/10 bg-stone-950/40 px-4 py-4">
      <p className="text-sm font-semibold text-stone-100">{title}</p>
      <p className="mt-1 text-sm leading-6 text-stone-400">{body}</p>
    </div>
  );
}
