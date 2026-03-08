import React, { useState } from 'react';
import { 
  Download, FileText, FileSpreadsheet, Users, 
  BarChart2, Clock, CheckCircle, ToggleRight, ToggleLeft
} from 'lucide-react';

const TeacherReport = () => {
  // 🌟 STATE FOR TEACHER TOGGLES 🌟
  const [releaseScores, setReleaseScores] = useState(false);
  const [releaseSolutions, setReleaseSolutions] = useState(false);

  // Dummy Data for Item Analysis
  const itemAnalysis = [
    { id: '1 Across', clue: 'The creator in Hindu trinity (6)', accuracy: '85%', commonWrong: 'VISHNU' },
    { id: '3 Down', clue: 'Illusion or magic (4)', accuracy: '42%', commonWrong: 'AURA' },
    { id: '4 Across', clue: 'Ultimate reality (7)', accuracy: '91%', commonWrong: '-' },
    { id: '7 Down', clue: 'Cycle of rebirth (7)', accuracy: '68%', commonWrong: 'KARMA' },
  ];

  return (
    <div className="w-full max-w-6xl font-sans text-white pb-10">
      
      {/* 🌟 HEADER & EXPORT BUTTONS 🌟 */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h2 className="text-4xl font-bold text-[#e06666] tracking-wide drop-shadow-md">
            Puzzle Analysis
          </h2>
          <p className="text-gray-400 font-serif italic text-lg mt-1">
            "Bhagavad Gita Basics" — Class Performance
          </p>
        </div>
        
        {/* Export Buttons */}
        <div className="flex gap-3">
          <button className="flex items-center gap-2 bg-[#1a1a1a] hover:bg-[#2a2a2a] text-gray-300 px-4 py-2.5 rounded-xl border border-white/10 transition-colors text-sm font-medium">
            <FileSpreadsheet size={18} className="text-green-500" /> Export CSV
          </button>
          <button className="flex items-center gap-2 bg-[#1a1a1a] hover:bg-[#2a2a2a] text-gray-300 px-4 py-2.5 rounded-xl border border-white/10 transition-colors text-sm font-medium">
            <FileText size={18} className="text-red-400" /> Export PDF
          </button>
        </div>
      </div>

      {/* 🌟 TEACHER ACTION TOGGLES 🌟 */}
      <div className="bg-[#181313] rounded-2xl p-4 md:p-6 shadow-[0_10px_30px_rgba(0,0,0,0.8)] border border-white/5 mb-6 flex flex-wrap gap-8 items-center">
        <h3 className="text-gray-300 font-serif text-lg mr-4">Student Access Controls:</h3>
        
        {/* Toggle 1: Release Scores */}
        <div 
          className="flex items-center gap-3 cursor-pointer group"
          onClick={() => setReleaseScores(!releaseScores)}
        >
          {releaseScores ? (
            <ToggleRight size={36} className="text-[#E53935] drop-shadow-[0_0_10px_rgba(229,57,53,0.5)] transition-all" />
          ) : (
            <ToggleLeft size={36} className="text-gray-600 group-hover:text-gray-400 transition-all" />
          )}
          <span className={`font-medium ${releaseScores ? 'text-white' : 'text-gray-500'}`}>Release Scores</span>
        </div>

        {/* Toggle 2: Release Solutions */}
        <div 
          className="flex items-center gap-3 cursor-pointer group"
          onClick={() => setReleaseSolutions(!releaseSolutions)}
        >
          {releaseSolutions ? (
            <ToggleRight size={36} className="text-[#E53935] drop-shadow-[0_0_10px_rgba(229,57,53,0.5)] transition-all" />
          ) : (
            <ToggleLeft size={36} className="text-gray-600 group-hover:text-gray-400 transition-all" />
          )}
          <span className={`font-medium ${releaseSolutions ? 'text-white' : 'text-gray-500'}`}>Release Solutions</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* 🌟 LEFT COLUMN: STATS & ITEM ANALYSIS 🌟 */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          
          {/* Summary Report Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-[#110c0b] border border-white/5 rounded-xl p-5 shadow-inner">
              <Users size={20} className="text-[#E53935] mb-2" />
              <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">Participation</p>
              <p className="text-2xl font-bold text-white">48<span className="text-gray-500 text-lg">/50</span></p>
            </div>
            
            <div className="bg-[#110c0b] border border-white/5 rounded-xl p-5 shadow-inner">
              <BarChart2 size={20} className="text-[#E53935] mb-2" />
              <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">Min/Avg/Max</p>
              <p className="text-xl font-bold text-white">15 <span className="text-gray-600 font-normal">/</span> 72 <span className="text-gray-600 font-normal">/</span> 100</p>
            </div>

            <div className="bg-[#110c0b] border border-white/5 rounded-xl p-5 shadow-inner">
              <Clock size={20} className="text-[#E53935] mb-2" />
              <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">Avg Time</p>
              <p className="text-2xl font-bold text-white">12<span className="text-gray-500 text-lg">m</span> 30<span className="text-gray-500 text-lg">s</span></p>
            </div>

            <div className="bg-[#110c0b] border border-white/5 rounded-xl p-5 shadow-inner">
              <CheckCircle size={20} className="text-[#E53935] mb-2" />
              <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">Grid Accuracy</p>
              <p className="text-2xl font-bold text-white">76%</p>
            </div>
          </div>

          {/* Item Analysis Table */}
          <div className="bg-[#181313] border border-white/5 rounded-2xl p-6 shadow-[0_10px_30px_rgba(0,0,0,0.8)]">
            <h3 className="text-xl font-bold text-gray-200 mb-6 border-b-2 border-[#E53935] inline-block pb-1 pr-4">
              Item Analysis (Accuracy per Clue)
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-gray-400 text-sm border-b border-white/10">
                    <th className="pb-3 font-medium px-2">ID</th>
                    <th className="pb-3 font-medium px-2">Clue</th>
                    <th className="pb-3 font-medium text-center px-2">Accuracy</th>
                    <th className="pb-3 font-medium text-center px-2">Common Wrong Answer</th>
                  </tr>
                </thead>
                <tbody>
                  {itemAnalysis.map((item, idx) => (
                    <tr key={idx} className="border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors">
                      <td className="py-4 px-2 text-gray-300 font-medium whitespace-nowrap">{item.id}</td>
                      <td className="py-4 px-2 text-gray-400">{item.clue}</td>
                      <td className="py-4 px-2 text-center">
                        <span className={`px-2 py-1 rounded text-xs font-bold ${
                          parseInt(item.accuracy) > 80 ? 'bg-green-500/10 text-green-400' : 
                          parseInt(item.accuracy) > 50 ? 'bg-yellow-500/10 text-yellow-400' : 'bg-red-500/10 text-red-400'
                        }`}>
                          {item.accuracy}
                        </span>
                      </td>
                      <td className="py-4 px-2 text-gray-500 text-center font-serif italic">{item.commonWrong}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* 🌟 RIGHT COLUMN: CROSSWORD LAYOUT PREVIEW 🌟 */}
        <div className="bg-[#181313] border border-white/5 rounded-2xl p-6 shadow-[0_10px_30px_rgba(0,0,0,0.8)] flex flex-col items-center">
          <h3 className="text-xl font-bold text-gray-200 mb-6 border-b-2 border-[#E53935] inline-block pb-1 w-full text-center">
            Layout Preview
          </h3>
          
          {/* Simulated Crossword Grid using CSS Grid */}
          <div className="grid grid-cols-6 gap-1 p-2 bg-[#0a0a0a] rounded-lg border border-white/10 w-full aspect-square max-w-[300px]">
            {/* Row 1 */}
            <div className="bg-white rounded-sm relative"><span className="absolute top-0.5 left-1 text-[8px] text-black font-bold">1</span></div>
            <div className="bg-white rounded-sm"></div>
            <div className="bg-white rounded-sm"></div>
            <div className="bg-white rounded-sm relative"><span className="absolute top-0.5 left-1 text-[8px] text-black font-bold">2</span></div>
            <div className="bg-white rounded-sm"></div>
            <div className="bg-white rounded-sm"></div>
            {/* Row 2 */}
            <div className="bg-[#1a1a1a] rounded-sm"></div>
            <div className="bg-[#1a1a1a] rounded-sm"></div>
            <div className="bg-white rounded-sm relative"><span className="absolute top-0.5 left-1 text-[8px] text-black font-bold">3</span></div>
            <div className="bg-[#1a1a1a] rounded-sm"></div>
            <div className="bg-[#1a1a1a] rounded-sm"></div>
            <div className="bg-white rounded-sm"></div>
            {/* Row 3 */}
            <div className="bg-white rounded-sm relative"><span className="absolute top-0.5 left-1 text-[8px] text-black font-bold">4</span></div>
            <div className="bg-white rounded-sm"></div>
            <div className="bg-white rounded-sm"></div>
            <div className="bg-white rounded-sm"></div>
            <div className="bg-[#1a1a1a] rounded-sm"></div>
            <div className="bg-white rounded-sm relative"><span className="absolute top-0.5 left-1 text-[8px] text-black font-bold">5</span></div>
            {/* Row 4 */}
            <div className="bg-white rounded-sm relative"><span className="absolute top-0.5 left-1 text-[8px] text-black font-bold">6</span></div>
            <div className="bg-[#1a1a1a] rounded-sm"></div>
            <div className="bg-white rounded-sm relative"><span className="absolute top-0.5 left-1 text-[8px] text-black font-bold">7</span></div>
            <div className="bg-[#1a1a1a] rounded-sm"></div>
            <div className="bg-[#1a1a1a] rounded-sm"></div>
            <div className="bg-[#1a1a1a] rounded-sm"></div>
            {/* Row 5 */}
            <div className="bg-white rounded-sm"></div>
            <div className="bg-[#1a1a1a] rounded-sm"></div>
            <div className="bg-white rounded-sm"></div>
            <div className="bg-white rounded-sm relative"><span className="absolute top-0.5 left-1 text-[8px] text-black font-bold">8</span></div>
            <div className="bg-white rounded-sm"></div>
            <div className="bg-white rounded-sm"></div>
            {/* Row 6 */}
            <div className="bg-[#1a1a1a] rounded-sm"></div>
            <div className="bg-[#1a1a1a] rounded-sm"></div>
            <div className="bg-white rounded-sm"></div>
            <div className="bg-[#1a1a1a] rounded-sm"></div>
            <div className="bg-[#1a1a1a] rounded-sm"></div>
            <div className="bg-[#1a1a1a] rounded-sm"></div>
          </div>
          
          <p className="text-gray-500 text-sm mt-6 text-center italic">
            Visual map of cells, numbering, and clue placement.
          </p>
        </div>

      </div>
    </div>
  );
};

export default TeacherReport;