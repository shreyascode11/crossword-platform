'use client';

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard, List, History, RotateCcw,
  Puzzle, Lightbulb, Target, Star, LogOut, PlusCircle,
  BarChart2, Gamepad2, FileText, Users, Trophy, Flame,
  Zap, BookOpen, Shield,
} from "lucide-react";
import {
  archivePuzzle, createTeacher, deleteStudent, deleteTeacher, deletePuzzle,
  fetchAllStudents, fetchLeaderboard, fetchTeacherStudents, fetchTeachers,
  fetchPuzzleAnalytics, fetchPuzzleLeaderboard, fetchPuzzles, fetchStats,
  fetchStudentHistory, logoutUser, publishPuzzle, resetStudentPassword, uploadStudentsCsv,
} from "../lib/api";

import CreatePuzzleForm from "./CreatePuzzleForm";
import CurrentStats from "./CurrentStats";
import Leaderboard from "./Leaderboard";
import Report from "./Report";
import Reanalyse from "./Reanalyse";
import TeacherReport from "./TeacherReport";
import CrosswordPlayer from "./CrosswordPlayer";
import TeacherContentUpload from "./TeacherContentUpload";
import TeacherStudents from "./TeacherStudents";

/* palette */
const C = {
  bg:    '#0f0e14', felt:  '#17151f', card:  '#1e1b29',
  taupe: '#7c5cff', tan:   '#22d3c9', stone: '#c7c2d9',
  cream: '#ede9f7', muted: '#8d87a3', rust:  '#ff4d6d',
  rule:  'rgba(124,92,255,0.1)',
};

const fmt = v => { try { return v ? new Date(v).toLocaleDateString() : "-"; } catch { return "-"; } };

const diffStars = d => {
  const n = { easy: 1, medium: 3, hard: 5 }[String(d).toLowerCase()] ?? 2;
  return Array.from({ length: 5 }, (_, i) => (
    <span key={i} style={{ color: i < n ? C.taupe : "#363047" }}>★</span>
  ));
};

const StatusBadge = ({ status }) => {
  const cfg = {
    draft:     { bg: "rgba(141,135,163,0.15)",  border: "rgba(141,135,163,0.35)", text: C.stone,  label: "DRAFT"     },
    published: { bg: "rgba(124,92,255,0.12)",  border: "rgba(124,92,255,0.35)", text: C.taupe,  label: "PUBLISHED" },
    archived:  { bg: "rgba(255,77,109,0.12)",    border: "rgba(255,77,109,0.3)",    text: "#e07070", label: "ARCHIVED"  },
  }[status] ?? { bg: "rgba(255,255,255,0.06)", border: "rgba(255,255,255,0.12)", text: C.stone, label: status?.toUpperCase() };
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded font-mono text-[10px] font-bold tracking-widest border animate-stamp-in"
      style={{ background: cfg.bg, borderColor: cfg.border, color: cfg.text }}>
      {cfg.label}
    </span>
  );
};

const UserCard = ({ role, userId }) => {
  const initial = (userId || role || "?")[0]?.toUpperCase();
  const color = role === "Admin" ? C.rust : role === "Student" ? C.tan : C.taupe;
  const level = 7; const xpCurrent = 720; const xpMax = 1000;
  return (
    <div className="mx-2 mb-5 rounded-xl p-4 border"
      style={{ background: "rgba(0,0,0,0.3)", borderColor: "rgba(124,92,255,0.12)" }}>
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-lg flex items-center justify-center font-display font-black text-lg shrink-0"
          style={{ background: `${color}22`, border: `1px solid ${color}40`, color }}>
          {initial}
        </div>
        <div className="min-w-0">
          <p className="font-mono text-[11px] font-bold truncate" style={{ color: C.cream }}>{userId || "—"}</p>
          <p className="font-mono text-[10px] tracking-widest uppercase" style={{ color }}>{role}</p>
        </div>
        <div className="ml-auto shrink-0 flex items-center justify-center w-7 h-7 rounded-md font-mono font-bold text-[11px]"
          style={{ background: `${color}20`, color, border: `1px solid ${color}35` }}>
          {level}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Zap size={12} color={color} className="shrink-0" />
        <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.07)" }}>
          <div className="h-full rounded-full animate-xp-fill"
            style={{ width: `${(xpCurrent / xpMax) * 100}%`, background: `linear-gradient(90deg, ${color}, ${color}88)` }} />
        </div>
        <span className="font-mono text-[10px]" style={{ color: `${color}bb` }}>{xpCurrent}/{xpMax}</span>
      </div>
    </div>
  );
};

