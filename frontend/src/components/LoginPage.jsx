'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Pencil, Lock } from 'lucide-react';
import { loginUser } from '../lib/api';

/* palette */
const P = {
  bg:      '#0f0e14',
  felt:    '#17151f',
  card:    '#1e1b29',
  taupe:   '#7c5cff',
  tan:     '#22d3c9',
  stone:   '#c7c2d9',
  cream:   '#ede9f7',
  muted:   '#8d87a3',
  rust:    '#ff4d6d',
  rule:    'rgba(124,92,255,0.12)',
};

const GridDeco = () => (
  <svg width="120" height="120" viewBox="0 0 120 120" className="opacity-[0.07]" aria-hidden>
    {[0,40,80].map(r => [0,40,80].map(c => (
      <rect key={`${r}-${c}`} x={c+1} y={r+1} width={38} height={38}
        fill={((r+c)/40) % 2 === 0 ? P.taupe : 'none'}
        stroke={P.taupe} strokeWidth="0.8" rx="1" />
    )))}
  </svg>
);

const roles = ['Teacher', 'Student', 'Admin'];
const ROLE_CONFIG = {
  Teacher: { color: P.taupe, label: 'FACULTY EDITION', placeholder: 'Teacher ID'          },
  Student: { color: P.tan,   label: 'STUDENT EDITION', placeholder: 'Registration Number' },
  Admin:   { color: P.rust,  label: 'ADMIN CONSOLE',   placeholder: 'Username'            },
};

