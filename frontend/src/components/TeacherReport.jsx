'use client';

import React, { useMemo } from 'react';
import { BarChart2, Users, Clock, CheckCircle, AlertTriangle, FileSpreadsheet, FileText, Lightbulb } from 'lucide-react';

const C = {
  bg: '#0f0e14', felt: '#17151f', card: '#1e1b29',
  taupe: '#7c5cff', tan: '#22d3c9', stone: '#c7c2d9',
  cream: '#ede9f7', muted: '#8d87a3', rust: '#ff4d6d',
};

const MetricCard = ({ icon: Icon, value, label, color = C.taupe, sub }) => (
  <div className="rounded-2xl border p-5 flex flex-col gap-3 transition-all duration-200"
    style={{ background: `linear-gradient(135deg,${C.card},${C.felt})`, borderColor: "rgba(124,92,255,0.12)" }}
    onMouseEnter={e => e.currentTarget.style.borderColor = `${color}35`}
    onMouseLeave={e => e.currentTarget.style.borderColor = "rgba(124,92,255,0.12)"}>
    <div className="w-9 h-9 rounded-xl flex items-center justify-center"
      style={{ background: `${color}18`, border: `1px solid ${color}30` }}>
      <Icon size={17} style={{ color }} />
    </div>
    <div>
      <div className="font-display font-black text-3xl tabular-nums" style={{ color: C.cream }}>{value}</div>
      <div className="font-mono text-[10px] tracking-widest uppercase mt-0.5" style={{ color: C.muted }}>{label}</div>
    </div>
    {sub && <div className="font-mono text-[10px]" style={{ color: C.muted }}>{sub}</div>}
  </div>
);

const SectionHead = ({ label }) => (
  <div className="flex items-center gap-3 mb-4">
    <div className="h-px flex-1" style={{ background: "rgba(124,92,255,0.12)" }} />
    <span className="font-mono text-[10px] tracking-[0.3em] uppercase" style={{ color: C.muted }}>{label}</span>
    <div className="h-px flex-1" style={{ background: "rgba(124,92,255,0.12)" }} />
  </div>
);

const ScoreBar = ({ pct, color = C.taupe, label, right }) => (
  <div className="flex items-center gap-3">
    {label && <span className="font-mono text-[11px] w-28 truncate shrink-0" style={{ color: C.muted }}>{label}</span>}
    <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
      <div className="h-full rounded-full transition-all duration-1000"
        style={{ width: `${Math.min(100, Math.max(0, pct))}%`, background: `linear-gradient(90deg,${color},${color}88)` }} />
    </div>
    {right && <span className="font-mono text-xs font-bold w-10 text-right shrink-0" style={{ color }}>{right}</span>}
  </div>
);

