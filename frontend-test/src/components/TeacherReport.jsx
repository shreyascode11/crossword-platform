import React, { useMemo } from 'react';
import {
  FileText,
  FileSpreadsheet,
  Users,
  BarChart2,
  Clock,
  CheckCircle,
  AlertTriangle,
} from 'lucide-react';

const TeacherReport = ({
  puzzles = [],
  puzzleAnalytics = null,
  isLoading = false,
  loadError = '',
  selectedPuzzleId = null,
  onPuzzleSelect = null,
}) => {
  const publishedPuzzles = useMemo(
    () => (Array.isArray(puzzles) ? puzzles.filter((p) => p.status === 'published') : []),
    [puzzles]
  );

  const analytics = puzzleAnalytics || {};
  const hardestClues = Array.isArray(analytics.hardest_clues) ? analytics.hardest_clues : [];
  const incorrectClues = Array.isArray(analytics.most_incorrect_clues)
    ? analytics.most_incorrect_clues
    : hardestClues;

  const totalAttempts = analytics.total_attempts || 0;
  const avgScore = analytics.average_score ?? 0;
  const completionRate = analytics.completion_rate ?? 0;
  const avgTime = analytics.average_completion_time ?? 0;
  const minTime = analytics.completion_time_min ?? 0;
  const maxTime = analytics.completion_time_max ?? 0;
  const hintLetters = analytics.hint_letters_used ?? 0;
  const hintWords = analytics.hint_words_used ?? 0;

  return (
    <div className="w-full max-w-6xl font-sans text-white pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
        <div>
          <p className="text-[11px] uppercase tracking-[0.28em] text-gray-500 font-semibold m-0 mb-2">Insights</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight m-0">
            Puzzle <span className="text-[#e63946]">Analytics</span>
          </h2>
          <p className="text-gray-500 text-sm mt-3 m-0 max-w-xl leading-relaxed">
            {analytics.title ? `"${analytics.title}" — Teacher Insights` : 'Select a puzzle to view analytics'}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row flex-wrap gap-3 items-stretch sm:items-center w-full md:w-auto">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">Select puzzle</span>
            <select
              className="w-full sm:w-auto min-w-[200px] bg-[#0c0a0a] border border-white/[0.1] rounded-xl px-4 py-2.5 text-sm text-gray-100 shadow-inner focus:outline-none focus:ring-2 focus:ring-[#e63946]/30 focus:border-[#e63946]/45"
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

          <div className="flex flex-wrap gap-2">
            <button className="flex items-center justify-center gap-2 bg-white/[0.06] hover:bg-emerald-500/15 text-gray-200 px-4 py-2.5 rounded-xl border border-white/10 hover:border-emerald-500/35 transition-colors text-sm font-semibold">
              <FileSpreadsheet size={18} className="text-emerald-400" /> Export CSV
            </button>
            <button className="flex items-center justify-center gap-2 bg-white/[0.06] hover:bg-[#e63946]/15 text-gray-200 px-4 py-2.5 rounded-xl border border-white/10 hover:border-[#e63946]/35 transition-colors text-sm font-semibold">
              <FileText size={18} className="text-[#e63946]" /> Export PDF
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-gradient-to-br from-[#1a1414] to-[#0c0a0a] p-5 shadow-[0_16px_40px_-24px_rgba(0,0,0,0.85)]">
              <div className="absolute inset-0 bg-gradient-to-br from-[#e63946]/10 to-transparent pointer-events-none" />
              <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-[#e63946]/15 border border-[#e63946]/25 text-[#e63946] mb-3">
                <Users size={20} />
              </div>
              <p className="text-gray-500 text-[11px] uppercase tracking-wider font-semibold mb-1 relative">Attempts</p>
              <p className="text-2xl font-bold text-white tabular-nums relative">{totalAttempts}</p>
            </div>
            <div className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-gradient-to-br from-[#1a1414] to-[#0c0a0a] p-5 shadow-[0_16px_40px_-24px_rgba(0,0,0,0.85)]">
              <div className="absolute inset-0 bg-gradient-to-br from-sky-500/10 to-transparent pointer-events-none" />
              <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500/15 border border-sky-400/25 text-sky-300 mb-3">
                <BarChart2 size={20} />
              </div>
              <p className="text-gray-500 text-[11px] uppercase tracking-wider font-semibold mb-1 relative">Average Score</p>
              <p className="text-2xl font-bold text-white tabular-nums relative">{avgScore}%</p>
            </div>
            <div className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-gradient-to-br from-[#1a1414] to-[#0c0a0a] p-5 shadow-[0_16px_40px_-24px_rgba(0,0,0,0.85)]">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent pointer-events-none" />
              <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/15 border border-emerald-400/25 text-emerald-300 mb-3">
                <CheckCircle size={20} />
              </div>
              <p className="text-gray-500 text-[11px] uppercase tracking-wider font-semibold mb-1 relative">Completion Rate</p>
              <p className="text-2xl font-bold text-white tabular-nums relative">{completionRate}%</p>
            </div>
            <div className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-gradient-to-br from-[#1a1414] to-[#0c0a0a] p-5 shadow-[0_16px_40px_-24px_rgba(0,0,0,0.85)]">
              <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-transparent pointer-events-none" />
              <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/15 border border-amber-400/25 text-amber-300 mb-3">
                <Clock size={20} />
              </div>
              <p className="text-gray-500 text-[11px] uppercase tracking-wider font-semibold mb-1 relative">Avg Time</p>
              <p className="text-2xl font-bold text-white tabular-nums relative">{avgTime}s</p>
            </div>
          </div>

          <div className="bg-gradient-to-br from-[#141212] via-[#101010] to-[#0c0a0a] border border-white/[0.07] rounded-2xl p-6 md:p-7 shadow-[0_24px_60px_-30px_rgba(0,0,0,0.9)]">
            <h3 className="text-lg font-bold text-white mb-6 pb-3 border-b border-white/[0.08]">
              Hint usage & completion time
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-300">
              <div className="bg-[#080808] border border-white/[0.06] rounded-xl p-5 shadow-inner">
                <p className="text-gray-500 text-[11px] uppercase tracking-wider font-semibold mb-2">Hints used</p>
                <p className="text-base font-semibold text-white leading-relaxed">
                  Letters: {hintLetters} | Words: {hintWords}
                </p>
              </div>
              <div className="bg-[#080808] border border-white/[0.06] rounded-xl p-5 shadow-inner">
                <p className="text-gray-500 text-[11px] uppercase tracking-wider font-semibold mb-2">Completion time</p>
                <p className="text-base font-semibold text-white leading-relaxed">
                  Min: {minTime}s | Avg: {avgTime}s | Max: {maxTime}s
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-[#141212] via-[#101010] to-[#0c0a0a] border border-white/[0.07] rounded-2xl p-6 md:p-7 shadow-[0_24px_60px_-30px_rgba(0,0,0,0.9)]">
            <h3 className="text-lg font-bold text-white mb-6 pb-3 border-b border-white/[0.08]">
              Hardest clues
            </h3>
            <div className="overflow-x-auto rounded-xl border border-white/[0.05]">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-white/[0.02] text-gray-400 text-xs uppercase tracking-wider border-b border-white/[0.08]">
                    <th className="py-3.5 font-semibold px-4">Clue</th>
                    <th className="py-3.5 font-semibold px-4 text-center">Wrong Attempts</th>
                  </tr>
                </thead>
                <tbody>
                  {hardestClues.length === 0 ? (
                    <tr>
                      <td colSpan="2" className="py-10 px-4 text-gray-500 text-center">
                        No clue data available.
                      </td>
                    </tr>
                  ) : (
                    hardestClues.map((item, idx) => (
                      <tr
                        key={item.clue_id}
                        className={`border-b border-white/[0.04] last:border-0 ${idx % 2 === 1 ? 'bg-white/[0.015]' : ''} hover:bg-white/[0.04] transition-colors`}
                      >
                        <td className="py-3.5 px-4 text-gray-200">{item.clue}</td>
                        <td className="py-3.5 px-4 text-center text-gray-400 tabular-nums font-medium">{item.wrong_attempts}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-b from-[#141212] to-[#0c0a0a] border border-white/[0.07] rounded-2xl p-6 md:p-7 shadow-[0_24px_60px_-30px_rgba(0,0,0,0.9)] flex flex-col">
          <h3 className="text-lg font-bold text-white mb-6 pb-3 border-b border-white/[0.08] text-center">
            Most incorrect clues
          </h3>
          <div className="flex-1">
            {incorrectClues.length === 0 ? (
              <div className="text-gray-500 text-center text-sm py-8 px-2 leading-relaxed">No incorrect clues yet.</div>
            ) : (
              <ul className="space-y-3">
                {incorrectClues.map((item) => (
                  <li key={item.clue_id} className="bg-[#080808] border border-white/[0.06] rounded-xl p-4 shadow-inner hover:border-amber-500/20 transition-colors">
                    <div className="flex items-start gap-3 text-gray-200">
                      <AlertTriangle size={18} className="text-amber-400 shrink-0 mt-0.5" />
                      <span className="font-medium text-sm leading-snug">{item.clue}</span>
                    </div>
                    <div className="text-xs text-gray-500 mt-2 pl-8 font-medium tabular-nums">
                      Wrong attempts: {item.wrong_attempts}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {isLoading && <div className="mt-4 text-sm text-gray-400">Loading analytics...</div>}
          {loadError && (
            <div className="mt-4 text-sm text-red-300 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">{loadError}</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeacherReport;
