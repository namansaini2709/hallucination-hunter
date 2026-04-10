import { examples } from "../constants/examples";

export function ExampleLoader({ onLoad }) {
  return (
    <div className="mb-6">
      <p className="mb-3 text-xs uppercase tracking-[0.2em] text-stone-400">
        Demo examples
      </p>
      <div className="flex flex-wrap gap-2">
        {examples.map((example) => (
          <button
            key={example.id}
            type="button"
            onClick={() => onLoad(example.payload)}
            className="rounded-full border border-stone-700 px-3 py-2 text-xs text-stone-200 transition hover:border-amber-300 hover:text-amber-200"
          >
            {example.label}
          </button>
        ))}
      </div>
    </div>
  );
}
