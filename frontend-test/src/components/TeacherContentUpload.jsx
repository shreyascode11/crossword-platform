'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { FileText, Plus, Trash2, CheckCircle, RefreshCw, Eye, Archive, Send, Download } from 'lucide-react';
import {
  addClues, archivePuzzle, deleteClue, downloadPrintableExport, fetchPrintableExport,
  previewPuzzle, publishPuzzle, regeneratePuzzleLayout, updateClue,
} from '../lib/api';

const C = {
  bg: '#0f0e14', felt: '#17151f', card: '#1e1b29',
  taupe: '#7c5cff', tan: '#22d3c9', stone: '#c7c2d9',
  cream: '#ede9f7', muted: '#8d87a3', rust: '#ff4d6d',
};

const Btn = ({ children, onClick, disabled, variant = "ghost", type = "button", loading }) => {
  const v = {
    primary: { bg: `linear-gradient(135deg,${C.taupe},${C.tan})`, color: C.bg, border: "none" },
    publish: { bg: "rgba(124,92,255,0.85)", color: C.bg,    border: "none" },
    amber:   { bg: `rgba(34,211,201,0.85)`, color: C.bg,    border: "none" },
    red:     { bg: "rgba(255,77,109,0.85)",   color: "#fff",  border: "1px solid rgba(255,77,109,0.5)" },
    blue:    { bg: "rgba(59,130,246,0.85)",  color: "#fff",  border: "1px solid rgba(59,130,246,0.4)" },
    slate:   { bg: "rgba(100,116,139,0.5)",  color: "#e2e8f0", border: "1px solid rgba(148,163,184,0.2)" },
    ghost:   { bg: "rgba(255,255,255,0.06)", color: C.stone, border: "1px solid rgba(255,255,255,0.08)" },
  }[variant];
  return (
    <button type={type} onClick={onClick} disabled={disabled || loading}
      className="flex items-center gap-1.5 font-mono text-[11px] font-bold tracking-wider px-4 py-2.5 rounded-xl transition-all duration-150 btn-press disabled:opacity-35"
      style={{ background: v.bg, color: v.color, border: v.border }}>
      {loading ? <RefreshCw size={13} className="animate-spin" /> : null}
      {children}
    </button>
  );
};

