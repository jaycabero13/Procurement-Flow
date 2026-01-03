
import React, { useState } from 'react';
import { LogIn, Database, User as UserIcon, Lock, ArrowLeft, ShieldCheck, Eye, EyeOff } from 'lucide-react';
import { User } from '../types';
import { authService } from '../services/authService';

interface LoginProps {
  onLogin: (user: User) => void;
}

type AuthMode = 'login' | 'signup';

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [mode, setMode] = useState<AuthMode>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const resetForm = () => {
    setError(null);
    setPassword('');
    setConfirmPassword('');
    setUsername('');
  };

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    
    try {
      const newUser = authService.register(username, password);
      onLogin(newUser);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Signup failed');
    }
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const user = authService.login(username, password);
      onLogin(user);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 font-sans overflow-y-auto">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center gap-3 mb-8 text-blue-600 animate-in fade-in slide-in-from-top-4 duration-500">
          <Database className="w-12 h-12" />
          <h1 className="text-4xl font-black tracking-tight">ProcureFlow</h1>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] shadow-2xl shadow-slate-200/50 border border-slate-100 transition-all duration-300">
          {mode === 'login' && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              <h2 className="text-2xl font-black text-slate-800 tracking-tight">Login</h2>
              <p className="text-slate-500 text-sm mb-8">Access your procurement dashboard.</p>
              
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <InputGroup icon={<UserIcon size={18}/>} label="Username">
                  <input
                    type="text"
                    required
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    placeholder="Enter your username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                </InputGroup>

                <InputGroup 
                  icon={<Lock size={18}/>} 
                  label="Password" 
                  rightElement={
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-slate-400 hover:text-slate-600 p-1">
                      {showPassword ? <EyeOff size={18}/> : <Eye size={18}/>}
                    </button>
                  }
                >
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    className="w-full pl-10 pr-10 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </InputGroup>

                {error && <ErrorMessage message={error} />}

                <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-4 rounded-2xl shadow-lg shadow-blue-200 transition-all active:scale-95 flex items-center justify-center gap-2 uppercase tracking-widest text-xs">
                  <LogIn size={18} />
                  Sign In
                </button>

                <div className="text-center mt-6">
                  <button 
                    type="button" 
                    onClick={() => { setMode('signup'); resetForm(); }}
                    className="text-sm font-bold text-slate-400 hover:text-blue-600 transition-colors"
                  >
                    New here? Create an account
                  </button>
                </div>
              </form>
            </div>
          )}

          {mode === 'signup' && (
            <div className="animate-in fade-in slide-in-from-left-4 duration-300">
              <div className="flex items-center gap-2 mb-2">
                <button onClick={() => { setMode('login'); resetForm(); }} className="p-1 hover:bg-slate-100 rounded-full text-slate-400">
                  <ArrowLeft size={20} />
                </button>
                <h2 className="text-2xl font-black text-slate-800 tracking-tight">Register</h2>
              </div>
              <p className="text-slate-500 text-sm mb-6 ml-8">Join the procurement team.</p>
              
              <form onSubmit={handleSignup} className="space-y-4">
                <InputGroup icon={<UserIcon size={18}/>} label="Choose Username">
                  <input
                    type="text"
                    required
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    placeholder="e.g. jdoe88"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                </InputGroup>

                <InputGroup icon={<Lock size={18}/>} label="Password">
                  <input
                    type="password"
                    required
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </InputGroup>

                <InputGroup icon={<ShieldCheck size={18}/>} label="Confirm Password">
                  <input
                    type="password"
                    required
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </InputGroup>

                {error && <ErrorMessage message={error} />}

                <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-4 rounded-2xl shadow-lg shadow-blue-200 transition-all active:scale-95 flex items-center justify-center gap-2 uppercase tracking-widest text-xs">
                  Create Account
                </button>
              </form>
            </div>
          )}

          <div className="mt-8 pt-8 border-t border-slate-50 text-center">
            <p className="text-[10px] text-slate-300 uppercase tracking-widest font-black">ProcureFlow Enterprise Security</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const InputGroup: React.FC<{ icon: React.ReactNode, label: string, children: React.ReactNode, rightElement?: React.ReactNode }> = ({ icon, label, children, rightElement }) => (
  <div className="space-y-1.5">
    <label className="text-xs font-black text-slate-400 uppercase tracking-tighter ml-1">{label}</label>
    <div className="relative group">
      <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors">
        {icon}
      </div>
      {children}
      {rightElement && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          {rightElement}
        </div>
      )}
    </div>
  </div>
);

const ErrorMessage: React.FC<{ message: string }> = ({ message }) => (
  <div className="p-3 bg-red-50 border border-red-100 text-red-600 rounded-xl text-xs font-bold flex items-center gap-2 animate-in slide-in-from-bottom-2">
    <ShieldCheck size={14} className="rotate-180" />
    {message}
  </div>
);

export default Login;
