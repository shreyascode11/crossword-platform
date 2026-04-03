import React, { useState } from 'react';
import { Clock, Hourglass, Square, Layers, Info, ChevronDown } from 'lucide-react';
import { createPuzzle, generateFromDocument } from '../api';

// 🌟 1. UPGRADED CUSTOM SELECT 🌟
// Now accepts name, value, and onChange so it can talk to our form state
const CustomSelect = ({ icon, options = [], name, value, onChange }) => (
  <div className="relative flex-1 min-w-[140px]">
    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
      {React.createElement(icon, { size: 16 })}
    </div>
    <select 
      name={name}
      value={value}
      onChange={onChange}
      className="w-full appearance-none bg-[#141414] text-gray-300 pl-10 pr-10 py-2.5 rounded-md text-sm outline-none cursor-pointer border border-transparent focus:border-[#E53935]/50 transition-colors shadow-inner"
    >
      {/* We map over the options to create the dropdown list */}
      {options.map((opt, idx) => (
        <option key={idx} value={opt}>{opt}</option>
      ))}
    </select>
    <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
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
    <div className="w-full max-w-2xl bg-[#111111] rounded-xl p-8 shadow-[0_15px_40px_rgba(0,0,0,0.8)] border border-white/5 font-sans">
      
      {/* HEADER */}
      <div className="border-b-2 border-[#E53935] pb-4 mb-2">
        <h2 className="text-3xl font-bold text-[#e06666] tracking-wide">
          Create Puzzle
        </h2>
      </div>

      <div className="flex gap-3 mb-6">
        <button
          type="button"
          onClick={() => setMode('manual')}
          className={`px-4 py-2 rounded-md text-sm font-semibold ${mode === 'manual' ? 'bg-[#E53935] text-white' : 'bg-[#221515] text-gray-300'}`}
        >
          Manual Entry
        </button>
        <button
          type="button"
          onClick={() => setMode('document')}
          className={`px-4 py-2 rounded-md text-sm font-semibold ${mode === 'document' ? 'bg-[#E53935] text-white' : 'bg-[#221515] text-gray-300'}`}
        >
          Upload Document
        </button>
      </div>

      {/* 🌟 CHANGED TO A <form> TAG 🌟 */}
      {mode === 'manual' && (
        <form onSubmit={handleSubmit} className="flex flex-col">
        
        {/* Row 1: Puzzle Title */}
        <div className="flex flex-col md:flex-row md:items-center py-5 border-b border-[#E53935]/30 gap-4">
          <label className="text-[#e06666] font-semibold text-lg md:w-1/3">
            Puzzle Title
          </label>
          <div className="flex-1">
            <input
              type="text"
              name="title" // Crucial for state mapping
              value={formData.title} // Bind to state
              onChange={handleChange} // Listen for typing
              placeholder="Enter Puzzle Name"
              className="w-full bg-[#141414] text-gray-300 px-4 py-2.5 rounded-md text-sm outline-none border border-transparent focus:border-[#E53935]/50 shadow-inner placeholder:text-gray-600 transition-colors"
            />
          </div>
        </div>

        {/* Row 2: Timer */}
        <div className="flex flex-col md:flex-row md:items-center py-5 border-b border-[#E53935]/30 gap-4">
          <label className="text-[#e06666] font-semibold text-lg md:w-1/3">
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
        <div className="flex flex-col md:flex-row md:items-center py-5 border-b border-[#E53935]/30 gap-4">
          <label className="text-[#e06666] font-semibold text-lg md:w-1/3">
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
        <div className="flex flex-col md:flex-row md:items-center py-5 border-b border-[#E53935]/30 gap-4">
          <label className="text-[#e06666] font-semibold text-lg md:w-1/3">
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
        <div className="mt-8 flex justify-center">
          <button 
            type="submit" 
            disabled={isGenerating} // Prevent double-clicks
            className={`bg-[#E53935] text-white font-bold py-3 px-8 rounded-xl shadow-[0_4px_15px_rgba(229,57,53,0.3)] transition-all duration-300 
            ${isGenerating ? 'opacity-70 cursor-not-allowed' : 'hover:bg-red-600 hover:shadow-[0_6px_20px_rgba(229,57,53,0.5)] hover:-translate-y-0.5 active:translate-y-0'}`}
          >
            {isGenerating ? 'Generating...' : 'Generate Grid'}
          </button>
        </div>

        </form>
      )}

      {mode === 'document' && (
        <form onSubmit={handleGenerateFromDocument} className="flex flex-col">
          <div className="flex flex-col md:flex-row md:items-center py-5 border-b border-[#E53935]/30 gap-4">
            <label className="text-[#e06666] font-semibold text-lg md:w-1/3">
              Puzzle Title
            </label>
            <div className="flex-1">
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Enter Puzzle Name"
                className="w-full bg-[#141414] text-gray-300 px-4 py-2.5 rounded-md text-sm outline-none border border-transparent focus:border-[#E53935]/50 shadow-inner placeholder:text-gray-600 transition-colors"
              />
            </div>
          </div>

          <div className="flex flex-col md:flex-row md:items-center py-5 border-b border-[#E53935]/30 gap-4">
            <label className="text-[#e06666] font-semibold text-lg md:w-1/3">
              Upload File
            </label>
            <div className="flex-1">
              <input
                type="file"
                accept=".pdf,.docx"
                onChange={(e) => setDocFile(e.target.files?.[0] || null)}
                className="text-sm text-gray-300"
              />
              <div className="text-xs text-gray-500 mt-1">PDF or DOCX only, max 5MB.</div>
            </div>
          </div>

          <div className="flex flex-col md:flex-row md:items-center py-5 border-b border-[#E53935]/30 gap-4">
            <label className="text-[#e06666] font-semibold text-lg md:w-1/3">
              Difficulty
            </label>
            <div className="flex-1">
              <select
                value={docDifficulty}
                onChange={(e) => setDocDifficulty(e.target.value)}
                className="w-full bg-[#141414] text-gray-300 px-4 py-2.5 rounded-md text-sm outline-none border border-transparent focus:border-[#E53935]/50 shadow-inner"
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
          </div>

          <div className="flex flex-col md:flex-row md:items-center py-5 border-b border-[#E53935]/30 gap-4">
            <label className="text-[#e06666] font-semibold text-lg md:w-1/3">
              Number of Questions
            </label>
            <div className="flex-1">
              <input
                type="number"
                min="5"
                max="20"
                value={numQuestions}
                onChange={(e) => setNumQuestions(Number(e.target.value))}
                className="w-full bg-[#141414] text-gray-300 px-4 py-2.5 rounded-md text-sm outline-none border border-transparent focus:border-[#E53935]/50 shadow-inner"
              />
            </div>
          </div>

          <div className="flex flex-col md:flex-row md:items-center py-5 border-b border-[#E53935]/30 gap-4">
            <label className="text-[#e06666] font-semibold text-lg md:w-1/3">
              Topic Hint
            </label>
            <div className="flex-1">
              <input
                type="text"
                value={topicHint}
                onChange={(e) => setTopicHint(e.target.value)}
                placeholder="Focus on this topic from the document"
                className="w-full bg-[#141414] text-gray-300 px-4 py-2.5 rounded-md text-sm outline-none border border-transparent focus:border-[#E53935]/50 shadow-inner placeholder:text-gray-600 transition-colors"
              />
            </div>
          </div>

          <div className="mt-8 flex justify-center">
            <button
              type="submit"
              disabled={isGenerating}
              className={`bg-[#E53935] text-white font-bold py-3 px-8 rounded-xl shadow-[0_4px_15px_rgba(229,57,53,0.3)] transition-all duration-300 
              ${isGenerating ? 'opacity-70 cursor-not-allowed' : 'hover:bg-red-600 hover:shadow-[0_6px_20px_rgba(229,57,53,0.5)] hover:-translate-y-0.5 active:translate-y-0'}`}
            >
              {isGenerating ? 'Generating...' : 'Generate Puzzle'}
            </button>
          </div>
        </form>
      )}
      {errorMessage && (
        <div className="mt-4 text-sm text-red-400">{errorMessage}</div>
      )}
      {successMessage && (
        <div className="mt-4 text-sm text-green-400">{successMessage}</div>
      )}
    </div>
  );
};

export default CreatePuzzleForm;
