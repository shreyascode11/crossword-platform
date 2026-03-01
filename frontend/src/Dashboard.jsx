import React from 'react';
import { 
  Search, LayoutDashboard, List, Bell, History, RotateCcw, 
  Puzzle, Lightbulb, Target, Star 
} from 'lucide-react';

const Dashboard = () => {
  // FIXED: Reset all table data to empty/zero states
  const puzzleData = [
    { name: '-', attempts: 0, points: '0%', status: '-' },
    { name: '-', attempts: 0, points: '0%', status: '-' },
    { name: '-', attempts: 0, points: '0%', status: '-' },
    { name: '-', attempts: 0, points: '0%', status: '-' },
  ];

  return (
    <div className="flex min-h-screen bg-[#050505] text-white font-sans">
      
      {/* SIDEBAR */}
      <aside className="w-[260px] bg-[#0f0a0a] p-8 border-r border-[#221515] flex flex-col">
        {/* FIXED: Added elegant serif font */}
        <h2 className="font-serif italic text-3xl mb-10 pl-2 text-gray-100">Dashboard</h2>
        
        <nav className="flex flex-col gap-3">
          <a href="#" className="flex items-center gap-4 px-5 py-3 rounded-full bg-[#4a4a4a] text-white font-bold transition-all">
            <LayoutDashboard size={20} />
            <span>Dashboard</span>
          </a>
          <a href="#" className="flex items-center gap-4 px-5 py-3 rounded-full text-gray-300 hover:bg-white/5 transition-all">
            <List size={20} />
            <span>Current Stats</span>
          </a>
          <a href="#" className="flex items-center gap-4 px-5 py-3 rounded-full text-gray-300 hover:bg-white/5 transition-all">
            <Bell size={20} />
            <span>Scores</span>
          </a>
          <a href="#" className="flex items-center gap-4 px-5 py-3 rounded-full text-gray-300 hover:bg-white/5 transition-all">
            <History size={20} />
            <span>Report</span>
          </a>
          <a href="#" className="flex items-center gap-4 px-5 py-3 rounded-full text-gray-300 hover:bg-white/5 transition-all">
            <RotateCcw size={20} />
            <span>Reanalyse</span>
          </a>
        </nav>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col bg-[radial-gradient(circle_at_top_left,_#1a1010_0%,_#050505_100%)]">
        
        {/* TOP HEADER */}
        <header className="px-10 py-8 bg-gradient-to-r from-[#1f1816] to-[#0a0808] border-b border-white/5 flex items-center">
          <div className="flex items-center gap-4">
            <Search size={32} className="text-gray-400" />
            <h1 className="font-serif text-4xl text-gray-200 m-0">Welcome 👋</h1>
          </div>
        </header>

        {/* DASHBOARD CONTENT PANEL */}
        {/* FIXED: Adjusted the dark maroon/brown box shadow and background */}
        <div className="m-10 bg-[#1e1514] rounded-3xl p-8 flex-1 shadow-[0_10px_40px_rgba(0,0,0,0.6)] border border-white/5">
          
          {/* STATS GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            {/* Stat Card 1 */}
            <div className="bg-[#110c0b] border border-white/5 rounded-2xl py-8 px-4 flex flex-col items-center justify-center shadow-inner">
              {/* FIXED: Values set to 0, applied Serif font */}
              <div className="font-serif text-5xl mb-3 text-white">0</div>
              <div className="flex items-center gap-2 text-sm text-gray-300 font-medium">
                <Puzzle size={18} color="#E53935" /> Total Puzzles
              </div>
            </div>
            
            {/* Stat Card 2 */}
            <div className="bg-[#110c0b] border border-white/5 rounded-2xl py-8 px-4 flex flex-col items-center justify-center shadow-inner">
              <div className="font-serif text-5xl mb-3 text-white">0</div>
              <div className="flex items-center gap-2 text-sm text-gray-300 font-medium">
                <Lightbulb size={18} color="#E53935" /> Assistances
              </div>
            </div>
            
            {/* Stat Card 3 */}
            <div className="bg-[#110c0b] border border-white/5 rounded-2xl py-8 px-4 flex flex-col items-center justify-center shadow-inner">
              <div className="font-serif text-5xl mb-3 text-white">0%</div>
              <div className="flex items-center gap-2 text-sm text-gray-300 font-medium">
                <Target size={18} color="#E53935" /> Attainment
              </div>
            </div>
            
            {/* Stat Card 4 */}
            <div className="bg-[#110c0b] border border-white/5 rounded-2xl py-8 px-4 flex flex-col items-center justify-center shadow-inner">
              <div className="font-serif text-5xl mb-3 text-white">0%</div>
              <div className="flex items-center gap-2 text-sm text-gray-300 font-medium">
                <Star size={18} color="#E53935" /> Avg Score
              </div>
            </div>
          </div>

          {/* TABLE SECTION */}
          <div className="bg-[#110c0b] border border-white/5 rounded-2xl p-6 overflow-hidden">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr>
                  {/* FIXED: Aligned columns to match the design cleanly */}
                  <th className="py-4 px-4 font-serif text-lg font-normal text-white border-b border-white/10">Puzzles Name</th>
                  <th className="py-4 px-4 font-serif text-lg font-normal text-white border-b border-white/10 text-center">Attempts</th>
                  <th className="py-4 px-4 font-serif text-lg font-normal text-white border-b border-white/10 text-center">Avg Points</th>
                  <th className="py-4 px-4 font-serif text-lg font-normal text-white border-b border-white/10 text-center">Status</th>
                </tr>
              </thead>
              <tbody>
                {puzzleData.map((row, index) => (
                  <tr key={index} className="hover:bg-white/5 transition-colors">
                    <td className="py-4 px-4 text-gray-400 border-b border-white/5">{row.name}</td>
                    <td className="py-4 px-4 text-gray-400 border-b border-white/5 text-center">{row.attempts}</td>
                    <td className="py-4 px-4 text-gray-400 border-b border-white/5 text-center">{row.points}</td>
                    <td className="py-4 px-4 text-gray-400 border-b border-white/5 text-center">{row.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>
      </main>
    </div>
  );
};

export default Dashboard;