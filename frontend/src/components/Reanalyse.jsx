'use client';

import React, { useMemo } from 'react';
import { TrendingUp, Lightbulb, AlertTriangle } from 'lucide-react';

const C = {
  bg: '#0f0e14', felt: '#17151f', card: '#1e1b29',
  taupe: '#7c5cff', tan: '#22d3c9', stone: '#c7c2d9',
  cream: '#ede9f7', muted: '#8d87a3', rust: '#ff4d6d',
};

const diffStars = d => {
  const map = { easy: 1, medium: 3, hard: 5 };
  const n = map[String(d).toLowerCase()] ?? 2;
  return Array.from({ length: 5 }, (_, i) => (
    <span key={i} style={{ color: i < n ? C.taupe : "rgba(124,92,255,0.15)" }}>★</span>
  ));
};

const SummaryCard = ({ label, value, emoji }) => (
  <div className="rounded-2xl border p-5 flex flex-col gap-2 transition-all duration-200"
    style={{ background: `linear-gradient(135deg,${C.card},${C.felt})`, borderColor: "rgba(124,92,255,0.12)" }}
    onMouseEnter={e => e.currentTarget.style.borderColor = "rgba(124,92,255,0.3)"}
    onMouseLeave={e => e.currentTarget.style.borderColor = "rgba(124,92,255,0.12)"}>
    <div className="text-2xl">{emoji}</div>
    <div className="font-mono text-[10px] uppercase tracking-widest" style={{ color: C.muted }}>{label}</div>
    <div className="font-display font-bold text-sm leading-tight truncate" style={{ color: C.cream }} title={value}>{value}</div>
  </div>
);

