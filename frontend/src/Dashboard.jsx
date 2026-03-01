import React from 'react';
import { 
  Search, LayoutDashboard, List, Bell, History, RotateCcw, 
  Puzzle, Lightbulb, Target, Star 
} from 'lucide-react';
import './Dashboard.css';

const Dashboard = () => {
  // Mock data for the table based on your image
  const puzzleData = [
    { name: 'Frost Illusion', attempts: 10, points: '87.56%', status: 'Ranked' },
    { name: 'Arid Mist Related', attempts: 10, points: '92.56%', status: 'Puzzle' },
    { name: 'Frost Yard Names', attempts: 10, points: '66.56%', status: 'Puzzle' },
    { name: 'Average Core', attempts: 10, points: '54.56%', status: 'Surreal' },
  ];

  return (
    <div className="dashboard-layout">
      
      {/* SIDEBAR */}
      <aside className="sidebar">
        <h2 className="sidebar-title">Dashboard</h2>
        <nav className="sidebar-nav">
          <a href="#" className="nav-item active">
            <LayoutDashboard size={20} />
            <span>Dashboard</span>
          </a>
          <a href="#" className="nav-item">
            <List size={20} />
            <span>Current Stats</span>
          </a>
          <a href="#" className="nav-item">
            <Bell size={20} />
            <span>Scores</span>
          </a>
          <a href="#" className="nav-item">
            <History size={20} />
            <span>Report</span>
          </a>
          <a href="#" className="nav-item">
            <RotateCcw size={20} />
            <span>Reanalyse</span>
          </a>
        </nav>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="main-content">
        
        {/* TOP HEADER */}
        <header className="top-header">
          <div className="header-left">
            <Search size={32} className="search-icon" />
            <h1 className="welcome-text">Welcome., Shreyas 👋</h1>
          </div>
        </header>

        {/* DASHBOARD CONTENT PANEL */}
        <div className="content-panel">
          
          {/* STATS ROW */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-number">12</div>
              <div className="stat-label">
                <Puzzle size={16} color="#E53935" /> Total Puzzles
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-number">163</div>
              <div className="stat-label">
                <Lightbulb size={16} color="#E53935" /> Assistances
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-number">69%</div>
              <div className="stat-label">
                <Target size={16} color="#E53935" /> Attainment
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-number">67%</div>
              <div className="stat-label">
                <Star size={16} color="#E53935" /> Avg Score
              </div>
            </div>
          </div>

          {/* TABLE SECTION */}
          <div className="table-container">
            <table className="puzzle-table">
              <thead>
                <tr>
                  <th>Puzzles Name</th>
                  <th>Attempts</th>
                  <th>Avg Points</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {puzzleData.map((row, index) => (
                  <tr key={index}>
                    <td>{row.name}</td>
                    <td>{row.attempts}</td>
                    <td>{row.points}</td>
                    <td>{row.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>
      </main>
    </div>
  );
};

export default Dashboard;