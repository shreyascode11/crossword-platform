import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { 
  Search, LayoutDashboard, List, Bell, History, RotateCcw, 
  Puzzle, Lightbulb, Target, Star, LogOut, PlusCircle, BarChart2, Gamepad2, FileText // <-- Add FileText right here!
} from 'lucide-react';

import CreatePuzzleForm from "./components/CreatePuzzleForm";
import CurrentStats from "./components/CurrentStats";
import Leaderboard from "./components/Leaderboard";
import Report from "./components/Report";
import Reanalyse from "./components/Reanalyse";
import TeacherReport from "./components/TeacherReport";
import CrosswordPlayer from "./components/CrosswordPlayer"; // 🌟 1. IMPORTED THE GAME 🌟
import TeacherContentUpload from "./components/TeacherContentUpload"; // 🌟 2. IMPORTED THE TEACHER CONTENT UPLOAD COMPONENT 🌟

const Dashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const userRole = location.state?.role || "Student";

  const [activeTab, setActiveTab] = useState("dashboard");

  const handleLogout = () => {
    console.log("Signing out...");
    navigate("/");
  };

  const puzzleData = [
    { name: "-", attempts: 0, points: "0%", status: "-" },
    { name: "-", attempts: 0, points: "0%", status: "-" },
    { name: "-", attempts: 0, points: "0%", status: "-" },
    { name: "-", attempts: 0, points: "0%", status: "-" },
  ];

  return (
    <div className="flex min-h-screen bg-[#050505] text-white font-sans">
      {/* SIDEBAR */}
      <aside className="w-[260px] bg-[#0f0a0a] p-8 border-r border-[#221515] flex flex-col">
        <div>
          <h2 className="font-serif italic text-3xl mb-2 pl-2 text-gray-100">
            Dashboard
          </h2>
          <p className="text-[#E53935] font-bold text-sm tracking-widest uppercase pl-2 mb-10">
            {userRole} Portal
          </p>
        </div>

        <nav className="flex flex-col gap-3">
          <button
            onClick={() => setActiveTab("dashboard")}
            className={`flex items-center gap-4 px-5 py-3 rounded-full transition-all w-full text-left ${activeTab === "dashboard" ? "bg-[#4a4a4a] text-white font-bold" : "text-gray-300 hover:bg-white/5"}`}
          >
            <LayoutDashboard size={20} />
            <span>Dashboard</span>
          </button>

          {userRole === "Teacher" && (
            <button
              onClick={() => setActiveTab("create")}
              className={`flex items-center gap-4 px-5 py-3 rounded-full transition-all w-full text-left ${activeTab === "create" ? "bg-[#4a4a4a] text-white font-bold" : "text-gray-300 hover:bg-white/5"}`}
            >
              <PlusCircle size={20} />
              <span>Create Puzzle</span>
            </button>
          )}
          {userRole === "Teacher" && (
            <button
              onClick={() => setActiveTab("upload")}
              className={`flex items-center gap-4 px-5 py-3 rounded-full transition-all w-full text-left ${activeTab === "upload" ? "bg-[#4a4a4a] text-white font-bold" : "text-gray-300 hover:bg-white/5"}`}
            >
              <FileText size={20} />
              <span>Add Content</span>
            </button>
          )}

          {/* 🌟 2. THE NEW TEST GAME BUTTON (STUDENT ONLY) 🌟 */}
          {userRole === "Student" && (
            <button
              onClick={() => setActiveTab("play")}
              className={`flex items-center gap-4 px-5 py-3 rounded-full transition-all w-full text-left ${activeTab === "play" ? "bg-[#E53935] text-white font-bold shadow-[0_0_15px_rgba(229,57,53,0.4)]" : "text-gray-300 hover:bg-white/5"}`}
            >
              <Gamepad2 size={20} />
              <span>Play Game (Test)</span>
            </button>
          )}

          {userRole === "Student" && (
            <button
              onClick={() => setActiveTab("stats")}
              className={`flex items-center gap-4 px-5 py-3 rounded-full transition-all w-full text-left ${activeTab === "stats" ? "bg-[#4a4a4a] text-white font-bold" : "text-gray-300 hover:bg-white/5"}`}
            >
              <List size={20} />
              <span>Current Stats</span>
            </button>
          )}

          <button
            onClick={() => setActiveTab("scores")}
            className={`flex items-center gap-4 px-5 py-3 rounded-full transition-all w-full text-left ${activeTab === "scores" ? "bg-[#4a4a4a] text-white font-bold" : "text-gray-300 hover:bg-white/5"}`}
          >
            <Bell size={20} />
            <span>Scores</span>
          </button>

          {userRole === "Teacher" && (
            <button
              onClick={() => setActiveTab("teacher-analysis")}
              className={`flex items-center gap-4 px-5 py-3 rounded-full transition-all w-full text-left ${activeTab === "teacher-analysis" ? "bg-[#4a4a4a] text-white font-bold" : "text-gray-300 hover:bg-white/5"}`}
            >
              <BarChart2 size={20} />
              <span>Class Analysis</span>
            </button>
          )}

          {userRole === "Student" && (
            <button
              onClick={() => setActiveTab("report")}
              className={`flex items-center gap-4 px-5 py-3 rounded-full transition-all w-full text-left ${activeTab === "report" ? "bg-[#4a4a4a] text-white font-bold" : "text-gray-300 hover:bg-white/5"}`}
            >
              <History size={20} />
              <span>Report</span>
            </button>
          )}

          {userRole === "Student" && (
            <button
              onClick={() => setActiveTab("reanalyse")}
              className={`flex items-center gap-4 px-5 py-3 rounded-full transition-all w-full text-left ${activeTab === "reanalyse" ? "bg-[#4a4a4a] text-white font-bold" : "text-gray-300 hover:bg-white/5"}`}
            >
              <RotateCcw size={20} />
              <span>Reanalyse</span>
            </button>
          )}
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
            <h1 className="font-serif text-4xl text-gray-200 m-0">
              Welcome 
            </h1>
          </div>
        </header>

        {/* DYNAMIC CONTENT PANEL */}
        <div className="m-10 flex-1">
          {activeTab === "dashboard" && (
            <div className="bg-[#1e1514] rounded-3xl p-8 shadow-[0_10px_40px_rgba(0,0,0,0.6)] border border-white/5 h-full">
              {/* ... (Existing Dashboard Grid) ... */}
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
                      <th className="py-4 px-4 font-serif text-lg font-normal text-white border-b border-white/10">
                        Puzzles Name
                      </th>
                      <th className="py-4 px-4 font-serif text-lg font-normal text-white border-b border-white/10 text-center">
                        Attempts
                      </th>
                      <th className="py-4 px-4 font-serif text-lg font-normal text-white border-b border-white/10 text-center">
                        Avg Points
                      </th>
                      <th className="py-4 px-4 font-serif text-lg font-normal text-white border-b border-white/10 text-center">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {puzzleData.map((row, index) => (
                      <tr
                        key={index}
                        className="hover:bg-white/5 transition-colors"
                      >
                        <td className="py-4 px-4 text-gray-400 border-b border-white/5">
                          {row.name}
                        </td>
                        <td className="py-4 px-4 text-gray-400 border-b border-white/5 text-center">
                          {row.attempts}
                        </td>
                        <td className="py-4 px-4 text-gray-400 border-b border-white/5 text-center">
                          {row.points}
                        </td>
                        <td className="py-4 px-4 text-gray-400 border-b border-white/5 text-center">
                          {row.status}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === "create" && userRole === "Teacher" && (
            <div className="flex justify-center items-start pt-4 h-full w-full">
              <CreatePuzzleForm />
            </div>
          )}

          {/* 🌟 3. RENDER THE GAME HERE 🌟 */}
          {activeTab === "play" && userRole === "Student" && (
            <div className="flex justify-center items-start pt-4 h-full w-full">
              <CrosswordPlayer />
            </div>
          )}

          {activeTab === "stats" && userRole === "Student" && (
            <div className="flex justify-center items-start pt-4 h-full w-full">
              <CurrentStats />
            </div>
          )}

          {activeTab === "scores" && (
            <div className="flex justify-center items-start pt-4 h-full w-full">
              <Leaderboard />
            </div>
          )}

          {activeTab === "teacher-analysis" && userRole === "Teacher" && (
            <div className="flex justify-center items-start pt-4 h-full w-full">
              <TeacherReport />
            </div>
          )}

          {activeTab === "report" && userRole === "Student" && (
            <div className="flex justify-center items-start pt-4 h-full w-full">
              <Report />
            </div>
          )}

          {activeTab === "reanalyse" && userRole === "Student" && (
            <div className="flex justify-center items-start pt-4 h-full w-full">
              <Reanalyse />
            </div>
          )}

          {activeTab === "upload" && userRole === "Teacher" && (
            <div className="flex justify-center items-start pt-4 h-full w-full">
              <TeacherContentUpload />
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
