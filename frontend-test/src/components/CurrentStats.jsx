import React from 'react';
import { ChevronDown, MapPin, Target, Star } from 'lucide-react';

const CurrentStats = ({ stats, puzzles = [] }) => {
  const totalAttempts = puzzles.reduce((sum, puzzle) => sum + (puzzle.attempts || 0), 0);
  const avgScoreNumeric = Number.parseFloat(String(stats?.avg_score || '0').replace('%', '')) || 0;
  const correctWords = Math.round((totalAttempts * avgScoreNumeric) / 100);
  const performanceData = (puzzles.length > 0 ? puzzles : [
    { title: '-', points: '0%' },
    { title: '-', points: '0%' },
    { title: '-', points: '0%' },
    { title: '-', points: '0%' },
    { title: '-', points: '0%' },
  ]).slice(0, 5).map((item) => ({
    name: item.title || '-',
    score: Number.parseFloat(String(item.points || '0').replace('%', '')) || 0,
  }));

  return (
    <div className="w-full max-w-5xl font-sans text-white">
      
      {/* 🌟 HEADER 🌟 */}
      <h2 className="text-4xl font-bold text-[#d88c8c] mb-6 tracking-wide drop-shadow-md">
        Current Statistics
      </h2>

      <div className="bg-[#18181a] rounded-2xl p-6 md:p-8 shadow-[0_15px_40px_rgba(0,0,0,0.6)] border border-white/5">
        
        {/* 🌟 TOP ROW: 4 STAT CARDS 🌟 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          
          {/* Card 1 */}
          <div className="bg-[#111111] rounded-xl p-6 flex flex-col items-center justify-center border border-white/5 shadow-inner">
            <div className="text-5xl font-semibold mb-3 tracking-tight">{totalAttempts}</div>
            <div className="flex items-center gap-2 text-sm text-gray-300 font-medium">
              <ChevronDown size={18} color="#E53935" strokeWidth={3} /> Total Attempts
            </div>
          </div>
          
          {/* Card 2 */}
          <div className="bg-[#111111] rounded-xl p-6 flex flex-col items-center justify-center border border-white/5 shadow-inner">
            <div className="text-5xl font-semibold mb-3 tracking-tight">{correctWords}</div>
            <div className="flex items-center gap-2 text-sm text-gray-300 font-medium">
              <MapPin size={18} color="#E53935" className="fill-[#E53935]/20" /> Correct Words
            </div>
          </div>
          
          {/* Card 3 */}
          <div className="bg-[#111111] rounded-xl p-6 flex flex-col items-center justify-center border border-white/5 shadow-inner">
            <div className="text-5xl font-semibold mb-3 tracking-tight">{stats?.avg_score || '0%'}</div>
            <div className="flex items-center gap-2 text-sm text-gray-300 font-medium">
              <Target size={18} color="#E53935" /> Accuracy Rate
            </div>
          </div>
          
          {/* Card 4 */}
          <div className="bg-[#111111] rounded-xl p-6 flex flex-col items-center justify-center border border-white/5 shadow-inner">
            <div className="text-4xl lg:text-5xl font-semibold mb-3 tracking-tight">{stats?.attainment || '0%'}</div>
            <div className="flex items-center gap-2 text-sm text-gray-300 font-medium">
              <Star size={18} color="#E53935" className="fill-[#E53935]" /> Avg Solv Time
            </div>
          </div>

        </div>

        {/* 🌟 BOTTOM ROW: TWO COLUMNS 🌟 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* LEFT COLUMN: Puzzle Performance */}
          <div className="lg:col-span-2 bg-[#111111] rounded-xl p-6 border border-white/5 shadow-inner">
            <h3 className="text-xl font-bold text-gray-200 mb-6 border-b-2 border-[#E53935] inline-block pb-1 pr-4">
              Puzzle Performance
            </h3>
            
            <div className="flex flex-col gap-5">
              {performanceData.map((item, index) => (
                <div key={index} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4">
                  <span className="text-sm text-gray-500 font-medium w-40 truncate">
                    {item.name}
                  </span>
                  
                  {/* Progress Bar Container */}
                  <div className="flex-1 flex items-center gap-4">
                    <div className="w-full h-3 bg-[#2a2a2a] rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-[#E53935] rounded-full transition-all duration-1000 ease-out"
                        style={{ width: `${item.score}%` }}
                      ></div>
                    </div>
                    <span className="text-xs text-gray-500 font-medium w-8 text-right">
                      {item.score}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT COLUMN: Weekly Activity Chart */}
          <div className="lg:col-span-1 bg-[#111111] rounded-xl p-6 border border-white/5 shadow-inner flex flex-col">
            <h3 className="text-xl font-bold text-gray-200 mb-6 border-b-2 border-[#E53935] inline-block pb-1 pr-4 self-start">
              Weekly Activity
            </h3>
            
            {/* Custom SVG Line Chart - FIXED: Flattened to Zero */}
            <div className="flex-1 relative w-full min-h-[160px] mt-2 border-l border-b border-gray-700">
              
              {/* Y-Axis Labels */}
              <div className="absolute -left-6 top-0 text-[10px] text-gray-600">100</div>
              <div className="absolute -left-5 top-1/4 text-[10px] text-gray-600">80</div>
              <div className="absolute -left-5 top-1/2 text-[10px] text-gray-600">60</div>

              {/* Grid Lines */}
              <div className="absolute top-1/4 w-full border-t border-gray-800/30"></div>
              <div className="absolute top-1/2 w-full border-t border-gray-800/30"></div>
              <div className="absolute left-1/4 h-full border-l border-gray-800/30"></div>
              <div className="absolute left-1/2 h-full border-l border-gray-800/30"></div>
              <div className="absolute left-3/4 h-full border-l border-gray-800/30"></div>

              {/* The Line and Dots - Flattened along the bottom (y=95) */}
              <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full absolute inset-0 overflow-visible">
                <path 
                  d="M 0,95 L 100,95" 
                  fill="none" 
                  stroke="rgba(229,57,53,0.1)" 
                  strokeWidth="6" 
                  className="blur-sm"
                />
                <path 
                  d="M 0,95 L 100,95" 
                  fill="none" 
                  stroke="#E53935" 
                  strokeWidth="2.5" 
                />
                <circle cx="5" cy="95" r="2.5" fill="#111111" stroke="#E53935" strokeWidth="1.5" />
                <circle cx="28" cy="95" r="2.5" fill="#111111" stroke="#E53935" strokeWidth="1.5" />
                <circle cx="50" cy="95" r="2.5" fill="#111111" stroke="#E53935" strokeWidth="1.5" />
                <circle cx="75" cy="95" r="2.5" fill="#111111" stroke="#E53935" strokeWidth="1.5" />
                <circle cx="95" cy="95" r="2.5" fill="#111111" stroke="#E53935" strokeWidth="1.5" />
              </svg>

              {/* X-Axis Labels - Reset to placeholders */}
              <div className="absolute -bottom-6 w-full flex justify-between text-[10px] text-gray-600 px-1">
                <span>-</span>
                <span>-</span>
                <span>-</span>
                <span>-</span>
                <span>-</span>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default CurrentStats;
