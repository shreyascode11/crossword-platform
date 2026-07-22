'use client';

import React, { useMemo } from 'react';
import { Target, Zap, TrendingUp, Award, Flame } from 'lucide-react';

const C = {
  bg: '#0f0e14', felt: '#17151f', card: '#1e1b29',
  taupe: '#7c5cff', tan: '#22d3c9', stone: '#c7c2d9',
  cream: '#ede9f7', muted: '#8d87a3', rust: '#ff4d6d',
};

const bar = (pct, color = C.taupe) => (
  <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
    <div className="h-full rounded-full transition-all duration-1000"
      style={{ width: `${Math.min(100, Math.max(0, pct))}%`, background: `linear-gradient(90deg, ${color}, ${color}88)` }} />
  </div>
);

const MiniStat = ({ icon: Icon, value, label, color = C.taupe }) => (
  <div className="flex flex-col items-center justify-center p-5 rounded-2xl border transition-all duration-200"
    style={{ background: `linear-gradient(135deg,${C.card},${C.felt})`, borderColor: "rgba(124,92,255,0.12)" }}
    onMouseEnter={e => e.currentTarget.style.borderColor = `${color}40`}
    onMouseLeave={e => e.currentTarget.style.borderColor = "rgba(124,92,255,0.12)"}>
    <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3"
      style={{ background: `${color}15`, border: `1px solid ${color}28` }}>
      <Icon size={18} style={{ color }} />
    </div>
    <div className="font-display font-black text-3xl tabular-nums" style={{ color: C.cream }}>{value}</div>
    <div className="font-mono text-[10px] tracking-widest uppercase mt-1" style={{ color: C.muted }}>{label}</div>
  </div>
);

const AchievementBadge = ({ icon, label, earned }) => (
  <div className="flex flex-col items-center gap-1.5 px-3">
    <div className="w-12 h-12 rounded-xl flex items-center justify-center text-xl transition-all duration-200"
      style={{
        background: earned ? "rgba(124,92,255,0.12)" : "rgba(255,255,255,0.03)",
        border: earned ? "1px solid rgba(124,92,255,0.35)" : "1px solid rgba(255,255,255,0.06)",
        filter: earned ? "none" : "grayscale(1) opacity(0.3)",
      }}>
      {icon}
    </div>
    <span className="font-mono text-[9px] tracking-wider uppercase text-center leading-tight"
      style={{ color: earned ? C.taupe : C.muted }}>{label}</span>
  </div>
);