const LoginPage = () => {
  const [activeRole, setActiveRole]     = useState('Teacher');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoggingIn, setIsLoggingIn]   = useState(false);
  const [loginError, setLoginError]     = useState('');
  const [credentials, setCredentials]   = useState({
    Teacher: { userId: '', password: '' },
    Student: { userId: '', password: '' },
    Admin:   { userId: '', password: '' },
  });
  const router = useRouter();
  const cfg = ROLE_CONFIG[activeRole];
  const currentCreds = credentials[activeRole];

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!currentCreds.userId.trim() || !currentCreds.password.trim()) return;
    setLoginError(''); setIsLoggingIn(true);
    try {
      const data = await loginUser({ role: activeRole, user_id: currentCreds.userId.trim(), password: currentCreds.password });
      localStorage.setItem('userRole',  data?.role    || activeRole);
      localStorage.setItem('userId',    data?.user_id || currentCreds.userId.trim());
      localStorage.setItem('authToken', data?.token   || '');
      router.push('/dashboard');
    } catch (err) { setLoginError(err?.message || 'Invalid credentials. Please try again.'); }
    finally { setIsLoggingIn(false); }
  };

  const handleChange = (field, value) =>
    setCredentials(prev => ({ ...prev, [activeRole]: { ...prev[activeRole], [field]: value } }));

  return (
    <div className="relative flex min-h-screen cw-grid-bg overflow-hidden" style={{ background: P.bg }}>

      {/* corners */}
      <div className="absolute top-0 left-0 p-4 opacity-50"><GridDeco /></div>
      <div className="absolute bottom-0 right-0 p-4 opacity-30 rotate-180"><GridDeco /></div>
      <div className="absolute top-0 right-0 p-4 opacity-20 rotate-90"><GridDeco /></div>

      {/* glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-[-20%] left-[-10%] w-[55vw] h-[55vw] rounded-full blur-[180px] opacity-[0.07]"
          style={{ background: cfg.color }} />
        <div className="absolute bottom-[-20%] right-[-10%] w-[40vw] h-[40vw] rounded-full blur-[140px] opacity-[0.05]"
          style={{ background: cfg.color }} />
      </div>

      {/* ── Left panel ── */}
      <div className="hidden lg:flex flex-col justify-center items-start w-1/2 px-20 py-16 relative">
        <p className="font-mono text-[11px] tracking-[0.4em] uppercase mb-6 animate-fade-up"
          style={{ color: cfg.color }}>✦ {cfg.label}</p>

        <h1 className="font-display text-[7rem] leading-[0.85] font-black text-[#ede9f7] tracking-tight mb-6 animate-fade-up delay-100">
          Cro<span style={{ color: cfg.color }} className="animate-flicker">×</span>word
        </h1>

        <p className="font-display italic text-2xl mb-10 animate-fade-up delay-200" style={{ color: P.stone }}>
          Puzzle Generator &amp; Assessment Platform
        </p>

        <div className="flex flex-col gap-3 animate-fade-up delay-300">
          {['AI-powered clue generation from documents',
            'Gamified crossword play for students',
            'Live leaderboards & performance analytics'].map((f, i) => (
            <div key={i} className="flex items-center gap-3">
              <span className="w-5 h-5 rounded-sm flex items-center justify-center text-[10px] font-bold font-mono"
                style={{ background: cfg.color, color: P.bg }}>✓</span>
              <span className="text-sm" style={{ color: P.stone }}>{f}</span>
            </div>
          ))}
        </div>

        <div className="mt-14 flex items-center gap-3 animate-fade-up delay-400">
          <div className="h-px flex-1" style={{ background: `linear-gradient(to right, ${cfg.color}55, transparent)` }} />
          <span className="font-mono text-[10px] tracking-[0.3em] uppercase" style={{ color: cfg.color }}>Est. 2025</span>
        </div>
      </div>

      {/* ── Right panel ── */}
      <div className="flex flex-col justify-center items-center w-full lg:w-1/2 px-6 py-12 relative">

        {/* Mobile brand */}
        <div className="lg:hidden mb-8 text-center animate-fade-up">
          <h1 className="font-display text-5xl font-black" style={{ color: P.cream }}>
            Cro<span style={{ color: cfg.color }}>×</span>word
          </h1>
          <p className="font-mono text-[10px] tracking-[0.35em] uppercase mt-2" style={{ color: cfg.color }}>
            {cfg.label}
          </p>
        </div>

        <div className="w-full max-w-[440px] animate-fade-up delay-100">
          <div className="rounded-2xl border p-8 shadow-[0_32px_80px_-20px_rgba(0,0,0,0.85)]"
            style={{ background: `linear-gradient(135deg, ${P.card} 0%, ${P.felt} 100%)`, borderColor: `${cfg.color}28` }}>

            {/* Role tabs */}
            <div className="flex rounded-xl p-1 mb-8 gap-1" style={{ background: 'rgba(0,0,0,0.35)' }}>
              {roles.map(role => (
                <button key={role} type="button"
                  onClick={() => { setActiveRole(role); setLoginError(''); }}
                  className="flex-1 py-2.5 rounded-lg font-mono text-xs font-bold tracking-widest uppercase transition-all duration-300"
                  style={activeRole === role
                    ? { background: cfg.color, color: P.bg, boxShadow: `0 4px 20px -6px ${cfg.color}70` }
                    : { color: P.muted }}>
                  {role}
                </button>
              ))}
            </div>

            {/* Form */}
            <form onSubmit={handleLogin} className="flex flex-col gap-4">
              <div className="relative group">
                <Pencil size={16} className="absolute left-4 top-1/2 -translate-y-1/2 opacity-40 group-focus-within:opacity-90 transition-opacity"
                  style={{ color: cfg.color }} />
                <input type="text" placeholder={cfg.placeholder} value={currentCreds.userId}
                  onChange={e => handleChange('userId', e.target.value)}
                  className="w-full pl-10 pr-4 py-3.5 rounded-xl text-sm bg-black/25 outline-none border transition-all duration-200 font-mono"
                  style={{ color: P.cream, borderColor: `rgba(124,92,255,0.15)` }}
                  onFocus={e => e.target.style.borderColor = `${cfg.color}65`}
                  onBlur={e => e.target.style.borderColor = 'rgba(124,92,255,0.15)'}
                  required />
              </div>

              <div className="relative group">
                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 opacity-40 group-focus-within:opacity-90 transition-opacity"
                  style={{ color: cfg.color }} />
                <input type={showPassword ? 'text' : 'password'} placeholder="Password" value={currentCreds.password}
                  onChange={e => handleChange('password', e.target.value)}
                  className="w-full pl-10 pr-12 py-3.5 rounded-xl text-sm bg-black/25 outline-none border transition-all duration-200 font-mono"
                  style={{ color: P.cream, borderColor: 'rgba(124,92,255,0.15)' }}
                  onFocus={e => e.target.style.borderColor = `${cfg.color}65`}
                  onBlur={e => e.target.style.borderColor = 'rgba(124,92,255,0.15)'}
                  required />
                <button type="button" onClick={() => setShowPassword(v => !v)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 opacity-40 hover:opacity-90 transition-opacity"
                  style={{ color: cfg.color }}>
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              <button type="submit" disabled={isLoggingIn}
                className="mt-2 w-full py-4 rounded-xl font-mono font-bold text-sm tracking-[0.3em] uppercase transition-all duration-200 btn-press disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ background: `linear-gradient(135deg, ${cfg.color}, ${cfg.color}cc)`, color: P.bg, boxShadow: `0 8px 32px -8px ${cfg.color}60` }}>
                {isLoggingIn ? '— SIGNING IN —' : '— SIGN IN —'}
              </button>
            </form>

            {loginError && (
              <div className="mt-4 px-4 py-3 rounded-xl text-sm font-mono border"
                style={{ background: 'rgba(255,77,109,0.12)', borderColor: 'rgba(255,77,109,0.3)', color: '#f0a0a0' }}>
                ✕ {loginError}
              </div>
            )}

            <div className="mt-6 flex justify-between text-xs font-mono border-t pt-5"
              style={{ color: P.muted, borderColor: 'rgba(124,92,255,0.1)' }}>
              <button type="button" className="hover:text-[#7c5cff] transition-colors">Forgot Password?</button>
              <button type="button" className="hover:text-[#7c5cff] transition-colors">Contact Admin</button>
            </div>
          </div>

          <p className="mt-6 text-center font-mono text-[10px] tracking-[0.3em] uppercase animate-fade-up delay-300"
            style={{ color: P.muted }}>
            Crossword Platform · Academic Edition
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
