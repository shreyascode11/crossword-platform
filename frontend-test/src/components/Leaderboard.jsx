import React, { useMemo } from 'react';
import { Medal } from 'lucide-react';

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
    <div className="w-full max-w-6xl font-sans text-white">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <div className="bg-gradient-to-br from-yellow-300 to-yellow-600 p-3 rounded-full shadow-[0_0_20px_rgba(234,179,8,0.4)]">
            <Medal size={36} className="text-[#3b2a05]" strokeWidth={1.5} />
          </div>
          <div>
            <h2 className="text-4xl font-bold text-[#e06666] tracking-wide drop-shadow-md">
              Puzzle Leaderboard
            </h2>
            <p className="text-gray-400 font-serif italic text-lg mt-1">
              All students who attempted this puzzle
            </p>
          </div>
        </div>

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
      </div>

      <div className="bg-[#181313] rounded-2xl p-6 md:p-8 shadow-[0_10px_30px_rgba(0,0,0,0.8)] border border-white/5">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-gray-400 text-sm border-b border-white/10">
                <th className="pb-3 font-medium px-2">Rank</th>
                <th className="pb-3 font-medium px-2">Student Name</th>
                <th className="pb-3 font-medium px-2">Registration No</th>
                <th className="pb-3 font-medium px-2 text-center">Score</th>
                <th className="pb-3 font-medium px-2 text-center">Completion Time</th>
                <th className="pb-3 font-medium px-2 text-center">Hints Used</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-6 text-center text-gray-400">
                    {isLoading ? 'Loading leaderboard...' : 'No attempts yet.'}
                  </td>
                </tr>
              ) : (
                rows.map((row) => (
                  <tr
                    key={row.id || row.attempt_id || `${row.student_reg_no}-${row.rank}`}
                    className="border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors"
                  >
                    <td className="py-4 px-2 text-gray-300 font-medium">{row.rank}</td>
                    <td className="py-4 px-2 text-gray-300">{row.student_name || 'Student'}</td>
                    <td className="py-4 px-2 text-gray-400">{row.student_reg_no || '-'}</td>
                    <td className="py-4 px-2 text-center text-gray-400">{Math.round(row.score || 0)}%</td>
                    <td className="py-4 px-2 text-center text-gray-400">{row.completion_time || 0}s</td>
                    <td className="py-4 px-2 text-center text-gray-400">
                      {Number(row.hint_letters_used || 0) + Number(row.hint_words_used || 0)}
                      <span className="text-xs text-gray-500">
                        {` (L${row.hint_letters_used || 0}/W${row.hint_words_used || 0})`}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {loadError && <div className="mt-4 text-sm text-red-400">{loadError}</div>}
      </div>
    </div>
  );
};

export default Leaderboard;