const CurrentStats = ({ stats, puzzles = [], history = [] }) => {
  const totalAttempts  = history.length || puzzles.reduce((s, p) => s + (p.attempts || 0), 0);
  const avgScoreNum    = parseFloat(String(stats?.avg_score  || "0").replace("%", "")) || 0;
  const attainNum      = parseFloat(String(stats?.attainment || "0").replace("%", "")) || 0;

  const perfData = useMemo(() => {
    const src = history.length > 0 ? history.slice(0, 6) : puzzles.slice(0, 6);
    return src.map(item => ({
      name:  item.puzzle_title || item.title || "—",
      score: parseFloat(String(item.score || item.points || "0").replace("%", "")) || 0,
    }));
  }, [history, puzzles]);

  const streak   = useMemo(() => { let s = 0; for (const h of [...history].reverse()) { if ((h.score || 0) >= 50) s++; else break; } return s; }, [history]);
  const bestScore = useMemo(() => Math.max(0, ...history.map(h => h.score || 0)), [history]);
  const rankOnes  = useMemo(() => history.filter(h => h.rank === 1).length, [history]);

  const achievements = [
    { icon: "🎯", label: "First Blood", earned: totalAttempts >= 1 },
    { icon: "🔥", label: "On Fire",     earned: streak >= 3 },
    { icon: "🏆", label: "Top Ranker",  earned: rankOnes >= 1 },
    { icon: "💯", label: "Perfect",     earned: bestScore >= 100 },
    { icon: "⚡", label: "Speed Demon", earned: history.some(h => (h.completion_time || 999) < 60) },
    { icon: "📚", label: "Scholar",     earned: totalAttempts >= 5 },
  ];

  const scoreColor = s => s >= 80 ? C.taupe : s >= 50 ? C.tan : "#e07070";

  return (
    <div className="w-full max-w-5xl space-y-6 animate-fade-up">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MiniStat icon={Flame}      value={totalAttempts}             label="Puzzles Done" color={C.taupe} />
        <MiniStat icon={Target}     value={`${Math.round(avgScoreNum)}%`} label="Avg Score" color={C.tan} />
        <MiniStat icon={TrendingUp} value={`${Math.round(attainNum)}%`}   label="Attainment" color={C.taupe} />
        <MiniStat icon={Zap}        value={streak}                    label="Win Streak"   color={C.tan} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Performance bars */}
        <div className="lg:col-span-2 rounded-2xl border p-6"
          style={{ background: `linear-gradient(135deg,${C.card},${C.felt})`, borderColor: "rgba(124,92,255,0.12)" }}>
          <div className="flex items-center gap-2 mb-5 pb-4 border-b" style={{ borderColor: "rgba(124,92,255,0.08)" }}>
            <span style={{ color: C.taupe }}>★</span>
            <h3 className="font-display font-bold text-lg" style={{ color: C.cream }}>Puzzle Performance</h3>
          </div>
          {perfData.length === 0 ? (
            <div className="text-center font-mono text-sm py-8" style={{ color: C.muted }}>Play a puzzle to see your scores here.</div>
          ) : (
            <div className="space-y-4">
              {perfData.map((item, i) => (
                <div key={i} className="flex items-center gap-4">
                  <span className="font-mono text-[11px] w-32 truncate shrink-0" style={{ color: C.muted }}>{item.name}</span>
                  {bar(item.score, scoreColor(item.score))}
                  <span className="font-mono text-xs font-bold w-10 text-right shrink-0" style={{ color: scoreColor(item.score) }}>{Math.round(item.score)}%</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Achievements */}
        <div className="rounded-2xl border p-6 flex flex-col"
          style={{ background: `linear-gradient(135deg,${C.card},${C.felt})`, borderColor: "rgba(124,92,255,0.12)" }}>
          <div className="flex items-center gap-2 mb-5 pb-4 border-b" style={{ borderColor: "rgba(124,92,255,0.08)" }}>
            <Award size={16} color={C.taupe} />
            <h3 className="font-display font-bold text-lg" style={{ color: C.cream }}>Achievements</h3>
          </div>
          <div className="grid grid-cols-3 gap-y-4 place-items-center flex-1">
            {achievements.map((a, i) => <AchievementBadge key={i} {...a} />)}
          </div>
          <div className="mt-5 pt-4 border-t text-center" style={{ borderColor: "rgba(124,92,255,0.08)" }}>
            <div className="font-mono text-[10px] uppercase tracking-widest mb-1" style={{ color: C.muted }}>Unlocked</div>
            <div className="font-display font-black text-2xl" style={{ color: C.taupe }}>
              {achievements.filter(a => a.earned).length}
              <span className="font-mono font-normal text-base" style={{ color: C.muted }}>/{achievements.length}</span>
            </div>
          </div>
        </div>
      </div>

      {bestScore > 0 && (
        <div className="rounded-2xl p-5 border flex items-center gap-5"
          style={{ background: "rgba(124,92,255,0.06)", borderColor: "rgba(124,92,255,0.2)" }}>
          <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0"
            style={{ background: "rgba(124,92,255,0.12)", border: "1px solid rgba(124,92,255,0.28)" }}>🏅</div>
          <div>
            <div className="font-mono text-[10px] tracking-widest uppercase mb-0.5" style={{ color: C.muted }}>Personal Best</div>
            <div className="font-display font-black text-3xl" style={{ color: C.cream }}>{Math.round(bestScore)}%</div>
          </div>
          <div className="ml-auto text-right">
            <div className="font-mono text-[10px] tracking-widest uppercase mb-0.5" style={{ color: C.muted }}>Top Rankings</div>
            <div className="font-display font-black text-3xl" style={{ color: C.taupe }}>#{rankOnes} 🥇</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CurrentStats;