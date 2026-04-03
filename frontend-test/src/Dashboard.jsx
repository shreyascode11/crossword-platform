 import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { 
  Search, LayoutDashboard, List, Bell, History, RotateCcw, 
  Puzzle, Lightbulb, Target, Star, LogOut, PlusCircle, BarChart2, Gamepad2, FileText, Users // <-- Add FileText right here!
} from 'lucide-react';
import {
  archivePuzzle,
  createTeacher,
  deleteStudent,
  deleteTeacher,
  deletePuzzle,
  fetchAllStudents,
  fetchLeaderboard,
  fetchTeacherStudents,
  fetchTeachers,
  fetchPuzzleAnalytics,
  fetchPuzzleLeaderboard,
  fetchPuzzles,
  fetchStats,
  fetchStudentHistory,
  publishPuzzle,
  resetStudentPassword,
  uploadStudentsCsv,
} from "./api";

import CreatePuzzleForm from "./components/CreatePuzzleForm";
import CurrentStats from "./components/CurrentStats";
import Leaderboard from "./components/Leaderboard";
import Report from "./components/Report";
import Reanalyse from "./components/Reanalyse";
import TeacherReport from "./components/TeacherReport";
import CrosswordPlayer from "./components/CrosswordPlayer"; // 🌟 1. IMPORTED THE GAME 🌟
import TeacherContentUpload from "./components/TeacherContentUpload"; // 🌟 2. IMPORTED THE TEACHER CONTENT UPLOAD COMPONENT 🌟
import TeacherStudents from "./components/TeacherStudents";

const Dashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const userRole = location.state?.role || localStorage.getItem("userRole") || "";
  const currentUserId = location.state?.userId || localStorage.getItem("userId") || "";

  const [activeTab, setActiveTab] = useState("dashboard");
  const [puzzles, setPuzzles] = useState([]);
  const [stats, setStats] = useState({
    total_puzzles: 0,
    assistances: 0,
    avg_score: "0%",
    attainment: "0%",
  });
  const [selectedPuzzleId, setSelectedPuzzleId] = useState(null);
  const [isLoadingDashboard, setIsLoadingDashboard] = useState(false);
  const [dashboardError, setDashboardError] = useState("");
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [isLoadingLeaderboard, setIsLoadingLeaderboard] = useState(false);
  const [leaderboardError, setLeaderboardError] = useState("");
  const [puzzleAnalytics, setPuzzleAnalytics] = useState(null);
  const [studentHistory, setStudentHistory] = useState([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [historyError, setHistoryError] = useState("");
  const [teacherStudents, setTeacherStudents] = useState([]);
  const [isLoadingStudents, setIsLoadingStudents] = useState(false);
  const [studentsError, setStudentsError] = useState("");
  const [adminTeachers, setAdminTeachers] = useState([]);
  const [adminStudents, setAdminStudents] = useState([]);
  const [isLoadingAdmin, setIsLoadingAdmin] = useState(false);
  const [adminError, setAdminError] = useState("");
  const [newTeacher, setNewTeacher] = useState({ teacher_id: "", name: "", password: "" });

  const publishedPuzzles = useMemo(
    () => puzzles.filter((puzzle) => puzzle.status === "published"),
    [puzzles]
  );

  const handleLogout = () => {
    console.log("Signing out...");
    localStorage.removeItem("userRole");
    localStorage.removeItem("userId");
    navigate("/");
  };

  const selectedPuzzle = useMemo(
    () => puzzles.find((p) => p.id === selectedPuzzleId) || null,
    [puzzles, selectedPuzzleId]
  );

  const formatDate = (value) => {
    if (!value) return "-";
    try {
      return new Date(value).toLocaleDateString();
    } catch {
      return "-";
    }
  };

  useEffect(() => {
    if (location.state?.role) {
      localStorage.setItem("userRole", location.state.role);
    }
    if (location.state?.userId) {
      localStorage.setItem("userId", location.state.userId);
    }
  }, [location.state]);

  useEffect(() => {
    if (userRole === "Teacher") {
      setActiveTab("dashboard");
    } else if (userRole === "Student") {
      setActiveTab("available");
    } else if (userRole === "Admin") {
      setActiveTab("admin-teachers");
    }
  }, [userRole]);

  const loadDashboardData = useCallback(async () => {
    if (userRole === "Admin") {
      setPuzzles([]);
      setStats({
        total_puzzles: 0,
        assistances: 0,
        avg_score: "0%",
        attainment: "0%",
      });
      return;
    }
    setIsLoadingDashboard(true);
    setDashboardError("");
    try {
      const [puzzleData, statsData] = await Promise.all([fetchPuzzles(userRole), fetchStats(userRole)]);
      const normalizedPuzzles = Array.isArray(puzzleData) ? puzzleData : [];
      setPuzzles(normalizedPuzzles);
      setStats(
        statsData && typeof statsData === "object"
          ? statsData
          : {
              total_puzzles: 0,
              assistances: 0,
              avg_score: "0%",
              attainment: "0%",
            }
      );

      setSelectedPuzzleId((prevId) => {
        if (prevId && normalizedPuzzles.some((p) => p.id === prevId)) {
          return prevId;
        }
        return normalizedPuzzles[0]?.id ?? null;
      });
    } catch (error) {
      console.error("Dashboard load failed:", error);
      setDashboardError("Failed to load dashboard data.");
      setPuzzles([]);
      setSelectedPuzzleId(null);
    } finally {
      setIsLoadingDashboard(false);
    }
  }, [userRole]);

  const loadLeaderboardData = useCallback(async (targetPuzzleId = selectedPuzzleId) => {
    if (userRole === "Admin") {
      setLeaderboardData([]);
      return;
    }
    setIsLoadingLeaderboard(true);
    setLeaderboardError("");
    try {
      const data = targetPuzzleId ? await fetchPuzzleLeaderboard(targetPuzzleId) : await fetchLeaderboard();
      setLeaderboardData(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Leaderboard load failed:", error);
      setLeaderboardData([]);
      setLeaderboardError("Failed to load leaderboard.");
    } finally {
      setIsLoadingLeaderboard(false);
    }
  }, [selectedPuzzleId, userRole]);

  const loadPuzzleAnalytics = useCallback(async (targetPuzzleId = selectedPuzzleId) => {
    if (!targetPuzzleId || userRole !== "Teacher") {
      setPuzzleAnalytics(null);
      return;
    }
    try {
      const data = await fetchPuzzleAnalytics(targetPuzzleId);
      setPuzzleAnalytics(data);
    } catch (error) {
      console.error("Puzzle analytics load failed:", error);
      setPuzzleAnalytics(null);
    }
  }, [selectedPuzzleId, userRole]);

  const loadStudentHistory = useCallback(async () => {
    if (userRole !== "Student" || !currentUserId) {
      setStudentHistory([]);
      return;
    }
    setIsLoadingHistory(true);
    setHistoryError("");
    try {
      const data = await fetchStudentHistory(currentUserId);
      setStudentHistory(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("History load failed:", error);
      setHistoryError("Failed to load attempt history.");
      setStudentHistory([]);
    } finally {
      setIsLoadingHistory(false);
    }
  }, [userRole, currentUserId]);

  const loadTeacherStudents = useCallback(async () => {
    if (userRole !== "Teacher" || !currentUserId) {
      setTeacherStudents([]);
      return;
    }
    setIsLoadingStudents(true);
    setStudentsError("");
    try {
      const data = await fetchTeacherStudents(currentUserId);
      setTeacherStudents(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Student list load failed:", error);
      setTeacherStudents([]);
      setStudentsError("Failed to load students.");
    } finally {
      setIsLoadingStudents(false);
    }
  }, [userRole, currentUserId]);

  const loadAdminData = useCallback(async () => {
    if (userRole !== "Admin") {
      setAdminTeachers([]);
      setAdminStudents([]);
      return;
    }
    setIsLoadingAdmin(true);
    setAdminError("");
    try {
      const [teachersData, studentsData] = await Promise.all([fetchTeachers(), fetchAllStudents()]);
      setAdminTeachers(Array.isArray(teachersData) ? teachersData : []);
      setAdminStudents(Array.isArray(studentsData) ? studentsData : []);
    } catch (error) {
      console.error("Admin data load failed:", error);
      setAdminTeachers([]);
      setAdminStudents([]);
      setAdminError("Failed to load admin data.");
    } finally {
      setIsLoadingAdmin(false);
    }
  }, [userRole]);

  useEffect(() => {
    if (!userRole) {
      navigate("/");
      return;
    }
    loadDashboardData();
    loadLeaderboardData();
    loadPuzzleAnalytics();
    loadStudentHistory();
    loadTeacherStudents();
    loadAdminData();
  }, [userRole, navigate, loadDashboardData, loadLeaderboardData, loadPuzzleAnalytics, loadStudentHistory, loadTeacherStudents, loadAdminData]);

  useEffect(() => {
    if (selectedPuzzleId) {
      loadLeaderboardData(selectedPuzzleId);
      loadPuzzleAnalytics(selectedPuzzleId);
    }
  }, [selectedPuzzleId, loadLeaderboardData, loadPuzzleAnalytics]);

  useEffect(() => {
    if (!["scores", "teacher-analysis"].includes(activeTab)) return;
    if (publishedPuzzles.length === 0) return;
    if (!publishedPuzzles.some((p) => p.id === selectedPuzzleId)) {
      setSelectedPuzzleId(publishedPuzzles[0].id);
    }
  }, [activeTab, publishedPuzzles, selectedPuzzleId]);

  useEffect(() => {
    if (userRole === "Student" && activeTab === "available") {
      loadDashboardData();
    }
  }, [userRole, activeTab, loadDashboardData]);

  useEffect(() => {
    if (userRole === "Teacher" && activeTab === "students") {
      loadTeacherStudents();
    }
  }, [userRole, activeTab, loadTeacherStudents]);

  useEffect(() => {
    if (userRole === "Admin" && (activeTab === "admin-teachers" || activeTab === "admin-students")) {
      loadAdminData();
    }
  }, [userRole, activeTab, loadAdminData]);

  useEffect(() => {
    if (userRole !== "Student") return undefined;
    const interval = setInterval(() => {
      loadDashboardData();
    }, 30000);
    return () => clearInterval(interval);
  }, [userRole, loadDashboardData]);

  useEffect(() => {
    if (userRole !== "Teacher") return undefined;
    if (!["scores", "teacher-analysis"].includes(activeTab)) return undefined;
    const interval = setInterval(() => {
      loadLeaderboardData(selectedPuzzleId);
      loadPuzzleAnalytics(selectedPuzzleId);
    }, 30000);
    return () => clearInterval(interval);
  }, [userRole, activeTab, selectedPuzzleId, loadLeaderboardData, loadPuzzleAnalytics]);

  useEffect(() => {
    if (userRole === "Teacher" && selectedPuzzleId) {
      localStorage.setItem("activePuzzleId", String(selectedPuzzleId));
    }
  }, [userRole, selectedPuzzleId]);

  const handlePuzzleSubmitted = async () => {
    await Promise.all([
      loadDashboardData(),
      loadLeaderboardData(selectedPuzzleId),
      loadPuzzleAnalytics(selectedPuzzleId),
      loadStudentHistory(),
    ]);
  };

  const handlePuzzleCreated = async (puzzle) => {
    if (puzzle?.id) {
      setSelectedPuzzleId(puzzle.id);
      localStorage.setItem("activePuzzleId", String(puzzle.id));
    }
    await loadDashboardData();
    if (puzzle?.id) {
      await Promise.all([loadLeaderboardData(puzzle.id), loadPuzzleAnalytics(puzzle.id)]);
    }
  };

  const handleTeacherEdit = (puzzleId) => {
    setSelectedPuzzleId(puzzleId);
    setActiveTab("upload");
  };

  const handleTeacherPreview = (puzzleId) => {
    setSelectedPuzzleId(puzzleId);
    setActiveTab("upload");
  };

  const handleTeacherPublish = async (puzzleId) => {
    try {
      await publishPuzzle({ puzzle_id: puzzleId });
      await handlePuzzleSubmitted();
    } catch (error) {
      console.error("Publish failed:", error);
      alert(error?.message || "Publish failed.");
    }
  };

  const handleTeacherArchive = async (puzzleId) => {
    try {
      await archivePuzzle(puzzleId);
      await handlePuzzleSubmitted();
    } catch (error) {
      console.error("Archive failed:", error);
      alert(error?.message || "Archive failed.");
    }
  };

  const handleTeacherDelete = async (puzzleId) => {
    try {
      const puzzle = puzzles.find((row) => row.id === puzzleId);
      if (puzzle?.status === "published") {
        alert("Published puzzles cannot be deleted.");
        return;
      }
      await deletePuzzle(puzzleId);
      if (selectedPuzzleId === puzzleId) {
        setSelectedPuzzleId(null);
      }
      await handlePuzzleSubmitted();
    } catch (error) {
      console.error("Delete failed:", error);
      alert(error?.message || "Delete failed.");
    }
  };

  const handleTeacherAnalytics = (puzzleId) => {
    setSelectedPuzzleId(puzzleId);
    setActiveTab("teacher-analysis");
  };

  const handlePuzzleSelect = (puzzleId) => {
    if (!puzzleId) return;
    setSelectedPuzzleId(puzzleId);
  };

  const handleStudentUpload = async (file) => {
    const result = await uploadStudentsCsv(currentUserId, file);
    await loadTeacherStudents();
    return result;
  };

  const handleStudentReset = async (student) => {
    const newPassword = window.prompt("Enter new password for the student:");
    if (!newPassword) return;
    await resetStudentPassword(student.id, newPassword);
    await loadTeacherStudents();
  };

  const handleStudentDelete = async (student) => {
    if (!window.confirm("Delete this student?")) return;
    await deleteStudent(student.id);
    await loadTeacherStudents();
  };

  const handleAdminCreateTeacher = async () => {
    if (!newTeacher.teacher_id || !newTeacher.password) {
      setAdminError("Teacher ID and password are required.");
      return;
    }
    await createTeacher(newTeacher);
    setNewTeacher({ teacher_id: "", name: "", password: "" });
    await loadAdminData();
  };

  const handleAdminDeleteTeacher = async (teacher) => {
    if (!window.confirm("Delete this teacher and their students?")) return;
    await deleteTeacher(teacher.teacher_id);
    await loadAdminData();
  };

  return (
    <div className="flex min-h-screen bg-[#050505] text-white font-sans">
      {/* SIDEBAR */}
      <aside className="w-[260px] bg-[#0f0a0a] p-8 border-r border-[#221515] flex flex-col">
        <div>
          <h2 className="font-serif italic text-3xl mb-2 pl-2 text-gray-100">
            Dashboard
          </h2>
          <p className="text-[#E53935] font-bold text-sm tracking-widest uppercase pl-2 mb-10">
            {userRole} Portal
          </p>
        </div>

        <nav className="flex flex-col gap-3">
          {userRole === "Teacher" && (
            <button
              onClick={() => setActiveTab("dashboard")}
              className={`flex items-center gap-4 px-5 py-3 rounded-full transition-all w-full text-left ${activeTab === "dashboard" ? "bg-[#4a4a4a] text-white font-bold" : "text-gray-300 hover:bg-white/5"}`}
            >
              <LayoutDashboard size={20} />
              <span>My Puzzles</span>
            </button>
          )}

          {userRole === "Teacher" && (
            <button
              onClick={() => setActiveTab("create")}
              className={`flex items-center gap-4 px-5 py-3 rounded-full transition-all w-full text-left ${activeTab === "create" ? "bg-[#4a4a4a] text-white font-bold" : "text-gray-300 hover:bg-white/5"}`}
            >
              <PlusCircle size={20} />
              <span>Create Puzzle</span>
            </button>
          )}
          {userRole === "Teacher" && (
            <button
              onClick={() => setActiveTab("upload")}
              className={`flex items-center gap-4 px-5 py-3 rounded-full transition-all w-full text-left ${activeTab === "upload" ? "bg-[#4a4a4a] text-white font-bold" : "text-gray-300 hover:bg-white/5"}`}
            >
              <FileText size={20} />
              <span>Add Content</span>
            </button>
          )}
          {userRole === "Teacher" && (
            <button
              onClick={() => setActiveTab("students")}
              className={`flex items-center gap-4 px-5 py-3 rounded-full transition-all w-full text-left ${activeTab === "students" ? "bg-[#4a4a4a] text-white font-bold" : "text-gray-300 hover:bg-white/5"}`}
            >
              <Users size={20} />
              <span>Students</span>
            </button>
          )}

          {userRole === "Admin" && (
            <button
              onClick={() => setActiveTab("admin-teachers")}
              className={`flex items-center gap-4 px-5 py-3 rounded-full transition-all w-full text-left ${activeTab === "admin-teachers" ? "bg-[#4a4a4a] text-white font-bold" : "text-gray-300 hover:bg-white/5"}`}
            >
              <Users size={20} />
              <span>Teachers</span>
            </button>
          )}

          {userRole === "Admin" && (
            <button
              onClick={() => setActiveTab("admin-students")}
              className={`flex items-center gap-4 px-5 py-3 rounded-full transition-all w-full text-left ${activeTab === "admin-students" ? "bg-[#4a4a4a] text-white font-bold" : "text-gray-300 hover:bg-white/5"}`}
            >
              <List size={20} />
              <span>Students</span>
            </button>
          )}

          {userRole === "Student" && (
            <button
              onClick={() => setActiveTab("available")}
              className={`flex items-center gap-4 px-5 py-3 rounded-full transition-all w-full text-left ${activeTab === "available" ? "bg-[#E53935] text-white font-bold shadow-[0_0_15px_rgba(229,57,53,0.4)]" : "text-gray-300 hover:bg-white/5"}`}
            >
              <Gamepad2 size={20} />
              <span>Available Puzzles</span>
            </button>
          )}

          {userRole === "Student" && (
            <button
              onClick={() => setActiveTab("attempts")}
              className={`flex items-center gap-4 px-5 py-3 rounded-full transition-all w-full text-left ${activeTab === "attempts" ? "bg-[#4a4a4a] text-white font-bold" : "text-gray-300 hover:bg-white/5"}`}
            >
              <History size={20} />
              <span>Attempted Puzzles</span>
            </button>
          )}

          {userRole === "Student" && (
            <button
              onClick={() => setActiveTab("stats")}
              className={`flex items-center gap-4 px-5 py-3 rounded-full transition-all w-full text-left ${activeTab === "stats" ? "bg-[#4a4a4a] text-white font-bold" : "text-gray-300 hover:bg-white/5"}`}
            >
              <List size={20} />
              <span>Current Stats</span>
            </button>
          )}

          <button
            onClick={() => setActiveTab("scores")}
            className={`flex items-center gap-4 px-5 py-3 rounded-full transition-all w-full text-left ${activeTab === "scores" ? "bg-[#4a4a4a] text-white font-bold" : "text-gray-300 hover:bg-white/5"}`}
          >
            <Bell size={20} />
            <span>Leaderboard</span>
          </button>

          {userRole === "Teacher" && (
            <button
              onClick={() => setActiveTab("teacher-analysis")}
              className={`flex items-center gap-4 px-5 py-3 rounded-full transition-all w-full text-left ${activeTab === "teacher-analysis" ? "bg-[#4a4a4a] text-white font-bold" : "text-gray-300 hover:bg-white/5"}`}
            >
              <BarChart2 size={20} />
              <span>Analytics</span>
            </button>
          )}

          {userRole === "Student" && (
            <button
              onClick={() => setActiveTab("report")}
              className={`flex items-center gap-4 px-5 py-3 rounded-full transition-all w-full text-left ${activeTab === "report" ? "bg-[#4a4a4a] text-white font-bold" : "text-gray-300 hover:bg-white/5"}`}
            >
              <BarChart2 size={20} />
              <span>Report</span>
            </button>
          )}

          {userRole === "Student" && (
            <button
              onClick={() => setActiveTab("reanalyse")}
              className={`flex items-center gap-4 px-5 py-3 rounded-full transition-all w-full text-left ${activeTab === "reanalyse" ? "bg-[#4a4a4a] text-white font-bold" : "text-gray-300 hover:bg-white/5"}`}
            >
              <RotateCcw size={20} />
              <span>Reanalyse</span>
            </button>
          )}
        </nav>

        {/* SIGN OUT BUTTON */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-4 px-5 py-3 mt-auto rounded-full text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all font-medium w-full text-left"
        >
          <LogOut size={20} />
          <span>Sign Out</span>
        </button>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col bg-[radial-gradient(circle_at_top_left,_#1a1010_0%,_#050505_100%)] overflow-y-auto">
        {/* TOP HEADER */}
        <header className="px-10 py-8 bg-gradient-to-r from-[#1f1816] to-[#0a0808] border-b border-white/5 flex items-center">
          <div className="flex items-center gap-4">
            <Search size={32} className="text-gray-400" />
            <h1 className="font-serif text-4xl text-gray-200 m-0">
              Welcome 🍦
            </h1>
          </div>
        </header>

        {/* DYNAMIC CONTENT PANEL */}
        <div className="m-10 flex-1">
          {activeTab === "dashboard" && userRole === "Teacher" && (
            <div className="bg-[#1e1514] rounded-3xl p-8 shadow-[0_10px_40px_rgba(0,0,0,0.6)] border border-white/5 h-full">
              {/* ... (Existing Dashboard Grid) ... */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                <div className="bg-[#110c0b] border border-white/5 rounded-2xl py-8 px-4 flex flex-col items-center justify-center shadow-inner">
                  <div className="font-serif text-5xl mb-3 text-white">{stats.total_puzzles}</div>
                  <div className="flex items-center gap-2 text-sm text-gray-300 font-medium">
                    <Puzzle size={18} color="#E53935" /> Total Puzzles
                  </div>
                </div>
                <div className="bg-[#110c0b] border border-white/5 rounded-2xl py-8 px-4 flex flex-col items-center justify-center shadow-inner">
                  <div className="font-serif text-5xl mb-3 text-white">{stats.assistances}</div>
                  <div className="flex items-center gap-2 text-sm text-gray-300 font-medium">
                    <Lightbulb size={18} color="#E53935" /> Assistances
                  </div>
                </div>
                <div className="bg-[#110c0b] border border-white/5 rounded-2xl py-8 px-4 flex flex-col items-center justify-center shadow-inner">
                  <div className="font-serif text-5xl mb-3 text-white">{stats.attainment}</div>
                  <div className="flex items-center gap-2 text-sm text-gray-300 font-medium">
                    <Target size={18} color="#E53935" /> Attainment
                  </div>
                </div>
                <div className="bg-[#110c0b] border border-white/5 rounded-2xl py-8 px-4 flex flex-col items-center justify-center shadow-inner">
                  <div className="font-serif text-5xl mb-3 text-white">{stats.avg_score}</div>
                  <div className="flex items-center gap-2 text-sm text-gray-300 font-medium">
                    <Star size={18} color="#E53935" /> Avg Score
                  </div>
                </div>
              </div>

              <div className="bg-[#110c0b] border border-white/5 rounded-2xl p-6 overflow-hidden">
                <table className="w-full border-collapse text-left">
                  <thead>
                    <tr>
                      <th className="py-4 px-4 font-serif text-lg font-normal text-white border-b border-white/10">
                        Title
                      </th>
                      <th className="py-4 px-4 font-serif text-lg font-normal text-white border-b border-white/10 text-center">
                        Clues
                      </th>
                      <th className="py-4 px-4 font-serif text-lg font-normal text-white border-b border-white/10 text-center">
                        Created
                      </th>
                      <th className="py-4 px-4 font-serif text-lg font-normal text-white border-b border-white/10 text-center">
                        Status
                      </th>
                      <th className="py-4 px-4 font-serif text-lg font-normal text-white border-b border-white/10 text-center">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoadingDashboard ? (
                      <tr>
                        <td colSpan="5" className="py-4 px-4 text-gray-400 text-center">
                          Loading puzzles...
                        </td>
                      </tr>
                    ) : puzzles.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="py-4 px-4 text-gray-400 text-center">
                          {dashboardError || "No puzzles available"}
                        </td>
                      </tr>
                    ) : (
                      puzzles.map((row) => (
                        <tr
                          key={row.id}
                          onClick={() => {
                            setSelectedPuzzleId(row.id);
                            if (userRole === "Teacher") {
                              setActiveTab("upload");
                            } else if (userRole === "Student") {
                              setActiveTab("play");
                            }
                          }}
                          className={`hover:bg-white/5 transition-colors cursor-pointer ${selectedPuzzleId === row.id ? "bg-white/5" : ""}`}
                        >
                          <td className="py-4 px-4 text-gray-400 border-b border-white/5">
                            {row.title}
                          </td>
                          <td className="py-4 px-4 text-gray-400 border-b border-white/5 text-center">
                            {row.clue_count ?? row.clues?.length ?? 0}
                          </td>
                          <td className="py-4 px-4 text-gray-400 border-b border-white/5 text-center">
                            {formatDate(row.created_at)}
                          </td>
                          <td className="py-4 px-4 text-gray-400 border-b border-white/5 text-center">
                            {row.status}
                          </td>
                          <td className="py-4 px-4 text-gray-400 border-b border-white/5 text-center">
                            <div className="flex flex-wrap gap-2 justify-center">
                              <button
                                type="button"
                                onClick={(event) => {
                                  event.stopPropagation();
                                  handleTeacherEdit(row.id);
                                }}
                                disabled={row.status !== "draft"}
                                className="text-xs bg-blue-700 px-2 py-1 rounded disabled:opacity-50"
                              >
                                Edit
                              </button>
                              <button
                                type="button"
                                onClick={(event) => {
                                  event.stopPropagation();
                                  handleTeacherPreview(row.id);
                                }}
                                className="text-xs bg-gray-700 px-2 py-1 rounded"
                              >
                                Preview
                              </button>
                              <button
                                type="button"
                                onClick={(event) => {
                                  event.stopPropagation();
                                  handleTeacherPublish(row.id);
                                }}
                                disabled={row.status !== "draft"}
                                className="text-xs bg-green-700 px-2 py-1 rounded disabled:opacity-50"
                              >
                                Publish
                              </button>
                              <button
                                type="button"
                                onClick={(event) => {
                                  event.stopPropagation();
                                  handleTeacherArchive(row.id);
                                }}
                                disabled={row.status === "archived"}
                                className="text-xs bg-amber-700 px-2 py-1 rounded disabled:opacity-50"
                              >
                                Archive
                              </button>
                              <button
                                type="button"
                                onClick={(event) => {
                                  event.stopPropagation();
                                  handleTeacherAnalytics(row.id);
                                }}
                                className="text-xs bg-purple-700 px-2 py-1 rounded"
                              >
                                Analytics
                              </button>
                              <button
                                type="button"
                                onClick={(event) => {
                                  event.stopPropagation();
                                  handleTeacherDelete(row.id);
                                }}
                                disabled={row.status === "published"}
                                className="text-xs bg-red-700 px-2 py-1 rounded disabled:opacity-50"
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
          )}

          {activeTab === "available" && userRole === "Student" && (
            <div className="bg-[#1e1514] rounded-3xl p-8 shadow-[0_10px_40px_rgba(0,0,0,0.6)] border border-white/5 h-full">
              <div className="bg-[#110c0b] border border-white/5 rounded-2xl p-6 overflow-hidden">
                <table className="w-full border-collapse text-left">
                  <thead>
                    <tr>
                      <th className="py-4 px-4 font-serif text-lg font-normal text-white border-b border-white/10">
                        Title
                      </th>
                      <th className="py-4 px-4 font-serif text-lg font-normal text-white border-b border-white/10 text-center">
                        Teacher
                      </th>
                      <th className="py-4 px-4 font-serif text-lg font-normal text-white border-b border-white/10 text-center">
                        Difficulty
                      </th>
                      <th className="py-4 px-4 font-serif text-lg font-normal text-white border-b border-white/10 text-center">
                        Clues
                      </th>
                      <th className="py-4 px-4 font-serif text-lg font-normal text-white border-b border-white/10 text-center">
                        Created
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoadingDashboard ? (
                      <tr>
                        <td colSpan="5" className="py-4 px-4 text-gray-400 text-center">
                          Loading puzzles...
                        </td>
                      </tr>
                    ) : puzzles.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="py-4 px-4 text-gray-400 text-center">
                          {dashboardError || "No puzzles available"}
                        </td>
                      </tr>
                    ) : (
                      puzzles.map((row) => (
                        <tr
                          key={row.id}
                          onClick={() => {
                            setSelectedPuzzleId(row.id);
                            setActiveTab("play");
                          }}
                          className={`hover:bg-white/5 transition-colors cursor-pointer ${selectedPuzzleId === row.id ? "bg-white/5" : ""}`}
                        >
                          <td className="py-4 px-4 text-gray-400 border-b border-white/5">
                            {row.title}
                          </td>
                          <td className="py-4 px-4 text-gray-400 border-b border-white/5 text-center">
                            {row.teacher_name || row.teacher_id || "-"}
                          </td>
                          <td className="py-4 px-4 text-gray-400 border-b border-white/5 text-center">
                            {row.difficulty || "-"}
                          </td>
                          <td className="py-4 px-4 text-gray-400 border-b border-white/5 text-center">
                            {row.clue_count ?? row.clues?.length ?? 0}
                          </td>
                          <td className="py-4 px-4 text-gray-400 border-b border-white/5 text-center">
                            {formatDate(row.created_at)}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === "attempts" && userRole === "Student" && (
            <div className="bg-[#1e1514] rounded-3xl p-8 shadow-[0_10px_40px_rgba(0,0,0,0.6)] border border-white/5 h-full">
              <div className="bg-[#110c0b] border border-white/5 rounded-2xl p-6 overflow-hidden">
                <table className="w-full border-collapse text-left">
                  <thead>
                    <tr>
                      <th className="py-4 px-4 font-serif text-lg font-normal text-white border-b border-white/10">
                        Puzzle
                      </th>
                      <th className="py-4 px-4 font-serif text-lg font-normal text-white border-b border-white/10 text-center">
                        Score
                      </th>
                      <th className="py-4 px-4 font-serif text-lg font-normal text-white border-b border-white/10 text-center">
                        Time
                      </th>
                      <th className="py-4 px-4 font-serif text-lg font-normal text-white border-b border-white/10 text-center">
                        Rank
                      </th>
                      <th className="py-4 px-4 font-serif text-lg font-normal text-white border-b border-white/10 text-center">
                        Date
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoadingHistory ? (
                      <tr>
                        <td colSpan="5" className="py-4 px-4 text-gray-400 text-center">
                          Loading attempts...
                        </td>
                      </tr>
                    ) : historyError ? (
                      <tr>
                        <td colSpan="5" className="py-4 px-4 text-gray-400 text-center">
                          {historyError}
                        </td>
                      </tr>
                    ) : studentHistory.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="py-4 px-4 text-gray-400 text-center">
                          No attempts yet.
                        </td>
                      </tr>
                    ) : (
                      studentHistory.map((row) => (
                        <tr key={row.attempt_id} className="hover:bg-white/5 transition-colors">
                          <td className="py-4 px-4 text-gray-400 border-b border-white/5">
                            {row.puzzle_title}
                          </td>
                          <td className="py-4 px-4 text-gray-400 border-b border-white/5 text-center">
                            {Math.round(row.score || 0)}%
                          </td>
                          <td className="py-4 px-4 text-gray-400 border-b border-white/5 text-center">
                            {row.completion_time || 0}s
                          </td>
                          <td className="py-4 px-4 text-gray-400 border-b border-white/5 text-center">
                            {row.rank ?? "-"}
                          </td>
                          <td className="py-4 px-4 text-gray-400 border-b border-white/5 text-center">
                            {formatDate(row.attempt_date || row.submitted_at)}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === "create" && userRole === "Teacher" && (
            <div className="flex justify-center items-start pt-4 h-full w-full">
              <CreatePuzzleForm
                onPuzzleCreated={handlePuzzleCreated}
                onShowPreview={() => setActiveTab("upload")}
              />
            </div>
          )}

          {/* 🌟 3. RENDER THE GAME HERE 🌟 */}
          {activeTab === "play" && userRole === "Student" && (
            <div className="flex justify-center items-start pt-4 h-full w-full">
              {selectedPuzzle ? (
                <CrosswordPlayer
                  key={selectedPuzzle.id}
                  selectedPuzzle={selectedPuzzle}
                  allPuzzles={puzzles}
                  onPuzzleSubmitted={handlePuzzleSubmitted}
                  studentRegNo={currentUserId}
                />
              ) : (
                <div className="text-gray-400 text-center">Select a puzzle to start playing.</div>
              )}
            </div>
          )}

          {activeTab === "stats" && userRole === "Student" && (
            <div className="flex justify-center items-start pt-4 h-full w-full">
              <CurrentStats stats={stats} puzzles={puzzles} />
            </div>
          )}

          {activeTab === "scores" && (
            <div className="flex justify-center items-start pt-4 h-full w-full">
              <Leaderboard
                data={leaderboardData}
                isLoading={isLoadingLeaderboard}
                loadError={leaderboardError}
                puzzles={publishedPuzzles}
                selectedPuzzleId={selectedPuzzleId}
                onPuzzleSelect={handlePuzzleSelect}
              />
            </div>
          )}

          {activeTab === "teacher-analysis" && userRole === "Teacher" && (
            <div className="flex justify-center items-start pt-4 h-full w-full">
              <TeacherReport
                puzzles={publishedPuzzles}
                puzzleAnalytics={puzzleAnalytics}
                isLoading={isLoadingLeaderboard}
                loadError={leaderboardError}
                selectedPuzzleId={selectedPuzzleId}
                onPuzzleSelect={handlePuzzleSelect}
              />
            </div>
          )}

          {activeTab === "report" && userRole === "Student" && (
            <div className="flex justify-center items-start pt-4 h-full w-full">
              <Report studentRegNo={currentUserId} />
            </div>
          )}

          {activeTab === "reanalyse" && userRole === "Student" && (
            <div className="flex justify-center items-start pt-4 h-full w-full">
              <Reanalyse history={studentHistory} puzzles={puzzles} />
            </div>
          )}

          {activeTab === "upload" && userRole === "Teacher" && (
            <div className="flex justify-center items-start pt-4 h-full w-full">
              <TeacherContentUpload
                onPuzzlePublished={handlePuzzleSubmitted}
                activePuzzleId={selectedPuzzleId}
              />
            </div>
          )}

          {activeTab === "students" && userRole === "Teacher" && (
            <div className="flex justify-center items-start pt-4 h-full w-full">
              <TeacherStudents
                teacherId={currentUserId}
                students={teacherStudents}
                isLoading={isLoadingStudents}
                error={studentsError}
                onUpload={handleStudentUpload}
                onResetPassword={handleStudentReset}
                onDelete={handleStudentDelete}
              />
            </div>
          )}

          {activeTab === "admin-teachers" && userRole === "Admin" && (
            <div className="bg-[#1e1514] rounded-3xl p-8 shadow-[0_10px_40px_rgba(0,0,0,0.6)] border border-white/5 h-full">
              <div className="mb-6 flex flex-col md:flex-row gap-4 items-start md:items-center">
                <input
                  type="text"
                  placeholder="Teacher ID"
                  value={newTeacher.teacher_id}
                  onChange={(e) => setNewTeacher((prev) => ({ ...prev, teacher_id: e.target.value }))}
                  className="bg-[#110c0b] border border-white/10 rounded-md px-3 py-2 text-sm text-gray-200"
                />
                <input
                  type="text"
                  placeholder="Name"
                  value={newTeacher.name}
                  onChange={(e) => setNewTeacher((prev) => ({ ...prev, name: e.target.value }))}
                  className="bg-[#110c0b] border border-white/10 rounded-md px-3 py-2 text-sm text-gray-200"
                />
                <input
                  type="password"
                  placeholder="Password"
                  value={newTeacher.password}
                  onChange={(e) => setNewTeacher((prev) => ({ ...prev, password: e.target.value }))}
                  className="bg-[#110c0b] border border-white/10 rounded-md px-3 py-2 text-sm text-gray-200"
                />
                <button
                  type="button"
                  onClick={handleAdminCreateTeacher}
                  className="bg-green-700 px-3 py-2 rounded text-sm"
                >
                  Create Teacher
                </button>
              </div>
              {adminError && <div className="text-sm text-red-400 mb-3">{adminError}</div>}
              <div className="bg-[#110c0b] border border-white/5 rounded-2xl p-6 overflow-hidden">
                <table className="w-full border-collapse text-left">
                  <thead>
                    <tr>
                      <th className="py-3 px-3 text-gray-300">Teacher ID</th>
                      <th className="py-3 px-3 text-gray-300">Name</th>
                      <th className="py-3 px-3 text-gray-300 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoadingAdmin ? (
                      <tr>
                        <td colSpan="3" className="py-4 text-gray-400 text-center">Loading teachers...</td>
                      </tr>
                    ) : adminTeachers.length === 0 ? (
                      <tr>
                        <td colSpan="3" className="py-4 text-gray-400 text-center">No teachers found.</td>
                      </tr>
                    ) : (
                      adminTeachers.map((teacher) => (
                        <tr key={teacher.teacher_id} className="border-b border-white/5 last:border-0">
                          <td className="py-3 px-3 text-gray-400">{teacher.teacher_id}</td>
                          <td className="py-3 px-3 text-gray-400">{teacher.name}</td>
                          <td className="py-3 px-3 text-center">
                            <button
                              type="button"
                              onClick={() => handleAdminDeleteTeacher(teacher)}
                              className="text-xs bg-red-700 px-2 py-1 rounded"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === "admin-students" && userRole === "Admin" && (
            <div className="bg-[#1e1514] rounded-3xl p-8 shadow-[0_10px_40px_rgba(0,0,0,0.6)] border border-white/5 h-full">
              <div className="bg-[#110c0b] border border-white/5 rounded-2xl p-6 overflow-hidden">
                <table className="w-full border-collapse text-left">
                  <thead>
                    <tr>
                      <th className="py-3 px-3 text-gray-300">Name</th>
                      <th className="py-3 px-3 text-gray-300">Registration</th>
                      <th className="py-3 px-3 text-gray-300">Teacher</th>
                      <th className="py-3 px-3 text-gray-300 text-center">Created</th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoadingAdmin ? (
                      <tr>
                        <td colSpan="4" className="py-4 text-gray-400 text-center">Loading students...</td>
                      </tr>
                    ) : adminStudents.length === 0 ? (
                      <tr>
                        <td colSpan="4" className="py-4 text-gray-400 text-center">No students found.</td>
                      </tr>
                    ) : (
                      adminStudents.map((student) => (
                        <tr key={student.id} className="border-b border-white/5 last:border-0">
                          <td className="py-3 px-3 text-gray-400">{student.name}</td>
                          <td className="py-3 px-3 text-gray-400">{student.reg_no}</td>
                          <td className="py-3 px-3 text-gray-400">{student.teacher_name || student.teacher_id || '-'}</td>
                          <td className="py-3 px-3 text-center text-gray-400">
                            {student.created_at ? new Date(student.created_at).toLocaleDateString() : '-'}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