const NavBtn = ({ icon: Icon, label, active, onClick, color, badge }) => (
  <button onClick={onClick}
    className="flex items-center gap-3 px-4 py-2.5 rounded-xl w-full text-left transition-all duration-200 text-sm font-medium"
    style={active
      ? { background: `${color}18`, color: C.cream, borderLeft: `2px solid ${color}`, paddingLeft: "14px" }
      : { color: C.muted, borderLeft: "2px solid transparent", paddingLeft: "14px" }}
    onMouseEnter={e => { if (!active) e.currentTarget.style.color = C.stone; }}
    onMouseLeave={e => { if (!active) e.currentTarget.style.color = C.muted; }}>
    <Icon size={17} style={{ color: active ? color : undefined, opacity: active ? 1 : 0.65 }} />
    <span>{label}</span>
    {badge != null && (
      <span className="ml-auto font-mono text-[10px] px-1.5 py-0.5 rounded"
        style={{ background: `${color}18`, color }}>{badge}</span>
    )}
  </button>
);

const PuzzleCard = ({ puzzle, isAttempted, onPlay }) => (
  <div onClick={onPlay}
    className="cursor-pointer rounded-2xl border p-5 flex flex-col gap-3 transition-all duration-200 hover:-translate-y-0.5"
    style={{ background: `linear-gradient(135deg, ${C.card}, ${C.felt})`, borderColor: "rgba(124,92,255,0.14)", boxShadow: "0 8px 32px -12px rgba(0,0,0,0.7)" }}
    onMouseEnter={e => e.currentTarget.style.borderColor = "rgba(124,92,255,0.35)"}
    onMouseLeave={e => e.currentTarget.style.borderColor = "rgba(124,92,255,0.14)"}>
    <div className="flex items-start justify-between gap-2">
      <h3 className="font-display font-bold text-lg leading-tight" style={{ color: C.cream }}>{puzzle.title}</h3>
      {isAttempted && (
        <span className="shrink-0 font-mono text-[9px] tracking-widest border rounded px-1.5 py-0.5"
          style={{ background: "rgba(124,92,255,0.1)", borderColor: "rgba(124,92,255,0.35)", color: C.taupe }}>
          DONE
        </span>
      )}
    </div>
    <div className="flex items-center gap-1 font-mono text-lg">{diffStars(puzzle.difficulty)}</div>
    <div className="flex items-center gap-4 font-mono text-[11px]" style={{ color: C.muted }}>
      <span>{puzzle.clue_count ?? puzzle.clues?.length ?? 0} clues</span>
      <span className="w-px h-3" style={{ background: "#363047" }} />
      <span>{puzzle.attempts || 0} attempts</span>
      {puzzle.teacher_name && (<><span className="w-px h-3" style={{ background: "#363047" }} /><span className="truncate max-w-[100px]">{puzzle.teacher_name}</span></>)}
    </div>
    <button type="button"
      className="mt-1 w-full py-2.5 rounded-xl font-mono font-bold text-[11px] tracking-[0.3em] uppercase transition-all duration-200 btn-press"
      style={{
        background: isAttempted ? "rgba(124,92,255,0.08)" : `linear-gradient(135deg, ${C.taupe}, ${C.tan})`,
        color: isAttempted ? C.taupe : C.bg,
        border: isAttempted ? "1px solid rgba(124,92,255,0.22)" : "none",
      }}>
      {isAttempted ? "▶ REVIEW" : "▶ PLAY"}
    </button>
  </div>
);

