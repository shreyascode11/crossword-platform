import React, { useState } from 'react';
import { Users, Upload } from 'lucide-react';

const TeacherStudents = ({
  teacherId,
  students = [],
  isLoading = false,
  error = '',
  onUpload,
  onResetPassword,
  onDelete,
}) => {
  const [file, setFile] = useState(null);
  const [uploadResult, setUploadResult] = useState(null);
  const [actionError, setActionError] = useState('');

  const handleUpload = async () => {
    if (!file || !teacherId) return;
    setActionError('');
    try {
      const result = await onUpload(file);
      setUploadResult(result);
    } catch (err) {
      setActionError(err?.message || 'Upload failed.');
    }
  };

  return (
    <div className="w-full max-w-5xl font-sans text-white pb-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <p className="text-[11px] uppercase tracking-[0.28em] text-gray-500 font-semibold m-0 mb-2">Roster</p>
          <h2 className="text-3xl font-bold text-white tracking-tight m-0">
            <span className="text-[#e63946]">Students</span>
          </h2>
          <p className="text-gray-500 text-sm mt-2 m-0 max-w-xl leading-relaxed">
            Upload students via CSV and manage your class roster.
          </p>
        </div>
      </div>

      <div className="bg-gradient-to-br from-[#141212] via-[#101010] to-[#0c0a0a] rounded-2xl p-6 md:p-7 border border-white/[0.07] shadow-[0_24px_60px_-30px_rgba(0,0,0,0.9)] mb-8">
        <div className="flex items-center gap-2 text-white font-semibold text-sm mb-4">
          <Upload size={18} className="text-[#e63946]" />
          Import roster
        </div>
        <div className="rounded-xl border border-dashed border-white/[0.12] bg-black/25 px-4 py-6 hover:border-[#e63946]/35 transition-colors">
          <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
            <input
              type="file"
              accept=".csv"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="text-sm text-gray-300 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-[#e63946] file:text-white hover:file:brightness-110 file:cursor-pointer cursor-pointer flex-1 min-w-0"
            />
            <button
              type="button"
              onClick={handleUpload}
              disabled={!file}
              className="shrink-0 bg-gradient-to-r from-[#e63946] to-[#c62f3a] text-white px-5 py-2.5 rounded-xl text-sm font-bold border border-white/10 shadow-[0_10px_30px_-12px_rgba(230,57,70,0.6)] hover:brightness-110 disabled:opacity-40 disabled:hover:brightness-100"
            >
              Upload CSV
            </button>
          </div>
        </div>
        <div className="text-xs text-gray-500 mt-3 font-medium">Format: name,reg_no,password</div>
        {uploadResult && (
          <div className="mt-4 text-sm text-gray-200 bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3">
            Created: {uploadResult.created} | Skipped: {uploadResult.skipped}
          </div>
        )}
        {actionError && (
          <div className="mt-3 text-sm text-red-300 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">{actionError}</div>
        )}
        {uploadResult?.errors?.length ? (
          <div className="mt-3 text-xs text-red-300 bg-red-500/5 border border-red-500/15 rounded-xl px-3 py-2 space-y-1">
            {uploadResult.errors.slice(0, 5).map((row, idx) => (
              <div key={idx}>Row {row.row}: {row.error}</div>
            ))}
          </div>
        ) : null}
      </div>

      <div className="bg-gradient-to-br from-[#141212] via-[#101010] to-[#0c0a0a] rounded-2xl p-2 md:p-0 border border-white/[0.07] shadow-[0_24px_60px_-30px_rgba(0,0,0,0.9)] overflow-hidden">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="bg-white/[0.02] text-gray-400 text-xs uppercase tracking-wider border-b border-white/[0.08]">
              <th className="py-4 font-semibold px-4">Name</th>
              <th className="py-4 font-semibold px-4">Registration Number</th>
              <th className="py-4 font-semibold px-4 text-center">Created</th>
              <th className="py-4 font-semibold px-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan="4" className="py-12 text-gray-400 text-center font-medium">Loading students...</td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan="4" className="py-12 text-gray-400 text-center">{error}</td>
              </tr>
            ) : students.length === 0 ? (
              <tr>
                <td colSpan="4" className="py-16 px-6 text-center">
                  <div className="flex flex-col items-center gap-4 max-w-sm mx-auto">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#e63946]/10 border border-[#e63946]/25 text-[#e63946]">
                      <Users size={32} strokeWidth={1.5} />
                    </div>
                    <div>
                      <p className="text-white font-semibold text-lg m-0">No students yet</p>
                      <p className="text-gray-500 text-sm mt-2 m-0 leading-relaxed">
                        Upload a CSV to add your class — they will appear in this table.
                      </p>
                    </div>
                  </div>
                </td>
              </tr>
            ) : (
              students.map((student, idx) => (
                <tr
                  key={student.id}
                  className={`border-b border-white/[0.04] last:border-0 transition-colors hover:bg-white/[0.04] ${idx % 2 === 1 ? 'bg-white/[0.015]' : ''}`}
                >
                  <td className="py-4 px-4 text-gray-100 font-medium">{student.name}</td>
                  <td className="py-4 px-4 text-gray-400 tabular-nums">{student.reg_no}</td>
                  <td className="py-4 px-4 text-gray-400 text-center">
                    {student.created_at ? new Date(student.created_at).toLocaleDateString() : '-'}
                  </td>
                  <td className="py-4 px-4 text-center">
                    <div className="flex flex-wrap gap-2 justify-center">
                      <button
                        type="button"
                        onClick={() => onResetPassword?.(student)}
                        className="text-[11px] font-semibold bg-blue-600/90 text-white px-3 py-1.5 rounded-lg border border-blue-400/20 hover:bg-blue-500 shadow-sm"
                      >
                        Reset Password
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete?.(student)}
                        className="text-[11px] font-semibold bg-red-600/90 text-white px-3 py-1.5 rounded-lg border border-red-400/25 hover:bg-red-500 shadow-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TeacherStudents;