const TeacherContentUpload = ({ onPuzzlePublished, activePuzzleId: activePuzzleIdProp }) => {
  const [manualEntries, setManualEntries] = useState([
    { word: '', clue: '' }, { word: '', clue: '' }, { word: '', clue: '' },
  ]);
  const [isSubmitting, setIsSubmitting]     = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [isPublishing, setIsPublishing]     = useState(false);
  const [downloading, setDownloading]       = useState('');
  const [errorMessage, setErrorMessage]     = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [previewData, setPreviewData]       = useState(null);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  const [editingClueId, setEditingClueId]   = useState(null);
  const [editForm, setEditForm]             = useState({ clue: '', answer: '' });

  const activePuzzleId = Number(activePuzzleIdProp || localStorage.getItem('activePuzzleId') || 0);
  const clueList    = useMemo(() => Array.isArray(previewData?.clues) ? previewData.clues : [], [previewData]);
  const puzzleStatus = previewData?.status || 'draft';
  const puzzleTitle  = previewData?.title || '';
  const isDraft    = puzzleStatus === 'draft';
  const isArchived = puzzleStatus === 'archived';

  const statusColor = { draft: C.taupe, published: C.tan, archived: C.muted }[puzzleStatus] || C.muted;

  const msg = (type, text) => {
    if (type === 'ok') { setSuccessMessage(text); setErrorMessage(''); }
    else               { setErrorMessage(text);   setSuccessMessage(''); }
  };

  const loadPreview = useCallback(async () => {
    if (!activePuzzleId) return;
    setIsLoadingPreview(true);
    try { setPreviewData(await previewPuzzle(activePuzzleId, 'Teacher')); setErrorMessage(''); }
    catch { setErrorMessage('Could not load puzzle preview.'); }
    finally { setIsLoadingPreview(false); }
  }, [activePuzzleId]);

  useEffect(() => { loadPreview(); }, [loadPreview]);

  const handleEntryChange = (i, field, val) => {
    const e = [...manualEntries]; e[i][field] = val; setManualEntries(e);
  };
  const addRow    = () => setManualEntries([...manualEntries, { word: '', clue: '' }]);
  const removeRow = i => setManualEntries(manualEntries.filter((_, j) => j !== i));

  const handleSubmit = async e => {
    e.preventDefault();
    if (!activePuzzleId) { msg('err', 'Select or create a puzzle first.'); return; }
    const entries = manualEntries.map(r => ({ word: r.word.trim(), clue: r.clue.trim() })).filter(r => r.word && r.clue);
    if (!entries.length) { msg('err', 'Add at least one valid word and clue pair.'); return; }
    setIsSubmitting(true);
    try {
      await addClues({ puzzle_id: activePuzzleId, entries });
      await loadPreview(); await onPuzzlePublished?.();
      setManualEntries([{ word: '', clue: '' }, { word: '', clue: '' }, { word: '', clue: '' }]);
      msg('ok', `${entries.length} clue${entries.length > 1 ? 's' : ''} added successfully.`);
    } catch (err) { msg('err', err?.message || 'Failed to add clues.'); }
    finally { setIsSubmitting(false); }
  };

  const handleRegenerate = async () => {
    if (!activePuzzleId) return;
    setIsRegenerating(true);
    try { await regeneratePuzzleLayout(activePuzzleId); await loadPreview(); await onPuzzlePublished?.(); msg('ok', 'Layout regenerated.'); }
    catch (err) { msg('err', err?.message || 'Regeneration failed.'); }
    finally { setIsRegenerating(false); }
  };

  const handlePublish = async () => {
    if (!activePuzzleId) return;
    setIsPublishing(true);
    try { await publishPuzzle({ puzzle_id: activePuzzleId }); await loadPreview(); await onPuzzlePublished?.(); msg('ok', 'Puzzle published!'); }
    catch (err) { msg('err', err?.message || 'Publish failed.'); }
    finally { setIsPublishing(false); }
  };

  const handleArchive = async () => {
    if (!activePuzzleId) return;
    try { await archivePuzzle(activePuzzleId); await loadPreview(); await onPuzzlePublished?.(); msg('ok', 'Puzzle archived.'); }
    catch (err) { msg('err', err?.message || 'Archive failed.'); }
  };

  const startEditClue = clue => { setEditingClueId(clue.id); setEditForm({ clue: clue.clue || clue.question || '', answer: '' }); };

  const saveClueEdit = async () => {
    if (!editingClueId) return;
    try {
      await updateClue(editingClueId, { clue: editForm.clue, answer: editForm.answer || undefined });
      setEditingClueId(null); setEditForm({ clue: '', answer: '' });
      await loadPreview(); await onPuzzlePublished?.(); msg('ok', 'Clue updated.');
    } catch { msg('err', 'Could not update clue.'); }
  };

  const handleDeleteClue = async id => {
    try { await deleteClue(id); await loadPreview(); await onPuzzlePublished?.(); msg('ok', 'Clue deleted.'); }
    catch { msg('err', 'Could not delete clue.'); }
  };

  const openPrintable = async () => {
    if (!activePuzzleId) return;
    try {
      const html = await fetchPrintableExport(activePuzzleId);
      const url = URL.createObjectURL(new Blob([html], { type: 'text/html' }));
      const win = window.open(url, '_blank');
      if (!win) {
        msg('err', 'Pop-up blocked. Allow pop-ups for this site to export.');
      }
      // Give the new tab time to load before releasing the object URL.
      setTimeout(() => URL.revokeObjectURL(url), 60000);
    } catch (err) {
      msg('err', err?.message || 'Could not export puzzle.');
    }
  };

  const handleDownload = async format => {
    if (!activePuzzleId) return;
    setDownloading(format);
    try {
      const filename = await downloadPrintableExport(activePuzzleId, format);
      msg('ok', `Downloaded ${filename}`);
    } catch (err) {
      msg('err', err?.message || `Could not download ${format.toUpperCase()}.`);
    } finally {
      setDownloading('');
    }
  };

  return (
    <div className="w-full max-w-4xl space-y-6 animate-fade-up">

      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="font-mono text-[10px] tracking-widest uppercase mb-1" style={{ color: C.muted }}>Content Editor</div>
          <h2 className="font-display font-black text-2xl" style={{ color: C.cream }}>Add Puzzle Content</h2>
          {puzzleTitle ? (
            <div className="mt-2 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border font-mono text-xs"
              style={{ background: `${statusColor}10`, borderColor: `${statusColor}30`, color: statusColor }}>
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: statusColor }} />
              {puzzleTitle} · {puzzleStatus}
            </div>
          ) : (
            <div className="mt-2 font-mono text-xs" style={{ color: C.muted }}>Select a puzzle from My Puzzles first.</div>
          )}
        </div>
      </div>

      {/* Clue entry form */}
      <div className="rounded-2xl border p-6"
        style={{ background: `linear-gradient(135deg,${C.card},${C.felt})`, borderColor: "rgba(124,92,255,0.15)" }}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-[1fr_2fr_40px] gap-3 px-1 mb-1">
            {["Answer Word", "Clue Description", ""].map((h, i) => (
              <span key={i} className="font-mono text-[10px] uppercase tracking-widest" style={{ color: C.muted }}>{h}</span>
            ))}
          </div>

          {manualEntries.map((entry, i) => (
            <div key={i} className="grid grid-cols-[1fr_2fr_40px] gap-3 items-center p-3 rounded-xl border transition-all"
              style={{ background: "rgba(0,0,0,0.3)", borderColor: "rgba(124,92,255,0.08)" }}
              onMouseEnter={e => e.currentTarget.style.borderColor = "rgba(124,92,255,0.2)"}
              onMouseLeave={e => e.currentTarget.style.borderColor = "rgba(124,92,255,0.08)"}>
              <input type="text" placeholder="e.g. REACT" value={entry.word} disabled={!isDraft}
                onChange={e => handleEntryChange(i, 'word', e.target.value)}
                className="bg-black/40 border rounded-lg px-3 py-2.5 text-sm uppercase font-mono font-bold tracking-widest placeholder:opacity-30 outline-none w-full disabled:opacity-50"
                style={{ color: C.cream, borderColor: "rgba(124,92,255,0.12)" }}
                onFocus={e => e.target.style.borderColor = "rgba(124,92,255,0.4)"}
                onBlur={e => e.target.style.borderColor = "rgba(124,92,255,0.12)"} />
              <input type="text" placeholder="e.g. A popular JavaScript library" value={entry.clue} disabled={!isDraft}
                onChange={e => handleEntryChange(i, 'clue', e.target.value)}
                className="bg-black/40 border rounded-lg px-3 py-2.5 text-sm font-mono placeholder:opacity-30 outline-none w-full disabled:opacity-50"
                style={{ color: C.stone, borderColor: "rgba(124,92,255,0.12)" }}
                onFocus={e => e.target.style.borderColor = "rgba(124,92,255,0.4)"}
                onBlur={e => e.target.style.borderColor = "rgba(124,92,255,0.12)"} />
              <button type="button" onClick={() => removeRow(i)} disabled={!isDraft}
                className="w-9 h-9 flex items-center justify-center rounded-lg transition-all disabled:opacity-30"
                style={{ color: C.muted }}
                onMouseEnter={e => { e.currentTarget.style.color = "#e07070"; e.currentTarget.style.background = "rgba(255,77,109,0.12)"; }}
                onMouseLeave={e => { e.currentTarget.style.color = C.muted; e.currentTarget.style.background = "transparent"; }}>
                <Trash2 size={15} />
              </button>
            </div>
          ))}

          <button type="button" onClick={addRow} disabled={!isDraft}
            className="flex items-center gap-2 font-mono text-[11px] font-bold tracking-wider px-4 py-2.5 rounded-xl border transition-all btn-press disabled:opacity-30"
            style={{ color: C.taupe, borderColor: "rgba(124,92,255,0.22)", background: "rgba(124,92,255,0.05)" }}
            onMouseEnter={e => e.currentTarget.style.background = "rgba(124,92,255,0.1)"}
            onMouseLeave={e => e.currentTarget.style.background = "rgba(124,92,255,0.05)"}>
            <Plus size={14} strokeWidth={3} /> Add Row
          </button>

          <div className="pt-4 border-t flex flex-wrap gap-2" style={{ borderColor: "rgba(124,92,255,0.1)" }}>
            <Btn type="submit" variant="primary" disabled={!isDraft} loading={isSubmitting}>
              <CheckCircle size={13} /> {isSubmitting ? "Adding…" : "Add Clues"}
            </Btn>
            <Btn variant="ghost" onClick={handleRegenerate} disabled={!isDraft} loading={isRegenerating}>
              <RefreshCw size={13} /> Regenerate
            </Btn>
            <Btn variant="ghost" onClick={loadPreview} disabled={!activePuzzleId}>
              <Eye size={13} /> Refresh
            </Btn>
            <Btn variant="publish" onClick={handlePublish} disabled={!isDraft} loading={isPublishing}>
              <Send size={13} /> Publish
            </Btn>
            <Btn variant="amber" onClick={handleArchive} disabled={isArchived}>
              <Archive size={13} /> Archive
            </Btn>
            <Btn variant="slate" onClick={openPrintable}>
              <Eye size={13} /> Preview
            </Btn>
            <Btn variant="slate" onClick={() => handleDownload('pdf')} loading={downloading === 'pdf'}>
              <Download size={13} /> PDF
            </Btn>
            <Btn variant="slate" onClick={() => handleDownload('doc')} loading={downloading === 'doc'}>
              <FileText size={13} /> Word
            </Btn>
          </div>

          {errorMessage && (
            <div className="px-4 py-3 rounded-xl text-sm font-mono border"
              style={{ background: "rgba(255,77,109,0.12)", borderColor: "rgba(255,77,109,0.3)", color: "#f0a0a0" }}>
              ✕ {errorMessage}
            </div>
          )}
          {successMessage && (
            <div className="px-4 py-3 rounded-xl text-sm font-mono border"
              style={{ background: "rgba(124,92,255,0.08)", borderColor: "rgba(124,92,255,0.25)", color: C.taupe }}>
              ✓ {successMessage}
            </div>
          )}
        </form>
      </div>

      {/* Preview */}
      <div className="rounded-2xl border overflow-hidden" style={{ borderColor: "rgba(124,92,255,0.12)" }}>
        <div className="px-6 py-4 border-b flex items-center gap-2"
          style={{ background: "rgba(0,0,0,0.4)", borderColor: "rgba(124,92,255,0.1)" }}>
          <Eye size={15} color={C.taupe} />
          <h3 className="font-display font-bold" style={{ color: C.cream }}>Puzzle Preview</h3>
          {previewData && (
            <span className="ml-auto font-mono text-[10px]" style={{ color: C.muted }}>
              {previewData.difficulty} · {clueList.length} clues
            </span>
          )}
        </div>

        <div className="p-6" style={{ background: `linear-gradient(135deg,${C.card},${C.felt})` }}>
          {isLoadingPreview ? (
            <div className="text-center font-mono text-sm py-8" style={{ color: C.muted }}>Loading preview…</div>
          ) : !previewData ? (
            <div className="text-center font-mono text-sm py-8" style={{ color: C.muted }}>
              {activePuzzleId ? "No preview yet — add clues and regenerate." : "Select a puzzle to preview."}
            </div>
          ) : (
            <div className="space-y-6">
              {previewData.cells?.length > 0 && (
                <div className="overflow-x-auto">
                  <div className="inline-block rounded-xl border p-3"
                    style={{ background: "rgba(0,0,0,0.5)", borderColor: "rgba(124,92,255,0.12)" }}>
                    <div className="grid gap-0.5" style={{ gridTemplateColumns: `repeat(${previewData.grid_size || 1}, 2rem)` }}>
                      {previewData.cells.flatMap((row, rIdx) =>
                        row.map((cell, cIdx) =>
                          cell ? (
                            <div key={`${rIdx}-${cIdx}`} className="relative w-8 h-8 rounded-sm flex items-center justify-center"
                              style={{ background: C.cream, border: `1px solid ${C.taupe}50` }}>
                              {cell.number && (
                                <span className="absolute top-0 left-0.5 font-mono text-[7px] font-black leading-none" style={{ color: C.bg }}>
                                  {cell.number}
                                </span>
                              )}
                            </div>
                          ) : (
                            <div key={`${rIdx}-${cIdx}`} className="w-8 h-8 rounded-sm"
                              style={{ background: C.bg, border: "1px solid rgba(124,92,255,0.06)" }} />
                          )
                        )
                      )}
                    </div>
                  </div>
                </div>
              )}

              {clueList.length > 0 && (
                <div>
                  <div className="font-mono text-[10px] tracking-widest uppercase mb-3" style={{ color: C.muted }}>Clues</div>
                  <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                    {clueList.map(clue => (
                      <div key={clue.id} className="rounded-xl border p-3 transition-all"
                        style={{ background: "rgba(0,0,0,0.3)", borderColor: "rgba(124,92,255,0.08)" }}>
                        {editingClueId === clue.id ? (
                          <div className="flex flex-col gap-2">
                            <input value={editForm.clue} disabled={!isDraft}
                              onChange={e => setEditForm(p => ({ ...p, clue: e.target.value }))}
                              className="bg-black/40 border rounded-lg px-3 py-2 text-sm font-mono outline-none"
                              style={{ color: C.cream, borderColor: "rgba(124,92,255,0.2)" }} />
                            <input placeholder="New answer (optional)" value={editForm.answer} disabled={!isDraft}
                              onChange={e => setEditForm(p => ({ ...p, answer: e.target.value }))}
                              className="bg-black/40 border rounded-lg px-3 py-2 text-sm font-mono uppercase tracking-widest outline-none"
                              style={{ color: C.taupe, borderColor: "rgba(124,92,255,0.2)" }} />
                            <div className="flex gap-2">
                              <Btn variant="publish" onClick={saveClueEdit} disabled={!isDraft}>Save</Btn>
                              <Btn variant="ghost" onClick={() => setEditingClueId(null)}>Cancel</Btn>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-start justify-between gap-2">
                            <span className="text-sm leading-snug font-mono" style={{ color: C.stone }}>
                              <span className="font-bold" style={{ color: C.taupe }}>{clue.number}.</span>{" "}
                              {clue.clue || clue.question}
                              <span style={{ color: C.muted }}> → {(clue.answer || "").toUpperCase()} ({clue.answer_length})</span>
                            </span>
                            <div className="flex gap-1.5 shrink-0">
                              <button type="button" onClick={() => startEditClue(clue)} disabled={!isDraft}
                                className="font-mono text-[10px] font-bold px-2.5 py-1.5 rounded-lg disabled:opacity-30 transition-all"
                                style={{ background: "rgba(59,130,246,0.15)", color: "#93c5fd", border: "1px solid rgba(59,130,246,0.25)" }}>
                                Edit
                              </button>
                              <button type="button" onClick={() => handleDeleteClue(clue.id)} disabled={!isDraft}
                                className="font-mono text-[10px] font-bold px-2.5 py-1.5 rounded-lg disabled:opacity-30 transition-all"
                                style={{ background: "rgba(255,77,109,0.15)", color: "#f0a0a0", border: "1px solid rgba(255,77,109,0.25)" }}>
                                Del
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeacherContentUpload;