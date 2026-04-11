import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { FileText, Plus, Trash2, CheckCircle } from 'lucide-react';
import {
  addClues,
  archivePuzzle,
  deleteClue,
  previewPuzzle,
  publishPuzzle,
  regeneratePuzzleLayout,
  updateClue,
} from '../api';

const TeacherContentUpload = ({ onPuzzlePublished, activePuzzleId: activePuzzleIdProp }) => {
  const [manualEntries, setManualEntries] = useState([
    { word: '', clue: '' },
    { word: '', clue: '' },
    { word: '', clue: '' },
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [previewData, setPreviewData] = useState(null);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  const [editingClueId, setEditingClueId] = useState(null);
  const [editForm, setEditForm] = useState({ clue: '', answer: '' });

  const activePuzzleId = Number(activePuzzleIdProp || localStorage.getItem('activePuzzleId') || 0);
  const clueList = useMemo(() => (Array.isArray(previewData?.clues) ? previewData.clues : []), [previewData]);
  const puzzleStatus = previewData?.status || 'draft';
  const puzzleTitle = previewData?.title || '';
  const isDraft = puzzleStatus === 'draft';
  const isArchived = puzzleStatus === 'archived';

  const loadPreview = useCallback(async () => {
    if (!activePuzzleId) return;
    setIsLoadingPreview(true);
    try {
      const data = await previewPuzzle(activePuzzleId, 'Teacher');
      setPreviewData(data);
      setErrorMessage('');
    } catch (error) {
      console.error('Preview load failed', error);
      setErrorMessage('Could not load puzzle preview.');
    } finally {
      setIsLoadingPreview(false);
    }
  }, [activePuzzleId]);

  useEffect(() => {
    loadPreview();
  }, [loadPreview]);

  const handleEntryChange = (index, field, value) => {
    const newEntries = [...manualEntries];
    newEntries[index][field] = value;
    setManualEntries(newEntries);
  };

  const addRow = () => setManualEntries([...manualEntries, { word: '', clue: '' }]);
  const removeRow = (index) => setManualEntries(manualEntries.filter((_, i) => i !== index));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    setIsSubmitting(true);
    if (!activePuzzleId) {
      setErrorMessage('Select or create a puzzle first.');
      setIsSubmitting(false);
      return;
    }

    const entries = manualEntries
      .map((entry) => ({ word: entry.word.trim(), clue: entry.clue.trim() }))
      .filter((entry) => entry.word && entry.clue);

    if (entries.length === 0) {
      setErrorMessage('Add at least one valid word and clue pair.');
      setIsSubmitting(false);
      return;
    }

    try {
      await addClues({ puzzle_id: activePuzzleId, entries });
      await loadPreview();
      if (typeof onPuzzlePublished === 'function') {
        await onPuzzlePublished();
      }
      setManualEntries([{ word: '', clue: '' }, { word: '', clue: '' }, { word: '', clue: '' }]);
          setSuccessMessage('Clue(s) added successfully.');
    } catch (error) {
      console.error('Add clues failed:', error);
      setErrorMessage(error?.message || 'Failed to add clues. Please verify entries and retry.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegenerate = async () => {
    if (!activePuzzleId) {
      setErrorMessage('Select or create a puzzle first.');
      return;
    }
    try {
      await regeneratePuzzleLayout(activePuzzleId);
      await loadPreview();
      if (typeof onPuzzlePublished === 'function') await onPuzzlePublished();
      setSuccessMessage('Preview regenerated successfully.');
    } catch (error) {
      console.error('Regenerate failed', error);
      setErrorMessage(error?.message || 'Layout regeneration failed.');
    }
  };

  const handlePublish = async () => {
    if (!activePuzzleId) {
      setErrorMessage('Select or create a puzzle first.');
      return;
    }
    try {
      await publishPuzzle({ puzzle_id: activePuzzleId });
      await loadPreview();
      if (typeof onPuzzlePublished === 'function') await onPuzzlePublished();
      setSuccessMessage('Puzzle published successfully.');
    } catch (error) {
      console.error('Publish failed', error);
      setErrorMessage(error?.message || 'Publish failed.');
    }
  };

  const handleArchive = async () => {
    if (!activePuzzleId) {
      setErrorMessage('Select or create a puzzle first.');
      return;
    }
    try {
      await archivePuzzle(activePuzzleId);
      await loadPreview();
      if (typeof onPuzzlePublished === 'function') await onPuzzlePublished();
      setSuccessMessage('Puzzle archived successfully.');
    } catch (error) {
      console.error('Archive failed', error);
      setErrorMessage(error?.message || 'Archive failed.');
    }
  };

  const startEditClue = (clue) => {
    setEditingClueId(clue.id);
    setEditForm({ clue: clue.clue || clue.question || '', answer: '' });
  };

  const saveClueEdit = async () => {
    if (!editingClueId) return;
    try {
      await updateClue(editingClueId, {
        clue: editForm.clue,
        answer: editForm.answer || undefined,
      });
      setEditingClueId(null);
      setEditForm({ clue: '', answer: '' });
      await loadPreview();
      if (typeof onPuzzlePublished === 'function') await onPuzzlePublished();
      setSuccessMessage('Clue updated successfully.');
    } catch (error) {
      console.error('Update clue failed', error);
      setErrorMessage('Could not update clue.');
    }
  };

  const handleDeleteClue = async (clueId) => {
    try {
      await deleteClue(clueId);
      await loadPreview();
      if (typeof onPuzzlePublished === 'function') await onPuzzlePublished();
      setSuccessMessage('Clue deleted successfully.');
    } catch (error) {
      console.error('Delete clue failed', error);
      setErrorMessage('Could not delete clue.');
    }
  };

  const openPrintable = () => {
    if (!activePuzzleId) return;
    window.open(`http://127.0.0.1:8000/api/puzzles/${activePuzzleId}/export/`, '_blank');
  };

  return (
    <div className="w-full max-w-4xl bg-gradient-to-br from-[#141416] via-[#101012] to-[#0c0c0e] rounded-2xl p-8 md:p-9 shadow-[0_28px_70px_-35px_rgba(0,0,0,0.9)] border border-white/[0.07] font-sans text-white">
      <div className="border-b border-white/[0.06] pb-6 mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <p className="text-[11px] uppercase tracking-[0.28em] text-gray-500 font-semibold m-0 mb-2">Content</p>
          <h2 className="text-3xl font-bold text-white tracking-tight m-0">
            Add Puzzle <span className="text-[#e63946]">Content</span>
          </h2>
          <p className="text-gray-400 mt-2 m-0 text-sm leading-relaxed max-w-2xl">
            Provide clue and answer pairs for the crossword
          </p>
          <p className="text-gray-500 text-xs mt-3 m-0 px-3 py-2 rounded-lg bg-black/30 border border-white/[0.06] inline-block">
            {puzzleTitle ? `Selected: ${puzzleTitle} (${puzzleStatus})` : 'Select a puzzle from the dashboard list.'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <div className="flex flex-col gap-4 animate-in fade-in duration-300">
          <div className="grid grid-cols-[1fr_2fr_auto] gap-4 px-2 text-gray-500 text-[11px] font-semibold uppercase tracking-wider mb-1">
            <span>Target Word (Answer)</span>
            <span>Clue Description</span>
            <span></span>
          </div>
          {manualEntries.map((entry, index) => (
            <div key={index} className="grid grid-cols-[1fr_2fr_auto] gap-4 items-center bg-[#0c0a0a]/90 p-3 rounded-xl border border-white/[0.06] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] hover:border-white/10 transition-colors">
              <input
                type="text"
                placeholder="e.g. REACT"
                value={entry.word}
                onChange={(e) => handleEntryChange(index, 'word', e.target.value)}
                disabled={!isDraft}
                className="bg-[#080808] text-white px-4 py-3 rounded-lg border border-white/[0.06] focus:border-[#e63946]/50 focus:ring-2 focus:ring-[#e63946]/15 outline-none uppercase font-bold tracking-wider w-full placeholder:text-gray-600 disabled:opacity-50"
              />
              <input
                type="text"
                placeholder="e.g. A popular JavaScript library"
                value={entry.clue}
                onChange={(e) => handleEntryChange(index, 'clue', e.target.value)}
                disabled={!isDraft}
                className="bg-[#080808] text-gray-200 px-4 py-3 rounded-lg border border-white/[0.06] focus:border-[#e63946]/50 focus:ring-2 focus:ring-[#e63946]/15 outline-none w-full placeholder:text-gray-600 disabled:opacity-50"
              />
              <button
                type="button"
                onClick={() => removeRow(index)}
                disabled={!isDraft}
                className="p-3 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-colors border border-transparent hover:border-red-500/20 disabled:opacity-40"
              >
                <Trash2 size={20} />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={addRow}
            disabled={!isDraft}
            className="flex items-center gap-2 text-[#e63946] font-semibold hover:bg-[#e63946]/10 w-max px-4 py-2.5 rounded-xl transition-colors mt-1 border border-[#e63946]/25 disabled:opacity-40"
          >
            <Plus size={18} strokeWidth={3} /> Add Another Word
          </button>
        </div>

        <div className="mt-8 pt-6 border-t border-white/[0.06] flex flex-wrap gap-2.5 justify-end">
          <button
            type="submit"
            disabled={isSubmitting || !isDraft}
            className="flex items-center gap-2 bg-gradient-to-r from-[#e63946] to-[#c62f3a] text-white font-bold py-3 px-6 rounded-xl shadow-[0_12px_32px_-14px_rgba(230,57,70,0.65)] border border-white/10 hover:brightness-110 disabled:opacity-50 disabled:hover:brightness-100"
          >
            <CheckCircle size={20} />
            {isSubmitting ? 'Submitting...' : 'Add Clues'}
          </button>
          <button type="button" onClick={handleRegenerate} disabled={!isDraft} className="bg-white/[0.06] text-gray-200 py-3 px-5 rounded-xl border border-white/10 hover:bg-white/[0.1] font-semibold text-sm disabled:opacity-40">Regenerate</button>
          <button type="button" onClick={loadPreview} disabled={!activePuzzleId} className="bg-white/[0.04] text-gray-200 py-3 px-5 rounded-xl border border-white/10 hover:bg-white/[0.08] font-semibold text-sm disabled:opacity-40">Refresh Preview</button>
          <button type="button" onClick={handlePublish} disabled={!isDraft} className="bg-emerald-600/90 text-white py-3 px-5 rounded-xl border border-emerald-400/25 hover:bg-emerald-500 font-semibold text-sm shadow-sm disabled:opacity-40">Publish</button>
          <button type="button" onClick={handleArchive} disabled={isArchived} className="bg-amber-600/90 text-white py-3 px-5 rounded-xl border border-amber-400/25 hover:bg-amber-500 font-semibold text-sm shadow-sm disabled:opacity-40">Archive</button>
          <button type="button" onClick={openPrintable} className="bg-slate-700/90 text-gray-100 py-3 px-5 rounded-xl border border-white/10 hover:bg-slate-600 font-semibold text-sm inline-flex items-center gap-2">
            <FileText size={16} className="inline" />
            Export
          </button>
        </div>
        {errorMessage && <div className="text-sm text-red-300 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">{errorMessage}</div>}
        {successMessage && <div className="text-sm text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 py-3">{successMessage}</div>}
      </form>

      <div className="mt-8 border-t border-white/[0.06] pt-6">
        <h3 className="text-lg font-bold text-white mb-1 tracking-tight">Puzzle Preview</h3>
        <p className="text-xs text-gray-500 mb-4">Layout and clues update after you save.</p>
        {isLoadingPreview && <div className="text-sm text-gray-400">Loading preview...</div>}
        {!isLoadingPreview && previewData && (
          <div className="space-y-4">
            <div className="text-sm text-gray-300">Status: {previewData.status} | Difficulty: {previewData.difficulty}</div>
            <div className="inline-block rounded-2xl border border-white/[0.08] bg-black/40 p-3 shadow-inner">
              <div className="grid gap-1 max-w-[360px]" style={{ gridTemplateColumns: `repeat(${previewData.grid_size || 1}, 1fr)` }}>
                {(previewData.cells || []).flatMap((row, rIdx) =>
                  row.map((cell, cIdx) =>
                    cell ? (
                      <div key={`${rIdx}-${cIdx}`} className="relative h-8 bg-[#f4f1ec] rounded-md text-black text-[10px] border border-stone-200/80 shadow-sm">
                        {cell.number ? <span className="absolute top-0 left-1 font-bold text-stone-700">{cell.number}</span> : null}
                      </div>
                    ) : (
                      <div key={`${rIdx}-${cIdx}`} className="h-8 bg-[#0a0a0a] rounded-md border border-white/[0.04]" />
                    )
                  )
                )}
              </div>
            </div>

            <div className="bg-[#0c0a0a]/90 p-5 rounded-2xl border border-white/[0.06] shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">Clues</h4>
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {clueList.map((clue) => (
                  <div key={clue.id} className="text-sm text-gray-200 bg-[#080808] p-3 rounded-xl border border-white/[0.06]">
                    {editingClueId === clue.id ? (
                      <div className="flex flex-col gap-2">
                        <input
                          value={editForm.clue}
                          onChange={(e) => setEditForm((prev) => ({ ...prev, clue: e.target.value }))}
                          disabled={!isDraft}
                          className="bg-black/50 border border-white/10 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-[#e63946]/25 focus:border-[#e63946]/40 outline-none"
                        />
                        <input
                          placeholder="Optional new answer"
                          value={editForm.answer}
                          onChange={(e) => setEditForm((prev) => ({ ...prev, answer: e.target.value }))}
                          disabled={!isDraft}
                          className="bg-black/50 border border-white/10 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-[#e63946]/25 focus:border-[#e63946]/40 outline-none"
                        />
                        <div className="flex gap-2">
                          <button type="button" onClick={saveClueEdit} disabled={!isDraft} className="text-xs font-semibold bg-emerald-600/90 text-white px-3 py-1.5 rounded-lg border border-emerald-400/25 hover:bg-emerald-500 disabled:opacity-40">Save</button>
                          <button type="button" onClick={() => setEditingClueId(null)} className="text-xs font-semibold bg-white/[0.08] text-gray-200 px-3 py-1.5 rounded-lg border border-white/10 hover:bg-white/[0.12]">Cancel</button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-gray-300 leading-snug">
                          {clue.number}. {clue.clue || clue.question} → {(clue.answer || '').toUpperCase()} ({clue.answer_length})
                        </span>
                        <div className="flex gap-1 shrink-0">
                          <button type="button" onClick={() => startEditClue(clue)} disabled={!isDraft} className="text-xs font-semibold bg-blue-600/90 text-white px-2.5 py-1.5 rounded-lg border border-blue-400/20 hover:bg-blue-500 disabled:opacity-40">Edit</button>
                          <button type="button" onClick={() => handleDeleteClue(clue.id)} disabled={!isDraft} className="text-xs font-semibold bg-red-600/90 text-white px-2.5 py-1.5 rounded-lg border border-red-400/25 hover:bg-red-500 disabled:opacity-40">Delete</button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeacherContentUpload;
