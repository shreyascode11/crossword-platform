import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react'; // 1. Imported the eye icons

const LoginPage = () => {
  const [activeRole, setActiveRole] = useState('Teacher');
  const [showPassword, setShowPassword] = useState(false); // 2. State for password toggle
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    console.log(`Logging in as ${activeRole}`);
    navigate('/dashboard'); 
  };

  return (
    <div className="flex flex-col min-h-screen bg-[radial-gradient(circle_at_30%_50%,_#2a0a0a_0%,_#111111_60%)] text-white font-sans px-8 py-12 md:px-20 overflow-hidden box-border">
      
      {/* 🌟 TOP HEADER 🌟 */}
      <div className="w-full mb-10 text-center lg:text-left">
        <h1 className="text-5xl md:text-6xl font-extrabold m-0 tracking-tight leading-tight drop-shadow-[0_4px_10px_rgba(0,0,0,0.5)]">
          Cro<span className="text-[var(--color-crox-red)] drop-shadow-[0_0_15px_rgba(229,57,53,0.6)]">X</span>word Puzzle Generator
        </h1>
        <h2 className="text-3xl md:text-4xl text-[var(--color-crox-red)] mt-3 mb-3 font-semibold">
          & Assessment Platform
        </h2>
        <p className="text-lg md:text-xl text-gray-400 tracking-wide mt-1">
          From Clues to Grades — Seamlessly.
        </p>
      </div>

      {/* 🌟 MAIN CONTENT 🌟 */}
      <div className="flex flex-col lg:flex-row w-full items-center lg:items-start justify-between flex-1 gap-12 lg:gap-0">
        
        {/* LEFT COLUMN: The Login Form */}
        <div className="flex-1 flex flex-col w-full max-w-md relative z-10">
          
          <div className="bg-gradient-to-br from-[#E53935]/15 to-[#141414]/60 backdrop-blur-xl border border-white/5 border-t-white/15 border-l-white/15 shadow-[0_8px_32px_0_rgba(229,57,53,0.25)] rounded-3xl p-10 w-full box-border transition-all duration-300 ease-in-out hover:-translate-y-1 hover:shadow-[0_15px_40px_0_rgba(229,57,53,0.35)]">
            
            {/* Toggle Switch */}
            <div className="flex bg-black/40 rounded-full p-1.5 mb-8 border border-white/5">
              <button 
                type="button"
                className={`flex-1 bg-transparent border-none py-3 rounded-full text-base transition-all duration-300 ${activeRole === 'Teacher' ? 'bg-[var(--color-crox-red)] text-white font-bold shadow-[0_4px_15px_rgba(229,57,53,0.4)]' : 'text-gray-400 hover:text-white font-medium cursor-pointer'}`}
                onClick={() => setActiveRole('Teacher')}
              >
                Teacher
              </button>
              <button 
                type="button"
                className={`flex-1 bg-transparent border-none py-3 rounded-full text-base transition-all duration-300 ${activeRole === 'Student' ? 'bg-[var(--color-crox-red)] text-white font-bold shadow-[0_4px_15px_rgba(229,57,53,0.4)]' : 'text-gray-400 hover:text-white font-medium cursor-pointer'}`}
                onClick={() => setActiveRole('Student')}
              >
                Student
              </button>
            </div>

            {/* Login Form Inputs */}
            <form onSubmit={handleLogin} className="flex flex-col gap-6">
              <input 
                type="text" 
                placeholder="Enter Registration Number" 
                className="w-full bg-black/50 border border-white/5 rounded-xl p-4 text-white text-base transition-all duration-300 shadow-inner placeholder:text-gray-500 focus:outline-none focus:border-[var(--color-crox-red)] focus:bg-[#E53935]/5 focus:shadow-[0_0_15px_rgba(229,57,53,0.2)]"
                required
              />
              
              {/* 3. Password Input Wrapper with Eye Icon */}
              <div className="relative w-full">
                <input 
                  type={showPassword ? "text" : "password"} 
                  placeholder="Password" 
                  className="w-full bg-black/50 border border-white/5 rounded-xl p-4 pr-12 text-white text-base transition-all duration-300 shadow-inner placeholder:text-gray-500 focus:outline-none focus:border-[var(--color-crox-red)] focus:bg-[#E53935]/5 focus:shadow-[0_0_15px_rgba(229,57,53,0.2)]"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[var(--color-crox-red)] transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              
              <button type="submit" className="bg-transparent text-[var(--color-crox-red)] border-2 border-[var(--color-crox-red)] rounded-full py-3.5 px-6 text-lg font-bold cursor-pointer mt-4 transition-all duration-300 w-[60%] self-center hover:bg-[var(--color-crox-red)] hover:text-white hover:shadow-[0_0_20px_rgba(229,57,53,0.6)] hover:scale-105">
                Sign In
              </button>
            </form>
          </div>
          
          <div className="mt-6 text-gray-500 text-sm text-center lg:text-left">Users & Roles</div>
        </div>

        {/* RIGHT COLUMN: The Hero Image */}
        <div className="flex-[1.2] flex items-center justify-center lg:justify-end relative z-0 w-full mt-10 lg:mt-0">
          <div className="w-full max-w-[520px]">
             <img 
               src="/Crossword_grid.jpg" 
               alt="Crossword Platform Preview" 
               className="w-full h-auto object-contain rounded-2xl drop-shadow-[0_20px_30px_rgba(0,0,0,0.8)] animate-[float_6s_ease-in-out_infinite]" 
             />
          </div>
        </div>

      </div>
    </div>
  );
};

export default LoginPage;