const DataTable = ({ cols, rows, emptyMsg = "No data", loading }) => (
  <div className="rounded-xl overflow-hidden border" style={{ borderColor: "rgba(124,92,255,0.1)" }}>
    <table className="w-full text-left text-sm border-collapse">
      <thead>
        <tr style={{ background: "rgba(0,0,0,0.4)" }}>
          {cols.map(c => (
            <th key={c.key} className={`py-3 px-4 font-mono text-[10px] uppercase tracking-widest border-b font-semibold ${c.center ? "text-center" : ""}`}
              style={{ color: C.muted, borderColor: "rgba(124,92,255,0.08)" }}>{c.label}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {loading ? (
          <tr><td colSpan={cols.length} className="py-12 text-center font-mono text-sm" style={{ color: C.muted }}>Loading…</td></tr>
        ) : rows.length === 0 ? (
          <tr><td colSpan={cols.length} className="py-12 text-center font-mono text-sm" style={{ color: C.muted }}>{emptyMsg}</td></tr>
        ) : rows.map((row, i) => (
          <tr key={i} onClick={row._onClick}
            className="border-b last:border-0 transition-colors"
            style={{
              borderColor: "rgba(124,92,255,0.06)",
              background: row._selected ? "rgba(124,92,255,0.05)" : i % 2 === 1 ? "rgba(255,255,255,0.012)" : "transparent",
              cursor: row._onClick ? "pointer" : undefined,
            }}
            onMouseEnter={e => { if (!row._selected) e.currentTarget.style.background = "rgba(124,92,255,0.04)"; }}
            onMouseLeave={e => { if (!row._selected) e.currentTarget.style.background = i % 2 === 1 ? "rgba(255,255,255,0.012)" : "transparent"; }}>
            {cols.map(c => (
              <td key={c.key} className={`py-3 px-4 ${c.center ? "text-center" : ""}`}
                style={{ color: c.muted ? C.muted : C.stone }}>{row[c.key]}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const StatCard = ({ icon: Icon, value, label, color }) => (
  <div className="rounded-2xl p-6 flex flex-col items-center justify-center gap-2 border transition-all duration-200"
    style={{ background: `linear-gradient(135deg, ${C.card}, ${C.felt})`, borderColor: "rgba(124,92,255,0.12)" }}
    onMouseEnter={e => e.currentTarget.style.borderColor = `${color}45`}
    onMouseLeave={e => e.currentTarget.style.borderColor = "rgba(124,92,255,0.12)"}>
    <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-1"
      style={{ background: `${color}15`, border: `1px solid ${color}28` }}>
      <Icon size={20} style={{ color }} />
    </div>
    <div className="font-display font-black text-4xl tabular-nums" style={{ color: C.cream }}>{value}</div>
    <div className="font-mono text-[10px] tracking-widest uppercase" style={{ color: C.muted }}>{label}</div>
  </div>
);

const ActionBtn = ({ label, onClick, variant = "ghost", disabled }) => {
  const v = {
    blue:   { bg: "rgba(100,140,200,0.8)", text: "#fff" },
    green:  { bg: "rgba(100,150,80,0.8)",  text: "#fff" },
    amber:  { bg: `rgba(124,92,255,0.85)`, text: C.bg  },
    red:    { bg: "rgba(255,77,109,0.85)",   text: "#fff" },
    violet: { bg: "rgba(139,92,246,0.8)",   text: "#fff" },
    ghost:  { bg: "rgba(255,255,255,0.05)", text: C.stone },
  }[variant];
  return (
    <button type="button" onClick={e => { e.stopPropagation(); onClick?.(); }} disabled={disabled}
      className="font-mono text-[10px] font-bold tracking-wider px-2.5 py-1.5 rounded-lg transition-all btn-press disabled:opacity-35"
      style={{ background: v.bg, color: v.text, border: "1px solid rgba(255,255,255,0.05)" }}>
      {label}
    </button>
  );
};

/* ── Main ────────────────────────────────────────────────── */
const Dashboard = () => {
  const router         = useRouter();
  const userRole       = localStorage.getItem("userRole") || "";
  const currentUserId  = localStorage.getItem("userId")   || "";

  const [activeTab, setActiveTab]               = useState("dashboard");
  const [puzzles, setPuzzles]                   = useState([]);
  const [stats, setStats]                       = useState({ total_puzzles: 0, assistances: 0, avg_score: "0%", attainment: "0%" });
  const [selectedPuzzleId, setSelectedPuzzleId] = useState(null);
  const [isLoadingDashboard, setIsLoadingDashboard] = useState(false);
  const [dashboardError, setDashboardError]     = useState("");
  const [leaderboardData, setLeaderboardData]   = useState([]);
  const [isLoadingLeaderboard, setIsLoadingLeaderboard] = useState(false);
  const [leaderboardError, setLeaderboardError] = useState("");
  const [puzzleAnalytics, setPuzzleAnalytics]   = useState(null);
  const [studentHistory, setStudentHistory]     = useState([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [historyError, setHistoryError]         = useState("");
  const [teacherStudents, setTeacherStudents]   = useState([]);
  const [isLoadingStudents, setIsLoadingStudents] = useState(false);
  const [studentsError, setStudentsError]       = useState("");
  const [adminTeachers, setAdminTeachers]       = useState([]);
  const [adminStudents, setAdminStudents]       = useState([]);
  const [isLoadingAdmin, setIsLoadingAdmin]     = useState(false);
  const [adminError, setAdminError]             = useState("");
  const [newTeacher, setNewTeacher]             = useState({ teacher_id: "", name: "", password: "" });
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const publishedPuzzles = useMemo(() => puzzles.filter(p => p.status === "published"), [puzzles]);
  const attemptedIds     = useMemo(() => new Set(studentHistory.map(h => h.puzzle_id)), [studentHistory]);
  const selectedPuzzle   = useMemo(() => puzzles.find(p => p.id === selectedPuzzleId) || null, [puzzles, selectedPuzzleId]);

  const handleLogout = async () => {
    // Revoke the token server-side first; clear local state regardless.
    try { await logoutUser(); } catch { /* token may already be expired */ }
    localStorage.removeItem("userRole"); localStorage.removeItem("userId"); localStorage.removeItem("authToken");
    router.push("/");
  };

  const loadDashboardData = useCallback(async () => {
    if (userRole === "Admin") { setPuzzles([]); return; }
    setIsLoadingDashboard(true); setDashboardError("");
    try {
      const [pd, sd] = await Promise.all([fetchPuzzles(userRole), fetchStats(userRole)]);
      const norm = Array.isArray(pd) ? pd : [];
      setPuzzles(norm);
      setStats(sd && typeof sd === "object" ? sd : { total_puzzles: 0, assistances: 0, avg_score: "0%", attainment: "0%" });
      setSelectedPuzzleId(prev => (prev && norm.some(p => p.id === prev)) ? prev : (norm[0]?.id ?? null));
    } catch { setDashboardError("Failed to load data."); setPuzzles([]); setSelectedPuzzleId(null); }
    finally { setIsLoadingDashboard(false); }
  }, [userRole]);

  const loadLeaderboardData = useCallback(async (tid = selectedPuzzleId) => {
    if (userRole === "Admin") return;
    setIsLoadingLeaderboard(true); setLeaderboardError("");
    try { setLeaderboardData(Array.isArray(await (tid ? fetchPuzzleLeaderboard(tid) : fetchLeaderboard())) ? await (tid ? fetchPuzzleLeaderboard(tid) : fetchLeaderboard()) : []); }
    catch { setLeaderboardData([]); setLeaderboardError("Failed to load leaderboard."); }
    finally { setIsLoadingLeaderboard(false); }
  }, [selectedPuzzleId, userRole]);

  const loadPuzzleAnalytics = useCallback(async (tid = selectedPuzzleId) => {
    if (!tid || userRole !== "Teacher") { setPuzzleAnalytics(null); return; }
    try { setPuzzleAnalytics(await fetchPuzzleAnalytics(tid)); }
    catch { setPuzzleAnalytics(null); }
  }, [selectedPuzzleId, userRole]);

  const loadStudentHistory = useCallback(async () => {
    if (userRole !== "Student" || !currentUserId) { setStudentHistory([]); return; }
    setIsLoadingHistory(true); setHistoryError("");
    try { setStudentHistory(Array.isArray(await fetchStudentHistory(currentUserId)) ? await fetchStudentHistory(currentUserId) : []); }
    catch { setHistoryError("Failed to load history."); setStudentHistory([]); }
    finally { setIsLoadingHistory(false); }
  }, [userRole, currentUserId]);

  const loadTeacherStudents = useCallback(async () => {
    if (userRole !== "Teacher" || !currentUserId) { setTeacherStudents([]); return; }
    setIsLoadingStudents(true); setStudentsError("");
    try { setTeacherStudents(Array.isArray(await fetchTeacherStudents(currentUserId)) ? await fetchTeacherStudents(currentUserId) : []); }
    catch { setStudentsError("Failed to load students."); setTeacherStudents([]); }
    finally { setIsLoadingStudents(false); }
  }, [userRole, currentUserId]);

  const loadAdminData = useCallback(async () => {
    if (userRole !== "Admin") return;
    setIsLoadingAdmin(true); setAdminError("");
    try {
      const [td, sd] = await Promise.all([fetchTeachers(), fetchAllStudents()]);
      setAdminTeachers(Array.isArray(td) ? td : []);
      setAdminStudents(Array.isArray(sd) ? sd : []);
    } catch { setAdminError("Failed to load admin data."); }
    finally { setIsLoadingAdmin(false); }
  }, [userRole]);

  useEffect(() => {
    if (userRole === "Teacher")      setActiveTab("dashboard");
    else if (userRole === "Student") setActiveTab("available");
    else if (userRole === "Admin")   setActiveTab("admin-teachers");
  }, [userRole]);

  useEffect(() => {
    if (!userRole) { router.push("/"); return; }
    loadDashboardData(); loadLeaderboardData(); loadPuzzleAnalytics();
    loadStudentHistory(); loadTeacherStudents(); loadAdminData();
  }, [userRole, router, loadDashboardData, loadLeaderboardData, loadPuzzleAnalytics, loadStudentHistory, loadTeacherStudents, loadAdminData]);

  useEffect(() => { if (selectedPuzzleId) { loadLeaderboardData(selectedPuzzleId); loadPuzzleAnalytics(selectedPuzzleId); } }, [selectedPuzzleId, loadLeaderboardData, loadPuzzleAnalytics]);
  useEffect(() => { if (!["scores","teacher-analysis"].includes(activeTab) || !publishedPuzzles.length) return; if (!publishedPuzzles.some(p => p.id === selectedPuzzleId)) setSelectedPuzzleId(publishedPuzzles[0].id); }, [activeTab, publishedPuzzles, selectedPuzzleId]);
  useEffect(() => { if (userRole === "Student" && activeTab === "available") loadDashboardData(); }, [userRole, activeTab, loadDashboardData]);
  useEffect(() => { if (userRole === "Teacher" && activeTab === "students") loadTeacherStudents(); }, [userRole, activeTab, loadTeacherStudents]);
  useEffect(() => { if (userRole === "Admin" && (activeTab === "admin-teachers" || activeTab === "admin-students")) loadAdminData(); }, [userRole, activeTab, loadAdminData]);
  useEffect(() => { if (userRole !== "Student") return; const t = setInterval(loadDashboardData, 30000); return () => clearInterval(t); }, [userRole, loadDashboardData]);
  useEffect(() => { if (userRole !== "Teacher" || !["scores","teacher-analysis"].includes(activeTab)) return; const t = setInterval(() => { loadLeaderboardData(selectedPuzzleId); loadPuzzleAnalytics(selectedPuzzleId); }, 30000); return () => clearInterval(t); }, [userRole, activeTab, selectedPuzzleId, loadLeaderboardData, loadPuzzleAnalytics]);

  const handlePuzzleSubmitted    = async () => Promise.all([loadDashboardData(), loadLeaderboardData(selectedPuzzleId), loadPuzzleAnalytics(selectedPuzzleId), loadStudentHistory()]);
  const handlePuzzleCreated      = async p => { if (p?.id) setSelectedPuzzleId(p.id); await loadDashboardData(); if (p?.id) await Promise.all([loadLeaderboardData(p.id), loadPuzzleAnalytics(p.id)]); };
  const handleTeacherPublish     = async id => { try { await publishPuzzle({ puzzle_id: id }); await handlePuzzleSubmitted(); } catch (e) { alert(e?.message || "Publish failed."); } };
  const handleTeacherArchive     = async id => { try { await archivePuzzle(id); await handlePuzzleSubmitted(); } catch (e) { alert(e?.message || "Archive failed."); } };
  const handleTeacherDelete      = async id => { try { if (puzzles.find(p => p.id === id)?.status === "published") { alert("Published puzzles cannot be deleted."); return; } await deletePuzzle(id); if (selectedPuzzleId === id) setSelectedPuzzleId(null); await handlePuzzleSubmitted(); } catch (e) { alert(e?.message || "Delete failed."); } };
  const handleStudentUpload      = async file => { const r = await uploadStudentsCsv(currentUserId, file); await loadTeacherStudents(); return r; };
  const handleStudentReset       = async s => { const p = window.prompt("New password:"); if (!p) return; await resetStudentPassword(s.id, p); await loadTeacherStudents(); };
  const handleStudentDelete      = async s => { if (!window.confirm("Delete this student?")) return; await deleteStudent(s.id); await loadTeacherStudents(); };
  const handleAdminCreateTeacher = async () => { if (!newTeacher.teacher_id || !newTeacher.password) { setAdminError("Teacher ID and password are required."); return; } await createTeacher(newTeacher); setNewTeacher({ teacher_id: "", name: "", password: "" }); await loadAdminData(); };
  const handleAdminDeleteTeacher = async t => { if (!window.confirm("Delete this teacher?")) return; await deleteTeacher(t.teacher_id); await loadAdminData(); };

  const accent = userRole === "Admin" ? C.rust : C.taupe;

  const teacherNav = [
    { tab: "dashboard",        icon: LayoutDashboard, label: "My Puzzles",   badge: puzzles.length || undefined },
    { tab: "create",           icon: PlusCircle,      label: "Create Puzzle" },
    { tab: "upload",           icon: FileText,        label: "Add Content"   },
    { tab: "students",         icon: Users,           label: "Students",     badge: teacherStudents.length || undefined },
    { tab: "scores",           icon: Trophy,          label: "Leaderboard"   },
    { tab: "teacher-analysis", icon: BarChart2,       label: "Analytics"     },
  ];
  const studentNav = [
    { tab: "available", icon: Gamepad2,  label: "Play Puzzles", badge: puzzles.length || undefined },
    { tab: "attempts",  icon: History,   label: "My Attempts",  badge: studentHistory.length || undefined },
    { tab: "stats",     icon: Target,    label: "My Stats"      },
    { tab: "scores",    icon: Trophy,    label: "Leaderboard"   },
    { tab: "report",    icon: BarChart2, label: "Report"        },
    { tab: "reanalyse", icon: RotateCcw, label: "Re-analyse"   },
  ];
  const adminNav = [
    { tab: "admin-teachers", icon: Shield, label: "Teachers", badge: adminTeachers.length || undefined },
    { tab: "admin-students", icon: Users,  label: "Students", badge: adminStudents.length || undefined },
  ];
  const navItems = userRole === "Teacher" ? teacherNav : userRole === "Student" ? studentNav : adminNav;
  const tabLabel = navItems.find(n => n.tab === activeTab)?.label ?? "Overview";

  return (
    <div className="flex min-h-screen cw-grid-bg" style={{ background: C.bg }}>

      {/* SIDEBAR */}
      <aside className="flex flex-col shrink-0 transition-all duration-300" style={{
        width: sidebarCollapsed ? "64px" : "260px",
        background: `linear-gradient(180deg, ${C.felt} 0%, ${C.bg} 100%)`,
        borderRight: "1px solid rgba(124,92,255,0.08)",
        boxShadow: "4px 0 40px -10px rgba(0,0,0,0.6)",
      }}>
        <div className="p-5 pb-3 border-b" style={{ borderColor: "rgba(124,92,255,0.07)" }}>
          {sidebarCollapsed ? (
            <button onClick={() => setSidebarCollapsed(false)} className="w-full flex justify-center">
              <Puzzle size={24} color={accent} />
            </button>
          ) : (
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-display italic font-black text-2xl leading-none" style={{ color: C.cream }}>
                  Cro<span style={{ color: accent }}>×</span>word
                </h2>
                <p className="font-mono text-[9px] tracking-[0.35em] uppercase mt-1" style={{ color: `${accent}bb` }}>
                  {userRole} Portal
                </p>
              </div>
              <button onClick={() => setSidebarCollapsed(true)} className="opacity-25 hover:opacity-60 transition-opacity">
                <List size={16} color={C.stone} />
              </button>
            </div>
          )}
        </div>

        {!sidebarCollapsed && <div className="pt-4 px-2"><UserCard role={userRole} userId={currentUserId} /></div>}

        <nav className="flex-1 flex flex-col gap-0.5 px-2 py-2 overflow-y-auto">
          {navItems.map(({ tab, icon, label, badge }) =>
            sidebarCollapsed ? (
              <button key={tab} onClick={() => setActiveTab(tab)} title={label}
                className="flex justify-center items-center py-3 rounded-xl transition-all"
                style={{ background: activeTab === tab ? `${accent}15` : "transparent" }}>
                {React.createElement(icon, { size: 18, style: { color: activeTab === tab ? accent : C.muted } })}
              </button>
            ) : (
              <NavBtn key={tab} icon={icon} label={label} active={activeTab === tab}
                onClick={() => setActiveTab(tab)} color={accent} badge={badge} />
            )
          )}
        </nav>

        <div className="p-2 border-t" style={{ borderColor: "rgba(124,92,255,0.07)" }}>
          {sidebarCollapsed ? (
            <button onClick={handleLogout} className="w-full flex justify-center py-3 opacity-35 hover:opacity-75 transition-opacity">
              <LogOut size={18} color={C.rust} />
            </button>
          ) : (
            <button onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-2.5 rounded-xl w-full text-left transition-all font-medium text-sm"
              style={{ color: C.rust }}
              onMouseEnter={e => e.currentTarget.style.background = "rgba(255,77,109,0.1)"}
              onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
              <LogOut size={17} /><span>Sign Out</span>
            </button>
          )}
        </div>
      </aside>

      {/* MAIN */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <header className="px-8 py-5 flex items-center gap-5 border-b sticky top-0 z-10"
          style={{ background: `${C.bg}ee`, borderColor: "rgba(124,92,255,0.07)", backdropFilter: "blur(12px)" }}>
          <div>
            <p className="font-mono text-[10px] tracking-[0.3em] uppercase" style={{ color: C.muted }}>{userRole}</p>
            <h1 className="font-display font-bold text-2xl leading-tight" style={{ color: C.cream }}>{tabLabel}</h1>
          </div>
          <div className="ml-auto flex items-center gap-3">
            {userRole === "Student" && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border font-mono text-xs"
                style={{ background: "rgba(124,92,255,0.07)", borderColor: "rgba(124,92,255,0.18)", color: C.taupe }}>
                <Flame size={14} /><span>{studentHistory.length} puzzles done</span>
              </div>
            )}
            {userRole === "Teacher" && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border font-mono text-xs"
                style={{ background: "rgba(124,92,255,0.07)", borderColor: "rgba(124,92,255,0.18)", color: C.taupe }}>
                <BookOpen size={14} /><span>{publishedPuzzles.length} published</span>
              </div>
            )}
          </div>
        </header>

        <div className="flex-1 p-6 lg:p-8">

          {activeTab === "dashboard" && userRole === "Teacher" && (
            <div className="animate-fade-up">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <StatCard icon={Puzzle}    value={stats.total_puzzles} label="Total Puzzles" color={C.taupe} />
                <StatCard icon={Lightbulb} value={stats.assistances}   label="Assistances"   color={C.tan}   />
                <StatCard icon={Target}    value={stats.attainment}    label="Attainment"    color={C.taupe} />
                <StatCard icon={Star}      value={stats.avg_score}     label="Avg Score"     color={C.tan}   />
              </div>
              <DataTable loading={isLoadingDashboard} emptyMsg={dashboardError || "No puzzles yet."}
                cols={[
                  { key: "title",   label: "Title"   },
                  { key: "clues",   label: "Clues",   center: true },
                  { key: "created", label: "Created", center: true, muted: true },
                  { key: "status",  label: "Status",  center: true },
                  { key: "actions", label: "Actions", center: true },
                ]}
                rows={puzzles.map(row => ({
                  _onClick:  () => { setSelectedPuzzleId(row.id); setActiveTab("upload"); },
                  _selected: selectedPuzzleId === row.id,
                  title:   <span className="font-display font-bold" style={{ color: C.cream }}>{row.title}</span>,
                  clues:   <span className="font-mono">{row.clue_count ?? row.clues?.length ?? 0}</span>,
                  created: <span className="font-mono" style={{ color: C.muted }}>{fmt(row.created_at)}</span>,
                  status:  <StatusBadge status={row.status} />,
                  actions: (
                    <div className="flex flex-wrap gap-1.5 justify-center">
                      <ActionBtn label="Edit"      variant="blue"   disabled={row.status !== "draft"}     onClick={() => { setSelectedPuzzleId(row.id); setActiveTab("upload"); }} />
                      <ActionBtn label="Publish"   variant="green"  disabled={row.status !== "draft"}     onClick={() => handleTeacherPublish(row.id)} />
                      <ActionBtn label="Archive"   variant="amber"  disabled={row.status === "archived"}  onClick={() => handleTeacherArchive(row.id)} />
                      <ActionBtn label="Analytics" variant="violet"                                       onClick={() => { setSelectedPuzzleId(row.id); setActiveTab("teacher-analysis"); }} />
                      <ActionBtn label="Delete"    variant="red"    disabled={row.status === "published"} onClick={() => handleTeacherDelete(row.id)} />
                    </div>
                  ),
                }))} />
            </div>
          )}

          {activeTab === "available" && userRole === "Student" && (
            <div className="animate-fade-up">
              {isLoadingDashboard ? (
                <div className="text-center font-mono py-20" style={{ color: C.muted }}>Loading puzzles…</div>
              ) : puzzles.length === 0 ? (
                <div className="text-center font-mono py-20" style={{ color: C.muted }}>{dashboardError || "No puzzles available yet."}</div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {puzzles.map((p, i) => (
                    <div key={p.id} className={`animate-fade-up delay-${Math.min(i * 100, 500)}`}>
                      <PuzzleCard puzzle={p} isAttempted={attemptedIds.has(p.id)}
                        onPlay={() => { setSelectedPuzzleId(p.id); setActiveTab("play"); }} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "attempts" && userRole === "Student" && (
            <div className="animate-fade-up">
              <DataTable loading={isLoadingHistory} emptyMsg={historyError || "No attempts yet — go play a puzzle!"}
                cols={[
                  { key: "puzzle", label: "Puzzle" },
                  { key: "score",  label: "Score",  center: true },
                  { key: "time",   label: "Time",   center: true, muted: true },
                  { key: "rank",   label: "Rank",   center: true },
                  { key: "date",   label: "Date",   center: true, muted: true },
                ]}
                rows={studentHistory.map(row => ({
                  puzzle: <span className="font-display font-bold" style={{ color: C.cream }}>{row.puzzle_title}</span>,
                  score:  <span className="font-mono font-bold" style={{ color: Number(row.score) >= 80 ? C.taupe : Number(row.score) >= 50 ? C.tan : "#e07070" }}>{Math.round(row.score || 0)}%</span>,
                  time:   <span className="font-mono" style={{ color: C.muted }}>{row.completion_time || 0}s</span>,
                  rank:   <span className="font-mono">{row.rank === 1 ? "🥇" : row.rank === 2 ? "🥈" : row.rank === 3 ? "🥉" : `#${row.rank ?? "—"}`}</span>,
                  date:   <span className="font-mono" style={{ color: C.muted }}>{fmt(row.attempt_date || row.submitted_at)}</span>,
                }))} />
            </div>
          )}

          {activeTab === "play" && userRole === "Student" && (
            <div className="animate-fade-up">
              {selectedPuzzle
                ? <CrosswordPlayer key={selectedPuzzle.id} selectedPuzzle={selectedPuzzle} allPuzzles={puzzles} onPuzzleSubmitted={handlePuzzleSubmitted} studentRegNo={currentUserId} />
                : <div className="text-center font-mono py-20" style={{ color: C.muted }}>Select a puzzle to play.</div>}
            </div>
          )}

          {activeTab === "create"   && userRole === "Teacher" && <div className="animate-fade-up flex justify-center"><CreatePuzzleForm onPuzzleCreated={handlePuzzleCreated} onShowPreview={() => setActiveTab("upload")} /></div>}
          {activeTab === "upload"   && userRole === "Teacher" && <div className="animate-fade-up"><TeacherContentUpload onPuzzlePublished={handlePuzzleSubmitted} activePuzzleId={selectedPuzzleId} /></div>}
          {activeTab === "students" && userRole === "Teacher" && <div className="animate-fade-up"><TeacherStudents teacherId={currentUserId} students={teacherStudents} isLoading={isLoadingStudents} error={studentsError} onUpload={handleStudentUpload} onResetPassword={handleStudentReset} onDelete={handleStudentDelete} /></div>}
          {activeTab === "scores"   && <div className="animate-fade-up"><Leaderboard data={leaderboardData} isLoading={isLoadingLeaderboard} loadError={leaderboardError} puzzles={publishedPuzzles} selectedPuzzleId={selectedPuzzleId} onPuzzleSelect={id => setSelectedPuzzleId(id)} /></div>}
          {activeTab === "teacher-analysis" && userRole === "Teacher" && <div className="animate-fade-up"><TeacherReport puzzles={publishedPuzzles} puzzleAnalytics={puzzleAnalytics} isLoading={isLoadingLeaderboard} loadError={leaderboardError} selectedPuzzleId={selectedPuzzleId} onPuzzleSelect={id => setSelectedPuzzleId(id)} /></div>}
          {activeTab === "stats"     && userRole === "Student" && <div className="animate-fade-up"><CurrentStats stats={stats} puzzles={puzzles} history={studentHistory} /></div>}
          {activeTab === "report"    && userRole === "Student" && <div className="animate-fade-up"><Report studentRegNo={currentUserId} /></div>}
          {activeTab === "reanalyse" && userRole === "Student" && <div className="animate-fade-up"><Reanalyse history={studentHistory} puzzles={puzzles} /></div>}

          {activeTab === "admin-teachers" && userRole === "Admin" && (
            <div className="animate-fade-up space-y-6">
              <div className="flex flex-wrap gap-3 p-5 rounded-2xl border"
                style={{ background: `linear-gradient(135deg,${C.card},${C.felt})`, borderColor: "rgba(124,92,255,0.14)" }}>
                {[{ key: "teacher_id", ph: "Teacher ID", type: "text" }, { key: "name", ph: "Name", type: "text" }, { key: "password", ph: "Password", type: "password" }].map(f => (
                  <input key={f.key} type={f.type} placeholder={f.ph} value={newTeacher[f.key]}
                    onChange={e => setNewTeacher(p => ({ ...p, [f.key]: e.target.value }))}
                    className="bg-black/25 border rounded-xl px-4 py-2.5 text-sm outline-none font-mono min-w-[160px]"
                    style={{ color: C.cream, borderColor: "rgba(124,92,255,0.14)" }}
                    onFocus={e => e.target.style.borderColor = "rgba(124,92,255,0.45)"}
                    onBlur={e => e.target.style.borderColor = "rgba(124,92,255,0.14)"} />
                ))}
                <button type="button" onClick={handleAdminCreateTeacher}
                  className="px-5 py-2.5 rounded-xl font-mono font-bold text-sm tracking-wider btn-press"
                  style={{ background: `linear-gradient(135deg,${C.taupe},${C.tan})`, color: C.bg }}>
                  + Create Teacher
                </button>
              </div>
              {adminError && <div className="px-4 py-3 rounded-xl text-sm font-mono border" style={{ background: "rgba(255,77,109,0.1)", borderColor: "rgba(255,77,109,0.3)", color: "#f0a0a0" }}>{adminError}</div>}
              <DataTable loading={isLoadingAdmin} emptyMsg="No teachers yet."
                cols={[{ key: "id", label: "Teacher ID" }, { key: "name", label: "Name", muted: true }, { key: "del", label: "Action", center: true }]}
                rows={adminTeachers.map(t => ({
                  id:   <span className="font-mono font-bold" style={{ color: C.cream }}>{t.teacher_id}</span>,
                  name: <span className="font-mono">{t.name}</span>,
                  del:  <ActionBtn label="Delete" variant="red" onClick={() => handleAdminDeleteTeacher(t)} />,
                }))} />
            </div>
          )}

          {activeTab === "admin-students" && userRole === "Admin" && (
            <div className="animate-fade-up">
              <DataTable loading={isLoadingAdmin} emptyMsg="No students found."
                cols={[{ key: "name", label: "Name" }, { key: "reg", label: "Reg No", muted: true }, { key: "teacher", label: "Teacher", muted: true }, { key: "date", label: "Created", center: true, muted: true }]}
                rows={adminStudents.map(s => ({
                  name:    <span className="font-display font-bold" style={{ color: C.cream }}>{s.name}</span>,
                  reg:     <span className="font-mono">{s.reg_no}</span>,
                  teacher: <span className="font-mono">{s.teacher_name || s.teacher_id || "—"}</span>,
                  date:    <span className="font-mono">{s.created_at ? new Date(s.created_at).toLocaleDateString() : "—"}</span>,
                }))} />
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
