import { useState } from "react";
import { Link } from "react-router-dom";
import { useAnalysis } from "../hooks/useAnalysis";

const DEMOS = [
  {
    label: "Great Wall",
    passage: "The Great Wall of China is a series of fortifications that were built across the historical northern borders of ancient Chinese states.",
    question: "Is it visible from space?",
    aiResponse: "The Great Wall of China is visible from space. It was built using stone, brick, and other materials."
  },
  {
    label: "Moon Landing",
    passage: "Apollo 11 was the spaceflight that first landed humans on the Moon. Commander Neil Armstrong and lunar module pilot Buzz Aldrin landed the Apollo Lunar Module Eagle on July 20, 1969.",
    question: "Who was on the mission?",
    aiResponse: "The Apollo 11 mission included Neil Armstrong and Buzz Aldrin. They were joined by Michael Collins who remained in orbit. They landed in 1972."
  },
  {
    label: "Photosynthesis",
    passage: "Photosynthesis is a process used by plants and other organisms to convert light energy into chemical energy that, through cellular respiration, can later be released to fuel the organism's activities.",
    question: "What is the byproduct?",
    aiResponse: "Photosynthesis converts light into chemical energy. It produces oxygen as a byproduct and consumes carbon dioxide. It only happens at night."
  }
];

export function AnalyzePage() {
  const [form, setForm] = useState({ passage: "", question: "", aiResponse: "" });
  const { status, data, error, analyze, reset } = useAnalysis();
  const [activeTile, setActiveTile] = useState(null);

  const isScanning = status === "loading";
  const hasResults = !!data;

  const handleAnalyze = () => {
    if (!form.aiResponse.trim() || !form.passage.trim()) return;
    analyze(form);
  };

  const loadDemo = (demo) => {
    reset();
    setForm(demo);
  };

  return (
    <div className="luminous-grid">
      
      {/* INPUT (Teal Edge Glow) */}
      <div className="tile tile-teal col-span-2">
        <div className="flex justify-between items-center mb-4">
          <span className="label-mono mb-0">Suspect Feed</span>
          <div className="flex gap-2">
            <span className="text-[9px] font-bold text-white/20 uppercase tracking-widest mr-2">Quick Samples:</span>
            {DEMOS.map(d => (
              <button key={d.label} onClick={() => loadDemo(d)} className="demo-chip">
                {d.label}
              </button>
            ))}
          </div>
        </div>

        <textarea
          value={form.aiResponse}
          onChange={(e) => setForm({ ...form, aiResponse: e.target.value })}
          placeholder="PASTE AI RESPONSE..."
          disabled={isScanning || hasResults}
          className="luminous-input-field flex-1 mb-4 custom-scrollbar resize-none bg-black/40"
          style={{ minHeight: '100px' }}
        />
        
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="flex flex-col gap-2">
            <label className="label-mono mb-0">Source</label>
            <input 
              type="text"
              value={form.passage}
              onChange={(e) => setForm({ ...form, passage: e.target.value })}
              className="luminous-input-field"
              placeholder="Grounding context..."
              disabled={isScanning || hasResults}
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="label-mono mb-0">Query</label>
            <input 
              type="text"
              value={form.question}
              onChange={(e) => setForm({ ...form, question: e.target.value })}
              className="luminous-input-field"
              placeholder="User question..."
              disabled={isScanning || hasResults}
            />
          </div>
        </div>

        {!hasResults ? (
          <button 
            onClick={handleAnalyze}
            disabled={isScanning || !form.aiResponse.trim() || !form.passage.trim()}
            className="action-btn self-start"
          >
            {isScanning ? "Scanning..." : "Initialize Engine"}
          </button>
        ) : (
          <button 
            onClick={() => { reset(); setForm({ passage: "", question: "", aiResponse: "" }); }}
            className="action-btn self-start"
          >
            New Session
          </button>
        )}
      </div>

      {/* SYSTEM READOUT (Purple Edge Glow) */}
      <div className="tile tile-purple row-span-2 items-center justify-center text-center">
        <span className="label-mono self-start">System Readout</span>
        
        <div className="my-10">
          <div className="title-bold" style={{ fontSize: '72px', lineHeight: 1 }}>
            {hasResults ? Math.round(data.truth_score) : "--"}
          </div>
          <div className="label-mono opacity-100">Truth Score %</div>
        </div>

        <div className="w-full space-y-4">
          <MetricRow label="Density" value={hasResults ? Math.round(data.hallucination_density) : "--"} />
          <MetricRow label="Uncertain" value={hasResults ? data.uncertain_count : "--"} />
          <MetricRow label="Claims" value={hasResults ? data.sentences.length : "--"} />
        </div>

        <div className="mt-auto self-start">
           <Link to="/" className="label-mono hover:text-white transition-colors">
             [ Exit ]
           </Link>
        </div>
      </div>

      {/* EVIDENCE NODES (Blue Edge Glow) */}
      <div className="tile tile-blue">
        <span className="label-mono">Evidence Nodes</span>
        {!hasResults && !isScanning ? (
          <div className="flex-1 flex items-center justify-center opacity-20 label-mono">
            Standby
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-3">
            {data?.sentences.map((sent, idx) => (
              <SentenceNode 
                key={idx} 
                sent={sent} 
                isExpanded={activeTile === idx}
                onClick={() => setActiveTile(activeTile === idx ? null : idx)}
              />
            ))}
          </div>
        )}
      </div>

      {/* VERDICT ENGINE (Neutral Edge) */}
      <div className="tile tile-neutral items-center justify-center">
        <span className="label-mono self-start">Verdict</span>
        <div className="title-bold text-center">
          {hasResults ? data.overall_verdict.toUpperCase() : "OFFLINE"}
        </div>
      </div>

      {/* REALITY MAP (Neutral Wide) */}
      <div className="tile tile-neutral col-span-2">
        <span className="label-mono">Reality Map</span>
        <div className="flex flex-wrap items-center">
          {hasResults ? (
            data.sentences.map((sent, sIdx) => (
              sent.text.split(" ").map((word, wIdx) => (
                <WordPill 
                  key={`${sIdx}-${wIdx}`} 
                  word={word} 
                  verdict={sent.verdict} 
                />
              ))
            ))
          ) : (
            <div className="w-full text-center opacity-10 label-mono">Passive Map</div>
          )}
        </div>
      </div>

      {/* PIPELINE (Neutral Small) */}
      <div className="tile tile-neutral justify-center">
        <span className="label-mono">Pipeline</span>
        <div className="flex justify-between items-center px-4">
          <div className={`w-3 h-3 rounded-full ${hasResults ? 'bg-white' : 'bg-white/10'}`} />
          <div className="flex-1 h-[1px] bg-white/10" />
          <div className={`w-3 h-3 rounded-full ${hasResults ? 'bg-white' : 'bg-white/10'}`} />
          <div className="flex-1 h-[1px] bg-white/10" />
          <div className={`w-3 h-3 rounded-full ${hasResults ? 'bg-white' : 'bg-white/10'}`} />
        </div>
      </div>

    </div>
  );
}

