import React, { useState } from 'react';
import { Medal, Award, Filter } from 'lucide-react';

const Leaderboard = () => {
  const [activeFilter, setActiveFilter] = useState('Weekly');

  const timeFilters = ['Today', 'Weekly', 'Monthly', 'All Time'];

  // 🌟 ZEROED OUT DATA: 5 Empty Placeholder Slots 🌟
  const leaderboardData = [
    { rank: 1, name: '-', solved: 0, points: 0 },
    { rank: 2, name: '-', solved: 0, points: 0 },
    { rank: 3, name: '-', solved: 0, points: 0 },
    { rank: 4, name: '-', solved: 0, points: 0 },
    { rank: 5, name: '-', solved: 0, points: 0 },
  ];

  return (
    <div className="w-full max-w-5xl font-sans text-white">
      
      {/* 🌟 HEADER 🌟 */}
      <div className="flex items-center gap-4 mb-8">
        <div className="bg-gradient-to-br from-yellow-300 to-yellow-600 p-3 rounded-full shadow-[0_0_20px_rgba(234,179,8,0.4)]">
          <Medal size={40} className="text-[#3b2a05]" strokeWidth={1.5} />
        </div>
        <div>
          <h2 className="text-4xl font-bold text-[#e06666] tracking-wide drop-shadow-md">
            Puzzle LeaderBoard
          </h2>
          <p className="text-gray-400 font-serif italic text-lg mt-1">
            Compare your scores with other players
          </p>
        </div>
      </div>

      {/* 🌟 TIME FILTERS (Now fully responsive with flex-wrap) 🌟 */}
      <div className="flex flex-wrap gap-2 mb-6 ml-2">
        {timeFilters.map((filter) => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
              activeFilter === filter 
                ? 'bg-[#E53935] text-white shadow-[0_4px_15px_rgba(229,57,53,0.4)]' 
                : 'bg-[#221515] text-gray-400 hover:bg-[#332020]'
            }`}
          >
            {filter}
          </button>
        ))}
      </div>

      {/* 🌟 TOP 3 PODIUM CARDS 🌟 */}
      <div className="bg-[#181313] rounded-2xl p-6 md:p-8 shadow-[0_10px_30px_rgba(0,0,0,0.8)] border border-white/5 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* 1st Place */}
          <div className="bg-[#110c0b] border border-white/5 rounded-xl p-6 flex flex-col items-center justify-center shadow-inner relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-yellow-500 to-transparent opacity-50"></div>
            <Award size={40} className="text-yellow-500 mb-3 drop-shadow-[0_0_10px_rgba(234,179,8,0.5)]" strokeWidth={1.5} />
            <h3 className="text-3xl font-serif text-[#E53935] mb-1">{leaderboardData[0].name}</h3>
            <p className="text-gray-400 text-lg">{leaderboardData[0].points}</p>
          </div>

          {/* 2nd Place */}
          <div className="bg-[#110c0b] border border-white/5 rounded-xl p-6 flex flex-col items-center justify-center shadow-inner relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-gray-300 to-transparent opacity-50"></div>
            <Award size={40} className="text-gray-300 mb-3 drop-shadow-[0_0_10px_rgba(209,213,219,0.3)]" strokeWidth={1.5} />
            <h3 className="text-3xl font-serif text-[#E53935] mb-1">{leaderboardData[1].name}</h3>
            <p className="text-gray-400 text-lg">{leaderboardData[1].points}</p>
          </div>

          {/* 3rd Place */}
          <div className="bg-[#110c0b] border border-white/5 rounded-xl p-6 flex flex-col items-center justify-center shadow-inner relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-orange-400 to-transparent opacity-50"></div>
            <Award size={40} className="text-orange-400 mb-3 drop-shadow-[0_0_10px_rgba(251,146,60,0.3)]" strokeWidth={1.5} />
            <h3 className="text-3xl font-serif text-[#E53935] mb-1">{leaderboardData[2].name}</h3>
            <p className="text-gray-400 text-lg">{leaderboardData[2].points}</p>
          </div>

        </div>
      </div>

      {/* 🌟 LEADERBOARD TABLE 🌟 */}
      <div className="bg-[#181313] rounded-2xl p-6 md:p-8 shadow-[0_10px_30px_rgba(0,0,0,0.8)] border border-white/5">
        
        {/* Filter Pill */}
        <div className="mb-6">
          <button className="flex items-center gap-2 px-5 py-2 rounded-full bg-[#110c0b] border border-white/10 text-gray-300 hover:bg-white/5 transition-colors text-sm w-max">
            <Filter size={16} /> Filter
          </button>
        </div>

        {/* Table (Responsive wrapping) */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left min-w-[500px]">
            <thead>
              <tr>
                <th className="py-4 px-6 font-serif text-lg font-normal text-gray-300 border-b border-white/10 whitespace-nowrap">Rank</th>
                <th className="py-4 px-6 font-serif text-lg font-normal text-gray-300 border-b border-white/10 whitespace-nowrap">Username</th>
                <th className="py-4 px-6 font-serif text-lg font-normal text-gray-300 border-b border-white/10 text-center whitespace-nowrap">No. of Puzzles Solved</th>
                <th className="py-4 px-6 font-serif text-lg font-normal text-gray-300 border-b border-white/10 text-center whitespace-nowrap">Total Points</th>
              </tr>
            </thead>
            <tbody>
              {leaderboardData.map((row) => (
                <tr key={row.rank} className="hover:bg-white/5 transition-colors border-b border-white/5 last:border-0">
                  <td className="py-4 px-6 text-gray-400 text-lg">{row.rank}</td>
                  <td className="py-4 px-6 text-gray-200 text-lg">{row.name}</td>
                  <td className="py-4 px-6 text-white text-center text-lg">{row.solved}</td>
                  <td className="py-4 px-6 text-gray-400 text-center text-lg">{row.points}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

export default Leaderboard;