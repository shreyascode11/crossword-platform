'use client';

import React, { useState } from 'react';
import { Clock, Hourglass, Square, Layers, Info, ChevronDown, Sparkles, PenLine } from 'lucide-react';
import { createPuzzle, generateFromDocument } from '../lib/api';

/* Palette — taupe/cream base + copper complement */
const C = {
  bg:     '#0f0e14',
  felt:   '#17151f',
  card:   '#1e1b29',
  paper:  '#262233',
  rule:   '#363047',
  taupe:  '#7c5cff',   /* warm taupe — manual mode accent  */
  tan:    '#22d3c9',   /* warm tan — secondary              */
  stone:  '#c7c2d9',   /* stone — labels / secondary text   */
  cream:  '#ede9f7',   /* parchment cream — primary text    */
  muted:  '#8d87a3',   /* warm gray — placeholders          */
  copper: '#ff9f43',   /* copper — AI / document mode accent */
  rust:   '#ff4d6d',   /* error                             */
};

/* ── Field row wrapper ─────────────────────────────── */
const FieldRow = ({ label, children }) => (
  <div className="flex flex-col md:flex-row md:items-center py-5 gap-4 border-b" style={{ borderColor: "rgba(124,92,255,0.08)" }}>
    <label className="font-display font-bold text-sm md:w-1/3 shrink-0" style={{ color: C.stone }}>{label}</label>
    <div className="flex-1">{children}</div>
  </div>
);

/* ── Styled select ─────────────────────────────────── */
const StyledSelect = ({ icon: Icon, options = [], name, value, onChange, accent = C.taupe }) => (
  <div className="relative flex-1 min-w-[140px] group">
    <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none transition-colors"
      style={{ color: C.muted }}>
      <Icon size={15} />
    </div>
    <select name={name} value={value} onChange={onChange}
      className="w-full appearance-none px-4 pl-9 pr-9 py-3 rounded-xl text-sm font-mono outline-none cursor-pointer border transition-all"
      style={{ background: "rgba(0,0,0,0.35)", color: C.cream, borderColor: "rgba(124,92,255,0.12)" }}
      onFocus={e => e.target.style.borderColor = `${accent}55`}
      onBlur={e => e.target.style.borderColor = "rgba(124,92,255,0.12)"}>
      {options.map((opt, i) => <option key={i} value={opt}>{opt}</option>)}
    </select>
    <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none opacity-50" style={{ color: C.muted }} />
  </div>
);

/* ── Text / number input ───────────────────────────── */
const StyledInput = ({ accent = C.taupe, ...props }) => (
  <input
    {...props}
    className="w-full px-4 py-3 rounded-xl text-sm font-mono outline-none border transition-all"
    style={{ background: "rgba(0,0,0,0.35)", color: C.cream, borderColor: "rgba(124,92,255,0.12)", ...props.style }}
    onFocus={e => e.target.style.borderColor = `${accent}55`}
    onBlur={e => e.target.style.borderColor = "rgba(124,92,255,0.12)"}
  />
);

/* ── Decorative crossword corner ───────────────────── */
const GridDeco = ({ accent }) => (
  <svg width="72" height="72" viewBox="0 0 72 72" className="opacity-[0.06]" aria-hidden>
    {[0,24,48].flatMap(r => [0,24,48].map(c => (
      <rect key={`${r}-${c}`} x={c+1} y={r+1} width={22} height={22}
        fill={((r + c) / 24) % 2 === 0 ? accent : 'none'}
        stroke={accent} strokeWidth="0.6" rx="1" />
    )))}
  </svg>
);

