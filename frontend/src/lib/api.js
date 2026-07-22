const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api/";

function getAuthHeaders() {
  const token = localStorage.getItem("authToken");
  return token ? { Authorization: `Token ${token}` } : {};
}

async function parseResponse(response) {
  const text = await response.text();
  let data = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = null;
    }
  }

  if (!response.ok) {
    const message =
      data && typeof data === "object"
        ? data.detail || data.error || JSON.stringify(data)
        : `Request failed with status ${response.status}`;
    throw new Error(message);
  }

  return data;
}

async function request(path, options = {}) {
  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      ...getAuthHeaders(),
      ...options.headers,
    },
  });
  return parseResponse(response);
}

export function loginUser(data) {
  return request("login/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
}

// Invalidates the token server-side so signing out actually revokes access.
export function logoutUser() {
  return request("logout/", { method: "POST" });
}

export function fetchPuzzles(role = "Student") {
  const teacherId = role === "Teacher" ? localStorage.getItem("userId") || "" : "";
  const studentRegNo = role === "Student" ? localStorage.getItem("userId") || "" : "";
  const teacherQuery = teacherId ? `&teacher_id=${encodeURIComponent(teacherId)}` : "";
  const studentQuery = studentRegNo ? `&student_reg_no=${encodeURIComponent(studentRegNo)}` : "";
  return request(`puzzles/?role=${encodeURIComponent(role)}${teacherQuery}${studentQuery}`);
}

export function fetchStats(role = "Student") {
  return request(`stats/?role=${encodeURIComponent(role)}`);
}

export function checkAnswer(data) {
  return request("check/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
}

export function submitPuzzle(data) {
  return request("submit/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
}

export function fetchLeaderboard() {
  return request("leaderboard/");
}

export function fetchPuzzleLeaderboard(puzzleId) {
  return request(`leaderboard/${puzzleId}/`);
}

export function createPuzzle(data) {
  return request("puzzles/create/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
}

export function addClues(data) {
  return request("puzzles/add-clues/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
}

export function generateFromDocument({ file, difficulty, num_questions, topic_hint, puzzle_title, teacher_id }) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("difficulty", difficulty);
  formData.append("num_questions", String(num_questions));
  formData.append("topic_hint", topic_hint || "");
  formData.append("puzzle_title", puzzle_title);
  formData.append("teacher_id", teacher_id);
  return request("puzzles/generate-from-document/", {
    method: "POST",
    body: formData,
  });
}

export function publishPuzzle(data) {
  return request("puzzles/publish/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
}

export function previewPuzzle(puzzleId, role = "Teacher") {
  return request(`puzzles/${puzzleId}/preview/?role=${encodeURIComponent(role)}`);
}

export function regeneratePuzzleLayout(puzzleId) {
  return request(`puzzles/${puzzleId}/regenerate/`, {
    method: "POST",
  });
}

// The export endpoint requires an Authorization header, which a plain
// window.open() navigation cannot send. Fetch here instead so the token is
// attached, then the caller can open or download the result as a blob.
async function requestExport(puzzleId, format) {
  // Note: "fmt", not "format" — DRF reserves "format" for content negotiation.
  const query = format ? `?fmt=${encodeURIComponent(format)}` : "";
  const response = await fetch(`${BASE_URL}puzzles/${puzzleId}/export/${query}`, {
    headers: { ...getAuthHeaders() },
  });

  if (!response.ok) {
    let message = `Export failed (${response.status})`;
    try {
      const parsed = JSON.parse(await response.text());
      message = parsed.error || parsed.detail || message;
    } catch {
      // non-JSON error body — keep the status-based message
    }
    throw new Error(message);
  }
  return response;
}

export async function fetchPrintableExport(puzzleId) {
  return (await requestExport(puzzleId, "html")).text();
}

// Downloads the puzzle as a test paper. `format` is "pdf" or "doc".
export async function downloadPrintableExport(puzzleId, format) {
  const response = await requestExport(puzzleId, format);
  const blob = await response.blob();

  let filename = `puzzle.${format}`;
  const disposition = response.headers.get("Content-Disposition") || "";
  const match = disposition.match(/filename="?([^"]+)"?/);
  if (match) filename = match[1];

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);

  return filename;
}

export function archivePuzzle(puzzleId) {
  return request(`puzzles/${puzzleId}/archive/`, {
    method: "POST",
  });
}

export function deletePuzzle(puzzleId) {
  return request(`puzzles/${puzzleId}/`, {
    method: "DELETE",
  });
}

export function updateClue(clueId, data) {
  return request(`puzzles/clues/${clueId}/update/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
}

export function deleteClue(clueId) {
  return request(`puzzles/clues/${clueId}/delete/`, {
    method: "DELETE",
  });
}

export function fetchPuzzleAnalytics(puzzleId) {
  return request(`analytics/${puzzleId}/`);
}

export function fetchStudentHistory(studentRegNo) {
  return request(`history/?student_reg_no=${encodeURIComponent(studentRegNo)}`);
}

export function revealHint(data) {
  return request("hint/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
}

export function fetchTeachers() {
  return request("admin/teachers/");
}

export function createTeacher(data) {
  return request("admin/teachers/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
}

export function deleteTeacher(teacherId) {
  return request(`admin/teachers/${encodeURIComponent(teacherId)}/`, {
    method: "DELETE",
  });
}

export function fetchAllStudents(teacherId = "") {
  const query = teacherId ? `?teacher_id=${encodeURIComponent(teacherId)}` : "";
  return request(`admin/students/${query}`);
}

export function fetchTeacherStudents(teacherId) {
  return request(`students/?teacher_id=${encodeURIComponent(teacherId)}`);
}

export function uploadStudentsCsv(teacherId, file) {
  const formData = new FormData();
  formData.append("teacher_id", teacherId);
  formData.append("file", file);
  return request("students/upload/", {
    method: "POST",
    body: formData,
  });
}

export function resetStudentPassword(studentId, password) {
  return request(`students/${studentId}/reset-password/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password }),
  });
}

export function deleteStudent(studentId) {
  return request(`students/${studentId}/`, {
    method: "DELETE",
  });
}
