'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { BarChart3 } from 'lucide-react';
import { fetchStudentHistory } from '../lib/api';

const C = {
  bg: '#0f0e14', felt: '#17151f', card: '#1e1b29',
  taupe: '#7c5cff', tan: '#22d3c9', stone: '#c7c2d9',
  cream: '#ede9f7', muted: '#8d87a3', rust: '#ff4d6d',
};

const TIME_FILTERS = ['Today', 'Weekly', 'Monthly', 'All Time'];

const fmt = v => { try { return v ? new Date(v).toLocaleDateString() : '—'; } catch { return '—'; } };

const filterByTime = (rows, filter) => {
  if (filter === 'All Time') return rows;
  const now = new Date();
  return rows.filter(r => {
    if (!r.date) return false;
    const d = new Date(r.date);
    if (filter === 'Today')   return d.toDateString() === now.toDateString();
    if (filter === 'Weekly')  return (now - d) <= 7 * 864e5;
    if (filter === 'Monthly') return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    return true;
  });
};

const scoreColor = s => s >= 80 ? C.taupe : s >= 50 ? C.tan : "#e07070";

const Report = ({ studentRegNo }) => {
  const [activeFilter, setActiveFilter] = useState('All Time');
  const [rawData, setRawData]           = useState([]);
  const [loadError, setLoadError]       = useState('');
  const [isLoading, setIsLoading]       = useState(false);

  useEffect(() => {
    if (!studentRegNo) return;
    let mounted = true;
    const load = async () => {
      setIsLoading(true); setLoadError('');
      try {
        const data = await fetchStudentHistory(studentRegNo);
        if (!mounted) return;
        setRawData((Array.isArray(data) ? data : []).map(item => ({
          id: item.attempt_id,
          title: item.puzzle_title,
          score: Math.round(item.score || 0),
          time: item.completion_time || 0,
          rank: item.rank ?? '—',
          date: item.attempt_date || item.submitted_at,
        })));
      } catch { if (mounted) setLoadError('Unable to load attempt history.'); }
      finally { if (mounted) setIsLoading(false); }
    };
    load();
    return () => { mounted = false; };
  }, [studentRegNo]);

  const rows = useMemo(() => filterByTime(rawData, activeFilter), [rawData, activeFilter]);
  const avgScore  = rows.length ? Math.round(rows.reduce((s, r) => s + r.score, 0) / rows.length) : 0;
  const bestScore = rows.length ? Math.max(...rows.map(r => r.score)) : 0;

  return (
    <div className="w-full max-w-5xl space-y-6 animate-fade-up">

      {rows.length > 0 && (
        <div className="flex flex-wrap gap-3">
          {[
            { label: "Attempts",   value: rows.length,     color: C.taupe },
            { label: "Avg Score",  value: `${avgScore}%`,  color: avgScore >= 70 ? C.taupe : C.tan },
            { label: "Best Score", value: `${bestScore}%`, color: C.tan },
          ].map(chip => (
            <div key={chip.label} className="flex items-center gap-2 px-4 py-2 rounded-xl border font-mono text-sm"
              style={{ background: `${chip.color}10`, borderColor: `${chip.color}30`, color: chip.color }}>
              <span className="font-black tabular-nums">{chip.value}</span>
              <span className="text-[10px] uppercase tracking-widest opacity-70">{chip.label}</span>
            </div>
          ))}
        </div>
      )}

      <div className="rounded-2xl border overflow-hidden" style={{ borderColor: "rgba(124,92,255,0.12)" }}>

        {/* Toolbar */}
        <div className="px-6 py-4 border-b flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
          style={{ background: "rgba(0,0,0,0.4)", borderColor: "rgba(124,92,255,0.1)" }}>
          <div className="flex items-center gap-2">
            <BarChart3 size={15} color={C.taupe} />
            <h3 className="font-display font-bold" style={{ color: C.cream }}>Attempt History</h3>
          </div>
          <div className="flex gap-1.5 p-1 rounded-xl" style={{ background: "rgba(0,0,0,0.4)" }}>
            {TIME_FILTERS.map(f => (
              <button key={f} type="button" onClick={() => setActiveFilter(f)}
                className="px-3 py-1.5 rounded-lg font-mono text-[10px] font-bold tracking-wider uppercase transition-all"
                style={activeFilter === f
                  ? { background: C.taupe, color: C.bg }
                  : { color: C.muted }}
                onMouseEnter={e => { if (activeFilter !== f) e.currentTarget.style.color = C.stone; }}
                onMouseLeave={e => { if (activeFilter !== f) e.currentTarget.style.color = C.muted; }}>
                {f}
              </button>
            ))}
          </div>
        </div>

        {isLoading && (
          <div className="px-6 py-3 font-mono text-sm" style={{ color: C.muted }}>Loading history…</div>
        )}
        {loadError && (
          <div className="mx-6 my-3 px-4 py-3 rounded-xl border font-mono text-sm"
            style={{ background: "rgba(255,77,109,0.12)", borderColor: "rgba(255,77,109,0.3)", color: "#f0a0a0" }}>
            {loadError}
          </div>
        )}

        <table className="w-full text-sm text-left border-collapse">
          <thead>
            <tr style={{ background: "rgba(0,0,0,0.3)" }}>
              {["Puzzle", "Score", "Time", "Rank", "Date"].map((h, i) => (
                <th key={h} className={`py-3 px-5 font-mono text-[10px] uppercase tracking-widest font-semibold border-b ${i > 0 ? "text-center" : ""}`}
                  style={{ color: C.muted, borderColor: "rgba(124,92,255,0.07)" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && !isLoading ? (
              <tr><td colSpan={5} className="py-16 text-center font-mono text-sm" style={{ color: C.muted }}>
                No attempts {activeFilter !== 'All Time' ? activeFilter.toLowerCase() : 'yet'}.
              </td></tr>
            ) : rows.map((row, i) => (
              <tr key={row.id || i}
                className="border-b last:border-0 transition-colors"
                style={{ borderColor: "rgba(124,92,255,0.06)", background: i % 2 === 1 ? "rgba(255,255,255,0.015)" : "transparent" }}
                onMouseEnter={e => e.currentTarget.style.background = "rgba(124,92,255,0.05)"}
                onMouseLeave={e => e.currentTarget.style.background = i % 2 === 1 ? "rgba(255,255,255,0.015)" : "transparent"}>
                <td className="py-3.5 px-5 font-display font-bold" style={{ color: C.cream }}>{row.title}</td>
                <td className="py-3.5 px-5 text-center font-mono font-bold tabular-nums" style={{ color: scoreColor(row.score) }}>
                  {row.score}%
                </td>
                <td className="py-3.5 px-5 text-center font-mono text-xs tabular-nums" style={{ color: C.muted }}>{row.time}s</td>
                <td className="py-3.5 px-5 text-center font-mono text-sm">
                  {row.rank === 1 ? "🥇" : row.rank === 2 ? "🥈" : row.rank === 3 ? "🥉" : `#${row.rank}`}
                </td>
                <td className="py-3.5 px-5 text-center font-mono text-xs" style={{ color: C.muted }}>{fmt(row.date)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Report;