const TeacherReport = ({ puzzles = [], puzzleAnalytics = null, isLoading, loadError, selectedPuzzleId, onPuzzleSelect }) => {
  const published = useMemo(() => Array.isArray(puzzles) ? puzzles.filter(p => p.status === "published") : [], [puzzles]);
  const a = puzzleAnalytics || {};
  const hardest   = Array.isArray(a.hardest_clues)        ? a.hardest_clues        : [];
  const incorrect = Array.isArray(a.most_incorrect_clues) ? a.most_incorrect_clues : hardest;
  const totalAttempts  = a.total_attempts || 0;
  const avgScore       = a.average_score  ?? 0;
  const completionRate = a.completion_rate ?? 0;
  const avgTime        = a.average_completion_time ?? 0;
  const minTime        = a.completion_time_min ?? 0;
  const maxTime        = a.completion_time_max ?? 0;
  const hintLetters    = a.hint_letters_used ?? 0;
  const hintWords      = a.hint_words_used   ?? 0;

  const scoreColor = avgScore >= 70 ? C.taupe : avgScore >= 40 ? C.tan : "#e07070";
  const compColor  = completionRate >= 70 ? C.taupe : completionRate >= 40 ? C.tan : "#e07070";

  return (
    <div className="w-full max-w-6xl space-y-6 animate-fade-up">

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: "rgba(124,92,255,0.12)", border: "1px solid rgba(124,92,255,0.25)" }}>
            <BarChart2 size={20} color={C.taupe} />
          </div>
          <div>
            <div className="font-mono text-[10px] tracking-widest uppercase" style={{ color: C.muted }}>Insights</div>
            <h2 className="font-display font-black text-2xl" style={{ color: C.cream }}>
              {a.title ? `"${a.title}"` : "Puzzle Analytics"}
            </h2>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <select
            value={selectedPuzzleId || ""}
            onChange={e => onPuzzleSelect?.(Number(e.target.value))}
            className="bg-black/40 border rounded-xl px-4 py-2.5 text-sm font-mono outline-none"
            style={{ borderColor: "rgba(124,92,255,0.2)", color: C.cream, minWidth: "180px" }}
            onFocus={e => e.target.style.borderColor = "rgba(124,92,255,0.5)"}
            onBlur={e => e.target.style.borderColor = "rgba(124,92,255,0.2)"}>
            {published.length === 0
              ? <option value="">No published puzzles</option>
              : published.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
          </select>
          <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl border font-mono text-xs font-bold tracking-wider transition-all btn-press"
            style={{ background: "rgba(124,92,255,0.08)", borderColor: "rgba(124,92,255,0.25)", color: C.taupe }}
            onMouseEnter={e => e.currentTarget.style.background = "rgba(124,92,255,0.15)"}
            onMouseLeave={e => e.currentTarget.style.background = "rgba(124,92,255,0.08)"}>
            <FileSpreadsheet size={15} /> CSV
          </button>
          <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl border font-mono text-xs font-bold tracking-wider transition-all btn-press"
            style={{ background: "rgba(255,77,109,0.1)", borderColor: "rgba(255,77,109,0.3)", color: "#e07070" }}
            onMouseEnter={e => e.currentTarget.style.background = "rgba(255,77,109,0.18)"}
            onMouseLeave={e => e.currentTarget.style.background = "rgba(255,77,109,0.1)"}>
            <FileText size={15} /> PDF
          </button>
        </div>
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard icon={Users}       value={totalAttempts}         label="Attempts"   color={C.taupe} />
        <MetricCard icon={BarChart2}   value={`${avgScore}%`}       label="Avg Score"  color={scoreColor} />
        <MetricCard icon={CheckCircle} value={`${completionRate}%`} label="Completion" color={compColor} />
        <MetricCard icon={Clock}       value={`${avgTime}s`}        label="Avg Time"   color={C.tan} sub={`Min ${minTime}s · Max ${maxTime}s`} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">

          {/* Performance bars */}
          <div className="rounded-2xl border p-6"
            style={{ background: `linear-gradient(135deg,${C.card},${C.felt})`, borderColor: "rgba(124,92,255,0.12)" }}>
            <SectionHead label="Performance Overview" />
            <div className="space-y-4">
              <ScoreBar pct={avgScore}       color={scoreColor}  label="Avg Score"   right={`${avgScore}%`} />
              <ScoreBar pct={completionRate} color={compColor}   label="Completion"  right={`${completionRate}%`} />
              <ScoreBar pct={Math.min(100, (hintLetters + hintWords) * 5)} color="#b52b2b" label="Hint Usage" right={`${hintLetters + hintWords}`} />
            </div>
            <div className="grid grid-cols-2 gap-3 mt-5 pt-4 border-t" style={{ borderColor: "rgba(124,92,255,0.1)" }}>
              <div className="rounded-xl p-4" style={{ background: "rgba(0,0,0,0.3)", border: "1px solid rgba(124,92,255,0.08)" }}>
                <div className="font-mono text-[10px] tracking-widest uppercase mb-1" style={{ color: C.muted }}>Letter Hints</div>
                <div className="font-display font-black text-2xl" style={{ color: C.cream }}>{hintLetters}</div>
              </div>
              <div className="rounded-xl p-4" style={{ background: "rgba(0,0,0,0.3)", border: "1px solid rgba(124,92,255,0.08)" }}>
                <div className="font-mono text-[10px] tracking-widest uppercase mb-1" style={{ color: C.muted }}>Word Hints</div>
                <div className="font-display font-black text-2xl" style={{ color: C.cream }}>{hintWords}</div>
              </div>
            </div>
          </div>

          {/* Hardest clues table */}
          <div className="rounded-2xl border overflow-hidden" style={{ borderColor: "rgba(124,92,255,0.12)" }}>
            <div className="px-6 py-4 border-b flex items-center gap-2"
              style={{ background: "rgba(0,0,0,0.4)", borderColor: "rgba(124,92,255,0.1)" }}>
              <AlertTriangle size={15} color={C.taupe} />
              <h3 className="font-display font-bold" style={{ color: C.cream }}>Hardest Clues</h3>
            </div>
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr style={{ background: "rgba(0,0,0,0.3)" }}>
                  {["Clue", "Wrong Attempts"].map((h, i) => (
                    <th key={h} className={`py-3 px-5 font-mono text-[10px] uppercase tracking-widest border-b font-semibold ${i > 0 ? "text-center" : ""}`}
                      style={{ color: C.muted, borderColor: "rgba(124,92,255,0.07)" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {hardest.length === 0 ? (
                  <tr><td colSpan={2} className="py-10 text-center font-mono text-sm" style={{ color: C.muted }}>
                    {isLoading ? "Loading…" : "No clue data yet."}
                  </td></tr>
                ) : hardest.map((item, i) => (
                  <tr key={item.clue_id || i}
                    className="border-b last:border-0 transition-colors"
                    style={{ borderColor: "rgba(124,92,255,0.06)", background: i % 2 === 1 ? "rgba(255,255,255,0.015)" : "transparent" }}
                    onMouseEnter={e => e.currentTarget.style.background = "rgba(124,92,255,0.04)"}
                    onMouseLeave={e => e.currentTarget.style.background = i % 2 === 1 ? "rgba(255,255,255,0.015)" : "transparent"}>
                    <td className="py-3.5 px-5" style={{ color: C.stone }}>{item.clue}</td>
                    <td className="py-3.5 px-5 text-center font-mono font-bold" style={{ color: "#e07070" }}>{item.wrong_attempts}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Most incorrect clues */}
        <div className="rounded-2xl border flex flex-col"
          style={{ background: `linear-gradient(135deg,${C.card},${C.felt})`, borderColor: "rgba(124,92,255,0.12)" }}>
          <div className="px-6 py-4 border-b flex items-center gap-2" style={{ borderColor: "rgba(124,92,255,0.1)" }}>
            <Lightbulb size={15} color={C.tan} />
            <h3 className="font-display font-bold" style={{ color: C.cream }}>Most Incorrect</h3>
          </div>
          <div className="flex-1 p-5 overflow-y-auto">
            {incorrect.length === 0 ? (
              <div className="text-center font-mono text-sm py-8" style={{ color: C.muted }}>
                {isLoading ? "Loading…" : "No data yet."}
              </div>
            ) : (
              <ul className="space-y-3">
                {incorrect.map((item, i) => (
                  <li key={item.clue_id || i}
                    className="rounded-xl p-4 border transition-all duration-200"
                    style={{ background: "rgba(0,0,0,0.3)", borderColor: "rgba(124,92,255,0.08)" }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = "rgba(124,92,255,0.22)"}
                    onMouseLeave={e => e.currentTarget.style.borderColor = "rgba(124,92,255,0.08)"}>
                    <div className="flex items-start gap-2.5">
                      <AlertTriangle size={15} color={C.tan} className="shrink-0 mt-0.5" />
                      <span className="text-sm leading-snug" style={{ color: C.stone }}>{item.clue}</span>
                    </div>
                    <div className="mt-2 pl-6 font-mono text-[10px]" style={{ color: C.muted }}>
                      {item.wrong_attempts} wrong attempt{item.wrong_attempts !== 1 ? "s" : ""}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
          {loadError && (
            <div className="m-4 px-4 py-3 rounded-xl text-xs font-mono border"
              style={{ background: "rgba(255,77,109,0.12)", borderColor: "rgba(255,77,109,0.3)", color: "#f0a0a0" }}>{loadError}</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeacherReport;