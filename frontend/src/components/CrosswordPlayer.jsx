import React, { useState, useEffect } from 'react';
import { Clock, ChevronLeft, CheckCircle, HelpCircle } from 'lucide-react';

const CrosswordPlayer = () => {
  // 🌟 1. TIMER STATE 🌟
  const [timeLeft, setTimeLeft] = useState(1200); // 20 minutes in seconds

  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  // 🌟 2. GRID STATE (Prototype 5x5 Grid) 🌟
  // 'b' means black square. Objects contain cell data.
  const initialGrid = [
    [{ n: 1, v: '' }, { v: '' }, { v: '' }, { v: '' }, { b: true }],
    [{ v: '' }, { b: true }, { n: 2, v: '' }, { b: true }, { n: 3, v: '' }],
    [{ n: 4, v: '' }, { v: '' }, { v: '' }, { v: '' }, { v: '' }],
    [{ v: '' }, { b: true }, { v: '' }, { b: true }, { v: '' }],
    [{ b: true }, { n: 5, v: '' }, { v: '' }, { v: '' }, { v: '' }]
  ];

  const [grid, setGrid] = useState(initialGrid);
  const [activeCell, setActiveCell] = useState({ r: 0, c: 0 });

  // Handle typing in a cell
  const handleInputChange = (r, c, value) => {
    // Only allow single letters, convert to uppercase
    const letter = value.slice(-1).toUpperCase(); 
    
    const newGrid = [...grid];
    newGrid[r][c] = { ...newGrid[r][c], v: letter };
    setGrid(newGrid);
  };

  // 🌟 3. DUMMY CLUES (Prince will feed these from the backend later) 🌟
  const clues = {
    across: [
      { num: 1, text: "The creator in Hindu trinity (6)" },
      { num: 4, text: "Ultimate reality in the universe (7)" },
      { num: 5, text: "Action, work, or deed (5)" }
    ],
    down: [
      { num: 1, text: "Illusion or magic (4)" },
      { num: 2, text: "Cycle of rebirth (7)" },
      { num: 3, text: "Avatar of Vishnu (7)" }
    ]
  };

  return (
    <div className="w-full max-w-6xl font-sans text-white flex flex-col h-[calc(100vh-120px)]">
      
      {/* 🌟 TOP GAME HEADER 🌟 */}
      <div className="flex justify-between items-center mb-6 bg-[#181313] p-4 rounded-2xl border border-white/5 shadow-md">
        <div className="flex items-center gap-4">
          <button className="p-2 hover:bg-white/10 rounded-full transition-colors text-gray-400">
            <ChevronLeft size={24} />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-[#e06666] tracking-wide m-0">Bhagavad Gita Basics</h2>
            <p className="text-gray-400 text-sm font-serif italic">Puzzle 1 of 4 • Easy</p>
          </div>
        </div>

        {/* Live Timer */}
        <div className={`flex items-center gap-3 px-6 py-2 rounded-full font-bold text-xl tracking-wider shadow-inner border 
          ${timeLeft < 300 ? 'bg-red-500/20 text-red-500 border-red-500/50 animate-pulse' : 'bg-[#110c0b] text-white border-white/10'}`}>
          <Clock size={20} className={timeLeft < 300 ? 'text-red-500' : 'text-[#E53935]'} />
          {formatTime(timeLeft)}
        </div>

        <button className="flex items-center gap-2 bg-[#E53935] hover:bg-red-600 text-white px-6 py-2.5 rounded-xl font-bold transition-all shadow-[0_0_15px_rgba(229,57,53,0.4)]">
          <CheckCircle size={18} /> Submit Grid
        </button>
      </div>

      {/* 🌟 MAIN PLAY AREA 🌟 */}
      <div className="flex flex-col lg:flex-row gap-8 flex-1 min-h-0">
        
        {/* LEFT: The Crossword Grid */}
        <div className="flex-1 flex items-center justify-center bg-[#110c0b] rounded-3xl border border-white/5 p-8 shadow-inner overflow-hidden">
          
          {/* Grid Container */}
          <div className="grid grid-cols-5 gap-1 w-full max-w-[450px] aspect-square bg-gray-800 p-2 rounded-xl">
            {grid.map((row, rIdx) => 
              row.map((cell, cIdx) => {
                if (cell.b) {
                  return <div key={`${rIdx}-${cIdx}`} className="bg-[#0a0808] rounded-md"></div>;
                }
                
                const isActive = activeCell.r === rIdx && activeCell.c === cIdx;

                return (
                  <div 
                    key={`${rIdx}-${cIdx}`} 
                    onClick={() => setActiveCell({r: rIdx, c: cIdx})}
                    className={`relative bg-white rounded-md flex items-center justify-center cursor-pointer overflow-hidden transition-colors
                      ${isActive ? 'ring-4 ring-[#E53935]/50 bg-red-50' : 'hover:bg-gray-100'}`}
                  >
                    {/* Clue Number */}
                    {cell.n && (
                      <span className="absolute top-1 left-1.5 text-[10px] sm:text-xs font-bold text-black select-none">
                        {cell.n}
                      </span>
                    )}
                    {/* Input Field */}
                    <input 
                      type="text"
                      value={cell.v}
                      onChange={(e) => handleInputChange(rIdx, cIdx, e.target.value)}
                      className="w-full h-full bg-transparent text-center font-bold text-2xl sm:text-4xl text-black outline-none caret-transparent"
                      autoFocus={isActive}
                    />
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* RIGHT: The Clues Panel */}
        <div className="w-full lg:w-[400px] flex flex-col gap-6 overflow-y-auto pr-2">
          
          {/* Across Clues */}
          <div className="bg-[#181313] rounded-2xl p-6 border border-white/5 shadow-md">
            <h3 className="text-xl font-bold text-[#e06666] border-b border-white/10 pb-3 mb-4 uppercase tracking-wider flex justify-between items-center">
              Across
              <HelpCircle size={18} className="text-gray-500 cursor-pointer hover:text-white" />
            </h3>
            <ul className="flex flex-col gap-3">
              {clues.across.map((clue, idx) => (
                <li key={idx} className="flex gap-3 p-2 rounded-lg hover:bg-white/5 cursor-pointer transition-colors group">
                  <span className="font-bold text-gray-400 group-hover:text-[#E53935]">{clue.num}</span>
                  <span className="text-gray-300 group-hover:text-white">{clue.text}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Down Clues */}
          <div className="bg-[#181313] rounded-2xl p-6 border border-white/5 shadow-md">
            <h3 className="text-xl font-bold text-[#e06666] border-b border-white/10 pb-3 mb-4 uppercase tracking-wider flex justify-between items-center">
              Down
              <HelpCircle size={18} className="text-gray-500 cursor-pointer hover:text-white" />
            </h3>
            <ul className="flex flex-col gap-3">
              {clues.down.map((clue, idx) => (
                <li key={idx} className="flex gap-3 p-2 rounded-lg hover:bg-white/5 cursor-pointer transition-colors group">
                  <span className="font-bold text-gray-400 group-hover:text-[#E53935]">{clue.num}</span>
                  <span className="text-gray-300 group-hover:text-white">{clue.text}</span>
                </li>
              ))}
            </ul>
          </div>

        </div>
      </div>
    </div>
  );
};

export default CrosswordPlayer;