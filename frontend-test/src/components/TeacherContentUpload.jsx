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
    <div className="w-full max-w-4xl bg-[#111111] rounded-2xl p-8 shadow-[0_15px_40px_rgba(0,0,0,0.8)] border border-white/5 font-sans text-white">
      <div className="border-b border-white/10 pb-6 mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-[#e06666] tracking-wide">
            Add Puzzle Content
          </h2>
          <p className="text-gray-400 font-serif italic mt-1">
            Provide clue and answer pairs for the crossword
          </p>
          <p className="text-gray-500 text-sm mt-2">
            {puzzleTitle ? `Selected: ${puzzleTitle} (${puzzleStatus})` : 'Select a puzzle from the dashboard list.'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <div className="flex flex-col gap-4 animate-in fade-in duration-300">
          <div className="grid grid-cols-[1fr_2fr_auto] gap-4 px-2 text-gray-400 font-serif italic text-sm mb-2">
            <span>Target Word (Answer)</span>
            <span>Clue Description</span>
            <span></span>
          </div>
          {manualEntries.map((entry, index) => (
            <div key={index} className="grid grid-cols-[1fr_2fr_auto] gap-4 items-center bg-[#181313] p-2 rounded-xl border border-white/5">
              <input
                type="text"
                placeholder="e.g. REACT"
                value={entry.word}
                onChange={(e) => handleEntryChange(index, 'word', e.target.value)}
                disabled={!isDraft}
                className="bg-[#0a0a0a] text-white px-4 py-3 rounded-lg border border-transparent focus:border-[#E53935]/50 outline-none uppercase font-bold tracking-wider w-full"
              />
              <input
                type="text"
                placeholder="e.g. A popular JavaScript library"
                value={entry.clue}
                onChange={(e) => handleEntryChange(index, 'clue', e.target.value)}
                disabled={!isDraft}
                className="bg-[#0a0a0a] text-gray-300 px-4 py-3 rounded-lg border border-transparent focus:border-[#E53935]/50 outline-none w-full"
              />
              <button
                type="button"
                onClick={() => removeRow(index)}
                disabled={!isDraft}
                className="p-3 text-gray-600 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
              >
                <Trash2 size={20} />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={addRow}
            disabled={!isDraft}
            className="flex items-center gap-2 text-[#E53935] font-bold hover:bg-[#E53935]/10 w-max px-4 py-2 rounded-lg transition-colors mt-2"
          >
            <Plus size={18} strokeWidth={3} /> Add Another Word
          </button>
        </div>

        <div className="mt-8 pt-6 border-t border-white/10 flex flex-wrap gap-3 justify-end">
          <button
            type="submit"
            disabled={isSubmitting || !isDraft}
            className="flex items-center gap-2 bg-[#E53935] text-white font-bold py-3 px-6 rounded-xl shadow-[0_4px_15px_rgba(229,57,53,0.3)] hover:bg-red-600 transition-all"
          >
            <CheckCircle size={20} />
            {isSubmitting ? 'Submitting...' : 'Add Clues'}
          </button>
          <button type="button" onClick={handleRegenerate} disabled={!isDraft} className="bg-[#221515] text-gray-200 py-3 px-5 rounded-xl">Regenerate</button>
          <button type="button" onClick={loadPreview} disabled={!activePuzzleId} className="bg-[#1b1b1b] text-gray-200 py-3 px-5 rounded-xl">Refresh Preview</button>
          <button type="button" onClick={handlePublish} disabled={!isDraft} className="bg-[#1d3d2c] text-gray-100 py-3 px-5 rounded-xl">Publish</button>
          <button type="button" onClick={handleArchive} disabled={isArchived} className="bg-[#3d1d1d] text-gray-100 py-3 px-5 rounded-xl">Archive</button>
          <button type="button" onClick={openPrintable} className="bg-[#1f2937] text-gray-100 py-3 px-5 rounded-xl">
            <FileText size={16} className="inline mr-2" />
            Export
          </button>
        </div>
        {errorMessage && <div className="text-sm text-red-400">{errorMessage}</div>}
        {successMessage && <div className="text-sm text-green-400">{successMessage}</div>}
      </form>

      <div className="mt-8 border-t border-white/10 pt-6">
        <h3 className="text-xl text-[#e06666] mb-4">Puzzle Preview</h3>
        {isLoadingPreview && <div className="text-sm text-gray-400">Loading preview...</div>}
        {!isLoadingPreview && previewData && (
          <div className="space-y-4">
            <div className="text-sm text-gray-300">Status: {previewData.status} | Difficulty: {previewData.difficulty}</div>
            <div className="grid gap-1 max-w-[360px]" style={{ gridTemplateColumns: `repeat(${previewData.grid_size || 1}, 1fr)` }}>
              {(previewData.cells || []).flatMap((row, rIdx) =>
                row.map((cell, cIdx) =>
                  cell ? (
                    <div key={`${rIdx}-${cIdx}`} className="relative h-8 bg-white rounded text-black text-[10px]">
                      {cell.number ? <span className="absolute top-0 left-1">{cell.number}</span> : null}
                    </div>
                  ) : (
                    <div key={`${rIdx}-${cIdx}`} className="h-8 bg-black rounded" />
                  )
                )
              )}
            </div>

            <div className="bg-[#181313] p-4 rounded-xl border border-white/5">
              <h4 className="text-sm text-gray-300 mb-2">Clues</h4>
              <div className="space-y-2 max-h-56 overflow-y-auto">
                {clueList.map((clue) => (
                  <div key={clue.id} className="text-sm text-gray-200 bg-[#111111] p-2 rounded">
                    {editingClueId === clue.id ? (
                      <div className="flex flex-col gap-2">
                        <input
                          value={editForm.clue}
                          onChange={(e) => setEditForm((prev) => ({ ...prev, clue: e.target.value }))}
                          disabled={!isDraft}
                          className="bg-black/40 border border-white/10 rounded p-2"
                        />
                        <input
                          placeholder="Optional new answer"
                          value={editForm.answer}
                          onChange={(e) => setEditForm((prev) => ({ ...prev, answer: e.target.value }))}
                          disabled={!isDraft}
                          className="bg-black/40 border border-white/10 rounded p-2"
                        />
                        <div className="flex gap-2">
                          <button type="button" onClick={saveClueEdit} disabled={!isDraft} className="text-xs bg-green-700 px-2 py-1 rounded">Save</button>
                          <button type="button" onClick={() => setEditingClueId(null)} className="text-xs bg-gray-700 px-2 py-1 rounded">Cancel</button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between gap-2">
                        <span>{clue.number}. {clue.clue || clue.question} ({clue.answer_length})</span>
                        <div className="flex gap-1">
                          <button type="button" onClick={() => startEditClue(clue)} disabled={!isDraft} className="text-xs bg-blue-700 px-2 py-1 rounded">Edit</button>
                          <button type="button" onClick={() => handleDeleteClue(clue.id)} disabled={!isDraft} className="text-xs bg-red-700 px-2 py-1 rounded">Delete</button>
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
