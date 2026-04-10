export function InputPanel({ form, onChange, onAnalyze, onClear, loading }) {
  return (
    <div className="space-y-5">
      <Field
        label="Passage"
        hint="Ground-truth source text used as the reference."
        value={form.passage}
        onChange={(value) => onChange("passage", value)}
        rows={7}
      />
      <Field
        label="Question"
        hint="Optional, but important for drift detection."
        value={form.question}
        onChange={(value) => onChange("question", value)}
        rows={3}
      />
      <Field
        label="AI Response"
        hint="Paste the answer you want to audit."
        value={form.aiResponse}
        onChange={(value) => onChange("aiResponse", value)}
        rows={6}
      />

      <div className="flex flex-wrap gap-3 pt-2">
        <button
          type="button"
          onClick={onAnalyze}
          disabled={loading || !form.passage || !form.aiResponse}
          className="rounded-full bg-[linear-gradient(135deg,#f6d365_0%,#fda085_100%)] px-6 py-3 text-sm font-semibold text-stone-950 shadow-[0_18px_45px_rgba(253,160,133,0.22)] transition hover:scale-[1.01] hover:shadow-[0_24px_55px_rgba(253,160,133,0.30)] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Analyzing..." : "Analyze"}
        </button>
        <button
          type="button"
          onClick={onClear}
          className="rounded-full border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold text-stone-200 transition hover:border-white/30 hover:bg-white/10"
        >
          Clear
        </button>
      </div>
    </div>
  );
}

function Field({ label, hint, value, onChange, rows }) {
  return (
    <label className="block">
      <div className="mb-2 flex items-end justify-between gap-4">
        <span className="block text-sm font-medium uppercase tracking-[0.2em] text-stone-200">
          {label}
        </span>
        <span className="text-xs text-stone-500">{hint}</span>
      </div>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        rows={rows}
        className="w-full rounded-[1.5rem] border border-white/10 bg-stone-950/70 px-4 py-4 text-sm leading-6 text-stone-100 outline-none transition placeholder:text-stone-600 focus:border-amber-300/70 focus:bg-stone-950"
      />
    </label>
  );
}