const Reanalyse = ({ history = [], puzzles = [] }) => {
  const puzzleById = useMemo(
    () => Object.fromEntries((Array.isArray(puzzles) ? puzzles : []).map(p => [p.id, p])),
    [puzzles]
  );

  const stats = useMemo(() => {
    const attempts = Array.isArray(history) ? history : [];
    if (!attempts.length) return {
      weakest: '—', strongest: '—', hardest: '—', important: '—',
      mistakes: [],
      suggestions: ['Solve more puzzles to generate insights.', 'Focus on accuracy before speed.'],
    };

    const byScore  = [...attempts].sort((a, b) => (a.score || 0) - (b.score || 0));
    const weakest  = byScore[0];
    const strongest = byScore[byScore.length - 1];
    const recent   = [...attempts].sort((a, b) =>
      new Date(b.attempt_date || b.submitted_at) - new Date(a.attempt_date || a.submitted_at)
    )[0];

    const mistakes = attempts.map(a => {
      const pz = puzzleById[a.puzzle_id];
      const total  = pz?.clue_count ?? pz?.clues?.length ?? 0;
      const solved = a.solved_words_count ?? 0;
      return { id: a.attempt_id, puzzle: a.puzzle_title, wrongWords: Math.max(0, total - solved), difficulty: pz?.difficulty || '—' };
    }).sort((a, b) => b.wrongWords - a.wrongWords).slice(0, 5);

    return {
      weakest:   weakest.puzzle_title   || '—',
      strongest: strongest.puzzle_title || '—',
      hardest:   weakest.puzzle_title   || '—',
      important: recent.puzzle_title    || '—',
      mistakes,
      suggestions: [
        `Strongest puzzle: "${strongest.puzzle_title || '—'}" — build on this!`,
        `Weakest puzzle: "${weakest.puzzle_title || '—'}" — revisit this topic.`,
        'Aim to reduce wrong words on harder puzzles.',
        'Use hints sparingly to improve memory retention.',
      ],
    };
  }, [history, puzzleById]);

  const wrongColor = n => n > 3 ? "#e07070" : n > 0 ? C.tan : C.taupe;

  return (
    <div className="w-full max-w-5xl space-y-6 animate-fade-up">

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard emoji="💪" label="Strongest Puzzle" value={stats.strongest} />
        <SummaryCard emoji="⚠️"  label="Weakest Puzzle"   value={stats.weakest}   />
        <SummaryCard emoji="🔥" label="Hardest Puzzle"   value={stats.hardest}   />
        <SummaryCard emoji="📅" label="Most Recent"      value={stats.important} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-6">

        {/* Mistake table */}
        <div className="rounded-2xl border overflow-hidden" style={{ borderColor: "rgba(124,92,255,0.12)" }}>
          <div className="px-6 py-4 border-b flex items-center gap-2"
            style={{ background: "rgba(0,0,0,0.4)", borderColor: "rgba(124,92,255,0.1)" }}>
            <AlertTriangle size={15} color={C.taupe} />
            <h3 className="font-display font-bold" style={{ color: C.cream }}>Mistake Analysis</h3>
          </div>
          <table className="w-full text-sm text-left border-collapse">
            <thead>
              <tr style={{ background: "rgba(0,0,0,0.3)" }}>
                {["Puzzle", "Wrong Words", "Difficulty"].map((h, i) => (
                  <th key={h} className={`py-3 px-5 font-mono text-[10px] uppercase tracking-widest font-semibold border-b ${i > 0 ? "text-center" : ""}`}
                    style={{ color: C.muted, borderColor: "rgba(124,92,255,0.07)" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {stats.mistakes.length === 0 ? (
                <tr><td colSpan={3} className="py-12 text-center font-mono text-sm" style={{ color: C.muted }}>
                  No attempts yet — play a puzzle to see insights.
                </td></tr>
              ) : stats.mistakes.map((row, i) => (
                <tr key={row.id || i}
                  className="border-b last:border-0 transition-colors"
                  style={{ borderColor: "rgba(124,92,255,0.06)", background: i % 2 === 1 ? "rgba(255,255,255,0.015)" : "transparent" }}
                  onMouseEnter={e => e.currentTarget.style.background = "rgba(124,92,255,0.05)"}
                  onMouseLeave={e => e.currentTarget.style.background = i % 2 === 1 ? "rgba(255,255,255,0.015)" : "transparent"}>
                  <td className="py-3.5 px-5 font-display font-bold max-w-[200px] truncate" style={{ color: C.cream }}>{row.puzzle}</td>
                  <td className="py-3.5 px-5 text-center font-mono font-bold" style={{ color: wrongColor(row.wrongWords) }}>
                    {row.wrongWords}
                  </td>
                  <td className="py-3.5 px-5 text-center font-mono text-sm">{diffStars(row.difficulty)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Suggestions */}
        <div className="rounded-2xl border p-6 flex flex-col gap-4"
          style={{ background: `linear-gradient(135deg,${C.card},${C.felt})`, borderColor: "rgba(124,92,255,0.12)" }}>
          <div className="flex items-center gap-2 pb-4 border-b" style={{ borderColor: "rgba(124,92,255,0.1)" }}>
            <Lightbulb size={15} color={C.tan} />
            <h3 className="font-display font-bold" style={{ color: C.cream }}>Suggestions</h3>
          </div>
          <div className="space-y-3 flex-1">
            {stats.suggestions.map((s, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-xl border transition-all"
                style={{ background: "rgba(0,0,0,0.25)", borderColor: "rgba(124,92,255,0.08)" }}>
                <div className="w-5 h-5 rounded-md flex items-center justify-center shrink-0 mt-0.5 font-mono text-[10px] font-black"
                  style={{ background: "rgba(124,92,255,0.15)", color: C.taupe }}>
                  {i + 1}
                </div>
                <span className="text-sm leading-snug" style={{ color: C.stone }}>{s}</span>
              </div>
            ))}
          </div>
          <div className="pt-3 border-t text-center" style={{ borderColor: "rgba(124,92,255,0.1)" }}>
            <div className="flex items-center justify-center gap-2">
              <TrendingUp size={13} color={C.tan} />
              <span className="font-mono text-[10px] tracking-widest uppercase" style={{ color: C.muted }}>
                Based on {history.length} attempt{history.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reanalyse;