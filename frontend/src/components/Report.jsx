import React, { useEffect, useState } from 'react';
import { BarChart3 } from 'lucide-react';
import { fetchStudentHistory } from '../api';

const Report = ({ studentRegNo }) => {
  const [activeFilter, setActiveFilter] = useState('All Time');
  const [reportData, setReportData] = useState([]);
  const [loadError, setLoadError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const timeFilters = ['Today', 'Weekly', 'Monthly', 'All Time'];

  useEffect(() => {
    if (!studentRegNo) return;
    let mounted = true;
    const load = async () => {
      setIsLoading(true);
      setLoadError('');
      try {
        const data = await fetchStudentHistory(studentRegNo);
        if (!mounted) return;
        const mapped = (Array.isArray(data) ? data : []).map((item) => ({
          id: item.attempt_id,
          title: item.puzzle_title,
          score: Math.round(item.score || 0),
          time: item.completion_time || 0,
          rank: item.rank ?? '-',
          date: item.attempt_date || item.submitted_at,
        }));
        setReportData(mapped);
      } catch (error) {
        console.error('History load failed', error);
        if (!mounted) return;
        setLoadError('Unable to load attempt history.');
      } finally {
        if (mounted) setIsLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, [studentRegNo]);

  const formatDate = (value) => {
    if (!value) return '-';
    try {
      return new Date(value).toLocaleDateString();
    } catch {
      return '-';
    }
  };

  return (
    <div className="w-full max-w-5xl font-sans text-white">
      <div className="flex items-center gap-4 mb-8">
        <div className="bg-gradient-to-br from-orange-500 to-red-600 p-3 rounded-xl shadow-[0_0_20px_rgba(229,57,53,0.3)]">
          <BarChart3 size={40} className="text-white" strokeWidth={2} />
        </div>
        <div>
          <h2 className="text-4xl font-bold text-[#e06666] tracking-wide drop-shadow-md">
            Report
          </h2>
          <p className="text-gray-400 font-serif italic text-lg mt-1">
            Your crossword attempts and performance
          </p>
        </div>
      </div>

      <div className="bg-[#181313] rounded-3xl p-6 md:p-8 shadow-[0_10px_30px_rgba(0,0,0,0.8)] border border-white/5">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4 pl-2">
          <span className="text-gray-400 font-serif text-xl italic tracking-wide">History</span>
          <div className="flex flex-wrap gap-2">
            {timeFilters.map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 font-serif tracking-wide ${
                  activeFilter === filter
                    ? 'bg-[#5c1a1a] text-gray-200 border border-[#e06666]/30 shadow-[0_4px_15px_rgba(229,57,53,0.2)]'
                    : 'bg-transparent text-gray-400 hover:text-gray-200'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        {isLoading && <div className="text-sm text-gray-400 mb-2">Loading history...</div>}
        {loadError && <div className="text-sm text-red-400 mb-2">{loadError}</div>}

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left min-w-[700px]">
            <thead>
              <tr className="bg-[#6b1b1b] text-gray-200 font-serif text-xl tracking-wide shadow-md">
                <th className="py-4 px-6 rounded-l-2xl font-normal">Puzzle</th>
                <th className="py-4 px-6 font-normal text-center">Score</th>
                <th className="py-4 px-6 font-normal text-center">Time</th>
                <th className="py-4 px-6 font-normal text-center">Rank</th>
                <th className="py-4 px-6 rounded-r-2xl font-normal text-center">Date</th>
              </tr>
            </thead>
            <tbody>
              <tr><td colSpan="5" className="h-4"></td></tr>
              {reportData.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-6 text-gray-400 text-center">
                    No attempts yet.
                  </td>
                </tr>
              ) : (
                reportData.map((row) => (
                  <tr key={row.id} className="hover:bg-white/5 transition-colors group">
                    <td className="py-5 px-6 text-gray-300 text-lg">{row.title}</td>
                    <td className="py-5 px-6 text-gray-400 text-center text-lg">{row.score}%</td>
                    <td className="py-5 px-6 text-gray-400 text-center text-lg">{row.time}s</td>
                    <td className="py-5 px-6 text-gray-400 text-center text-lg">{row.rank}</td>
                    <td className="py-5 px-6 text-gray-400 text-center text-lg">{formatDate(row.date)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Report;