function MetricRow({ label, value }) {
  return (
    <div className="flex items-center justify-between border-b border-white/5 pb-2">
      <div className="label-mono mb-0 opacity-100">{label}</div>
      <div className="title-bold mb-0" style={{ fontSize: '18px' }}>{value}</div>
    </div>
  );
}

function SentenceNode({ sent, isExpanded, onClick }) {
  const getGlowColor = (v) => {
    if (v === 'faithful') return '#00c9b1';
    if (v === 'hallucinated') return '#ef4444';
    return '#f59e0b';
  };

  return (
    <div 
      className="p-4 rounded-xl border border-white/5 bg-black/40 cursor-pointer transition-all hover:bg-black/60 shadow-inner"
      onClick={onClick}
    >
      <div className="flex items-center gap-2 mb-2">
        <div className="w-1.5 h-1.5 rounded-full" style={{ background: getGlowColor(sent.verdict), boxShadow: `0 0 10px ${getGlowColor(sent.verdict)}` }} />
        <span className="label-mono mb-0 opacity-100" style={{ fontSize: '9px', color: getGlowColor(sent.verdict) }}>{sent.verdict}</span>
      </div>
      <p className="text-xs font-bold leading-relaxed">{sent.text}</p>
      {isExpanded && (
        <div className="mt-4 pt-4 border-t border-white/5 animate-in fade-in">
          <p className="text-[10px] italic opacity-60 mb-2">"{sent.reasoning}"</p>
          <div className="flex justify-between label-mono mb-0 opacity-100" style={{ fontSize: '8px' }}>
            <span>CONF: {Math.round(sent.confidence * 100)}%</span>
            <span>MATCH: {Math.round(sent.similarity * 100)}%</span>
          </div>
        </div>
      )}
    </div>
  );
}

function WordPill({ word, verdict }) {
  const color = verdict === 'faithful' ? '#00c9b1' : verdict === 'hallucinated' ? '#ef4444' : '#f59e0b';
  return (
    <span 
      className="px-2 py-1 rounded-md text-[10px] font-black m-1 border shadow-sm"
      style={{ 
        color, 
        borderColor: `${color}44`,
        background: `${color}05`
      }}
    >
      {word}
    </span>
  );
}
