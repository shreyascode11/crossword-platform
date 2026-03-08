import React, { useState } from 'react';
import { BarChart3, Mail, Database, Award, Shield, Target } from 'lucide-react';

const Report = () => {
  const [activeFilter, setActiveFilter] = useState('Monthly');
  const timeFilters = ['Today', 'Weekly', 'Monthly', 'All Time'];

  // 🌟 ZEROED OUT DATA: 5 Empty Placeholder Slots 🌟
  // I included placeholder icons to match the visual style of your mockup!
  const reportData = [
    { id: 1, icon: Mail, name: '-', attempts: 0, accuracy: '0%', time: '0 min', status: '-' },
    { id: 2, icon: Database, name: '-', attempts: 0, accuracy: '0%', time: '0 min', status: '-' },
    { id: 3, icon: Award, name: '-', attempts: 0, accuracy: '0%', time: '0 min', status: '-' },
    { id: 4, icon: Shield, name: '-', attempts: 0, accuracy: '0%', time: '0 min', status: '-' },
    { id: 5, icon: Mail, name: '-', attempts: 0, accuracy: '0%', time: '0 min', status: '-' },
  ];

  return (
    <div className="w-full max-w-5xl font-sans text-white">
      
      {/* 🌟 HEADER 🌟 */}
      <div className="flex items-center gap-4 mb-8">
        <div className="bg-gradient-to-br from-orange-500 to-red-600 p-3 rounded-xl shadow-[0_0_20px_rgba(229,57,53,0.3)]">
          <BarChart3 size={40} className="text-white" strokeWidth={2} />
        </div>
        <div>
          <h2 className="text-4xl font-bold text-[#e06666] tracking-wide drop-shadow-md">
            Report
          </h2>
          <p className="text-gray-400 font-serif italic text-lg mt-1">
            Get insight on your puzzle solving performances
          </p>
        </div>
      </div>

      <div className="bg-[#181313] rounded-3xl p-6 md:p-8 shadow-[0_10px_30px_rgba(0,0,0,0.8)] border border-white/5">
        
        {/* 🌟 FILTERS ROW 🌟 */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4 pl-2">
          <span className="text-gray-400 font-serif text-xl italic tracking-wide">Recent</span>
          
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

        {/* 🌟 REPORT TABLE 🌟 */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left min-w-[700px]">
            <thead>
              {/* The distinctive deep red rounded table header from the mockup */}
              <tr className="bg-[#6b1b1b] text-gray-200 font-serif text-xl tracking-wide shadow-md">
                <th className="py-4 px-6 rounded-l-2xl font-normal">Rank</th>
                <th className="py-4 px-6 font-normal text-center">Attempts</th>
                <th className="py-4 px-6 font-normal text-center">Accuracy</th>
                <th className="py-4 px-6 font-normal text-center">Time</th>
                <th className="py-4 px-6 rounded-r-2xl font-normal text-center">Status</th>
              </tr>
            </thead>
            <tbody>
              {/* Add a tiny gap after the header to match the mockup's floating header look */}
              <tr><td colSpan="5" className="h-4"></td></tr>
              
              {reportData.map((row) => {
                const IconComponent = row.icon;
                return (
                  <tr key={row.id} className="hover:bg-white/5 transition-colors group">
                    <td className="py-5 px-6 flex items-center gap-4">
                      {/* Placeholder Icon with a subtle gradient background */}
                      <div className="bg-gradient-to-br from-gray-700 to-gray-900 p-2 rounded-lg border border-white/10 group-hover:border-[#e06666]/50 transition-colors">
                        <IconComponent size={24} className="text-orange-400" strokeWidth={1.5} />
                      </div>
                      <span className="text-gray-300 text-lg">{row.name}</span>
                    </td>
                    <td className="py-5 px-6 text-gray-400 text-center text-lg">{row.attempts}</td>
                    <td className="py-5 px-6 text-gray-400 text-center text-lg">{row.accuracy}</td>
                    <td className="py-5 px-6 text-gray-400 text-center text-lg">{row.time}</td>
                    <td className="py-5 px-6 text-gray-400 text-center text-lg flex items-center justify-center gap-2">
                       <Target size={16} className="text-[#E53935]" /> {row.status}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
};

export default Report;