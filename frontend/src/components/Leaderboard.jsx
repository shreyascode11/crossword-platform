'use client';

import React, { useMemo } from 'react';
import { Trophy, Crown } from 'lucide-react';

const C = {
  bg: '#0f0e14', felt: '#17151f', card: '#1e1b29',
  taupe: '#7c5cff', tan: '#22d3c9', stone: '#c7c2d9',
  cream: '#ede9f7', muted: '#8d87a3', rust: '#ff4d6d',
};

const MEDAL = {
  1: { emoji: "🥇", bg: "linear-gradient(135deg,#f0c040,#c47f17)", text: "#3b2a05", glow: "rgba(212,160,23,0.5)" },
  2: { emoji: "🥈", bg: "linear-gradient(135deg,#d4d4d8,#71717a)", text: "#1c1917", glow: "rgba(161,161,170,0.4)" },
  3: { emoji: "🥉", bg: "linear-gradient(135deg,#fb923c,#b45309)", text: "#1c0f00", glow: "rgba(196,127,23,0.4)" },
};

const PodiumCard = ({ row, pos }) => {
  const m = MEDAL[pos];
  const heights = { 1: "h-28", 2: "h-20", 3: "h-16" };
  const order   = { 1: "order-2", 2: "order-1", 3: "order-3" };
  return (
    <div className={`flex flex-col items-center gap-2 ${order[pos]}`}>
      <div className="text-2xl animate-float" style={{ animationDelay: `${pos * 0.2}s` }}>{m.emoji}</div>
      <div className="font-display font-black text-sm text-center max-w-[90px] truncate" style={{ color: C.cream }}>{row?.student_name || "—"}</div>
      <div className="font-mono text-[10px] text-center max-w-[90px] truncate" style={{ color: C.muted }}>{row?.student_reg_no || "—"}</div>
      <div className="font-display font-black text-xl" style={{ color: pos === 1 ? C.taupe : C.tan }}>{Math.round(row?.score || 0)}%</div>
      <div className={`w-20 rounded-t-xl flex items-end justify-center pb-2 ${heights[pos]}`}
        style={{ background: m.bg, boxShadow: `0 0 30px -8px ${m.glow}` }}>
        <span className="font-mono font-black text-2xl" style={{ color: m.text }}>#{pos}</span>
      </div>
    </div>
  );
};

