import React, { useMemo } from 'react';
import { Medal, Trophy, Sparkles } from 'lucide-react';

const Leaderboard = ({
  data,
  isLoading = false,
  loadError = '',
  puzzles = [],
  selectedPuzzleId = null,
  onPuzzleSelect = null,
}) => {
  const publishedPuzzles = useMemo(
    () => (Array.isArray(puzzles) ? puzzles.filter((p) => p.status === 'published') : []),
    [puzzles]
  );

  const rows = useMemo(() => {
    if (!Array.isArray(data) || data.length === 0) {
      return [];
    }
    return [...data].sort((a, b) => (a.rank || 0) - (b.rank || 0));
  }, [data]);

  return (
    <div className="w-full max-w-6xl font-sans text-white pb-8">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-10">
        <div className="flex items-center gap-5">
          <div className="bg-gradient-to-br from-amber-200 via-amber-400 to-amber-700 p-3.5 rounded-2xl shadow-[0_12px_40px_-12px_rgba(245,158,11,0.55)] border border-amber-100/30">
            <Medal size={34} className="text-[#3b2a05]" strokeWidth={1.5} />
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-[0.28em] text-gray-500 font-semibold m-0 mb-2">Competition</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight m-0">
              Puzzle <span className="text-[#e63946]">Leaderboard</span>
            </h2>
            <p className="text-gray-500 text-sm mt-2 m-0 leading-relaxed max-w-md">
              Rankings for the puzzle you select — updated as students submit attempts.
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 w-full md:w-auto">
          <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">Select puzzle</span>
          <select
            className="w-full md:w-auto min-w-[200px] bg-[#0c0a0a] border border-white/[0.1] rounded-xl px-4 py-2.5 text-sm text-gray-100 shadow-inner focus:outline-none focus:ring-2 focus:ring-[#e63946]/30 focus:border-[#e63946]/45"
            value={selectedPuzzleId || ''}
            onChange={(event) => onPuzzleSelect?.(Number(event.target.value))}
          >
            {publishedPuzzles.length === 0 ? (
              <option value="">No published puzzles</option>
            ) : (
              publishedPuzzles.map((puzzle) => (
                <option key={puzzle.id} value={puzzle.id}>
                  {puzzle.title}
                </option>
              ))
            )}
          </select>
        </div>
      </div>

      <div className="bg-gradient-to-br from-[#141212] via-[#101010] to-[#0c0a0a] rounded-2xl p-6 md:p-8 shadow-[0_24px_60px_-30px_rgba(0,0,0,0.9)] border border-white/[0.07]">
        <div className="overflow-x-auto rounded-xl border border-white/[0.05]">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-white/[0.02] text-gray-400 text-xs uppercase tracking-wider border-b border-white/[0.08]">
                <th className="py-4 font-semibold px-4">Rank</th>
                <th className="py-4 font-semibold px-4">Student Name</th>
                <th className="py-4 font-semibold px-4">Registration No</th>
                <th className="py-4 font-semibold px-4 text-center">Score</th>
                <th className="py-4 font-semibold px-4 text-center">Completion Time</th>
                <th className="py-4 font-semibold px-4 text-center">Hints Used</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-16 px-6 text-center">
                    {isLoading ? (
                      <span className="text-gray-400 text-sm font-medium">Loading leaderboard...</span>
                    ) : (
                      <div className="flex flex-col items-center gap-4 max-w-sm mx-auto">
                        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#e63946]/10 border border-[#e63946]/25 text-[#e63946]">
                          <Trophy size={32} strokeWidth={1.5} />
                        </div>
                        <div>
                          <p className="text-white font-semibold text-lg m-0 flex items-center justify-center gap-2">
                            <Sparkles size={18} className="text-amber-400 shrink-0" />
                            No attempts yet
                          </p>
                          <p className="text-gray-500 text-sm mt-2 m-0 leading-relaxed">
                            When students complete this puzzle, their scores and times will appear here.
                          </p>
                        </div>
                      </div>
                    )}
                  </td>
                </tr>
              ) : (
                rows.map((row, idx) => (
                  <tr
                    key={row.id || row.attempt_id || `${row.student_reg_no}-${row.rank}`}
                    className={`border-b border-white/[0.04] last:border-0 transition-colors hover:bg-white/[0.04] ${idx % 2 === 1 ? 'bg-white/[0.015]' : ''}`}
                  >
                    <td className="py-4 px-4 align-middle">
                      <span
                        className={
                          Number(row.rank) === 1
                            ? 'inline-flex items-center justify-center min-w-[2.25rem] h-9 px-2 rounded-xl bg-gradient-to-br from-amber-300/90 to-amber-600 text-amber-950 font-bold text-sm shadow-[0_0_24px_-4px_rgba(245,158,11,0.55)] border border-amber-200/50'
                            : Number(row.rank) === 2
                              ? 'inline-flex items-center justify-center min-w-[2.25rem] h-9 px-2 rounded-xl bg-gradient-to-br from-slate-200 to-slate-400 text-slate-900 font-bold text-sm shadow-[0_0_20px_-4px_rgba(148,163,184,0.45)] border border-slate-100/50'
                              : Number(row.rank) === 3
                                ? 'inline-flex items-center justify-center min-w-[2.25rem] h-9 px-2 rounded-xl bg-gradient-to-br from-orange-300/90 to-orange-700 text-orange-950 font-bold text-sm shadow-[0_0_20px_-4px_rgba(234,88,12,0.4)] border border-orange-200/40'
                                : 'inline-flex items-center justify-center min-w-[2.25rem] h-9 px-2 rounded-xl bg-white/[0.06] text-gray-200 font-semibold text-sm border border-white/10'
                        }
                      >
                        {row.rank}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-gray-100 font-medium">{row.student_name || 'Student'}</td>
                    <td className="py-4 px-4 text-gray-400 tabular-nums">{row.student_reg_no || '-'}</td>
                    <td className="py-4 px-4 text-center text-gray-200 font-semibold tabular-nums">{Math.round(row.score || 0)}%</td>
                    <td className="py-4 px-4 text-center text-gray-400 tabular-nums">{row.completion_time || 0}s</td>
                    <td className="py-4 px-4 text-center text-gray-400">
                      {Number(row.hint_letters_used || 0) + Number(row.hint_words_used || 0)}
                      <span className="text-xs text-gray-600 block sm:inline sm:ml-1">
                        {` (L${row.hint_letters_used || 0}/W${row.hint_words_used || 0})`}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {loadError && (
          <div className="mt-5 text-sm text-red-300 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
            {loadError}
          </div>
        )}
      </div>
    </div>
  );
};

export default Leaderboard;
