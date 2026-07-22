'use client';

import React, { useState } from 'react';
import { Users, Upload, KeyRound, Trash2 } from 'lucide-react';

const C = {
  bg: '#0f0e14', felt: '#17151f', card: '#1e1b29',
  taupe: '#7c5cff', tan: '#22d3c9', stone: '#c7c2d9',
  cream: '#ede9f7', muted: '#8d87a3', rust: '#ff4d6d',
};

const TeacherStudents = ({ teacherId, students = [], isLoading, error, onUpload, onResetPassword, onDelete }) => {
  const [file, setFile] = useState(null);
  const [uploadResult, setUploadResult] = useState(null);
  const [actionError, setActionError] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const handleUpload = async () => {
    if (!file || !teacherId) return;
    setActionError(''); setIsUploading(true);
    try { const r = await onUpload(file); setUploadResult(r); setFile(null); }
    catch (err) { setActionError(err?.message || 'Upload failed.'); }
    finally { setIsUploading(false); }
  };

  return (
    <div className="w-full max-w-5xl space-y-6 animate-fade-up">

      {/* Upload card */}
      <div className="rounded-2xl border p-6"
        style={{ background: `linear-gradient(135deg,${C.card},${C.felt})`, borderColor: "rgba(124,92,255,0.15)" }}>
        <div className="flex items-center gap-2 mb-4">
          <Upload size={16} color={C.taupe} />
          <h3 className="font-display font-bold text-lg" style={{ color: C.cream }}>Import Roster</h3>
        </div>
        <div className="rounded-xl border border-dashed p-5 flex flex-col sm:flex-row gap-4 items-stretch sm:items-center"
          style={{ borderColor: "rgba(124,92,255,0.2)", background: "rgba(0,0,0,0.25)" }}>
          <input type="file" accept=".csv"
            onChange={e => setFile(e.target.files?.[0] || null)}
            className="flex-1 min-w-0 text-sm font-mono
              file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0
              file:text-xs file:font-bold file:tracking-wider file:uppercase
              file:cursor-pointer hover:file:brightness-110"
            style={{ color: C.stone }}
            ref={el => el && (el.style.setProperty('--file-color', C.bg))} />
          <button type="button" onClick={handleUpload} disabled={!file || isUploading}
            className="shrink-0 px-5 py-2.5 rounded-xl font-mono font-bold text-xs tracking-widest uppercase btn-press disabled:opacity-40"
            style={{ background: `linear-gradient(135deg,${C.taupe},${C.tan})`, color: C.bg }}>
            {isUploading ? "Uploading…" : "Upload CSV"}
          </button>
        </div>
        <div className="mt-2 font-mono text-[10px]" style={{ color: C.muted }}>Format: name,reg_no,password (one per row)</div>

        {uploadResult && (
          <div className="mt-3 px-4 py-3 rounded-xl text-sm font-mono border"
            style={{ background: "rgba(124,92,255,0.08)", borderColor: "rgba(124,92,255,0.25)", color: C.taupe }}>
            ✓ Created: {uploadResult.created} | Skipped: {uploadResult.skipped}
          </div>
        )}
        {actionError && (
          <div className="mt-3 px-4 py-3 rounded-xl text-sm font-mono border"
            style={{ background: "rgba(255,77,109,0.12)", borderColor: "rgba(255,77,109,0.3)", color: "#f0a0a0" }}>
            ✕ {actionError}
          </div>
        )}
        {uploadResult?.errors?.length > 0 && (
          <div className="mt-2 px-3 py-2 rounded-xl border space-y-1"
            style={{ background: "rgba(255,77,109,0.08)", borderColor: "rgba(255,77,109,0.2)" }}>
            {uploadResult.errors.slice(0, 5).map((row, i) => (
              <div key={i} className="font-mono text-[11px] text-[#e07070]">Row {row.row}: {row.error}</div>
            ))}
          </div>
        )}
      </div>

      {/* Students table */}
      <div className="rounded-2xl border overflow-hidden" style={{ borderColor: "rgba(124,92,255,0.12)" }}>
        <div className="px-6 py-4 border-b flex items-center justify-between"
          style={{ background: "rgba(0,0,0,0.4)", borderColor: "rgba(124,92,255,0.1)" }}>
          <div className="flex items-center gap-2">
            <Users size={15} color={C.taupe} />
            <h3 className="font-display font-bold" style={{ color: C.cream }}>Class Roster</h3>
          </div>
          <span className="font-mono text-[10px] tracking-widest px-2.5 py-1 rounded-lg"
            style={{ background: "rgba(124,92,255,0.1)", color: C.taupe }}>
            {students.length} students
          </span>
        </div>
        <table className="w-full text-sm text-left border-collapse">
          <thead>
            <tr style={{ background: "rgba(0,0,0,0.3)" }}>
              {["Name", "Reg No", "Created", "Actions"].map((h, i) => (
                <th key={h} className={`py-3 px-5 font-mono text-[10px] uppercase tracking-widest font-semibold border-b ${i >= 2 ? "text-center" : ""}`}
                  style={{ color: C.muted, borderColor: "rgba(124,92,255,0.07)" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={4} className="py-12 text-center font-mono text-sm" style={{ color: C.muted }}>Loading…</td></tr>
            ) : error ? (
              <tr><td colSpan={4} className="py-12 text-center font-mono text-sm" style={{ color: "#e07070" }}>{error}</td></tr>
            ) : students.length === 0 ? (
              <tr><td colSpan={4} className="py-16 text-center">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
                    style={{ background: "rgba(124,92,255,0.08)", border: "1px solid rgba(124,92,255,0.18)" }}>
                    <Users size={28} style={{ color: "rgba(124,92,255,0.4)" }} />
                  </div>
                  <div className="font-display font-bold text-lg" style={{ color: C.cream }}>No students yet</div>
                  <div className="font-mono text-sm" style={{ color: C.muted }}>Upload a CSV to add your class roster.</div>
                </div>
              </td></tr>
            ) : students.map((s, i) => (
              <tr key={s.id}
                className="border-b last:border-0 transition-colors"
                style={{ borderColor: "rgba(124,92,255,0.06)", background: i % 2 === 1 ? "rgba(255,255,255,0.015)" : "transparent" }}
                onMouseEnter={e => e.currentTarget.style.background = "rgba(124,92,255,0.05)"}
                onMouseLeave={e => e.currentTarget.style.background = i % 2 === 1 ? "rgba(255,255,255,0.015)" : "transparent"}>
                <td className="py-3.5 px-5 font-display font-bold" style={{ color: C.cream }}>{s.name}</td>
                <td className="py-3.5 px-5 font-mono text-xs" style={{ color: C.muted }}>{s.reg_no}</td>
                <td className="py-3.5 px-5 text-center font-mono text-xs" style={{ color: C.muted }}>
                  {s.created_at ? new Date(s.created_at).toLocaleDateString() : "—"}
                </td>
                <td className="py-3.5 px-5 text-center">
                  <div className="flex gap-2 justify-center">
                    <button type="button" onClick={() => onResetPassword?.(s)}
                      className="flex items-center gap-1.5 font-mono text-[10px] font-bold tracking-wider px-3 py-1.5 rounded-lg transition-all btn-press"
                      style={{ background: "rgba(59,130,246,0.15)", border: "1px solid rgba(59,130,246,0.3)", color: "#93c5fd" }}
                      onMouseEnter={e => e.currentTarget.style.background = "rgba(59,130,246,0.25)"}
                      onMouseLeave={e => e.currentTarget.style.background = "rgba(59,130,246,0.15)"}>
                      <KeyRound size={11} /> Reset
                    </button>
                    <button type="button" onClick={() => onDelete?.(s)}
                      className="flex items-center gap-1.5 font-mono text-[10px] font-bold tracking-wider px-3 py-1.5 rounded-lg transition-all btn-press"
                      style={{ background: "rgba(255,77,109,0.15)", border: "1px solid rgba(255,77,109,0.3)", color: "#f0a0a0" }}
                      onMouseEnter={e => e.currentTarget.style.background = "rgba(255,77,109,0.25)"}
                      onMouseLeave={e => e.currentTarget.style.background = "rgba(255,77,109,0.15)"}>
                      <Trash2 size={11} /> Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TeacherStudents;