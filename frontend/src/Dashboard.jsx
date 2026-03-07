import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, LayoutDashboard, List, Bell, History, RotateCcw, 
  Puzzle, Lightbulb, Target, Star, LogOut, PlusCircle 
} from 'lucide-react';

// 🌟 FIXED IMPORTS: Now looking in the exact same folder (./) 🌟
import CreatePuzzleForm from './CreatePuzzleForm';
import CurrentStats from './CurrentStats'; 
import Leaderboard from './Leaderboard'; 
import Report from './Report'; 

const Dashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard'); 

  const handleLogout = () => {
    console.log("Signing out...");
    navigate('/'); 
  };

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
        <h2 className="font-serif italic text-3xl mb-10 pl-2 text-gray-100">Dashboard</h2>
        
        <nav className="flex flex-col gap-3">
          {/* Dashboard Button */}
          <button 
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center gap-4 px-5 py-3 rounded-full transition-all w-full text-left ${activeTab === 'dashboard' ? 'bg-[#4a4a4a] text-white font-bold' : 'text-gray-300 hover:bg-white/5'}`}
          >
            <LayoutDashboard size={20} />
            <span>Dashboard</span>
          </button>

          {/* Create Puzzle Button */}
          <button 
            onClick={() => setActiveTab('create')}
            className={`flex items-center gap-4 px-5 py-3 rounded-full transition-all w-full text-left ${activeTab === 'create' ? 'bg-[#4a4a4a] text-white font-bold' : 'text-gray-300 hover:bg-white/5'}`}
          >
            <PlusCircle size={20} />
            <span>Create Puzzle</span>
          </button>

          {/* Current Stats Button */}
          <button 
            onClick={() => setActiveTab('stats')}
            className={`flex items-center gap-4 px-5 py-3 rounded-full transition-all w-full text-left ${activeTab === 'stats' ? 'bg-[#4a4a4a] text-white font-bold' : 'text-gray-300 hover:bg-white/5'}`}
          >
            <List size={20} />
            <span>Current Stats</span>
          </button>

          {/* Scores / Leaderboard Button */}
          <button 
            onClick={() => setActiveTab('scores')}
            className={`flex items-center gap-4 px-5 py-3 rounded-full transition-all w-full text-left ${activeTab === 'scores' ? 'bg-[#4a4a4a] text-white font-bold' : 'text-gray-300 hover:bg-white/5'}`}
          >
            <Bell size={20} />
            <span>Scores</span>
          </button>

          {/* Report Button */}
          <button 
            onClick={() => setActiveTab('report')}
            className={`flex items-center gap-4 px-5 py-3 rounded-full transition-all w-full text-left ${activeTab === 'report' ? 'bg-[#4a4a4a] text-white font-bold' : 'text-gray-300 hover:bg-white/5'}`}
          >
            <History size={20} />
            <span>Report</span>
          </button>

          {/* Reanalyse (Placeholder) */}
          <a href="#" className="flex items-center gap-4 px-5 py-3 rounded-full text-gray-300 hover:bg-white/5 transition-all">
            <RotateCcw size={20} />
            <span>Reanalyse</span>
          </a>
        </nav>

        {/* SIGN OUT BUTTON */}
        <button 
          onClick={handleLogout}
          className="flex items-center gap-4 px-5 py-3 mt-auto rounded-full text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all font-medium w-full text-left"
        >
          <LogOut size={20} />
          <span>Sign Out</span>
        </button>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col bg-[radial-gradient(circle_at_top_left,_#1a1010_0%,_#050505_100%)] overflow-y-auto">
        
        {/* TOP HEADER */}
        <header className="px-10 py-8 bg-gradient-to-r from-[#1f1816] to-[#0a0808] border-b border-white/5 flex items-center">
          <div className="flex items-center gap-4">
            <Search size={32} className="text-gray-400" />
            <h1 className="font-serif text-4xl text-gray-200 m-0">Welcome 👋</h1>
          </div>
        </header>

        {/* DYNAMIC CONTENT PANEL */}
        <div className="m-10 flex-1">
          
          {activeTab === 'dashboard' && (
            <div className="bg-[#1e1514] rounded-3xl p-8 shadow-[0_10px_40px_rgba(0,0,0,0.6)] border border-white/5 h-full">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                <div className="bg-[#110c0b] border border-white/5 rounded-2xl py-8 px-4 flex flex-col items-center justify-center shadow-inner">
                  <div className="font-serif text-5xl mb-3 text-white">0</div>
                  <div className="flex items-center gap-2 text-sm text-gray-300 font-medium">
                    <Puzzle size={18} color="#E53935" /> Total Puzzles
                  </div>
                </div>
                <div className="bg-[#110c0b] border border-white/5 rounded-2xl py-8 px-4 flex flex-col items-center justify-center shadow-inner">
                  <div className="font-serif text-5xl mb-3 text-white">0</div>
                  <div className="flex items-center gap-2 text-sm text-gray-300 font-medium">
                    <Lightbulb size={18} color="#E53935" /> Assistances
                  </div>
                </div>
                <div className="bg-[#110c0b] border border-white/5 rounded-2xl py-8 px-4 flex flex-col items-center justify-center shadow-inner">
                  <div className="font-serif text-5xl mb-3 text-white">0%</div>
                  <div className="flex items-center gap-2 text-sm text-gray-300 font-medium">
                    <Target size={18} color="#E53935" /> Attainment
                  </div>
                </div>
                <div className="bg-[#110c0b] border border-white/5 rounded-2xl py-8 px-4 flex flex-col items-center justify-center shadow-inner">
                  <div className="font-serif text-5xl mb-3 text-white">0%</div>
                  <div className="flex items-center gap-2 text-sm text-gray-300 font-medium">
                    <Star size={18} color="#E53935" /> Avg Score
                  </div>
                </div>
              </div>

              <div className="bg-[#110c0b] border border-white/5 rounded-2xl p-6 overflow-hidden">
                <table className="w-full border-collapse text-left">
                  <thead>
                    <tr>
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
          )}

          {activeTab === 'create' && (
            <div className="flex justify-center items-start pt-4 h-full w-full">
              <CreatePuzzleForm />
            </div>
          )}

          {activeTab === 'stats' && (
            <div className="flex justify-center items-start pt-4 h-full w-full">
              <CurrentStats />
            </div>
          )}

          {activeTab === 'scores' && (
            <div className="flex justify-center items-start pt-4 h-full w-full">
              <Leaderboard />
            </div>
          )}

          {activeTab === 'report' && (
            <div className="flex justify-center items-start pt-4 h-full w-full">
              <Report />
            </div>
          )}

        </div>
      </main>
    </div>
  );
};

export default Dashboard;