const Leaderboard = ({ data, isLoading, loadError, puzzles = [], selectedPuzzleId, onPuzzleSelect }) => {
  const published = useMemo(() => Array.isArray(puzzles) ? puzzles.filter(p => p.status === "published") : [], [puzzles]);
  const rows = useMemo(() => Array.isArray(data) ? [...data].sort((a, b) => (a.rank || 0) - (b.rank || 0)) : [], [data]);

  const scoreColor = s => s >= 80 ? C.taupe : s >= 50 ? C.tan : "#e07070";

  return (
    <div className="w-full max-w-4xl space-y-6 animate-fade-up">

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: "rgba(124,92,255,0.12)", border: "1px solid rgba(124,92,255,0.25)" }}>
            <Trophy size={20} color={C.taupe} />
          </div>
          <div>
            <div className="font-mono text-[10px] tracking-widest uppercase" style={{ color: C.muted }}>Competition</div>
            <h2 className="font-display font-black text-2xl" style={{ color: C.cream }}>Leaderboard</h2>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="font-mono text-[10px] tracking-widest uppercase" style={{ color: C.muted }}>Puzzle</span>
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
        </div>
      </div>

      {/* Podium */}
      {rows.length >= 3 && (
        <div className="rounded-2xl border p-8 overflow-hidden relative"
          style={{ background: `linear-gradient(180deg,${C.card},${C.felt})`, borderColor: "rgba(124,92,255,0.15)" }}>
          <div className="absolute inset-0 pointer-events-none"
            style={{ background: "radial-gradient(ellipse at 50% 0%, rgba(124,92,255,0.05) 0%, transparent 65%)" }} />
          <div className="flex items-end justify-center gap-6 relative">
            {[2, 1, 3].map(pos => {
              const row = rows.find(r => r.rank === pos);
              return row ? <PodiumCard key={pos} row={row} pos={pos} /> : null;
            })}
          </div>
        </div>
      )}

      {/* Full table */}
      <div className="rounded-2xl border overflow-hidden" style={{ borderColor: "rgba(124,92,255,0.12)" }}>
        <table className="w-full text-left text-sm border-collapse">
          <thead>
            <tr style={{ background: "rgba(0,0,0,0.5)" }}>
              {["Rank", "Player", "Reg No", "Score", "Time", "Hints"].map((h, i) => (
                <th key={h} className={`py-3.5 px-4 font-mono text-[10px] uppercase tracking-widest font-semibold border-b ${i > 2 ? "text-center" : ""}`}
                  style={{ color: C.muted, borderColor: "rgba(124,92,255,0.1)" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={6} className="py-16 text-center font-mono text-sm" style={{ color: C.muted }}>Loading…</td></tr>
            ) : rows.length === 0 ? (
              <tr><td colSpan={6} className="py-16 text-center">
                <div className="flex flex-col items-center gap-3">
                  <Crown size={32} style={{ color: "rgba(124,92,255,0.3)" }} />
                  <div className="font-display font-bold text-lg" style={{ color: C.cream }}>No attempts yet</div>
                  <div className="font-mono text-sm" style={{ color: C.muted }}>{loadError || "Scores appear here when students submit."}</div>
                </div>
              </td></tr>
            ) : rows.map((row, i) => {
              const medal = MEDAL[row.rank];
              const hints = Number(row.hint_letters_used || 0) + Number(row.hint_words_used || 0);
              return (
                <tr key={row.id || i}
                  className="border-b last:border-0 transition-colors"
                  style={{
                    borderColor: "rgba(124,92,255,0.07)",
                    background: row.rank <= 3 ? `${medal.glow}08` : i % 2 === 1 ? "rgba(255,255,255,0.015)" : "transparent",
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = "rgba(124,92,255,0.05)"}
                  onMouseLeave={e => e.currentTarget.style.background = row.rank <= 3 ? `${medal?.glow}08` : i % 2 === 1 ? "rgba(255,255,255,0.015)" : "transparent"}>
                  <td className="py-3.5 px-4">
                    {medal ? (
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-base font-bold"
                        style={{ background: medal.bg, color: medal.text, boxShadow: `0 0 16px -4px ${medal.glow}` }}>
                        {row.rank}
                      </span>
                    ) : (
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg font-mono font-bold text-sm"
                        style={{ background: "rgba(255,255,255,0.05)", color: C.muted, border: "1px solid rgba(255,255,255,0.08)" }}>
                        {row.rank}
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 font-display font-bold" style={{ color: C.cream }}>{row.student_name || "Student"}</td>
                  <td className="py-3.5 px-4 font-mono text-xs" style={{ color: C.muted }}>{row.student_reg_no || "—"}</td>
                  <td className="py-3.5 px-4 text-center font-mono font-bold tabular-nums" style={{ color: scoreColor(row.score || 0) }}>
                    {Math.round(row.score || 0)}%
                  </td>
                  <td className="py-3.5 px-4 text-center font-mono tabular-nums text-xs" style={{ color: C.muted }}>{row.completion_time || 0}s</td>
                  <td className="py-3.5 px-4 text-center font-mono text-xs" style={{ color: C.muted }}>
                    {hints > 0 ? (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg"
                        style={{ background: "rgba(255,77,109,0.1)", color: "#e07070" }}>
                        {hints}
                        <span className="text-[9px] opacity-70">L{row.hint_letters_used || 0}/W{row.hint_words_used || 0}</span>
                      </span>
                    ) : "—"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {loadError && rows.length > 0 && (
        <div className="px-4 py-3 rounded-xl text-sm font-mono border"
          style={{ background: "rgba(255,77,109,0.12)", borderColor: "rgba(255,77,109,0.3)", color: "#f0a0a0" }}>{loadError}</div>
      )}
    </div>
  );
};

export default Leaderboard;