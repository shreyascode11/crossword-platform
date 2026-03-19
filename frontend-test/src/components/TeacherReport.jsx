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
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h2 className="text-4xl font-bold text-[#e06666] tracking-wide drop-shadow-md">
            Puzzle Analytics
          </h2>
          <p className="text-gray-400 font-serif italic text-lg mt-1">
            {analytics.title ? `"${analytics.title}" — Teacher Insights` : 'Select a puzzle to view analytics'}
          </p>
        </div>

        <div className="flex flex-wrap gap-3 items-center">
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-400">Select Puzzle</span>
            <select
              className="bg-[#110c0b] border border-white/10 rounded-lg px-3 py-2 text-sm text-gray-200"
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

          <div className="flex gap-3">
            <button className="flex items-center gap-2 bg-[#1a1a1a] hover:bg-[#2a2a2a] text-gray-300 px-4 py-2.5 rounded-xl border border-white/10 transition-colors text-sm font-medium">
              <FileSpreadsheet size={18} className="text-green-500" /> Export CSV
            </button>
            <button className="flex items-center gap-2 bg-[#1a1a1a] hover:bg-[#2a2a2a] text-gray-300 px-4 py-2.5 rounded-xl border border-white/10 transition-colors text-sm font-medium">
              <FileText size={18} className="text-red-400" /> Export PDF
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-[#110c0b] border border-white/5 rounded-xl p-5 shadow-inner">
              <Users size={20} className="text-[#E53935] mb-2" />
              <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">Attempts</p>
              <p className="text-2xl font-bold text-white">{totalAttempts}</p>
            </div>
            <div className="bg-[#110c0b] border border-white/5 rounded-xl p-5 shadow-inner">
              <BarChart2 size={20} className="text-[#E53935] mb-2" />
              <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">Average Score</p>
              <p className="text-2xl font-bold text-white">{avgScore}%</p>
            </div>
            <div className="bg-[#110c0b] border border-white/5 rounded-xl p-5 shadow-inner">
              <CheckCircle size={20} className="text-[#E53935] mb-2" />
              <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">Completion Rate</p>
              <p className="text-2xl font-bold text-white">{completionRate}%</p>
            </div>
            <div className="bg-[#110c0b] border border-white/5 rounded-xl p-5 shadow-inner">
              <Clock size={20} className="text-[#E53935] mb-2" />
              <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">Avg Time</p>
              <p className="text-2xl font-bold text-white">{avgTime}s</p>
            </div>
          </div>

          <div className="bg-[#181313] border border-white/5 rounded-2xl p-6 shadow-[0_10px_30px_rgba(0,0,0,0.8)]">
            <h3 className="text-xl font-bold text-gray-200 mb-6 border-b-2 border-[#E53935] inline-block pb-1 pr-4">
              Hint Usage & Completion Time
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-300">
              <div className="bg-[#110c0b] border border-white/5 rounded-xl p-4">
                <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">Hints Used</p>
                <p className="text-lg font-semibold text-white">
                  Letters: {hintLetters} | Words: {hintWords}
                </p>
              </div>
              <div className="bg-[#110c0b] border border-white/5 rounded-xl p-4">
                <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">Completion Time</p>
                <p className="text-lg font-semibold text-white">
                  Min: {minTime}s | Avg: {avgTime}s | Max: {maxTime}s
                </p>
              </div>
            </div>
          </div>

          <div className="bg-[#181313] border border-white/5 rounded-2xl p-6 shadow-[0_10px_30px_rgba(0,0,0,0.8)]">
            <h3 className="text-xl font-bold text-gray-200 mb-6 border-b-2 border-[#E53935] inline-block pb-1 pr-4">
              Hardest Clues
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-gray-400 text-sm border-b border-white/10">
                    <th className="pb-3 font-medium px-2">Clue</th>
                    <th className="pb-3 font-medium px-2 text-center">Wrong Attempts</th>
                  </tr>
                </thead>
                <tbody>
                  {hardestClues.length === 0 ? (
                    <tr>
                      <td colSpan="2" className="py-4 px-2 text-gray-500 text-center">
                        No clue data available.
                      </td>
                    </tr>
                  ) : (
                    hardestClues.map((item) => (
                      <tr key={item.clue_id} className="border-b border-white/5 last:border-0">
                        <td className="py-4 px-2 text-gray-300">{item.clue}</td>
                        <td className="py-4 px-2 text-center text-gray-400">{item.wrong_attempts}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="bg-[#181313] border border-white/5 rounded-2xl p-6 shadow-[0_10px_30px_rgba(0,0,0,0.8)] flex flex-col">
          <h3 className="text-xl font-bold text-gray-200 mb-6 border-b-2 border-[#E53935] inline-block pb-1 w-full text-center">
            Most Incorrect Clues
          </h3>
          <div className="flex-1">
            {incorrectClues.length === 0 ? (
              <div className="text-gray-500 text-center">No incorrect clues yet.</div>
            ) : (
              <ul className="space-y-3">
                {incorrectClues.map((item) => (
                  <li key={item.clue_id} className="bg-[#110c0b] border border-white/5 rounded-xl p-4">
                    <div className="flex items-center gap-2 text-gray-300">
                      <AlertTriangle size={16} className="text-amber-400" />
                      <span className="font-medium">{item.clue}</span>
                    </div>
                    <div className="text-sm text-gray-500 mt-1">
                      Wrong attempts: {item.wrong_attempts}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {isLoading && <div className="mt-4 text-sm text-gray-400">Loading analytics...</div>}
          {loadError && <div className="mt-4 text-sm text-red-400">{loadError}</div>}
        </div>
      </div>
    </div>
  );
};

export default TeacherReport;
