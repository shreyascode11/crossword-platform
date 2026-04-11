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
      <aside className="w-[272px] shrink-0 bg-gradient-to-b from-[#0d0a0a] via-[#0a0808] to-[#080606] p-8 border-r border-white/[0.06] flex flex-col shadow-[8px_0_40px_-20px_rgba(0,0,0,0.9)]">
        <div className="mb-2">
          <h2 className="font-serif italic text-3xl mb-1.5 pl-1 text-white tracking-tight">
            Dashboard
          </h2>
          <p className="text-[#e63946] font-bold text-[11px] tracking-[0.25em] uppercase pl-1 mb-10">
            {userRole} Portal
          </p>
        </div>

        <nav className="flex flex-col gap-1.5">
          {userRole === "Teacher" && (
            <button
              onClick={() => setActiveTab("dashboard")}
              className={`flex items-center gap-3.5 px-4 py-3 rounded-xl transition-all duration-200 w-full text-left border text-sm ${activeTab === "dashboard" ? "bg-gradient-to-r from-[#e63946]/20 to-[#e63946]/5 text-white font-semibold border-[#e63946]/35 shadow-[0_0_0_1px_rgba(230,57,70,0.15),0_8px_24px_-8px_rgba(230,57,70,0.35)]" : "text-gray-400 hover:text-white hover:bg-white/[0.04] border-transparent hover:border-white/[0.06] font-medium"}`}
            >
              <LayoutDashboard size={20} className={activeTab === "dashboard" ? "text-[#e63946]" : "opacity-80"} />
              <span>My Puzzles</span>
            </button>
          )}

          {userRole === "Teacher" && (
            <button
              onClick={() => setActiveTab("create")}
              className={`flex items-center gap-3.5 px-4 py-3 rounded-xl transition-all duration-200 w-full text-left border text-sm ${activeTab === "create" ? "bg-gradient-to-r from-[#e63946]/20 to-[#e63946]/5 text-white font-semibold border-[#e63946]/35 shadow-[0_0_0_1px_rgba(230,57,70,0.15),0_8px_24px_-8px_rgba(230,57,70,0.35)]" : "text-gray-400 hover:text-white hover:bg-white/[0.04] border-transparent hover:border-white/[0.06] font-medium"}`}
            >
              <PlusCircle size={20} className={activeTab === "create" ? "text-[#e63946]" : "opacity-80"} />
              <span>Create Puzzle</span>
            </button>
          )}
          {userRole === "Teacher" && (
            <button
              onClick={() => setActiveTab("upload")}
              className={`flex items-center gap-3.5 px-4 py-3 rounded-xl transition-all duration-200 w-full text-left border text-sm ${activeTab === "upload" ? "bg-gradient-to-r from-[#e63946]/20 to-[#e63946]/5 text-white font-semibold border-[#e63946]/35 shadow-[0_0_0_1px_rgba(230,57,70,0.15),0_8px_24px_-8px_rgba(230,57,70,0.35)]" : "text-gray-400 hover:text-white hover:bg-white/[0.04] border-transparent hover:border-white/[0.06] font-medium"}`}
            >
              <FileText size={20} className={activeTab === "upload" ? "text-[#e63946]" : "opacity-80"} />
              <span>Add Content</span>
            </button>
          )}
          {userRole === "Teacher" && (
            <button
              onClick={() => setActiveTab("students")}
              className={`flex items-center gap-3.5 px-4 py-3 rounded-xl transition-all duration-200 w-full text-left border text-sm ${activeTab === "students" ? "bg-gradient-to-r from-[#e63946]/20 to-[#e63946]/5 text-white font-semibold border-[#e63946]/35 shadow-[0_0_0_1px_rgba(230,57,70,0.15),0_8px_24px_-8px_rgba(230,57,70,0.35)]" : "text-gray-400 hover:text-white hover:bg-white/[0.04] border-transparent hover:border-white/[0.06] font-medium"}`}
            >
              <Users size={20} className={activeTab === "students" ? "text-[#e63946]" : "opacity-80"} />
              <span>Students</span>
            </button>
          )}

          {userRole === "Admin" && (
            <button
              onClick={() => setActiveTab("admin-teachers")}
              className={`flex items-center gap-3.5 px-4 py-3 rounded-xl transition-all duration-200 w-full text-left border text-sm ${activeTab === "admin-teachers" ? "bg-gradient-to-r from-[#22c55e]/20 to-[#22c55e]/5 text-white font-semibold border-[#22c55e]/35 shadow-[0_0_0_1px_rgba(34,197,94,0.15),0_8px_24px_-8px_rgba(34,197,94,0.25)]" : "text-gray-400 hover:text-white hover:bg-white/[0.04] border-transparent hover:border-white/[0.06] font-medium"}`}
            >
              <Users size={20} className={activeTab === "admin-teachers" ? "text-[#4ade80]" : "opacity-80"} />
              <span>Teachers</span>
            </button>
          )}

          {userRole === "Admin" && (
            <button
              onClick={() => setActiveTab("admin-students")}
              className={`flex items-center gap-3.5 px-4 py-3 rounded-xl transition-all duration-200 w-full text-left border text-sm ${activeTab === "admin-students" ? "bg-gradient-to-r from-[#22c55e]/20 to-[#22c55e]/5 text-white font-semibold border-[#22c55e]/35 shadow-[0_0_0_1px_rgba(34,197,94,0.15),0_8px_24px_-8px_rgba(34,197,94,0.25)]" : "text-gray-400 hover:text-white hover:bg-white/[0.04] border-transparent hover:border-white/[0.06] font-medium"}`}
            >
              <List size={20} className={activeTab === "admin-students" ? "text-[#4ade80]" : "opacity-80"} />
              <span>Students</span>
            </button>
          )}

          {userRole === "Student" && (
            <button
              onClick={() => setActiveTab("available")}
              className={`flex items-center gap-3.5 px-4 py-3 rounded-xl transition-all duration-200 w-full text-left border text-sm ${activeTab === "available" ? "bg-gradient-to-r from-[#e63946] to-[#c62f3a] text-white font-semibold border-[#e63946]/50 shadow-[0_0_0_1px_rgba(230,57,70,0.35),0_12px_32px_-10px_rgba(230,57,70,0.55)]" : "text-gray-400 hover:text-white hover:bg-white/[0.04] border-transparent hover:border-white/[0.06] font-medium"}`}
            >
              <Gamepad2 size={20} className={activeTab === "available" ? "text-white" : "opacity-80"} />
              <span>Available Puzzles</span>
            </button>
          )}

          {userRole === "Student" && (
            <button
              onClick={() => setActiveTab("attempts")}
              className={`flex items-center gap-3.5 px-4 py-3 rounded-xl transition-all duration-200 w-full text-left border text-sm ${activeTab === "attempts" ? "bg-gradient-to-r from-[#3b82f6]/20 to-[#3b82f6]/5 text-white font-semibold border-[#3b82f6]/35 shadow-[0_0_0_1px_rgba(59,130,246,0.15),0_8px_24px_-8px_rgba(59,130,246,0.3)]" : "text-gray-400 hover:text-white hover:bg-white/[0.04] border-transparent hover:border-white/[0.06] font-medium"}`}
            >
              <History size={20} className={activeTab === "attempts" ? "text-[#60a5fa]" : "opacity-80"} />
              <span>Attempted Puzzles</span>
            </button>
          )}

          {userRole === "Student" && (
            <button
              onClick={() => setActiveTab("stats")}
              className={`flex items-center gap-3.5 px-4 py-3 rounded-xl transition-all duration-200 w-full text-left border text-sm ${activeTab === "stats" ? "bg-gradient-to-r from-[#3b82f6]/20 to-[#3b82f6]/5 text-white font-semibold border-[#3b82f6]/35 shadow-[0_0_0_1px_rgba(59,130,246,0.15),0_8px_24px_-8px_rgba(59,130,246,0.3)]" : "text-gray-400 hover:text-white hover:bg-white/[0.04] border-transparent hover:border-white/[0.06] font-medium"}`}
            >
              <List size={20} className={activeTab === "stats" ? "text-[#60a5fa]" : "opacity-80"} />
              <span>Current Stats</span>
            </button>
          )}

          <button
            onClick={() => setActiveTab("scores")}
            className={`flex items-center gap-3.5 px-4 py-3 rounded-xl transition-all duration-200 w-full text-left border text-sm ${activeTab === "scores" ? "bg-gradient-to-r from-amber-500/15 to-amber-600/5 text-white font-semibold border-amber-500/30 shadow-[0_0_0_1px_rgba(245,158,11,0.12),0_8px_24px_-8px_rgba(245,158,11,0.2)]" : "text-gray-400 hover:text-white hover:bg-white/[0.04] border-transparent hover:border-white/[0.06] font-medium"}`}
          >
            <Bell size={20} className={activeTab === "scores" ? "text-amber-400" : "opacity-80"} />
            <span>Leaderboard</span>
          </button>

          {userRole === "Teacher" && (
            <button
              onClick={() => setActiveTab("teacher-analysis")}
              className={`flex items-center gap-3.5 px-4 py-3 rounded-xl transition-all duration-200 w-full text-left border text-sm ${activeTab === "teacher-analysis" ? "bg-gradient-to-r from-[#e63946]/20 to-[#e63946]/5 text-white font-semibold border-[#e63946]/35 shadow-[0_0_0_1px_rgba(230,57,70,0.15),0_8px_24px_-8px_rgba(230,57,70,0.35)]" : "text-gray-400 hover:text-white hover:bg-white/[0.04] border-transparent hover:border-white/[0.06] font-medium"}`}
            >
              <BarChart2 size={20} className={activeTab === "teacher-analysis" ? "text-[#e63946]" : "opacity-80"} />
              <span>Analytics</span>
            </button>
          )}

          {userRole === "Student" && (
            <button
              onClick={() => setActiveTab("report")}
              className={`flex items-center gap-3.5 px-4 py-3 rounded-xl transition-all duration-200 w-full text-left border text-sm ${activeTab === "report" ? "bg-gradient-to-r from-[#3b82f6]/20 to-[#3b82f6]/5 text-white font-semibold border-[#3b82f6]/35 shadow-[0_0_0_1px_rgba(59,130,246,0.15),0_8px_24px_-8px_rgba(59,130,246,0.3)]" : "text-gray-400 hover:text-white hover:bg-white/[0.04] border-transparent hover:border-white/[0.06] font-medium"}`}
            >
              <BarChart2 size={20} className={activeTab === "report" ? "text-[#60a5fa]" : "opacity-80"} />
              <span>Report</span>
            </button>
          )}

          {userRole === "Student" && (
            <button
              onClick={() => setActiveTab("reanalyse")}
              className={`flex items-center gap-3.5 px-4 py-3 rounded-xl transition-all duration-200 w-full text-left border text-sm ${activeTab === "reanalyse" ? "bg-gradient-to-r from-[#3b82f6]/20 to-[#3b82f6]/5 text-white font-semibold border-[#3b82f6]/35 shadow-[0_0_0_1px_rgba(59,130,246,0.15),0_8px_24px_-8px_rgba(59,130,246,0.3)]" : "text-gray-400 hover:text-white hover:bg-white/[0.04] border-transparent hover:border-white/[0.06] font-medium"}`}
            >
              <RotateCcw size={20} className={activeTab === "reanalyse" ? "text-[#60a5fa]" : "opacity-80"} />
              <span>Reanalyse</span>
            </button>
          )}
        </nav>

        {/* SIGN OUT BUTTON */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-3.5 px-4 py-3 mt-auto rounded-xl text-red-400/95 hover:bg-red-500/10 hover:text-red-300 transition-all duration-200 font-medium w-full text-left border border-transparent hover:border-red-500/20 text-sm"
        >
          <LogOut size={20} />
          <span>Sign Out</span>
        </button>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col min-w-0 bg-[radial-gradient(ellipse_120%_80%_at_0%_-10%,rgba(230,57,70,0.08),transparent_50%),radial-gradient(circle_at_top_right,#141018_0%,#050505_55%)] overflow-y-auto">
        {/* TOP HEADER */}
        <header className="px-8 lg:px-12 py-7 bg-gradient-to-r from-[#141212] via-[#0e0c0c] to-[#0a0808] border-b border-white/[0.06] flex items-center justify-between shadow-[0_1px_0_rgba(255,255,255,0.04)_inset]">
          <div className="flex items-center gap-5 min-w-0">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/[0.04] border border-white/[0.08] text-[#e63946] shadow-[0_8px_30px_-12px_rgba(230,57,70,0.45)] shrink-0">
              <Search size={22} className="opacity-90" />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] uppercase tracking-[0.28em] text-gray-500 font-semibold m-0 mb-1">
                Overview
              </p>
              <h1 className="font-serif text-3xl sm:text-4xl text-white m-0 tracking-tight">
                Welcome
              </h1>
              <p className="text-sm text-gray-500 m-0 mt-1 font-normal max-w-xl leading-relaxed">
                Manage puzzles, content, and progress from one place.
              </p>
            </div>
          </div>
        </header>

        {/* DYNAMIC CONTENT PANEL */}
        <div className="p-6 sm:p-8 lg:p-10 flex-1">
          {activeTab === "dashboard" && userRole === "Teacher" && (
            <div className="bg-gradient-to-br from-[#1a1414] via-[#141010] to-[#0f0c0c] rounded-3xl p-8 sm:p-9 shadow-[0_24px_60px_-30px_rgba(0,0,0,0.85)] border border-white/[0.07] h-full">
              {/* ... (Existing Dashboard Grid) ... */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
                <div className="group bg-[#0c0a0a]/90 border border-white/[0.06] rounded-2xl py-8 px-4 flex flex-col items-center justify-center shadow-[inset_0_1px_0_rgba(255,255,255,0.04),0_12px_40px_-24px_rgba(0,0,0,0.8)] hover:border-[#e63946]/25 transition-colors duration-300">
                  <div className="font-serif text-5xl mb-3 text-white tabular-nums tracking-tight">{stats.total_puzzles}</div>
                  <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-gray-400 font-semibold">
                    <Puzzle size={18} color="#e63946" className="opacity-90" /> Total Puzzles
                  </div>
                </div>
                <div className="group bg-[#0c0a0a]/90 border border-white/[0.06] rounded-2xl py-8 px-4 flex flex-col items-center justify-center shadow-[inset_0_1px_0_rgba(255,255,255,0.04),0_12px_40px_-24px_rgba(0,0,0,0.8)] hover:border-[#e63946]/25 transition-colors duration-300">
                  <div className="font-serif text-5xl mb-3 text-white tabular-nums tracking-tight">{stats.assistances}</div>
                  <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-gray-400 font-semibold">
                    <Lightbulb size={18} color="#e63946" className="opacity-90" /> Assistances
                  </div>
                </div>
                <div className="group bg-[#0c0a0a]/90 border border-white/[0.06] rounded-2xl py-8 px-4 flex flex-col items-center justify-center shadow-[inset_0_1px_0_rgba(255,255,255,0.04),0_12px_40px_-24px_rgba(0,0,0,0.8)] hover:border-[#e63946]/25 transition-colors duration-300">
                  <div className="font-serif text-5xl mb-3 text-white tabular-nums tracking-tight">{stats.attainment}</div>
                  <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-gray-400 font-semibold">
                    <Target size={18} color="#e63946" className="opacity-90" /> Attainment
                  </div>
                </div>
                <div className="group bg-[#0c0a0a]/90 border border-white/[0.06] rounded-2xl py-8 px-4 flex flex-col items-center justify-center shadow-[inset_0_1px_0_rgba(255,255,255,0.04),0_12px_40px_-24px_rgba(0,0,0,0.8)] hover:border-[#e63946]/25 transition-colors duration-300">
                  <div className="font-serif text-5xl mb-3 text-white tabular-nums tracking-tight">{stats.avg_score}</div>
                  <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-gray-400 font-semibold">
                    <Star size={18} color="#e63946" className="opacity-90" /> Avg Score
                  </div>
                </div>
              </div>

              <div className="bg-[#0c0a0a]/95 border border-white/[0.06] rounded-2xl p-2 sm:p-0 overflow-hidden shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
                <table className="w-full border-collapse text-left text-sm">
                  <thead>
                    <tr className="bg-white/[0.02]">
                      <th className="py-4 px-4 font-semibold text-xs uppercase tracking-wider text-gray-400 border-b border-white/[0.08]">
                        Title
                      </th>
                      <th className="py-4 px-4 font-semibold text-xs uppercase tracking-wider text-gray-400 border-b border-white/[0.08] text-center">
                        Clues
                      </th>
                      <th className="py-4 px-4 font-semibold text-xs uppercase tracking-wider text-gray-400 border-b border-white/[0.08] text-center">
                        Created
                      </th>
                      <th className="py-4 px-4 font-semibold text-xs uppercase tracking-wider text-gray-400 border-b border-white/[0.08] text-center">
                        Status
                      </th>
                      <th className="py-4 px-4 font-semibold text-xs uppercase tracking-wider text-gray-400 border-b border-white/[0.08] text-center">
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
                      puzzles.map((row, idx) => (
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
                          className={`transition-colors cursor-pointer border-b border-white/[0.04] ${idx % 2 === 1 ? "bg-white/[0.02]" : "bg-transparent"} hover:bg-white/[0.06] ${selectedPuzzleId === row.id ? "bg-[#e63946]/[0.08] hover:bg-[#e63946]/[0.1]" : ""}`}
                        >
                          <td className="py-3.5 px-4 text-gray-200 font-medium">
                            {row.title}
                          </td>
                          <td className="py-3.5 px-4 text-gray-400 text-center tabular-nums">
                            {row.clue_count ?? row.clues?.length ?? 0}
                          </td>
                          <td className="py-3.5 px-4 text-gray-400 text-center">
                            {formatDate(row.created_at)}
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <span className="inline-flex items-center justify-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide border border-white/10 bg-white/[0.04] text-gray-300">
                              {row.status}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <div className="flex flex-wrap gap-1.5 justify-center">
                              <button
                                type="button"
                                onClick={(event) => {
                                  event.stopPropagation();
                                  handleTeacherEdit(row.id);
                                }}
                                disabled={row.status !== "draft"}
                                className="text-[11px] font-semibold px-2.5 py-1.5 rounded-lg bg-blue-600/90 text-white hover:bg-blue-500 border border-blue-400/20 shadow-sm disabled:opacity-40 disabled:hover:bg-blue-600/90"
                              >
                                Edit
                              </button>
                              <button
                                type="button"
                                onClick={(event) => {
                                  event.stopPropagation();
                                  handleTeacherPreview(row.id);
                                }}
                                className="text-[11px] font-semibold px-2.5 py-1.5 rounded-lg bg-white/[0.06] text-gray-200 hover:bg-white/[0.1] border border-white/10"
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
                                className="text-[11px] font-semibold px-2.5 py-1.5 rounded-lg bg-emerald-600/90 text-white hover:bg-emerald-500 border border-emerald-400/20 shadow-sm disabled:opacity-40 disabled:hover:bg-emerald-600/90"
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
                                className="text-[11px] font-semibold px-2.5 py-1.5 rounded-lg bg-amber-600/90 text-white hover:bg-amber-500 border border-amber-400/25 shadow-sm disabled:opacity-40 disabled:hover:bg-amber-600/90"
                              >
                                Archive
                              </button>
                              <button
                                type="button"
                                onClick={(event) => {
                                  event.stopPropagation();
                                  handleTeacherAnalytics(row.id);
                                }}
                                className="text-[11px] font-semibold px-2.5 py-1.5 rounded-lg bg-violet-600/90 text-white hover:bg-violet-500 border border-violet-400/20 shadow-sm"
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
                                className="text-[11px] font-semibold px-2.5 py-1.5 rounded-lg bg-red-600/90 text-white hover:bg-red-500 border border-red-400/25 shadow-sm disabled:opacity-40 disabled:hover:bg-red-600/90"
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
            <div className="bg-gradient-to-br from-[#1a1414] via-[#141010] to-[#0f0c0c] rounded-3xl p-8 shadow-[0_24px_60px_-30px_rgba(0,0,0,0.85)] border border-white/[0.07] h-full">
              <div className="bg-[#0c0a0a]/95 border border-white/[0.06] rounded-2xl overflow-hidden shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
                <table className="w-full border-collapse text-left text-sm">
                  <thead>
                    <tr className="bg-white/[0.02]">
                      <th className="py-4 px-4 font-semibold text-xs uppercase tracking-wider text-gray-400 border-b border-white/[0.08]">
                        Title
                      </th>
                      <th className="py-4 px-4 font-semibold text-xs uppercase tracking-wider text-gray-400 border-b border-white/[0.08] text-center">
                        Teacher
                      </th>
                      <th className="py-4 px-4 font-semibold text-xs uppercase tracking-wider text-gray-400 border-b border-white/[0.08] text-center">
                        Difficulty
                      </th>
                      <th className="py-4 px-4 font-semibold text-xs uppercase tracking-wider text-gray-400 border-b border-white/[0.08] text-center">
                        Clues
                      </th>
                      <th className="py-4 px-4 font-semibold text-xs uppercase tracking-wider text-gray-400 border-b border-white/[0.08] text-center">
                        Created
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoadingDashboard ? (
                      <tr>
                        <td colSpan="5" className="py-10 px-4 text-gray-400 text-center">
                          Loading puzzles...
                        </td>
                      </tr>
                    ) : puzzles.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="py-10 px-4 text-gray-400 text-center">
                          {dashboardError || "No puzzles available"}
                        </td>
                      </tr>
                    ) : (
                      puzzles.map((row, idx) => (
                        <tr
                          key={row.id}
                          onClick={() => {
                            setSelectedPuzzleId(row.id);
                            setActiveTab("play");
                          }}
                          className={`transition-colors cursor-pointer border-b border-white/[0.04] ${idx % 2 === 1 ? "bg-white/[0.02]" : ""} hover:bg-white/[0.06] ${selectedPuzzleId === row.id ? "bg-[#3b82f6]/[0.08]" : ""}`}
                        >
                          <td className="py-3.5 px-4 text-gray-200 font-medium">
                            {row.title}
                          </td>
                          <td className="py-3.5 px-4 text-gray-400 text-center">
                            {row.teacher_name || row.teacher_id || "-"}
                          </td>
                          <td className="py-3.5 px-4 text-gray-400 text-center">
                            {row.difficulty || "-"}
                          </td>
                          <td className="py-3.5 px-4 text-gray-400 text-center tabular-nums">
                            {row.clue_count ?? row.clues?.length ?? 0}
                          </td>
                          <td className="py-3.5 px-4 text-gray-400 text-center">
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
            <div className="bg-gradient-to-br from-[#1a1414] via-[#141010] to-[#0f0c0c] rounded-3xl p-8 shadow-[0_24px_60px_-30px_rgba(0,0,0,0.85)] border border-white/[0.07] h-full">
              <div className="bg-[#0c0a0a]/95 border border-white/[0.06] rounded-2xl overflow-hidden shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
                <table className="w-full border-collapse text-left text-sm">
                  <thead>
                    <tr className="bg-white/[0.02]">
                      <th className="py-4 px-4 font-semibold text-xs uppercase tracking-wider text-gray-400 border-b border-white/[0.08]">
                        Puzzle
                      </th>
                      <th className="py-4 px-4 font-semibold text-xs uppercase tracking-wider text-gray-400 border-b border-white/[0.08] text-center">
                        Score
                      </th>
                      <th className="py-4 px-4 font-semibold text-xs uppercase tracking-wider text-gray-400 border-b border-white/[0.08] text-center">
                        Time
                      </th>
                      <th className="py-4 px-4 font-semibold text-xs uppercase tracking-wider text-gray-400 border-b border-white/[0.08] text-center">
                        Rank
                      </th>
                      <th className="py-4 px-4 font-semibold text-xs uppercase tracking-wider text-gray-400 border-b border-white/[0.08] text-center">
                        Date
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoadingHistory ? (
                      <tr>
                        <td colSpan="5" className="py-10 px-4 text-gray-400 text-center">
                          Loading attempts...
                        </td>
                      </tr>
                    ) : historyError ? (
                      <tr>
                        <td colSpan="5" className="py-10 px-4 text-gray-400 text-center">
                          {historyError}
                        </td>
                      </tr>
                    ) : studentHistory.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="py-10 px-4 text-gray-400 text-center">
                          No attempts yet.
                        </td>
                      </tr>
                    ) : (
                      studentHistory.map((row, idx) => (
                        <tr
                          key={row.attempt_id}
                          className={`transition-colors border-b border-white/[0.04] ${idx % 2 === 1 ? "bg-white/[0.02]" : ""} hover:bg-white/[0.06]`}
                        >
                          <td className="py-3.5 px-4 text-gray-200 font-medium">
                            {row.puzzle_title}
                          </td>
                          <td className="py-3.5 px-4 text-gray-300 text-center tabular-nums font-medium">
                            {Math.round(row.score || 0)}%
                          </td>
                          <td className="py-3.5 px-4 text-gray-400 text-center tabular-nums">
                            {row.completion_time || 0}s
                          </td>
                          <td className="py-3.5 px-4 text-gray-400 text-center tabular-nums">
                            {row.rank ?? "-"}
                          </td>
                          <td className="py-3.5 px-4 text-gray-400 text-center">
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
            <div className="bg-gradient-to-br from-[#101a12] via-[#0e1410] to-[#0a0f0c] rounded-3xl p-8 shadow-[0_24px_60px_-30px_rgba(0,0,0,0.85)] border border-white/[0.07] h-full">
              <div className="mb-6 flex flex-col md:flex-row gap-3 items-stretch md:items-center flex-wrap">
                <input
                  type="text"
                  placeholder="Teacher ID"
                  value={newTeacher.teacher_id}
                  onChange={(e) => setNewTeacher((prev) => ({ ...prev, teacher_id: e.target.value }))}
                  className="bg-[#0c0f0d] border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-gray-100 placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-[#22c55e]/35 focus:border-[#22c55e]/40 min-w-[160px] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"
                />
                <input
                  type="text"
                  placeholder="Name"
                  value={newTeacher.name}
                  onChange={(e) => setNewTeacher((prev) => ({ ...prev, name: e.target.value }))}
                  className="bg-[#0c0f0d] border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-gray-100 placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-[#22c55e]/35 focus:border-[#22c55e]/40 min-w-[160px] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"
                />
                <input
                  type="password"
                  placeholder="Password"
                  value={newTeacher.password}
                  onChange={(e) => setNewTeacher((prev) => ({ ...prev, password: e.target.value }))}
                  className="bg-[#0c0f0d] border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-gray-100 placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-[#22c55e]/35 focus:border-[#22c55e]/40 min-w-[160px] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"
                />
                <button
                  type="button"
                  onClick={handleAdminCreateTeacher}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2.5 rounded-xl text-sm font-semibold border border-emerald-400/25 shadow-[0_8px_24px_-12px_rgba(16,185,129,0.5)]"
                >
                  Create Teacher
                </button>
              </div>
              {adminError && (
                <div className="text-sm text-red-300 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 mb-4">
                  {adminError}
                </div>
              )}
              <div className="bg-[#0c0f0d]/95 border border-white/[0.06] rounded-2xl overflow-hidden shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
                <table className="w-full border-collapse text-left text-sm">
                  <thead>
                    <tr className="bg-white/[0.02]">
                      <th className="py-3.5 px-4 text-xs font-semibold uppercase tracking-wider text-gray-400 border-b border-white/[0.08]">
                        Teacher ID
                      </th>
                      <th className="py-3.5 px-4 text-xs font-semibold uppercase tracking-wider text-gray-400 border-b border-white/[0.08]">
                        Name
                      </th>
                      <th className="py-3.5 px-4 text-xs font-semibold uppercase tracking-wider text-gray-400 border-b border-white/[0.08] text-center">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoadingAdmin ? (
                      <tr>
                        <td colSpan="3" className="py-10 text-gray-400 text-center">
                          Loading teachers...
                        </td>
                      </tr>
                    ) : adminTeachers.length === 0 ? (
                      <tr>
                        <td colSpan="3" className="py-10 text-gray-400 text-center">
                          No teachers found.
                        </td>
                      </tr>
                    ) : (
                      adminTeachers.map((teacher, idx) => (
                        <tr
                          key={teacher.teacher_id}
                          className={`border-b border-white/[0.04] last:border-0 ${idx % 2 === 1 ? "bg-white/[0.02]" : ""} hover:bg-white/[0.05] transition-colors`}
                        >
                          <td className="py-3.5 px-4 text-gray-200 font-medium">{teacher.teacher_id}</td>
                          <td className="py-3.5 px-4 text-gray-400">{teacher.name}</td>
                          <td className="py-3.5 px-4 text-center">
                            <button
                              type="button"
                              onClick={() => handleAdminDeleteTeacher(teacher)}
                              className="text-[11px] font-semibold px-2.5 py-1.5 rounded-lg bg-red-600/90 text-white hover:bg-red-500 border border-red-400/25 shadow-sm"
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
            <div className="bg-gradient-to-br from-[#101a12] via-[#0e1410] to-[#0a0f0c] rounded-3xl p-8 shadow-[0_24px_60px_-30px_rgba(0,0,0,0.85)] border border-white/[0.07] h-full">
              <div className="bg-[#0c0f0d]/95 border border-white/[0.06] rounded-2xl overflow-hidden shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
                <table className="w-full border-collapse text-left text-sm">
                  <thead>
                    <tr className="bg-white/[0.02]">
                      <th className="py-3.5 px-4 text-xs font-semibold uppercase tracking-wider text-gray-400 border-b border-white/[0.08]">
                        Name
                      </th>
                      <th className="py-3.5 px-4 text-xs font-semibold uppercase tracking-wider text-gray-400 border-b border-white/[0.08]">
                        Registration
                      </th>
                      <th className="py-3.5 px-4 text-xs font-semibold uppercase tracking-wider text-gray-400 border-b border-white/[0.08]">
                        Teacher
                      </th>
                      <th className="py-3.5 px-4 text-xs font-semibold uppercase tracking-wider text-gray-400 border-b border-white/[0.08] text-center">
                        Created
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoadingAdmin ? (
                      <tr>
                        <td colSpan="4" className="py-10 text-gray-400 text-center">
                          Loading students...
                        </td>
                      </tr>
                    ) : adminStudents.length === 0 ? (
                      <tr>
                        <td colSpan="4" className="py-10 text-gray-400 text-center">
                          No students found.
                        </td>
                      </tr>
                    ) : (
                      adminStudents.map((student, idx) => (
                        <tr
                          key={student.id}
                          className={`border-b border-white/[0.04] last:border-0 ${idx % 2 === 1 ? "bg-white/[0.02]" : ""} hover:bg-white/[0.05] transition-colors`}
                        >
                          <td className="py-3.5 px-4 text-gray-200 font-medium">{student.name}</td>
                          <td className="py-3.5 px-4 text-gray-400">{student.reg_no}</td>
                          <td className="py-3.5 px-4 text-gray-400">{student.teacher_name || student.teacher_id || "-"}</td>
                          <td className="py-3.5 px-4 text-center text-gray-400">
                            {student.created_at ? new Date(student.created_at).toLocaleDateString() : "-"}
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
