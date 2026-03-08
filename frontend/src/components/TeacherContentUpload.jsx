import React, { useState } from 'react';
import { UploadCloud, FileText, Plus, Trash2, Wand2, Keyboard, CheckCircle } from 'lucide-react';

const TeacherContentUpload = () => {
  // 🌟 STATE: Toggle between AI and Manual modes
  const [inputMode, setInputMode] = useState('ai'); // 'ai' or 'manual'
  
  // 🌟 STATE: Manual word/clue pairs
  const [manualEntries, setManualEntries] = useState([
    { word: '', clue: '' },
    { word: '', clue: '' },
    { word: '', clue: '' }
  ]);

  // Handle typing in manual rows
  const handleEntryChange = (index, field, value) => {
    const newEntries = [...manualEntries];
    newEntries[index][field] = value;
    setManualEntries(newEntries);
  };

  // Add a new empty row
  const addRow = () => {
    setManualEntries([...manualEntries, { word: '', clue: '' }]);
  };

  // Remove a row
  const removeRow = (index) => {
    const newEntries = manualEntries.filter((_, i) => i !== index);
    setManualEntries(newEntries);
  };

  // Simulate sending to Prince's backend
  const handleSubmit = (e) => {
    e.preventDefault();
    if (inputMode === 'ai') {
      console.log("🚀 Sending Document/Text to AI Backend for extraction...");
      alert("Sent to GenAI! Prince's backend will extract the words and clues.");
    } else {
      console.log("🚀 Sending Manual Entries to Backend:", manualEntries);
      alert("Sent manual pairs! Prince's backend will build the grid.");
    }
  };

  return (
    <div className="w-full max-w-4xl bg-[#111111] rounded-2xl p-8 shadow-[0_15px_40px_rgba(0,0,0,0.8)] border border-white/5 font-sans text-white">
      
      {/* HEADER */}
      <div className="border-b border-white/10 pb-6 mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-[#e06666] tracking-wide">
            Add Puzzle Content
          </h2>
          <p className="text-gray-400 font-serif italic mt-1">
            Provide source material for the crossword generation
          </p>
        </div>
      </div>

      {/* 🌟 MODE TOGGLE SWITCHES 🌟 */}
      <div className="flex gap-4 mb-8 bg-[#0a0a0a] p-2 rounded-xl border border-white/5 w-max">
        <button 
          onClick={() => setInputMode('ai')}
          className={`flex items-center gap-2 px-6 py-3 rounded-lg font-bold transition-all ${
            inputMode === 'ai' ? 'bg-[#E53935] text-white shadow-[0_0_15px_rgba(229,57,53,0.4)]' : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Wand2 size={18} />
          GenAI Extraction
        </button>
        <button 
          onClick={() => setInputMode('manual')}
          className={`flex items-center gap-2 px-6 py-3 rounded-lg font-bold transition-all ${
            inputMode === 'manual' ? 'bg-[#E53935] text-white shadow-[0_0_15px_rgba(229,57,53,0.4)]' : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Keyboard size={18} />
          Manual Entry
        </button>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        
        {/* 🌟 CONDITIONAL: AI UPLOAD MODE 🌟 */}
        {inputMode === 'ai' && (
          <div className="flex flex-col gap-6 animate-in fade-in duration-300">
            {/* Drag & Drop Zone */}
            <div className="border-2 border-dashed border-white/20 rounded-2xl p-12 flex flex-col items-center justify-center bg-[#181313] hover:bg-[#1f1818] hover:border-[#E53935]/50 transition-all cursor-pointer group">
              <div className="bg-gray-800 p-4 rounded-full mb-4 group-hover:bg-[#E53935]/20 transition-colors">
                <UploadCloud size={40} className="text-gray-400 group-hover:text-[#E53935]" />
              </div>
              <p className="text-xl font-bold text-gray-200 mb-2">Drag & drop your syllabus or PDF</p>
              <p className="text-gray-500 text-sm">Supports .TXT, .PDF, .DOCX (Max 10MB)</p>
              <button type="button" className="mt-6 px-6 py-2 bg-white/5 border border-white/10 rounded-full text-sm font-medium hover:bg-white/10 transition-colors">
                Browse Files
              </button>
            </div>

            {/* OR Divider */}
            <div className="flex items-center gap-4 text-gray-500 font-serif italic">
              <div className="h-px bg-white/10 flex-1"></div>
              Or paste text directly
              <div className="h-px bg-white/10 flex-1"></div>
            </div>

            {/* Paste Text Area */}
            <textarea 
              rows="5"
              placeholder="Paste your paragraph or lecture notes here. Our AI will automatically extract key terms and generate clues..."
              className="w-full bg-[#181313] text-gray-300 p-4 rounded-xl border border-white/10 focus:border-[#E53935]/50 outline-none resize-none shadow-inner placeholder:text-gray-600"
            ></textarea>
          </div>
        )}

        {/* 🌟 CONDITIONAL: MANUAL ENTRY MODE 🌟 */}
        {inputMode === 'manual' && (
          <div className="flex flex-col gap-4 animate-in fade-in duration-300">
            <div className="grid grid-cols-[1fr_2fr_auto] gap-4 px-2 text-gray-400 font-serif italic text-sm mb-2">
              <span>Target Word (Answer)</span>
              <span>Clue Description</span>
              <span></span>
            </div>

            {/* Dynamic Rows */}
            {manualEntries.map((entry, index) => (
              <div key={index} className="grid grid-cols-[1fr_2fr_auto] gap-4 items-center bg-[#181313] p-2 rounded-xl border border-white/5">
                <input 
                  type="text"
                  placeholder="e.g. REACT"
                  value={entry.word}
                  onChange={(e) => handleEntryChange(index, 'word', e.target.value)}
                  className="bg-[#0a0a0a] text-white px-4 py-3 rounded-lg border border-transparent focus:border-[#E53935]/50 outline-none uppercase font-bold tracking-wider w-full"
                />
                <input 
                  type="text"
                  placeholder="e.g. A popular JavaScript library for building user interfaces"
                  value={entry.clue}
                  onChange={(e) => handleEntryChange(index, 'clue', e.target.value)}
                  className="bg-[#0a0a0a] text-gray-300 px-4 py-3 rounded-lg border border-transparent focus:border-[#E53935]/50 outline-none w-full"
                />
                <button 
                  type="button"
                  onClick={() => removeRow(index)}
                  className="p-3 text-gray-600 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            ))}

            {/* Add Row Button */}
            <button 
              type="button"
              onClick={addRow}
              className="flex items-center gap-2 text-[#E53935] font-bold hover:bg-[#E53935]/10 w-max px-4 py-2 rounded-lg transition-colors mt-2"
            >
              <Plus size={18} strokeWidth={3} /> Add Another Word
            </button>
          </div>
        )}

        {/* 🌟 SUBMIT BUTTON 🌟 */}
        <div className="mt-8 pt-6 border-t border-white/10 flex justify-end">
          <button 
            type="submit" 
            className="flex items-center gap-2 bg-[#E53935] text-white font-bold py-3 px-8 rounded-xl shadow-[0_4px_15px_rgba(229,57,53,0.3)] hover:bg-red-600 hover:shadow-[0_6px_20px_rgba(229,57,53,0.5)] transition-all"
          >
            <CheckCircle size={20} />
            Generate Crossword
          </button>
        </div>

      </form>
    </div>
  );
};

export default TeacherContentUpload;