import React, { useMemo } from 'react';
import { Search, Check } from 'lucide-react';

const Reanalyse = ({ history = [], puzzles = [] }) => {
  const puzzleById = useMemo(
    () => Object.fromEntries((Array.isArray(puzzles) ? puzzles : []).map((p) => [p.id, p])),
    [puzzles]
  );

  const stats = useMemo(() => {
    const attempts = Array.isArray(history) ? history : [];
    if (!attempts.length) {
      return {
        weakest: '-',
        strongest: '-',
        hardest: '-',
        important: '-',
        mistakes: [],
        suggestions: [
          'Solve more puzzles to generate insights.',
          'Focus on accuracy before speed.',
        ],
      };
    }

    const sortedByScore = [...attempts].sort((a, b) => (a.score || 0) - (b.score || 0));
    const weakestAttempt = sortedByScore[0];
    const strongestAttempt = sortedByScore[sortedByScore.length - 1];
    const recentAttempt = [...attempts].sort(
      (a, b) => new Date(b.attempt_date || b.submitted_at) - new Date(a.attempt_date || a.submitted_at)
    )[0];

    const mistakes = attempts
      .map((attempt) => {
        const puzzle = puzzleById[attempt.puzzle_id];
        const total = puzzle?.clue_count ?? puzzle?.clues?.length ?? 0;
        const solved = attempt.solved_words_count ?? 0;
        return {
          id: attempt.attempt_id,
          puzzle: attempt.puzzle_title,
          wrongWords: Math.max(0, total - solved),
          difficulty: puzzle?.difficulty || '-',
        };
      })
      .sort((a, b) => b.wrongWords - a.wrongWords)
      .slice(0, 4);

    const suggestions = [
      `Your strongest puzzle: ${strongestAttempt.puzzle_title || '-'}.`,
      `Your weakest puzzle: ${weakestAttempt.puzzle_title || '-'}.`,
      'Aim to reduce wrong words on harder puzzles.',
    ];

    return {
      weakest: weakestAttempt.puzzle_title || '-',
      strongest: strongestAttempt.puzzle_title || '-',
      hardest: weakestAttempt.puzzle_title || '-',
      important: recentAttempt.puzzle_title || '-',
      mistakes,
      suggestions,
    };
  }, [history, puzzleById]);

  const summaryCards = [
    { title: 'Weakest Puzzle', value: stats.weakest },
    { title: 'Strongest Puzzle', value: stats.strongest },
    { title: 'Hardest Puzzle', value: stats.hardest },
    { title: 'Most Recent Puzzle', value: stats.important },
  ];

  return (
    <div className="w-full max-w-5xl font-sans text-white">
      <div className="flex items-center gap-4 mb-8">
        <div className="bg-gradient-to-br from-orange-500 to-red-600 p-3 rounded-full shadow-[0_0_20px_rgba(229,57,53,0.3)]">
          <Search size={36} className="text-white" strokeWidth={2.5} />
        </div>
        <div>
          <h2 className="text-4xl font-bold text-[#e06666] tracking-wide drop-shadow-md">
            Reanalyse Puzzle Performance
          </h2>
          <p className="text-gray-400 font-serif italic text-lg mt-1">
            Insights based on your attempt history
          </p>
        </div>
      </div>

      <div className="bg-[#181313] rounded-3xl p-6 md:p-8 shadow-[0_10px_30px_rgba(0,0,0,0.8)] border border-white/5">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {summaryCards.map((card, index) => (
            <div key={index} className="bg-[#0a0a0a] border border-white/5 rounded-xl p-6 flex flex-col items-center justify-center shadow-inner text-center">
              <h3 className="text-gray-200 font-medium text-sm md:text-base mb-3">{card.title}</h3>
              <p className="text-lg md:text-xl font-semibold text-[#E53935] tracking-wide text-center">{card.value}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-6">
          <div className="bg-[#0a0a0a] border border-white/5 rounded-2xl p-6 shadow-inner">
            <h3 className="text-2xl font-bold text-gray-200 mb-6 border-b-2 border-[#E53935] inline-block pb-1 pr-4">
              Mistake Analysis
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left min-w-[400px]">
                <thead>
                  <tr className="border-b border-white/10 text-gray-300 font-serif text-lg">
                    <th className="py-3 px-2 font-normal">Puzzle</th>
                    <th className="py-3 px-2 font-normal text-center">Wrong Words</th>
                    <th className="py-3 px-2 font-normal text-center">Difficulty</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.mistakes.length === 0 ? (
                    <tr>
                      <td colSpan="3" className="py-4 text-gray-400 text-center">
                        No attempts yet.
                      </td>
                    </tr>
                  ) : (
                    stats.mistakes.map((row) => (
                      <tr key={row.id} className="hover:bg-white/5 transition-colors border-b border-white/5 last:border-0">
                        <td className="py-4 px-2 text-gray-400 text-lg">{row.puzzle}</td>
                        <td className="py-4 px-2 text-gray-300 text-center text-lg">{row.wrongWords}</td>
                        <td className="py-4 px-2 text-gray-400 text-center text-lg">{row.difficulty}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-[#0a0a0a] border border-white/5 rounded-2xl p-6 shadow-inner flex flex-col">
            <h3 className="text-2xl font-bold text-gray-200 mb-2">AI Suggestion</h3>
            <p className="text-gray-400 font-serif text-lg mb-6">Suggestion to improve:</p>

            <div className="flex flex-col gap-4 flex-1">
              {stats.suggestions.map((suggestion, index) => (
                <div key={index} className="flex items-start gap-3">
                  <Check size={20} className="text-[#E53935] mt-1 shrink-0" strokeWidth={3} />
                  <span className="text-gray-200 text-lg italic font-serif leading-snug">
                    {suggestion}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reanalyse;
