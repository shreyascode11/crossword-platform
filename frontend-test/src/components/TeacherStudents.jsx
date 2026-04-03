import React, { useState } from 'react';

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
    <div className="w-full max-w-5xl font-sans text-white">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h2 className="text-3xl font-bold text-[#e06666]">Students</h2>
          <p className="text-gray-400 text-sm">Upload students via CSV and manage your class roster.</p>
        </div>
      </div>

      <div className="bg-[#181313] rounded-2xl p-6 border border-white/5 shadow-md mb-6">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
          <input
            type="file"
            accept=".csv"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="text-sm text-gray-300"
          />
          <button
            type="button"
            onClick={handleUpload}
            disabled={!file}
            className="bg-[#221515] px-4 py-2 rounded-md text-sm text-gray-200 hover:bg-[#332020] disabled:opacity-50"
          >
            Upload CSV
          </button>
        </div>
        <div className="text-xs text-gray-500 mt-2">Format: name,reg_no,password</div>
        {uploadResult && (
          <div className="mt-3 text-sm text-gray-300">
            Created: {uploadResult.created} | Skipped: {uploadResult.skipped}
          </div>
        )}
        {actionError && <div className="mt-2 text-sm text-red-400">{actionError}</div>}
        {uploadResult?.errors?.length ? (
          <div className="mt-2 text-xs text-red-400">
            {uploadResult.errors.slice(0, 5).map((row, idx) => (
              <div key={idx}>Row {row.row}: {row.error}</div>
            ))}
          </div>
        ) : null}
      </div>

      <div className="bg-[#181313] rounded-2xl p-6 border border-white/5 shadow-md">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="text-gray-400 text-sm border-b border-white/10">
              <th className="pb-3 font-medium px-2">Name</th>
              <th className="pb-3 font-medium px-2">Registration Number</th>
              <th className="pb-3 font-medium px-2 text-center">Created</th>
              <th className="pb-3 font-medium px-2 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan="4" className="py-4 text-gray-400 text-center">Loading students...</td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan="4" className="py-4 text-gray-400 text-center">{error}</td>
              </tr>
            ) : students.length === 0 ? (
              <tr>
                <td colSpan="4" className="py-4 text-gray-400 text-center">No students yet.</td>
              </tr>
            ) : (
              students.map((student) => (
                <tr key={student.id} className="border-b border-white/5 last:border-0">
                  <td className="py-4 px-2 text-gray-300">{student.name}</td>
                  <td className="py-4 px-2 text-gray-400">{student.reg_no}</td>
                  <td className="py-4 px-2 text-gray-400 text-center">
                    {student.created_at ? new Date(student.created_at).toLocaleDateString() : '-'}
                  </td>
                  <td className="py-4 px-2 text-center">
                    <div className="flex gap-2 justify-center">
                      <button
                        type="button"
                        onClick={() => onResetPassword?.(student)}
                        className="text-xs bg-blue-700 px-2 py-1 rounded"
                      >
                        Reset Password
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete?.(student)}
                        className="text-xs bg-red-700 px-2 py-1 rounded"
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