/* ═══════════════════════════════════════════════════ */
const CreatePuzzleForm = ({ onPuzzleCreated, onShowPreview }) => {
  const [formData, setFormData] = useState({
    title: '', timer: '20 Minutes', accessWindowDuration: '10 min window',
    accessWindowType: 'Clear', difficulty: 'Easy', hints: 'Hints On',
  });
  const [mode, setMode]                 = useState('manual');
  const [docFile, setDocFile]           = useState(null);
  const [docDifficulty, setDocDifficulty] = useState('easy');
  const [numQuestions, setNumQuestions] = useState(10);
  const [topicHint, setTopicHint]       = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(p => ({ ...p, [name]: value }));
  };

  const handleSubmit = e => {
    e.preventDefault();
    if (!formData.title.trim()) { alert('Please enter a Puzzle Title first!'); return; }
    setErrorMessage(''); setSuccessMessage(''); setIsGenerating(true);
    createPuzzle({
      title: formData.title.trim(),
      teacher_id: localStorage.getItem('userId') || '',
      validation_mode: formData.hints === 'Hints On' ? 'instant' : 'on_submit',
    })
      .then(puzzle => {
        localStorage.setItem('activePuzzleId', String(puzzle.id));
        onPuzzleCreated?.(puzzle);
        setSuccessMessage(`Puzzle "${formData.title}" created successfully.`);
      })
      .catch(() => setErrorMessage('Failed to create puzzle. Ensure teacher login is valid.'))
      .finally(() => setIsGenerating(false));
  };

  const handleGenerateFromDocument = async e => {
    e.preventDefault();
    if (!formData.title.trim()) { alert('Please enter a Puzzle Title first!'); return; }
    if (!docFile)               { alert('Please upload a PDF or DOCX document.'); return; }
    setErrorMessage(''); setSuccessMessage(''); setIsGenerating(true);
    try {
      const response = await generateFromDocument({
        file: docFile, difficulty: docDifficulty,
        num_questions: numQuestions, topic_hint: topicHint.trim(),
        puzzle_title: formData.title.trim(),
        teacher_id: localStorage.getItem('userId') || '',
      });
      localStorage.setItem('activePuzzleId', String(response.id || response.puzzle_id));
      onPuzzleCreated?.(response);
      onShowPreview?.();
      setSuccessMessage('Puzzle generated from document successfully.');
    } catch (err) {
      setErrorMessage(err?.message || 'AI generation failed. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  /* Which accent colour depends on mode */
  const accent = mode === 'document' ? C.copper : C.taupe;

  return (
    <div className="w-full max-w-2xl animate-fade-up" style={{ fontFamily: "inherit" }}>
      <div className="relative rounded-2xl border overflow-hidden"
        style={{ background: `linear-gradient(145deg,${C.card} 0%,${C.felt} 60%,${C.bg} 100%)`, borderColor: "rgba(124,92,255,0.15)" }}>

        {/* Ambient glow behind header */}
        <div className="pointer-events-none absolute top-0 left-0 right-0 h-40 opacity-20"
          style={{ background: `radial-gradient(ellipse at 50% -20%, ${accent} 0%, transparent 70%)` }} />

        {/* Deco corners */}
        <div className="absolute top-0 right-0 p-3 pointer-events-none"><GridDeco accent={accent} /></div>
        <div className="absolute bottom-0 left-0 p-3 pointer-events-none rotate-180 opacity-60"><GridDeco accent={accent} /></div>

        <div className="relative p-8 md:p-9">

          {/* ── Header ── */}
          <div className="mb-7 pb-5 border-b" style={{ borderColor: "rgba(124,92,255,0.1)" }}>
            <p className="font-mono text-[10px] uppercase tracking-[0.32em] mb-2" style={{ color: C.muted }}>
              ✦ Teacher Console
            </p>
            <h2 className="font-display font-black text-4xl tracking-tight" style={{ color: C.cream }}>
              Create <span style={{ color: accent }} className="animate-flicker">Puzzle</span>
            </h2>
            <p className="font-mono text-xs mt-2" style={{ color: C.muted }}>
              Build a crossword manually or generate one with AI from a document.
            </p>
          </div>

          {/* ── Mode toggle ── */}
          <div className="flex p-1 rounded-xl gap-1 mb-8"
            style={{ background: "rgba(0,0,0,0.4)", border: "1px solid rgba(124,92,255,0.08)" }}>
            {[
              { key: 'manual',   Icon: PenLine,   label: 'Manual Entry',    accent: C.taupe  },
              { key: 'document', Icon: Sparkles,   label: 'AI from Document', accent: C.copper },
            ].map(tab => (
              <button key={tab.key} type="button" onClick={() => setMode(tab.key)}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-mono font-bold text-xs tracking-widest uppercase transition-all duration-250"
                style={mode === tab.key
                  ? { background: `linear-gradient(135deg,${tab.accent},${tab.accent}bb)`, color: C.bg, boxShadow: `0 6px 22px -8px ${tab.accent}70` }
                  : { color: C.muted }}>
                <tab.Icon size={13} />
                {tab.label}
              </button>
            ))}
          </div>

          {/* ══════════ MANUAL FORM ══════════ */}
          {mode === 'manual' && (
            <form onSubmit={handleSubmit} className="flex flex-col">
              <FieldRow label="Puzzle Title">
                <StyledInput
                  type="text" name="title" value={formData.title} onChange={handleChange}
                  placeholder="Enter Puzzle Name" accent={C.taupe}
                  style={{ "::placeholder": { color: C.muted } }} />
              </FieldRow>

              <FieldRow label="Timer">
                <div className="flex">
                  <StyledSelect icon={Clock} name="timer" value={formData.timer} onChange={handleChange} accent={C.taupe}
                    options={["Timer", "10 Minutes", "20 Minutes", "30 Minutes", "No Timer"]} />
                </div>
              </FieldRow>

              <FieldRow label="Access Window">
                <div className="flex flex-col sm:flex-row gap-3">
                  <StyledSelect icon={Hourglass} name="accessWindowDuration" value={formData.accessWindowDuration}
                    onChange={handleChange} accent={C.taupe}
                    options={["5 min to 10000", "10 min window", "1 hour window"]} />
                  <StyledSelect icon={Square} name="accessWindowType" value={formData.accessWindowType}
                    onChange={handleChange} accent={C.taupe}
                    options={["Clear", "Strict", "Flexible"]} />
                </div>
              </FieldRow>

              <FieldRow label="Difficulty & Hints">
                <div className="flex flex-col sm:flex-row gap-3">
                  <StyledSelect icon={Layers} name="difficulty" value={formData.difficulty}
                    onChange={handleChange} accent={C.taupe}
                    options={["Assorted", "Easy", "Medium", "Hard"]} />
                  <StyledSelect icon={Info} name="hints" value={formData.hints}
                    onChange={handleChange} accent={C.taupe}
                    options={["Answer", "Hints On", "Hints Off"]} />
                </div>
              </FieldRow>

              {/* Divider */}
              <div className="my-6 h-px" style={{ background: `linear-gradient(to right,transparent,${C.taupe}30,transparent)` }} />

              <div className="flex justify-center">
                <button type="submit" disabled={isGenerating}
                  className="min-w-[220px] font-mono font-bold py-4 px-10 rounded-xl tracking-[0.2em] uppercase text-sm btn-press disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  style={{
                    background: isGenerating ? "rgba(124,92,255,0.25)" : `linear-gradient(135deg,${C.taupe},${C.tan})`,
                    color: C.bg,
                    boxShadow: isGenerating ? "none" : `0 12px 36px -12px ${C.taupe}70`,
                  }}>
                  {isGenerating ? '— Generating… —' : '— Generate Grid —'}
                </button>
              </div>
            </form>
          )}

          {/* ══════════ DOCUMENT / AI FORM ══════════ */}
          {mode === 'document' && (
            <form onSubmit={handleGenerateFromDocument} className="flex flex-col">

              {/* AI badge */}
              <div className="flex items-center gap-2 mb-5 px-4 py-3 rounded-xl border"
                style={{ background: `${C.copper}0d`, borderColor: `${C.copper}28` }}>
                <Sparkles size={14} style={{ color: C.copper }} />
                <span className="font-mono text-xs" style={{ color: C.copper }}>
                  AI reads your document and auto-generates crossword clues and answers.
                </span>
              </div>

              <FieldRow label="Puzzle Title">
                <StyledInput type="text" name="title" value={formData.title} onChange={handleChange}
                  placeholder="Enter Puzzle Name" accent={C.copper} />
              </FieldRow>

              <FieldRow label="Upload File">
                <div className="rounded-xl border border-dashed p-5 text-center transition-all duration-200"
                  style={{ borderColor: `${C.copper}28`, background: `${C.copper}05` }}
                  onDragOver={e => { e.preventDefault(); e.currentTarget.style.borderColor = `${C.copper}60`; e.currentTarget.style.background = `${C.copper}0d`; }}
                  onDragLeave={e => { e.currentTarget.style.borderColor = `${C.copper}28`; e.currentTarget.style.background = `${C.copper}05`; }}>
                  <input type="file" accept=".pdf,.docx"
                    onChange={e => setDocFile(e.target.files?.[0] || null)}
                    className="w-full text-sm font-mono cursor-pointer
                      file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0
                      file:text-xs file:font-bold file:tracking-wider file:uppercase
                      file:cursor-pointer hover:file:brightness-110"
                    style={{ color: C.stone }} />
                  <div className="mt-2 font-mono text-[10px]" style={{ color: C.muted }}>PDF or DOCX · max 5 MB</div>
                  {docFile && (
                    <div className="mt-2 font-mono text-[11px] px-3 py-1.5 rounded-lg inline-block"
                      style={{ background: `${C.copper}15`, color: C.copper, border: `1px solid ${C.copper}30` }}>
                      ✓ {docFile.name}
                    </div>
                  )}
                </div>
              </FieldRow>

              <FieldRow label="Difficulty">
                <select value={docDifficulty} onChange={e => setDocDifficulty(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl text-sm font-mono outline-none border transition-all"
                  style={{ background: "rgba(0,0,0,0.35)", color: C.cream, borderColor: "rgba(124,92,255,0.12)" }}
                  onFocus={e => e.target.style.borderColor = `${C.copper}55`}
                  onBlur={e => e.target.style.borderColor = "rgba(124,92,255,0.12)"}>
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </FieldRow>

              <FieldRow label="No. of Questions">
                <StyledInput type="number" min="5" max="20" value={numQuestions} accent={C.copper}
                  onChange={e => setNumQuestions(Number(e.target.value))} />
              </FieldRow>

              <FieldRow label="Topic Hint">
                <StyledInput type="text" value={topicHint} onChange={e => setTopicHint(e.target.value)} accent={C.copper}
                  placeholder="e.g. Focus on photosynthesis" />
              </FieldRow>

              <div className="my-6 h-px" style={{ background: `linear-gradient(to right,transparent,${C.copper}30,transparent)` }} />

              <div className="flex justify-center">
                <button type="submit" disabled={isGenerating}
                  className="min-w-[240px] font-mono font-bold py-4 px-10 rounded-xl tracking-[0.2em] uppercase text-sm btn-press disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  style={{
                    background: isGenerating ? "rgba(255,159,67,0.25)" : `linear-gradient(135deg,${C.copper},${C.tan})`,
                    color: C.bg,
                    boxShadow: isGenerating ? "none" : `0 12px 36px -12px ${C.copper}70`,
                  }}>
                  {isGenerating ? '— Generating… —' : '— Generate with AI —'}
                </button>
              </div>
            </form>
          )}

          {/* Messages */}
          {errorMessage && (
            <div className="mt-5 px-4 py-3 rounded-xl text-sm font-mono border"
              style={{ background: "rgba(255,77,109,0.12)", borderColor: "rgba(255,77,109,0.3)", color: "#f0a0a0" }}>
              ✕ {errorMessage}
            </div>
          )}
          {successMessage && (
            <div className="mt-5 px-4 py-3 rounded-xl text-sm font-mono border"
              style={{ background: "rgba(124,92,255,0.08)", borderColor: "rgba(124,92,255,0.25)", color: C.taupe }}>
              ✓ {successMessage}
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default CreatePuzzleForm;