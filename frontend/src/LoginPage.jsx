import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, User, Lock } from 'lucide-react';

const LoginPage = () => {
  const [activeRole, setActiveRole] = useState('Teacher');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    console.log(`Logging in as ${activeRole}`);
    navigate('/dashboard'); 
  };

  // 🌟 DYNAMIC THEME CONFIGURATION 🌟
  const isTeacher = activeRole === 'Teacher';
  const theme = isTeacher ? {
    color: 'text-[#E53935]',
    bg: 'bg-[#E53935]',
    glowText: 'drop-shadow-[0_0_20px_rgba(229,57,53,0.6)]',
    glowBox: 'shadow-[0_0_20px_rgba(229,57,53,0.3)]',
    glowBtn: 'hover:shadow-[0_8px_30px_rgba(229,57,53,0.5)]',
    borderFocus: 'focus:border-[#E53935]',
    bgFocus: 'focus:bg-[#E53935]/10',
    btnHover: 'hover:bg-red-600',
  } : {
    color: 'text-[#3B82F6]',
    bg: 'bg-[#3B82F6]',
    glowText: 'drop-shadow-[0_0_20px_rgba(59,130,246,0.6)]',
    glowBox: 'shadow-[0_0_20px_rgba(59,130,246,0.3)]',
    glowBtn: 'hover:shadow-[0_8px_30px_rgba(59,130,246,0.5)]',
    borderFocus: 'focus:border-[#3B82F6]',
    bgFocus: 'focus:bg-[#3B82F6]/10',
    btnHover: 'hover:bg-blue-600',
  };

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen bg-[#09090b] text-white font-sans overflow-hidden px-6 py-12 transition-colors duration-500">
      
      {/* 🌟 REDESIGNED AMBIENT BACKGROUND GLOW 🌟 */}
      {/* Top Left Ambient Light */}
      <div className={`absolute top-[-20%] left-[-10%] w-[60vw] h-[60vw] rounded-full mix-blend-screen opacity-10 blur-[130px] pointer-events-none transition-colors duration-700 ease-in-out ${theme.bg}`}></div>
      {/* Bottom Right Ambient Light */}
      <div className={`absolute bottom-[-20%] right-[-10%] w-[60vw] h-[60vw] rounded-full mix-blend-screen opacity-[0.07] blur-[130px] pointer-events-none transition-colors duration-700 ease-in-out ${theme.bg}`}></div>
      
      {/* Fading Crossword-style Tech Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_50%,#000_60%,transparent_100%)] pointer-events-none"></div>

      {/* 🌟 CENTERED HEADER 🌟 */}
      <div className="relative z-10 w-full max-w-2xl text-center mb-12 mt-[-4vh]">
        <h1 className="text-6xl md:text-7xl font-extrabold m-0 tracking-tighter leading-tight drop-shadow-xl">
          Cro<span className={`transition-all duration-500 ease-in-out ${theme.color} ${theme.glowText}`}>X</span>word
        </h1>
        <h2 className="text-xl md:text-2xl text-gray-300 mt-4 mb-3 font-medium tracking-wide">
          Puzzle Generator & Assessment
        </h2>
        <p className="text-base text-gray-500 tracking-wide font-light">
          From Clues to Grades — Seamlessly.
        </p>
      </div>

      {/* 🌟 CENTERED GLASSMORPHISM LOGIN BOX 🌟 */}
      <div className="relative z-10 w-full max-w-[500px]">
        {/* Outer glow for the box */}
        <div className={`absolute -inset-0.5 bg-gradient-to-b from-white/10 to-transparent rounded-[2.5rem] blur-sm opacity-50 transition-all duration-500`}></div>
        
        {/* Actual Form Box */}
        <div className="relative bg-[#0a0a0a]/80 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-10 md:p-12 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.9)]">
          
          {/* Toggle Switch */}
          <div className="flex bg-black/60 rounded-full p-2 mb-10 border border-white/5 relative shadow-inner">
            <button 
              type="button"
              className={`flex-1 bg-transparent border-none py-3 rounded-full text-base tracking-wider transition-all duration-300 z-10 ${isTeacher ? 'text-white font-bold' : 'text-gray-500 hover:text-gray-300 font-medium cursor-pointer'}`}
              onClick={() => setActiveRole('Teacher')}
            >
              Teacher
            </button>
            <button 
              type="button"
              className={`flex-1 bg-transparent border-none py-3 rounded-full text-base tracking-wider transition-all duration-300 z-10 ${!isTeacher ? 'text-white font-bold' : 'text-gray-500 hover:text-gray-300 font-medium cursor-pointer'}`}
              onClick={() => setActiveRole('Student')}
            >
              Student
            </button>
            {/* Dynamic sliding indicator */}
            <div className={`absolute top-2 bottom-2 w-[calc(50%-8px)] rounded-full transition-all duration-500 cubic-bezier(0.4, 0, 0.2, 1) ${theme.bg} ${theme.glowBox} ${isTeacher ? 'translate-x-0' : 'translate-x-[calc(100%+8px)]'}`}></div>
          </div>

          {/* Login Form Inputs */}
          <form onSubmit={handleLogin} className="flex flex-col gap-6">
            
            {/* ID Input Wrapper */}
            <div className="relative w-full group">
              <User className={`absolute left-5 top-1/2 -translate-y-1/2 transition-colors duration-300 ${isTeacher ? 'text-gray-500 group-focus-within:text-[#E53935]' : 'text-gray-500 group-focus-within:text-[#3B82F6]'}`} size={22} />
              <input 
                type="text" 
                placeholder={isTeacher ? "Teacher ID" : "Student Registration Number"} 
                className={`w-full bg-[#141414] border border-white/10 rounded-xl p-5 pl-14 text-white text-base transition-all duration-300 placeholder:text-gray-600 focus:outline-none ${theme.borderFocus} ${theme.bgFocus}`}
                required
              />
            </div>
            
            {/* Password Input Wrapper */}
            <div className="relative w-full group">
              <Lock className={`absolute left-5 top-1/2 -translate-y-1/2 transition-colors duration-300 ${isTeacher ? 'text-gray-500 group-focus-within:text-[#E53935]' : 'text-gray-500 group-focus-within:text-[#3B82F6]'}`} size={22} />
              <input 
                type={showPassword ? "text" : "password"} 
                placeholder="Password" 
                className={`w-full bg-[#141414] border border-white/10 rounded-xl p-5 pl-14 pr-12 text-white text-base transition-all duration-300 placeholder:text-gray-600 focus:outline-none ${theme.borderFocus} ${theme.bgFocus}`}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className={`absolute right-5 top-1/2 -translate-y-1/2 text-gray-500 transition-colors cursor-pointer ${isTeacher ? 'hover:text-[#E53935]' : 'hover:text-[#3B82F6]'}`}
              >
                {showPassword ? <EyeOff size={22} /> : <Eye size={22} />}
              </button>
            </div>
            
            {/* Cleaned up Submit Button */}
            <button 
              type="submit" 
              className={`text-white border-none rounded-xl py-5 mt-4 text-base font-bold tracking-widest uppercase cursor-pointer transition-all duration-500 w-full hover:-translate-y-1 active:translate-y-0 ${theme.bg} ${theme.btnHover} ${theme.glowBtn}`}
            >
              Sign In
            </button>
          </form>

          {/* Bottom links */}
          <div className="mt-8 flex justify-between text-sm text-gray-500 font-medium">
            <a href="#" className={`transition-colors duration-300 ${isTeacher ? 'hover:text-[#E53935]' : 'hover:text-[#3B82F6]'}`}>Forgot Password?</a>
            <a href="#" className={`transition-colors duration-300 ${isTeacher ? 'hover:text-[#E53935]' : 'hover:text-[#3B82F6]'}`}>Contact Admin</a>
          </div>

        </div>
      </div>
      
    </div>
  );
};

export default LoginPage;