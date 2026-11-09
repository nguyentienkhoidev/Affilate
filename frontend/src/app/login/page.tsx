'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { ROUTES } from '@/constants/routes';
import { STORAGE_KEYS } from '@/constants/ui-constants';
import {
  ShieldCheck,
  Lock,
  Mail,
  KeyRound,
  ArrowRight,
  AlertCircle,
  Eye,
  EyeOff,
  ArrowLeft,
  Loader2,
  Sparkles,
  CheckCircle2,
  Smartphone,
  AlertTriangle,
  RotateCcw,
  Languages,
  UserCheck,
  X,
  Info,
} from 'lucide-react';
import { authService, extractPermissionsFromToken } from '@/services/authService';
import type { UserData } from '@/app/admin/users/_lib/data';

interface ToastMessage {
  id: string;
  type: 'error' | 'success' | 'warning' | 'info';
  title: string;
  description?: string;
}

export default function LoginPage() {
  const router = useRouter();

  // Language state: 'en' | 'vi'
  const [lang, setLang] = useState<'en' | 'vi'>('vi');

  // Step 1: Pre-filled credentials (auto fill by default)
  const [email, setEmail] = useState('admin@heygoodly.com');
  const [password, setPassword] = useState('Admin@123456');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [capsLockActive, setCapsLockActive] = useState(false);

  // Field error highlights (borders only, error messages go to Toast)
  const [hasEmailError, setHasEmailError] = useState(false);
  const [hasPasswordError, setHasPasswordError] = useState(false);
  const [hasOtpError, setHasOtpError] = useState(false);
  const [shakeCard, setShakeCard] = useState(false);

  // Floating Toast notification state
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Brute force lockout protection
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockoutSeconds, setLockoutSeconds] = useState(0);

  // Step 2: 2FA State & User config
  const [is2FaStep, setIs2FaStep] = useState(false);
  const [tempToken, setTempToken] = useState<string>('');
  const [pendingUser, setPendingUser] = useState<UserData | null>(null);
  const [isBackupCodeMode, setIsBackupCodeMode] = useState(false);
  const [backupCode, setBackupCode] = useState('');
  const [otp, setOtp] = useState<string[]>(['', '', '', '', '', '']);
  const otpInputs = useRef<(HTMLInputElement | null)[]>([]);

  // Feedback & UI State
  const [loading, setLoading] = useState(false);
  const [verifiedSuccess, setVerifiedSuccess] = useState(false);

  // Helper to show floating Toast notifications
  const showToast = (
    type: 'error' | 'success' | 'warning' | 'info',
    title: string,
    description?: string
  ) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    setToasts((prev) => [...prev.slice(-3), { id, type, title, description }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Inspect URL query params for auth/session error reasons
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const reason = params.get('reason');
    if (!reason) return;

    if (reason === 'session_expired') {
      showToast(
        'warning',
        lang === 'vi' ? 'Phiên làm việc đã hết hạn' : 'Session Expired',
        lang === 'vi'
          ? 'Phiên đăng nhập của bạn đã hết hạn. Vui lòng đăng nhập lại để tiếp tục.'
          : 'Your session has expired. Please sign in again to continue.'
      );
    } else if (reason === 'invalid_token') {
      showToast(
        'error',
        lang === 'vi' ? 'Mã xác thực không hợp lệ' : 'Invalid Authentication Token',
        lang === 'vi'
          ? 'Mã xác thực không hợp lệ hoặc đã bị thay đổi. Vui lòng đăng nhập lại.'
          : 'Your authentication token is invalid or tampered. Please sign in again.'
      );
    } else if (reason === 'missing_token') {
      showToast(
        'warning',
        lang === 'vi' ? 'Yêu cầu đăng nhập' : 'Authentication Required',
        lang === 'vi'
          ? 'Vui lòng đăng nhập để truy cập trang quản trị ProCMS.'
          : 'Please sign in to access the ProCMS administration dashboard.'
      );
    }
  }, [lang]);

  // Auto focus first OTP input when transitioning to 2FA step
  useEffect(() => {
    if (is2FaStep && !isBackupCodeMode) {
      setTimeout(() => {
        otpInputs.current[0]?.focus();
      }, 100);
    }
  }, [is2FaStep, isBackupCodeMode]);

  // Lockout countdown timer
  useEffect(() => {
    if (lockoutSeconds <= 0) return;
    const timer = setInterval(() => {
      setLockoutSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [lockoutSeconds]);

  // Trigger shake animation on error
  const triggerShake = () => {
    setShakeCard(true);
    setTimeout(() => setShakeCard(false), 500);
  };

  // Caps Lock detection on password input
  const checkCapsLock = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.getModifierState) {
      setCapsLockActive(e.getModifierState('CapsLock'));
    }
  };

  // Complete login & redirect
  const finalizeLogin = (
    user: any,
    method: 'Password' | '2FA (TOTP)' | '2FA (Backup Code)',
    tokens?: { accessToken?: string; refreshToken?: string }
  ) => {
    const isSuper = Boolean(user.isSuperAdmin || user.role === 'Administrator' || user.roleName === 'Administrator');
    const token = tokens?.accessToken || (typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN) : '') || '';
    const jwtPerms = token ? extractPermissionsFromToken(token) : [];
    const finalUser = {
      id: user.id || 1,
      fullName: user.fullName || 'System Administrator',
      email: user.email,
      roleName: user.roleName || user.role || 'Administrator',
      roleSlug: user.roleSlug || (isSuper ? 'admin' : 'staff'),
      isSuperAdmin: isSuper,
      twoFactorEnabled: Boolean(user.twoFactorEnabled),
      permissions: jwtPerms.length > 0 ? jwtPerms : (user.permissions || (isSuper ? ['*'] : ['posts:*', 'categories:*', 'stores:*', 'offers:*'])),
      authMethod: method,
    };

    authService.saveSession(token, tokens?.refreshToken, finalUser);

    setLoading(false);
    setVerifiedSuccess(true);

    showToast(
      'success',
      lang === 'vi' ? 'Đăng nhập thành công!' : 'Authentication Successful',
      lang === 'vi'
        ? method === 'Password'
          ? 'Đăng nhập thành công. Đang chuyển hướng...'
          : 'Xác thực 2FA hợp lệ! Đang mở bảng điều khiển...'
        : method === 'Password'
        ? 'Direct access granted. Redirecting...'
        : '2FA security verified! Entering workspace...'
    );

    setTimeout(() => {
      router.push(ROUTES.ADMIN.DASHBOARD);
    }, 800);
  };

  // ==========================================
  // AUTO VERIFY 2FA ON COMPLETION OF 6TH DIGIT
  // ==========================================
  const verifyOtpCode = async (code: string) => {
    setHasOtpError(false);
    setLoading(true);

    const activeTempToken = tempToken || (typeof window !== 'undefined' ? localStorage.getItem('admin:tempToken') : '') || '';

    try {
      const res = await authService.verify2Fa(activeTempToken, parseInt(code, 10));
      if (res.accessToken && res.user) {
        finalizeLogin(res.user, '2FA (TOTP)', { accessToken: res.accessToken, refreshToken: res.refreshToken });
      } else {
        throw new Error('Missing token in verification response.');
      }
    } catch (err: any) {
      setLoading(false);
      setHasOtpError(true);
      triggerShake();

      const errMsg =
        err?.response?.data?.message ||
        err?.message ||
        (lang === 'vi'
          ? 'Mã xác thực không đúng hoặc đã hết hạn. Vui lòng kiểm tra lại Google Authenticator.'
          : 'The 6-digit code does not match or has expired. Please check your authenticator app.');

      showToast(
        'error',
        lang === 'vi' ? 'Mã 2FA không chính xác' : 'Invalid 2FA Code',
        errMsg
      );

      // Reset digits and focus first
      setOtp(['', '', '', '', '', '']);
      otpInputs.current[0]?.focus();
    }
  };

  // Handle OTP digit change & AUTO SUBMIT when 6 digits filled
  const handleOtpChange = (index: number, val: string) => {
    const digit = val.slice(-1);
    if (!/^\d*$/.test(digit)) return;

    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);
    setHasOtpError(false);

    // Auto advance focus
    if (digit && index < 5) {
      otpInputs.current[index + 1]?.focus();
    }

    // Auto verify as soon as the 6th digit is entered
    const fullCode = newOtp.join('');
    if (fullCode.length === 6) {
      verifyOtpCode(fullCode);
    }
  };

  // Handle backspace navigation in OTP
  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpInputs.current[index - 1]?.focus();
    }
  };

  // Handle OTP paste & auto verify if 6 digits
  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pasted) return;

    const newOtp = [...otp];
    for (let i = 0; i < 6; i++) {
      newOtp[i] = pasted[i] || '';
    }
    setOtp(newOtp);
    setHasOtpError(false);

    if (pasted.length === 6) {
      verifyOtpCode(pasted);
    } else {
      const nextFocus = Math.min(pasted.length, 5);
      otpInputs.current[nextFocus]?.focus();
    }
  };

  // ==========================================
  // STEP 1: VALIDATE CREDENTIALS & CHECK 2FA
  // ==========================================
  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (lockoutSeconds > 0) {
      showToast(
        'warning',
        lang === 'vi' ? 'Tài khoản đang bị khóa tạm thời' : 'Account Temporarily Locked',
        lang === 'vi'
          ? `Vui lòng đợi ${lockoutSeconds} giây trước khi thử lại.`
          : `Please wait ${lockoutSeconds} seconds before trying again.`
      );
      return;
    }

    setHasEmailError(false);
    setHasPasswordError(false);

    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password;

    // 1. Validate Email Presence
    if (!cleanEmail) {
      setHasEmailError(true);
      triggerShake();
      showToast(
        'error',
        lang === 'vi' ? 'Email không được để trống' : 'Email Required',
        lang === 'vi'
          ? 'Vui lòng nhập địa chỉ email nhân sự của bạn.'
          : 'Please enter your corporate email address.'
      );
      return;
    }

    // 2. Validate Email Format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      setHasEmailError(true);
      triggerShake();
      showToast(
        'error',
        lang === 'vi' ? 'Định dạng email không hợp lệ' : 'Invalid Email Format',
        lang === 'vi'
          ? 'Email phải có định dạng chuẩn (Ví dụ: admin@heygoodly.com).'
          : 'Email must follow standard format (e.g. admin@heygoodly.com).'
      );
      return;
    }

    // 3. Validate Password Presence
    if (!cleanPassword) {
      setHasPasswordError(true);
      triggerShake();
      showToast(
        'error',
        lang === 'vi' ? 'Mật khẩu không được để trống' : 'Password Required',
        lang === 'vi'
          ? 'Vui lòng nhập mật khẩu tài khoản của bạn.'
          : 'Please enter your account password.'
      );
      return;
    }

    setLoading(true);

    try {
      // Call Real Backend Login API
      const res = await authService.login(cleanEmail, cleanPassword);
      setFailedAttempts(0);

      // Check if 2FA step is required
      if (res.requiresTwoFactor && res.tempToken) {
        setTempToken(res.tempToken);
        setPendingUser({
          id: 0,
          fullName: cleanEmail,
          email: cleanEmail,
          role: 'Staff',
          isSuperAdmin: false,
          isActive: true,
          twoFactorEnabled: true,
          createdAt: new Date().toLocaleDateString(),
        });
        setIs2FaStep(true);
        setLoading(false);
        showToast(
          'info',
          lang === 'vi' ? 'Yêu cầu xác thực 2FA' : '2FA Verification Required',
          lang === 'vi'
            ? 'Tài khoản yêu cầu mã OTP bảo mật. Vui lòng nhập mã từ Google Authenticator.'
            : 'Two-factor authentication required. Please enter your authenticator code.'
        );
        return;
      }

      // Direct login successful
      if (res.accessToken && res.user) {
        finalizeLogin(res.user, 'Password', { accessToken: res.accessToken, refreshToken: res.refreshToken });
      } else {
        throw new Error('Authentication response missing accessToken.');
      }
    } catch (err: any) {
      setLoading(false);
      const errMsg = err?.response?.data?.message || err?.message || 'Authentication failed.';
      const nextFailed = failedAttempts + 1;
      setFailedAttempts(nextFailed);
      setHasPasswordError(true);
      triggerShake();

      if (nextFailed >= 5) {
        setLockoutSeconds(30);
        showToast(
          'warning',
          lang === 'vi' ? 'Bảo mật: Tạm khóa 30 giây' : 'Security Lockout Active',
          lang === 'vi'
            ? 'Tài khoản tạm thời bị khóa do nhập sai mật khẩu quá 5 lần. Vui lòng chờ 30 giây.'
            : 'Account locked for 30 seconds due to 5 consecutive failed password attempts.'
        );
      } else {
        const remaining = 5 - nextFailed;
        showToast(
          'error',
          lang === 'vi' ? 'Đăng nhập không thành công' : 'Authentication Failed',
          `${errMsg} (${remaining} ${lang === 'vi' ? 'lần thử còn lại' : 'attempts remaining'})`
        );
      }
    }
  };

  // Backup Recovery Code submit handler
  const handleBackupCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const cleanBackup = backupCode.trim().toUpperCase();
    if (!cleanBackup) {
      setHasOtpError(true);
      triggerShake();
      showToast(
        'error',
        lang === 'vi' ? 'Mã dự phòng không được để trống' : 'Recovery Code Required',
        lang === 'vi'
          ? 'Vui lòng nhập mã sao lưu phục hồi 8 ký tự.'
          : 'Please enter your 8-character recovery backup code.'
      );
      return;
    }

    if (cleanBackup.length < 8) {
      setHasOtpError(true);
      triggerShake();
      showToast(
        'error',
        lang === 'vi' ? 'Định dạng mã phục hồi không đúng' : 'Invalid Recovery Code',
        lang === 'vi'
          ? 'Mã phục hồi không hợp lệ. Định dạng mẫu: 8A41-92F0.'
          : 'Invalid recovery code format. Expected format: 8A41-92F0.'
      );
      return;
    }

    setLoading(true);
    const activeTempToken = tempToken || (typeof window !== 'undefined' ? localStorage.getItem('admin:tempToken') : '') || '';

    try {
      const res = await authService.verify2Fa(activeTempToken, undefined, cleanBackup);
      if (res.accessToken && res.user) {
        finalizeLogin(res.user, '2FA (Backup Code)', { accessToken: res.accessToken, refreshToken: res.refreshToken });
      } else {
        throw new Error('Missing token in recovery response.');
      }
    } catch (err: any) {
      setLoading(false);
      setHasOtpError(true);
      triggerShake();

      const errMsg =
        err?.response?.data?.message ||
        err?.message ||
        (lang === 'vi'
          ? 'Mã phục hồi không hợp lệ hoặc đã qua sử dụng. Vui lòng thử mã khác.'
          : 'Invalid or already used backup code. Please try another code.');

      showToast(
        'error',
        lang === 'vi' ? 'Mã phục hồi không chính xác' : 'Invalid Recovery Code',
        errMsg
      );
    }
  };

  return (
    <div className="min-h-screen bg-[#07090E] relative overflow-hidden flex items-center justify-center p-4 selection:bg-indigo-500 selection:text-white">
      {/* =========================================================
          FLOATING TOAST NOTIFICATION STACK (TOP-RIGHT)
          ========================================================= */}
      <div className="fixed top-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-2xl backdrop-blur-2xl border shadow-2xl transition-all duration-300 animate-in fade-in slide-in-from-top-4 ${
              toast.type === 'error'
                ? 'bg-[#18111A]/95 border-rose-500/40 text-rose-100 shadow-rose-950/50'
                : toast.type === 'success'
                ? 'bg-[#0E1A17]/95 border-emerald-500/40 text-emerald-100 shadow-emerald-950/50'
                : toast.type === 'warning'
                ? 'bg-[#1C1811]/95 border-amber-500/40 text-amber-100 shadow-amber-950/50'
                : 'bg-[#101426]/95 border-indigo-500/40 text-indigo-100 shadow-indigo-950/50'
            }`}
          >
            <div className="flex-shrink-0 mt-0.5">
              {toast.type === 'error' && <AlertCircle size={18} className="text-rose-400" />}
              {toast.type === 'success' && <CheckCircle2 size={18} className="text-emerald-400" />}
              {toast.type === 'warning' && <AlertTriangle size={18} className="text-amber-400" />}
              {toast.type === 'info' && <Info size={18} className="text-indigo-400" />}
            </div>

            <div className="flex-1 min-w-0 pr-1">
              <h4 className="text-xs font-bold leading-snug">{toast.title}</h4>
              {toast.description && (
                <p className="text-[11px] opacity-80 mt-0.5 leading-relaxed break-words">
                  {toast.description}
                </p>
              )}
            </div>

            <button
              type="button"
              onClick={() => removeToast(toast.id)}
              className="flex-shrink-0 text-slate-400 hover:text-white transition-colors p-0.5 rounded cursor-pointer"
              aria-label="Close notification"
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>

      {/* Dynamic ambient background lighting */}
      <div className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-[550px] h-[550px] bg-violet-600/18 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-blue-600/5 rounded-full blur-[180px] pointer-events-none" />

      {/* Grid pattern overlay */}
      <div
        className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff04_1px,transparent_1px),linear-gradient(to_bottom,#ffffff04_1px,transparent_1px)] bg-[size:3.5rem_3.5rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none"
      />

      {/* Main Login Card */}
      <div
        className={`relative w-full max-w-[430px] bg-[#0E131F]/90 backdrop-blur-2xl border border-slate-800/80 rounded-3xl p-7 sm:p-9 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.7)] space-y-6 before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-indigo-500/60 before:to-transparent before:rounded-t-3xl transition-transform duration-200 ${
          shakeCard ? 'translate-x-[-6px] animate-pulse' : ''
        }`}
      >
        {/* Top Bar: Language Switcher & Step Indicator */}
        <div className="flex items-center justify-between">
          {/* Step Indicator */}
          <div className="flex items-center gap-1.5">
            <div
              className={`h-1.5 rounded-full transition-all duration-300 ${
                !is2FaStep ? 'w-8 bg-indigo-500' : 'w-2 bg-indigo-500/40'
              }`}
            />
            <div
              className={`h-1.5 rounded-full transition-all duration-300 ${
                is2FaStep ? 'w-8 bg-indigo-500' : 'w-2 bg-slate-800'
              }`}
            />
          </div>

          {/* Bilingual Toggle */}
          <button
            type="button"
            onClick={() => setLang(lang === 'vi' ? 'en' : 'vi')}
            className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-400 hover:text-slate-200 bg-slate-900/80 px-2 py-0.5 rounded-full border border-slate-800 transition-colors cursor-pointer"
            title="Switch Language (VI / EN)"
          >
            <Languages size={12} className="text-indigo-400" />
            <span>{lang === 'vi' ? 'VI' : 'EN'}</span>
          </button>
        </div>

        {/* Brand Emblem & Header */}
        <div className="text-center space-y-3">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-gradient-to-br from-indigo-500/20 via-violet-500/15 to-transparent border border-indigo-500/30 flex items-center justify-center text-indigo-400 shadow-lg shadow-indigo-500/10">
            {is2FaStep ? (
              <Smartphone size={24} className="text-indigo-400 animate-pulse" />
            ) : (
              <ShieldCheck size={24} className="text-indigo-400" />
            )}
          </div>

          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-[11px] font-semibold tracking-wider uppercase">
              <Sparkles size={11} className="text-indigo-400" />
              <span>
                {is2FaStep
                  ? lang === 'vi'
                    ? 'Bước 2: Xác thực 2FA'
                    : 'Step 2: Two-Factor Auth'
                  : 'ProCMS Workspace'}
              </span>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              {is2FaStep
                ? lang === 'vi'
                  ? 'Mã bảo mật 2FA'
                  : '2FA Security Code'
                : lang === 'vi'
                ? 'Đăng nhập ProCMS'
                : 'Sign In to ProCMS'}
            </h1>
            <p className="text-xs text-slate-400 leading-relaxed max-w-xs mx-auto">
              {is2FaStep
                ? lang === 'vi'
                  ? `Nhập đủ 6 số mã xác thực để tự động đăng nhập.`
                  : `Enter all 6 digits to verify and sign in automatically.`
                : lang === 'vi'
                ? 'Cổng quản trị nội dung & affiliate với kiểm tra cấu hình 2FA tự động'
                : 'Enterprise content & affiliate portal with automatic 2FA configuration check'}
            </p>
          </div>
        </div>

        {/* Lockout Countdown Alert */}
        {lockoutSeconds > 0 && (
          <div className="p-3 bg-amber-500/10 border border-amber-500/25 rounded-2xl text-amber-300 text-xs flex items-center justify-between animate-pulse">
            <div className="flex items-center gap-2">
              <AlertTriangle size={16} className="text-amber-400" />
              <span>
                {lang === 'vi'
                  ? `Khóa tạm thời: Thử lại sau ${lockoutSeconds}s`
                  : `Locked: Retry in ${lockoutSeconds}s`}
              </span>
            </div>
            <RotateCcw size={14} className="animate-spin text-amber-400" />
          </div>
        )}

        {!is2FaStep ? (
          /* =========================================================
             STEP 1: EMAIL & PASSWORD (CLEAN INPUTS, TOAST REPORTING)
             ========================================================= */
          <form onSubmit={handleCredentialsSubmit} className="space-y-4" noValidate>
            {/* Email Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300 block">
                {lang === 'vi' ? 'Địa chỉ Email' : 'Email Address'}
              </label>
              <div className="relative group">
                <Mail
                  className={`absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors ${
                    hasEmailError
                      ? 'text-rose-400'
                      : 'text-slate-400 group-focus-within:text-indigo-400'
                  }`}
                  size={16}
                />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (hasEmailError) setHasEmailError(false);
                  }}
                  placeholder="admin@heygoodly.com"
                  className={`w-full pl-10 pr-4 py-2.5 bg-[#080B14]/80 rounded-xl text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none transition-all duration-200 ${
                    hasEmailError
                      ? 'border border-rose-500/80 ring-2 ring-rose-500/20'
                      : 'border border-slate-800 focus:border-indigo-500/80 focus:ring-4 focus:ring-indigo-500/15'
                  }`}
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-slate-300 block">
                  {lang === 'vi' ? 'Mật khẩu' : 'Password'}
                </label>
                {capsLockActive && (
                  <span className="text-[10px] text-amber-400 font-semibold flex items-center gap-1 animate-pulse">
                    <AlertTriangle size={11} /> Caps Lock ON
                  </span>
                )}
              </div>
              <div className="relative group">
                <Lock
                  className={`absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors ${
                    hasPasswordError
                      ? 'text-rose-400'
                      : 'text-slate-400 group-focus-within:text-indigo-400'
                  }`}
                  size={16}
                />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (hasPasswordError) setHasPasswordError(false);
                  }}
                  onKeyDown={checkCapsLock}
                  onKeyUp={checkCapsLock}
                  placeholder="••••••••••••"
                  className={`w-full pl-10 pr-10 py-2.5 bg-[#080B14]/80 rounded-xl text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none transition-all duration-200 font-mono tracking-wider ${
                    hasPasswordError
                      ? 'border border-rose-500/80 ring-2 ring-rose-500/20'
                      : 'border border-slate-800 focus:border-indigo-500/80 focus:ring-4 focus:ring-indigo-500/15'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 p-1 rounded-md transition-colors focus:outline-none cursor-pointer"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Remember Device Option */}
            <div className="flex items-center justify-between pt-0.5">
              <label className="inline-flex items-center gap-2 cursor-pointer select-none text-xs text-slate-400 hover:text-slate-300 transition-colors">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-3.5 h-3.5 rounded border-slate-700 bg-slate-900 text-indigo-600 focus:ring-indigo-500 focus:ring-offset-0 cursor-pointer"
                />
                <span>{lang === 'vi' ? 'Ghi nhớ thiết bị này' : 'Remember this device'}</span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || lockoutSeconds > 0}
              className="w-full py-3 px-4 bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 hover:from-indigo-500 hover:to-violet-500 active:scale-[0.99] text-white font-semibold text-sm rounded-xl shadow-lg shadow-indigo-600/25 hover:shadow-indigo-600/40 transition-all duration-200 flex items-center justify-center gap-2 group cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed mt-2"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>
                    {lang === 'vi'
                      ? 'Đang kiểm tra tài khoản & 2FA...'
                      : 'Checking account & 2FA status...'}
                  </span>
                </>
              ) : (
                <>
                  <span>
                    {lang === 'vi'
                      ? 'Đăng nhập vào hệ thống'
                      : 'Sign In to Workspace'}
                  </span>
                  <ArrowRight
                    size={16}
                    className="group-hover:translate-x-0.5 transition-transform duration-200"
                  />
                </>
              )}
            </button>
          </form>
        ) : (
          /* =========================================================
             STEP 2: 2FA WITH AUTO-SUBMIT & TOAST FEEDBACK
             ========================================================= */
          <div className="space-y-4 animate-in fade-in slide-in-from-right-2 duration-300">
            {/* Account Profile Preview Badge */}
            {pendingUser && (
              <div className="flex items-center gap-3 p-2.5 rounded-2xl bg-slate-950/70 border border-slate-800">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-300 font-bold overflow-hidden flex-shrink-0">
                  {pendingUser.avatar ? (
                    <Image
                      src={pendingUser.avatar}
                      alt={pendingUser.fullName}
                      width={40}
                      height={40}
                      className="w-full h-full object-cover"
                      unoptimized
                    />
                  ) : (
                    <span>{pendingUser.fullName.charAt(0)}</span>
                  )}
                </div>
                <div className="min-w-0 flex-1 text-left">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-semibold text-white truncate">
                      {pendingUser.fullName}
                    </span>
                    <span className="inline-flex items-center px-1.5 py-0.2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded text-[10px] font-medium">
                      2FA Active
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 truncate">{pendingUser.email}</p>
                </div>
                <UserCheck size={16} className="text-indigo-400 flex-shrink-0 mr-1" />
              </div>
            )}

            {!isBackupCodeMode ? (
              /* TOTP 6-Digit Mode (AUTO SUBMITS ON 6TH DIGIT) */
              <div className="space-y-2">
                <label className="text-xs font-medium text-slate-300 block">
                  {lang === 'vi' ? 'Mã Google Authenticator (6 số)' : 'Authenticator 6-Digit Code'}
                </label>

                <div
                  className="grid grid-cols-6 gap-2 sm:gap-2.5 pt-1"
                  onPaste={handleOtpPaste}
                >
                  {otp.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={(el) => {
                        otpInputs.current[idx] = el;
                      }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      disabled={loading || verifiedSuccess}
                      value={digit}
                      onChange={(e) => handleOtpChange(idx, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                      className={`w-full aspect-square text-center font-mono text-xl font-bold bg-[#080B14]/90 rounded-xl text-white focus:outline-none transition-all duration-150 selection:bg-transparent ${
                        hasOtpError
                          ? 'border border-rose-500 ring-2 ring-rose-500/20'
                          : 'border border-slate-800 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20'
                      }`}
                    />
                  ))}
                </div>

                <p className="text-[11px] text-slate-500 text-center pt-1">
                  {lang === 'vi'
                    ? '💡 Nhập đủ 6 số hệ thống sẽ tự động xác thực và đăng nhập.'
                    : '💡 System will auto-verify as soon as the 6th digit is entered.'}
                </p>
              </div>
            ) : (
              /* Backup Recovery Code Mode */
              <form noValidate onSubmit={handleBackupCodeSubmit} className="space-y-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-300 block">
                    {lang === 'vi' ? 'Mã sao lưu phục hồi (Backup Code)' : 'Backup Recovery Code'}
                  </label>
                  <div className="relative group">
                    <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input
                      type="text"
                      value={backupCode}
                      onChange={(e) => {
                        setBackupCode(e.target.value);
                        setHasOtpError(false);
                      }}
                      placeholder="8A41-92F0"
                      className={`w-full pl-10 pr-4 py-2.5 bg-[#080B14]/80 rounded-xl text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none font-mono uppercase tracking-widest ${
                        hasOtpError
                          ? 'border border-rose-500 ring-2 ring-rose-500/20'
                          : 'border border-slate-800 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20'
                      }`}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-xl shadow transition-all cursor-pointer"
                >
                  {lang === 'vi' ? 'Xác thực mã dự phòng' : 'Verify Backup Code'}
                </button>
              </form>
            )}

            {/* Toggle between TOTP and Backup Code */}
            <div className="text-right">
              <button
                type="button"
                onClick={() => {
                  setIsBackupCodeMode(!isBackupCodeMode);
                  setHasOtpError(false);
                }}
                className="text-[11px] text-indigo-400 hover:text-indigo-300 hover:underline cursor-pointer"
              >
                {isBackupCodeMode
                  ? lang === 'vi'
                    ? '← Sử dụng ứng dụng Google Authenticator'
                    : '← Use Google Authenticator app'
                  : lang === 'vi'
                  ? 'Mất điện thoại? Nhập mã sao lưu dự phòng'
                  : 'Lost phone? Enter backup recovery code'}
              </button>
            </div>

            {/* Loading Indicator when Auto-Verifying */}
            {loading && (
              <div className="flex items-center justify-center gap-2 py-2 text-xs text-indigo-300 animate-pulse">
                <Loader2 size={15} className="animate-spin" />
                <span>
                  {lang === 'vi'
                    ? 'Đang tự động xác thực mã 2FA...'
                    : 'Auto-verifying 2FA code...'}
                </span>
              </div>
            )}

            {/* Back Button */}
            <div className="text-center pt-1 border-t border-slate-800/60">
              <button
                type="button"
                onClick={() => {
                  setIs2FaStep(false);
                  setPendingUser(null);
                  setHasOtpError(false);
                  setOtp(['', '', '', '', '', '']);
                }}
                className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors cursor-pointer pt-2"
              >
                <ArrowLeft size={14} />
                <span>
                  {lang === 'vi'
                    ? 'Quay lại chỉnh sửa email & mật khẩu'
                    : 'Back to email & password'}
                </span>
              </button>
            </div>
          </div>
        )}

        {/* Security Trust Footer */}
        <div className="pt-2 border-t border-slate-800/60 flex items-center justify-center gap-2 text-[11px] text-slate-500">
          <Lock size={12} className="text-slate-500" />
          <span>256-bit Encrypted • ProCMS Enterprise Security</span>
        </div>

      </div>
    </div>
  );
}
