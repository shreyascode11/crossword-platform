import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // 1. Imported useNavigate
import './LoginPage.css';

const LoginPage = () => {
  const [activeRole, setActiveRole] = useState('Teacher');
  const navigate = useNavigate(); // 2. Initialized the navigate function

  const handleLogin = (e) => {
    e.preventDefault();
    console.log(`Logging in as ${activeRole}`);
    
    // 3. Tells React to instantly swap to the dashboard page
    navigate('/dashboard'); 
  };

  return (
    <div className="landing-container">
      
      {/* 🌟 TOP HEADER: Title spans across the top now 🌟 */}
      <div className="header-text">
        <h1 className="main-title">
          Cro<span className="accent-red">X</span>word Puzzle Generator
        </h1>
        <h2 className="sub-title">& Assessment Platform</h2>
        <p className="tagline">From Clues to Grades — Seamlessly.</p>
      </div>

      {/* 🌟 MAIN CONTENT: 2-Column layout for Login & Image 🌟 */}
      <div className="content-container">
        
        {/* LEFT COLUMN: The Login Form */}
        <div className="left-column">
          <div className="login-box">
            {/* Toggle Switch */}
            <div className="role-toggle-container">
              <button 
                className={`toggle-btn ${activeRole === 'Teacher' ? 'active' : ''}`}
                onClick={() => setActiveRole('Teacher')}
              >
                Teacher
              </button>
              <button 
                className={`toggle-btn ${activeRole === 'Student' ? 'active' : ''}`}
                onClick={() => setActiveRole('Student')}
              >
                Student
              </button>
            </div>

            {/* Login Form */}
            <form onSubmit={handleLogin} className="login-form">
              <input 
                type="text" 
                placeholder="Enter Registration Number" 
                className="login-input"
                required
              />
              <input 
                type="password" 
                placeholder="Password" 
                className="login-input"
                required
              />
              <button type="submit" className="submit-btn">
                Sign In
              </button>
            </form>
          </div>
          <div className="footer-text">Users & Roles</div>
        </div>

        {/* RIGHT COLUMN: The Hero Image */}
        <div className="right-column">
          <div className="image-placeholder">
             <img 
               src="/Crossword_grid.jpg" 
               alt="Crossword Platform Preview" 
               className="hero-image" 
             />
          </div>
        </div>

      </div>
    </div>
  );
};

export default LoginPage;