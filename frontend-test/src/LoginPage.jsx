import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, User, Lock } from 'lucide-react';
import { loginUser } from './api';

const LoginPage = () => {
  const [activeRole, setActiveRole] = useState('Teacher');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [credentials, setCredentials] = useState({
    Teacher: { userId: '', password: '' },
    Student: { userId: '', password: '' },
    Admin: { userId: '', password: '' },
  });
  const navigate = useNavigate();

  const roles = ['Teacher', 'Student', 'Admin'];
  const roleIndex = roles.indexOf(activeRole);
  const currentCreds = credentials[activeRole] || { userId: '', password: '' };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!currentCreds.userId.trim() || !currentCreds.password.trim()) return;
    setLoginError('');
    setIsLoggingIn(true);
    try {
      const data = await loginUser({
        role: activeRole,
        user_id: currentCreds.userId.trim(),
        password: currentCreds.password,
      });
      localStorage.setItem('userRole', data?.role || activeRole);
      localStorage.setItem('userId', data?.user_id || currentCreds.userId.trim());
      navigate('/dashboard', { state: { role: data?.role || activeRole, userId: data?.user_id || currentCreds.userId.trim() } });
    } catch (error) {
      console.error('Login failed:', error);
      setLoginError(error?.message || 'Invalid credentials. Please try again.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const theme = useMemo(() => {
    if (activeRole === 'Teacher') {
      return {
        color: 'text-[#E53935]',
        bg: 'bg-[#E53935]',
        glowText: 'drop-shadow-[0_0_20px_rgba(229,57,53,0.6)]',
        glowBox: 'shadow-[0_0_20px_rgba(229,57,53,0.3)]',
        glowBtn: 'hover:shadow-[0_8px_30px_rgba(229,57,53,0.5)]',
        borderFocus: 'focus:border-[#E53935]',
        bgFocus: 'focus:bg-[#E53935]/10',
        btnHover: 'hover:bg-red-600',
      };
    }
    if (activeRole === 'Admin') {
      return {
        color: 'text-[#22c55e]',
        bg: 'bg-[#22c55e]',
        glowText: 'drop-shadow-[0_0_20px_rgba(34,197,94,0.6)]',
        glowBox: 'shadow-[0_0_20px_rgba(34,197,94,0.3)]',
        glowBtn: 'hover:shadow-[0_8px_30px_rgba(34,197,94,0.5)]',
        borderFocus: 'focus:border-[#22c55e]',
        bgFocus: 'focus:bg-[#22c55e]/10',
        btnHover: 'hover:bg-green-600',
      };
    }
    return {
      color: 'text-[#3B82F6]',
      bg: 'bg-[#3B82F6]',
      glowText: 'drop-shadow-[0_0_20px_rgba(59,130,246,0.6)]',
      glowBox: 'shadow-[0_0_20px_rgba(59,130,246,0.3)]',
      glowBtn: 'hover:shadow-[0_8px_30px_rgba(59,130,246,0.5)]',
      borderFocus: 'focus:border-[#3B82F6]',
      bgFocus: 'focus:bg-[#3B82F6]/10',
      btnHover: 'hover:bg-blue-600',
    };
  }, [activeRole]);

  const placeholderLabel = activeRole === 'Teacher'
    ? 'Teacher ID'
    : activeRole === 'Student'
      ? 'Student Registration Number'
      : 'Admin Username';

  const handleChange = (field, value) => {
    setCredentials((prev) => ({
      ...prev,
      [activeRole]: { ...prev[activeRole], [field]: value },
    }));
  };

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen bg-[#060607] text-white font-sans overflow-hidden px-6 py-16 transition-colors duration-500">
      <div className={`absolute top-[-20%] left-[-10%] w-[60vw] h-[60vw] rounded-full mix-blend-screen opacity-[0.12] blur-[140px] pointer-events-none transition-colors duration-700 ease-in-out ${theme.bg}`}></div>
      <div className={`absolute bottom-[-20%] right-[-10%] w-[60vw] h-[60vw] rounded-full mix-blend-screen opacity-[0.09] blur-[140px] pointer-events-none transition-colors duration-700 ease-in-out ${theme.bg}`}></div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_120%_80%_at_50%_-20%,rgba(230,57,70,0.12),transparent_55%)] pointer-events-none"></div>
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff06_1px,transparent_1px),linear-gradient(to_bottom,#ffffff06_1px,transparent_1px)] bg-[size:3.5rem_3.5rem] [mask-image:radial-gradient(ellipse_75%_75%_at_50%_45%,#000_55%,transparent_100%)] pointer-events-none opacity-90"></div>

      <div className="relative z-10 w-full max-w-2xl text-center mb-14 animate-[fade-in-up_0.7s_ease-out_both]">
        <p className="text-[11px] uppercase tracking-[0.35em] text-gray-500 font-semibold mb-5">
          Crossword Platform
        </p>
        <h1 className="text-6xl md:text-7xl font-extrabold m-0 tracking-tighter leading-[0.95] drop-shadow-[0_8px_40px_rgba(0,0,0,0.65)] font-serif italic">
          Cro<span className={`not-italic transition-all duration-500 ease-in-out ${theme.color} ${theme.glowText}`}>X</span>word
        </h1>
        <h2 className="text-xl md:text-2xl text-gray-200 mt-5 mb-2 font-semibold tracking-tight">
          Puzzle Generator & Assessment
        </h2>
        <p className="text-sm md:text-base text-gray-500 tracking-wide font-normal max-w-md mx-auto leading-relaxed">
          From clues to grades — seamlessly.
        </p>
      </div>

      <div className="relative z-10 w-full max-w-[480px] animate-[fade-in-up_0.75s_ease-out_0.1s_both]">
        <div className="absolute -inset-px bg-gradient-to-b from-white/[0.14] via-white/[0.04] to-transparent rounded-[2rem] blur-[2px] opacity-70 transition-all duration-500"></div>
        <div className="relative bg-[#0c0c0d]/90 backdrop-blur-2xl border border-white/[0.08] rounded-[2rem] p-10 md:p-11 shadow-[0_24px_80px_-20px_rgba(0,0,0,0.85),inset_0_1px_0_rgba(255,255,255,0.06)]">
          <div className="flex bg-black/50 rounded-full p-1.5 mb-10 border border-white/[0.06] relative shadow-[inset_0_1px_2px_rgba(0,0,0,0.5)]">
            {roles.map((role) => (
              <button
                key={role}
                type="button"
                className={`flex-1 bg-transparent border-none py-3.5 rounded-full text-sm tracking-wide transition-all duration-300 z-10 ${activeRole === role ? 'text-white font-bold shadow-sm' : 'text-gray-500 hover:text-gray-200 font-medium cursor-pointer'}`}
                onClick={() => setActiveRole(role)}
              >
                {role}
              </button>
            ))}
            <div
              className={`absolute top-1.5 bottom-1.5 w-1/3 rounded-full transition-all duration-500 cubic-bezier(0.4, 0, 0.2, 1) ${theme.bg} ${theme.glowBox} shadow-[0_4px_20px_rgba(0,0,0,0.35)]`}
              style={{ transform: `translateX(${roleIndex * 100}%)` }}
            ></div>
          </div>

          <form onSubmit={handleLogin} className="flex flex-col gap-5">
            <div className="relative w-full group">
              <User className="absolute left-5 top-1/2 -translate-y-1/2 transition-colors duration-300 text-gray-500 group-focus-within:text-gray-300" size={22} />
              <input
                type="text"
                placeholder={placeholderLabel}
                value={currentCreds.userId}
                onChange={(e) => handleChange('userId', e.target.value)}
                className={`w-full bg-[#111113] border border-white/[0.08] rounded-xl p-[1.125rem] pl-14 text-white text-[15px] transition-all duration-300 placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-0 focus:ring-offset-transparent ${theme.borderFocus} ${theme.bgFocus} hover:border-white/15 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]`}
                required
              />
            </div>

            <div className="relative w-full group">
              <Lock className="absolute left-5 top-1/2 -translate-y-1/2 transition-colors duration-300 text-gray-500 group-focus-within:text-gray-300" size={22} />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                value={currentCreds.password}
                onChange={(e) => handleChange('password', e.target.value)}
                className={`w-full bg-[#111113] border border-white/[0.08] rounded-xl p-[1.125rem] pl-14 pr-12 text-white text-[15px] transition-all duration-300 placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-0 focus:ring-offset-transparent ${theme.borderFocus} ${theme.bgFocus} hover:border-white/15 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]`}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors cursor-pointer rounded-lg p-1 hover:bg-white/5"
              >
                {showPassword ? <EyeOff size={22} /> : <Eye size={22} />}
              </button>
            </div>

            <button
              type="submit"
              disabled={isLoggingIn}
              className={`text-white border-none rounded-xl py-[1.125rem] mt-2 text-[15px] font-bold tracking-[0.2em] uppercase cursor-pointer transition-all duration-500 w-full hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-60 disabled:hover:translate-y-0 disabled:cursor-not-allowed shadow-[0_12px_40px_-12px_rgba(0,0,0,0.8)] ${theme.bg} ${theme.btnHover} ${theme.glowBtn}`}
            >
              {isLoggingIn ? 'Signing In...' : 'Sign In'}
            </button>
          </form>

          {loginError && (
            <div className="mt-5 text-sm text-red-300 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
              {loginError}
            </div>
          )}

          <div className="mt-8 flex justify-between text-xs sm:text-sm text-gray-500 font-medium border-t border-white/[0.06] pt-6">
            <a href="#" className="hover:text-gray-200 transition-colors duration-300">
              Forgot Password?
            </a>
            <a href="#" className="hover:text-gray-200 transition-colors duration-300">
              Contact Admin
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
