import React, { useState } from 'react';
import { X, Mail, Phone, Lock, Sparkles, LogIn, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { loginWithEmailOrPhone, loginWithGoogle } = useAuth();
  const [authMode, setAuthMode] = useState<'email' | 'phone'>('email');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier) return;
    setLoading(true);
    const success = await loginWithEmailOrPhone(identifier);
    setLoading(false);
    if (success) {
      onClose();
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    const success = await loginWithGoogle();
    setLoading(false);
    if (success) {
      onClose();
    }
  };

  const handleDemoUser = async (email: string, role: 'user' | 'admin' = 'user') => {
    setLoading(true);
    await loginWithEmailOrPhone(email, role);
    setLoading(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-800 w-full max-w-md overflow-hidden relative">
        
        {/* Header decoration */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white bg-black/10 hover:bg-black/20 p-1.5 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-5 h-5 text-emerald-200" />
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-100">Welcome to VeloxBus</span>
          </div>
          <h2 className="text-2xl font-bold">Sign In to Your Account</h2>
          <p className="text-emerald-100 text-xs mt-1">Manage bookings, earn reward miles, and track buses live.</p>
        </div>

        <div className="p-6">
          
          {/* Quick Demo Login Preset Buttons */}
          <div className="mb-5 bg-emerald-50 dark:bg-emerald-950/40 p-3 rounded-xl border border-emerald-200 dark:border-emerald-800">
            <p className="text-[11px] font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wide mb-2 flex items-center justify-between">
              <span>🚀 One-Click Demo Access</span>
              <span className="text-[10px] bg-emerald-200 dark:bg-emerald-800 px-1.5 py-0.5 rounded text-emerald-900 dark:text-emerald-100">Instant</span>
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleDemoUser('alex.johnson@example.com', 'user')}
                className="px-2.5 py-1.5 bg-white dark:bg-slate-800 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-semibold shadow-xs border border-emerald-200 dark:border-emerald-800/80 flex items-center justify-between transition-colors"
              >
                <span>Traveler (Alex)</span>
                <ArrowRight className="w-3 h-3 text-emerald-600" />
              </button>
              <button
                onClick={() => handleDemoUser('admin@veloxbus.com', 'admin')}
                className="px-2.5 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-semibold shadow-xs flex items-center justify-between transition-colors"
              >
                <span>Admin Station</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Toggle Email vs Phone */}
          <div className="flex rounded-xl bg-slate-100 dark:bg-slate-800 p-1 mb-4">
            <button
              onClick={() => setAuthMode('email')}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                authMode === 'email'
                  ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-xs'
                  : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              <Mail className="w-3.5 h-3.5" />
              Email Address
            </button>
            <button
              onClick={() => setAuthMode('phone')}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                authMode === 'phone'
                  ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-xs'
                  : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              <Phone className="w-3.5 h-3.5" />
              Mobile Number
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {authMode === 'email' ? 'Email Address' : 'Mobile Number'}
              </label>
              <div className="relative">
                {authMode === 'email' ? (
                  <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                ) : (
                  <Phone className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                )}
                <input
                  type={authMode === 'email' ? 'email' : 'tel'}
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder={authMode === 'email' ? 'alex.johnson@example.com' : '+1 (555) 234-5678'}
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 mt-2"
            >
              <LogIn className="w-4 h-4" />
              {loading ? 'Signing In...' : 'Sign In / Register'}
            </button>
          </form>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200 dark:border-slate-800"></div>
            </div>
            <div className="relative flex justify-center text-[10px] uppercase">
              <span className="bg-white dark:bg-slate-900 px-2 text-slate-400 font-semibold">Or continue with</span>
            </div>
          </div>

          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full py-2.5 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 font-semibold text-xs rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            Sign In with Google
          </button>

        </div>
      </div>
    </div>
  );
};
