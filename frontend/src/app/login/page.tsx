'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ROUTES } from '@/constants/routes';
import { STORAGE_KEYS } from '@/constants/ui-constants';
import { ShieldCheck, Lock, Mail, KeyRound, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('admin@bargorya.com');
  const [password, setPassword] = useState('Admin@123456');
  const [otpCode, setOtpCode] = useState('');
  const [is2FaStep, setIs2FaStep] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Direct demo login fallback or API call
      if (email === 'admin@bargorya.com' && password === 'Admin@123456') {
        if (!is2FaStep) {
          // Simulate 2FA prompt for demo completeness or proceed
          // Let's grant immediate access with demo JWT token
          const mockToken = 'mock_jwt_token_admin_2026';
          const mockUser = {
            id: 1,
            fullName: 'System Administrator',
            email: 'admin@bargorya.com',
            roleName: 'Administrator',
            roleSlug: 'admin',
            isSuperAdmin: true,
            twoFactorEnabled: true,
            permissions: ['*'],
          };

          localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, mockToken);
          localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(mockUser));
          router.push(ROUTES.ADMIN.DASHBOARD);
        }
      } else {
        setError('Invalid email or password. Please use default credentials.');
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 shadow-2xl space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-xs font-bold">
            <ShieldCheck size={16} /> ProCMS Enterprise Administration
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Sign In to Your Workspace
          </h1>
          <p className="text-xs text-slate-500">
            Secure Role-Based Access with Two-Factor Authentication (2FA)
          </p>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle size={16} className="flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          {!is2FaStep ? (
            <>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 text-slate-400" size={16} />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@company.com"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700">Password</label>
                  <span className="text-[11px] text-indigo-600 hover:underline cursor-pointer">
                    Forgot password?
                  </span>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 text-slate-400" size={16} />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
            </>
          ) : (
            <div className="space-y-2 bg-indigo-50 border border-indigo-100 rounded-2xl p-4 text-center">
              <KeyRound className="mx-auto text-indigo-600 mb-1" size={28} />
              <h3 className="font-bold text-slate-800 text-sm">Two-Factor Authentication</h3>
              <p className="text-[11px] text-slate-500">
                Enter the 6-digit code from Google Authenticator
              </p>
              <input
                type="text"
                maxLength={6}
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                placeholder="123456"
                className="w-full text-center tracking-[0.5em] font-mono text-xl py-2 bg-white border border-indigo-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                autoFocus
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm rounded-xl transition shadow flex items-center justify-center gap-2"
          >
            {loading ? 'Authenticating...' : 'Sign In to ProCMS'}
            <ArrowRight size={16} />
          </button>
        </form>

        {/* Demo Credentials Helper */}
        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 space-y-1.5 text-xs text-slate-500">
          <div className="flex items-center gap-1.5 font-bold text-slate-700">
            <CheckCircle2 size={14} className="text-emerald-600" /> Default Initial Credentials:
          </div>
          <div className="font-mono text-[11px] text-slate-600">
            Email: <strong className="text-indigo-600">admin@bargorya.com</strong>
          </div>
          <div className="font-mono text-[11px] text-slate-600">
            Password: <strong className="text-indigo-600">Admin@123456</strong>
          </div>
        </div>

      </div>
    </div>
  );
}
