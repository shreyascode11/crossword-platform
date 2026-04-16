import React, { useState } from 'react';
import { Clock, Hourglass, Square, Layers, Info, ChevronDown } from 'lucide-react';
import { createPuzzle, generateFromDocument } from '../api';

// 🌟 1. UPGRADED CUSTOM SELECT 🌟
// Now accepts name, value, and onChange so it can talk to our form state
const CustomSelect = ({ icon, options = [], name, value, onChange }) => (
  <div className="relative flex-1 min-w-[140px] group">
    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#e63946] transition-colors">
      {React.createElement(icon, { size: 16 })}
    </div>
    <select 
      name={name}
      value={value}
      onChange={onChange}
      className="w-full appearance-none bg-[#121214] text-gray-200 pl-10 pr-10 py-3 rounded-xl text-sm outline-none cursor-pointer border border-white/[0.08] hover:border-white/15 focus:border-[#e63946]/55 focus:ring-2 focus:ring-[#e63946]/25 transition-all shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"
    >
      {/* We map over the options to create the dropdown list */}
      {options.map((opt, idx) => (
        <option key={idx} value={opt}>{opt}</option>
      ))}
    </select>
    <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none opacity-70" />
  </div>
);


const CreatePuzzleForm = ({ onPuzzleCreated, onShowPreview }) => {
  // 🌟 2. SETUP FORM STATE 🌟
  // This object holds everything the user types or selects
  const [formData, setFormData] = useState({
    title: '',
    timer: '20 Minutes',
    accessWindowDuration: '10 min window',
    accessWindowType: 'Clear',
    difficulty: 'Easy',
    hints: 'Hints On'
  });
  const [mode, setMode] = useState('manual');
  const [docFile, setDocFile] = useState(null);
  const [docDifficulty, setDocDifficulty] = useState('easy');
  const [numQuestions, setNumQuestions] = useState(10);
  const [topicHint, setTopicHint] = useState('');

  // State to handle the button loading animation
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // 🌟 3. HANDLE INPUT CHANGES 🌟
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value // Updates the specific field being changed
    }));
  };

  // 🌟 4. HANDLE SUBMISSION 🌟
  const handleSubmit = (e) => {
    e.preventDefault(); // Prevents the page from refreshing
    
    // Quick validation to ensure they typed a title
    if (!formData.title.trim()) {
      alert("Please enter a Puzzle Title first!");
      return;
    }

    setErrorMessage('');
    setSuccessMessage('');
    setIsGenerating(true);

    createPuzzle({
      title: formData.title.trim(),
      teacher_id: localStorage.getItem('userId') || '',
      validation_mode: formData.hints === 'Hints On' ? 'instant' : 'on_submit',
    })
      .then((puzzle) => {
        localStorage.setItem('activePuzzleId', String(puzzle.id));
        if (typeof onPuzzleCreated === 'function') {
          onPuzzleCreated(puzzle);
        }
        setSuccessMessage(`Puzzle "${formData.title}" created successfully.`);
      })
      .catch((error) => {
        console.error('Create puzzle failed:', error);
        setErrorMessage('Failed to create puzzle. Ensure teacher login is valid.');
      })
      .finally(() => {
      setIsGenerating(false);
    });
  };

  const handleGenerateFromDocument = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      alert("Please enter a Puzzle Title first!");
      return;
    }
    if (!docFile) {
      alert("Please upload a PDF or DOCX document.");
      return;
    }
    setErrorMessage('');
    setSuccessMessage('');
    setIsGenerating(true);
    try {
      const response = await generateFromDocument({
        file: docFile,
        difficulty: docDifficulty,
        num_questions: numQuestions,
        topic_hint: topicHint.trim(),
        puzzle_title: formData.title.trim(),
        teacher_id: localStorage.getItem('userId') || '',
      });
      localStorage.setItem('activePuzzleId', String(response.id || response.puzzle_id));
      if (typeof onPuzzleCreated === 'function') {
        onPuzzleCreated(response);
      }
      if (typeof onShowPreview === 'function') {
        onShowPreview();
      }
      setSuccessMessage('Puzzle generated from document successfully.');
    } catch (error) {
      console.error('Document generation failed:', error);
      setErrorMessage(error?.message || 'AI generation failed. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="w-full max-w-2xl bg-gradient-to-br from-[#141416] via-[#101012] to-[#0c0c0e] rounded-2xl p-8 md:p-9 shadow-[0_28px_70px_-35px_rgba(0,0,0,0.9)] border border-white/[0.07] font-sans">
      
      {/* HEADER */}
      <div className="relative pb-5 mb-6">
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#e63946]/60 to-transparent" />
        <p className="text-[11px] uppercase tracking-[0.28em] text-gray-500 font-semibold m-0 mb-2">Teacher</p>
        <h2 className="text-3xl font-bold text-white tracking-tight m-0">
          Create <span className="text-[#e63946]">Puzzle</span>
        </h2>
      </div>

      <div className="flex p-1 rounded-xl bg-black/40 border border-white/[0.06] shadow-[inset_0_1px_2px_rgba(0,0,0,0.45)] mb-8 gap-1">
        <button
          type="button"
          onClick={() => setMode('manual')}
          className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${mode === 'manual' ? 'bg-gradient-to-r from-[#e63946] to-[#c62f3a] text-white shadow-[0_8px_24px_-12px_rgba(230,57,70,0.55)]' : 'text-gray-400 hover:text-white hover:bg-white/[0.04]'}`}
        >
          Manual Entry
        </button>
        <button
          type="button"
          onClick={() => setMode('document')}
          className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${mode === 'document' ? 'bg-gradient-to-r from-[#e63946] to-[#c62f3a] text-white shadow-[0_8px_24px_-12px_rgba(230,57,70,0.55)]' : 'text-gray-400 hover:text-white hover:bg-white/[0.04]'}`}
        >
          Upload Document
        </button>
      </div>

      {/* 🌟 CHANGED TO A <form> TAG 🌟 */}
      {mode === 'manual' && (
        <form onSubmit={handleSubmit} className="flex flex-col">
        
        {/* Row 1: Puzzle Title */}
        <div className="flex flex-col md:flex-row md:items-center py-5 border-b border-white/[0.06] gap-4">
          <label className="text-gray-200 font-semibold text-sm md:w-1/3 tracking-tight">
            Puzzle Title
          </label>
          <div className="flex-1">
            <input
              type="text"
              name="title" // Crucial for state mapping
              value={formData.title} // Bind to state
              onChange={handleChange} // Listen for typing
              placeholder="Enter Puzzle Name"
              className="w-full bg-[#121214] text-gray-100 px-4 py-3 rounded-xl text-sm outline-none border border-white/[0.08] hover:border-white/15 focus:border-[#e63946]/55 focus:ring-2 focus:ring-[#e63946]/20 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] placeholder:text-gray-600 transition-all"
            />
          </div>
        </div>

        {/* Row 2: Timer */}
        <div className="flex flex-col md:flex-row md:items-center py-5 border-b border-white/[0.06] gap-4">
          <label className="text-gray-200 font-semibold text-sm md:w-1/3 tracking-tight">
            Timer
          </label>
          <div className="flex-1 flex justify-end">
            <div className="w-full md:w-1/2">
              <CustomSelect 
                icon={Clock} 
                name="timer"
                value={formData.timer}
                onChange={handleChange}
                options={["Timer", "10 Minutes", "20 Minutes", "30 Minutes", "No Timer"]} 
              />
            </div>
          </div>
        </div>

        {/* Row 3: Access Window */}
        <div className="flex flex-col md:flex-row md:items-center py-5 border-b border-white/[0.06] gap-4">
          <label className="text-gray-200 font-semibold text-sm md:w-1/3 tracking-tight">
            Access Window
          </label>
          <div className="flex-1 flex flex-col sm:flex-row gap-4">
            <CustomSelect 
              icon={Hourglass} 
              name="accessWindowDuration"
              value={formData.accessWindowDuration}
              onChange={handleChange}
              options={["5 min to 10000", "10 min window", "1 hour window"]} 
            />
            <CustomSelect 
              icon={Square} 
              name="accessWindowType"
              value={formData.accessWindowType}
              onChange={handleChange}
              options={["Clear", "Strict", "Flexible"]} 
            />
          </div>
        </div>

        {/* Row 4: Difficulty */}
        <div className="flex flex-col md:flex-row md:items-center py-5 border-b border-white/[0.06] gap-4">
          <label className="text-gray-200 font-semibold text-sm md:w-1/3 tracking-tight">
            Difficulty
          </label>
          <div className="flex-1 flex flex-col sm:flex-row gap-4">
            <CustomSelect 
              icon={Layers} 
              name="difficulty"
              value={formData.difficulty}
              onChange={handleChange}
              options={["Assorted", "Easy", "Medium", "Hard"]} 
            />
            <CustomSelect 
              icon={Info} 
              name="hints"
              value={formData.hints}
              onChange={handleChange}
              options={["Answer", "Hints On", "Hints Off"]} 
            />
          </div>
        </div>

        {/* 🌟 SUBMIT BUTTON 🌟 */}
        <div className="mt-10 flex justify-center">
          <button 
            type="submit" 
            disabled={isGenerating} // Prevent double-clicks
            className={`min-w-[220px] bg-gradient-to-r from-[#e63946] to-[#c62f3a] text-white font-bold py-3.5 px-10 rounded-xl tracking-wide uppercase text-xs sm:text-sm shadow-[0_14px_40px_-14px_rgba(230,57,70,0.75)] border border-white/10 transition-all duration-300 
            ${isGenerating ? 'opacity-60 cursor-not-allowed' : 'hover:brightness-110 hover:-translate-y-0.5 active:translate-y-0'}`}
          >
            {isGenerating ? 'Generating...' : 'Generate Grid'}
          </button>
        </div>

        </form>
      )}

      {mode === 'document' && (
        <form onSubmit={handleGenerateFromDocument} className="flex flex-col">
          <div className="flex flex-col md:flex-row md:items-center py-5 border-b border-white/[0.06] gap-4">
            <label className="text-gray-200 font-semibold text-sm md:w-1/3 tracking-tight">
              Puzzle Title
            </label>
            <div className="flex-1">
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Enter Puzzle Name"
                className="w-full bg-[#121214] text-gray-100 px-4 py-3 rounded-xl text-sm outline-none border border-white/[0.08] hover:border-white/15 focus:border-[#e63946]/55 focus:ring-2 focus:ring-[#e63946]/20 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] placeholder:text-gray-600 transition-all"
              />
            </div>
          </div>

          <div className="flex flex-col md:flex-row md:items-center py-5 border-b border-white/[0.06] gap-4">
            <label className="text-gray-200 font-semibold text-sm md:w-1/3 tracking-tight">
              Upload File
            </label>
            <div className="flex-1">
              <div className="rounded-xl border border-dashed border-white/[0.12] bg-black/30 px-4 py-6 text-center hover:border-[#e63946]/35 hover:bg-[#e63946]/[0.03] transition-colors duration-200">
                <input
                  type="file"
                  accept=".pdf,.docx"
                  onChange={(e) => setDocFile(e.target.files?.[0] || null)}
                  className="text-sm text-gray-300 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-[#e63946] file:text-white hover:file:brightness-110 file:cursor-pointer cursor-pointer w-full max-w-full"
                />
                <div className="text-xs text-gray-500 mt-3">PDF or DOCX only, max 5MB.</div>
              </div>
            </div>
          </div>

          <div className="flex flex-col md:flex-row md:items-center py-5 border-b border-white/[0.06] gap-4">
            <label className="text-gray-200 font-semibold text-sm md:w-1/3 tracking-tight">
              Difficulty
            </label>
            <div className="flex-1">
              <select
                value={docDifficulty}
                onChange={(e) => setDocDifficulty(e.target.value)}
                className="w-full bg-[#121214] text-gray-200 px-4 py-3 rounded-xl text-sm outline-none border border-white/[0.08] hover:border-white/15 focus:border-[#e63946]/55 focus:ring-2 focus:ring-[#e63946]/20 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
          </div>

          <div className="flex flex-col md:flex-row md:items-center py-5 border-b border-white/[0.06] gap-4">
            <label className="text-gray-200 font-semibold text-sm md:w-1/3 tracking-tight">
              Number of Questions
            </label>
            <div className="flex-1">
              <input
                type="number"
                min="5"
                max="20"
                value={numQuestions}
                onChange={(e) => setNumQuestions(Number(e.target.value))}
                className="w-full bg-[#121214] text-gray-100 px-4 py-3 rounded-xl text-sm outline-none border border-white/[0.08] hover:border-white/15 focus:border-[#e63946]/55 focus:ring-2 focus:ring-[#e63946]/20 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] tabular-nums"
              />
            </div>
          </div>

          <div className="flex flex-col md:flex-row md:items-center py-5 border-b border-white/[0.06] gap-4">
            <label className="text-gray-200 font-semibold text-sm md:w-1/3 tracking-tight">
              Topic Hint
            </label>
            <div className="flex-1">
              <input
                type="text"
                value={topicHint}
                onChange={(e) => setTopicHint(e.target.value)}
                placeholder="Focus on this topic from the document"
                className="w-full bg-[#121214] text-gray-100 px-4 py-3 rounded-xl text-sm outline-none border border-white/[0.08] hover:border-white/15 focus:border-[#e63946]/55 focus:ring-2 focus:ring-[#e63946]/20 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] placeholder:text-gray-600 transition-all"
              />
            </div>
          </div>

          <div className="mt-10 flex justify-center">
            <button
              type="submit"
              disabled={isGenerating}
              className={`min-w-[240px] bg-gradient-to-r from-[#e63946] to-[#c62f3a] text-white font-bold py-3.5 px-10 rounded-xl tracking-wide uppercase text-xs sm:text-sm shadow-[0_14px_40px_-14px_rgba(230,57,70,0.75)] border border-white/10 transition-all duration-300 
              ${isGenerating ? 'opacity-60 cursor-not-allowed' : 'hover:brightness-110 hover:-translate-y-0.5 active:translate-y-0'}`}
            >
              {isGenerating ? 'Generating...' : 'Generate Puzzle'}
            </button>
          </div>
        </form>
      )}
      {errorMessage && (
        <div className="mt-5 text-sm text-red-300 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">{errorMessage}</div>
      )}
      {successMessage && (
        <div className="mt-5 text-sm text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 py-3">{successMessage}</div>
      )}
    </div>
  );
};

export default CreatePuzzleForm;
