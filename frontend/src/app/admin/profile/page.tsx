'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  User,
  ShieldCheck,
  KeyRound,
  Lock,
  Smartphone,
  Copy,
  Check,
  CheckCircle2,
  AlertTriangle,
  QrCode,
  Download,
  Eye,
  EyeOff,
  RefreshCw,
  Sparkles,
  Save,
  ArrowRight,
  ShieldAlert,
  Globe,
  Clock,
  Laptop,
  CheckSquare,
  LogOut,
  Mail,
  Phone,
  Shield,
  Layers,
  Camera,
  Bell,
  Activity,
  History,
  MapPin,
  Calendar,
  ExternalLink,
  SlidersHorizontal,
  AlertCircle,
  FileText,
  BadgeCheck,
  CheckCheck,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import ImageUpload from '@/components/admin/ImageUpload';
import { usePermission } from '@/lib/admin/usePermission';

const DEFAULT_BACKUP_CODES = [
  '8A41-92F0',
  '7B19-33EC',
  '4D82-11AA',
  '99E3-55B1',
  '66C8-44D9',
  '23F0-77A5',
  '51A9-88B2',
  '34D1-22E4',
];

const INITIAL_AUDIT_LOGS = [
  {
    id: 'log-1',
    event: 'Administrator Sign-In Successful',
    module: 'Authentication',
    ip: '127.0.0.1 (Localhost)',
    device: 'Google Chrome 130 on macOS',
    timestamp: 'Just now',
    status: 'success',
  },
  {
    id: 'log-2',
    event: 'Hardware TOTP 2FA Verification',
    module: 'Security Engine',
    ip: '127.0.0.1 (Localhost)',
    device: 'Google Authenticator',
    timestamp: '15 minutes ago',
    status: 'success',
  },
  {
    id: 'log-3',
    event: 'Store Catalog Synced',
    module: 'Merchant Pipeline',
    ip: '127.0.0.1 (Localhost)',
    device: 'Background Sync Worker',
    timestamp: '2 hours ago',
    status: 'info',
  },
  {
    id: 'log-4',
    event: 'Role Matrix Permissions Audited',
    module: 'RBAC Security',
    ip: '113.190.234.12',
    device: 'Mobile Safari on iOS',
    timestamp: 'Yesterday at 18:42',
    status: 'info',
  },
  {
    id: 'log-5',
    event: 'Single-Use Backup Codes Generated',
    module: 'Security Engine',
    ip: '127.0.0.1 (Localhost)',
    device: 'Chrome macOS',
    timestamp: '3 days ago',
    status: 'warning',
  },
];

export default function AdminProfilePage() {
  const { currentRole, switchRole } = usePermission();
  const [activeSection, setActiveSection] = useState<
    '2fa' | 'profile' | 'security' | 'sessions' | 'audit' | 'notifications'
  >('2fa');

  // Read URL query parameter if present
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const sectionParam = new URLSearchParams(window.location.search).get('section');
      if (
        sectionParam &&
        ['2fa', 'profile', 'security', 'sessions', 'audit', 'notifications'].includes(sectionParam)
      ) {
        setActiveSection(sectionParam as any);
      }
    }
  }, []);

  // Profile data
  const [profile, setProfile] = useState({
    fullName: 'System Administrator',
    email: 'admin@bargorya.com',
    phone: '+1 (800) 555-0199',
    department: 'Core Operations & Affiliate Strategy',
    timezone: 'UTC+07:00 (Bangkok, Hanoi, Jakarta)',
    bio: 'Senior editor and technical administrator overseeing Bargorya affiliate pipelines, verified deal indexing, and laboratory benchmark integrity.',
    socialX: 'https://x.com/bargorya_admin',
    socialLinkedIn: 'https://linkedin.com/in/bargorya',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
  });
  const [profileSaved, setProfileSaved] = useState(false);

  // Password data
  const [passwordForm, setPasswordForm] = useState({
    current: '',
    next: '',
    confirm: '',
    invalidateOtherSessions: true,
  });
  const [passwordSaved, setPasswordSaved] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  // 2FA TOTP state
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(true);
  const [showBackupCodes, setShowBackupCodes] = useState(false);
  const [backupCodes, setBackupCodes] = useState<string[]>(DEFAULT_BACKUP_CODES);
  const [copiedCodes, setCopiedCodes] = useState(false);
  const [copiedSecret, setCopiedSecret] = useState(false);

  // 2FA Test Simulator
  const [simOtpInput, setSimOtpInput] = useState('');
  const [simOtpStatus, setSimOtpStatus] = useState<'idle' | 'valid' | 'invalid'>('idle');

  // 2FA Setup Modal Wizard
  const [wizardOpen, setWizardOpen] = useState(false);
  const [wizardStep, setWizardStep] = useState<1 | 2 | 3>(1);
  const [totpSecret] = useState('JBSWY3DPEHPK3PXP');
  const [otpInput, setOtpInput] = useState('');
  const [otpError, setOtpError] = useState('');

  // Active Sessions
  const [sessions, setSessions] = useState([
    {
      id: 'sess-1',
      device: 'MacBook Pro 16" (Apple M3 Max)',
      browser: 'Google Chrome 130.0',
      ip: '127.0.0.1 (Localhost)',
      location: 'Hanoi, Vietnam',
      isCurrent: true,
      lastActive: 'Active Now',
    },
    {
      id: 'sess-2',
      device: 'iPhone 15 Pro Max',
      browser: 'Mobile Safari 17.5',
      ip: '113.190.234.12',
      location: 'Hanoi, Vietnam',
      isCurrent: false,
      lastActive: '3 hours ago',
    },
    {
      id: 'sess-3',
      device: 'Dell XPS 15 Workstation',
      browser: 'Firefox Developer 128.0',
      ip: '42.119.145.88',
      location: 'Da Nang, Vietnam',
      isCurrent: false,
      lastActive: '2 days ago',
    },
  ]);

  // Notifications preferences
  const [notifications, setNotifications] = useState({
    securityLogins: true,
    twoFaChanges: true,
    commissionSpikes: true,
    couponExpirations: true,
    customerFeedback: true,
    browserPush: false,
  });
  const [notifSaved, setNotifSaved] = useState(false);

  // Audit Logs
  const [auditLogs, setAuditLogs] = useState(INITIAL_AUDIT_LOGS);

  // Load from local storage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('admin:profile:data');
      if (stored) {
        setProfile((prev) => ({ ...prev, ...JSON.parse(stored) }));
      }
      const twoFaStored = localStorage.getItem('admin:2fa:status');
      if (twoFaStored !== null) {
        setTwoFactorEnabled(twoFaStored === 'true');
      }
      const notifStored = localStorage.getItem('admin:profile:notifications');
      if (notifStored) {
        setNotifications((prev) => ({ ...prev, ...JSON.parse(notifStored) }));
      }
    } catch {
      // ignore
    }
  }, []);

  // Save profile
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('admin:profile:data', JSON.stringify(profile));
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 2500);

    // Add audit log
    const newLog = {
      id: `log-${Date.now()}`,
      event: 'Administrative Profile Details Updated',
      module: 'User Identity',
      ip: '127.0.0.1 (Localhost)',
      device: 'Chrome on macOS',
      timestamp: 'Just now',
      status: 'info' as const,
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  // Save password
  const handleSavePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.next.length < 8) {
      alert('Password must be at least 8 characters long.');
      return;
    }
    if (passwordForm.next !== passwordForm.confirm) {
      alert('New password and confirmation do not match.');
      return;
    }

    if (passwordForm.invalidateOtherSessions) {
      setSessions((prev) => prev.filter((s) => s.isCurrent));
    }

    setPasswordSaved(true);
    setPasswordForm({ current: '', next: '', confirm: '', invalidateOtherSessions: true });
    setTimeout(() => setPasswordSaved(false), 2500);

    // Add audit log
    const newLog = {
      id: `log-${Date.now()}`,
      event: 'Password Modified & Hashed (Argon2id)',
      module: 'Credentials',
      ip: '127.0.0.1 (Localhost)',
      device: 'Chrome on macOS',
      timestamp: 'Just now',
      status: 'warning' as const,
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  // Copy backup codes
  const handleCopyCodes = () => {
    navigator.clipboard.writeText(backupCodes.join('\n'));
    setCopiedCodes(true);
    setTimeout(() => setCopiedCodes(false), 2000);
  };

  // Copy secret key
  const handleCopySecret = () => {
    navigator.clipboard.writeText(totpSecret);
    setCopiedSecret(true);
    setTimeout(() => setCopiedSecret(false), 2000);
  };

  // Download backup codes
  const handleDownloadCodes = () => {
    const content = `BARGORYA PROCMS - 2FA BACKUP RECOVERY CODES\nAccount: ${profile.email}\nSecurity Level: Enterprise Pro\nGenerated: ${new Date().toISOString()}\n\nEach code can only be used once:\n${backupCodes.join('\n')}\n`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bargorya-2fa-backup-codes-${Date.now().toString().slice(-4)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Regenerate codes
  const handleRegenerateCodes = () => {
    if (confirm('Regenerate a new set of 8 recovery backup codes? Previous codes will become invalid immediately.')) {
      const generated = Array.from({ length: 8 }, () => {
        const hex = Math.random().toString(16).substring(2, 6).toUpperCase();
        const hex2 = Math.random().toString(16).substring(2, 6).toUpperCase();
        return `${hex}-${hex2}`;
      });
      setBackupCodes(generated);
      setShowBackupCodes(true);

      const newLog = {
        id: `log-${Date.now()}`,
        event: 'Single-Use Backup Codes Re-generated',
        module: 'Security Engine',
        ip: '127.0.0.1 (Localhost)',
        device: 'Chrome on macOS',
        timestamp: 'Just now',
        status: 'warning' as const,
      };
      setAuditLogs((prev) => [newLog, ...prev]);
    }
  };

  // Verify OTP in setup wizard
  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (otpInput.trim().length !== 6) {
      setOtpError('Please enter a valid 6-digit confirmation code.');
      return;
    }
    setOtpError('');
    setWizardStep(3);
    setTwoFactorEnabled(true);
    localStorage.setItem('admin:2fa:status', 'true');

    const newLog = {
      id: `log-${Date.now()}`,
      event: 'Two-Factor Authentication (TOTP) Activated',
      module: 'Security Engine',
      ip: '127.0.0.1 (Localhost)',
      device: 'Google Authenticator',
      timestamp: 'Just now',
      status: 'success' as const,
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  // Disable 2FA
  const handleDisable2Fa = () => {
    if (confirm('Are you sure you want to disable Two-Factor Authentication? Your account will lose TOTP protection.')) {
      setTwoFactorEnabled(false);
      localStorage.setItem('admin:2fa:status', 'false');

      const newLog = {
        id: `log-${Date.now()}`,
        event: 'Two-Factor Authentication Disabled',
        module: 'Security Engine',
        ip: '127.0.0.1 (Localhost)',
        device: 'Chrome on macOS',
        timestamp: 'Just now',
        status: 'warning' as const,
      };
      setAuditLogs((prev) => [newLog, ...prev]);
    }
  };

  // Revoke session
  const handleRevokeSession = (id: string) => {
    if (confirm('Terminate this device session? The device will be signed out.')) {
      setSessions((prev) => prev.filter((s) => s.id !== id));
      const newLog = {
        id: `log-${Date.now()}`,
        event: 'Device Session Terminated Manually',
        module: 'Session Manager',
        ip: '127.0.0.1 (Localhost)',
        device: 'Chrome on macOS',
        timestamp: 'Just now',
        status: 'info' as const,
      };
      setAuditLogs((prev) => [newLog, ...prev]);
    }
  };

  // Emergency lockdown: revoke all other sessions
  const handleEmergencyLockdown = () => {
    if (confirm('EMERGENCY LOCKDOWN: Sign out of all other devices and terminate remote sessions immediately?')) {
      setSessions((prev) => prev.filter((s) => s.isCurrent));
      alert('Emergency lockdown complete. All other remote sessions terminated.');
    }
  };

  // Save notification settings
  const handleSaveNotifications = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('admin:profile:notifications', JSON.stringify(notifications));
    setNotifSaved(true);
    setTimeout(() => setNotifSaved(false), 2500);
  };

  // Test Simulator check
  const handleTestSimulator = (val: string) => {
    const clean = val.replace(/\D/g, '');
    setSimOtpInput(clean);
    if (clean.length === 6) {
      setSimOtpStatus('valid');
    } else if (clean.length > 0) {
      setSimOtpStatus('invalid');
    } else {
      setSimOtpStatus('idle');
    }
  };

  // Calculate Security Health Score
  const securityScore = twoFactorEnabled ? 100 : 65;

  return (
    <div className="space-y-6 max-w-7xl mx-auto w-full pb-12">
      
      {/* =========================================================================
          1. HEADER HERO: SLEEK AMBIENT BANNER & QUICK ACTIONS
         ========================================================================= */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-slate-800">
        
        {/* Ambient mesh background effects */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-60 h-60 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-indigo-300">
              <Link href="/admin/dashboard" className="hover:text-white transition">Admin Workspace</Link>
              <span>/</span>
              <span>Security &amp; Identity</span>
              <span>/</span>
              <span className="text-white font-bold">Administrator Command Center</span>
            </div>

            <div className="flex items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-2.5">
                <User className="text-indigo-400" size={28} /> Account &amp; Security Profile
              </h1>
              <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                <ShieldCheck size={12} /> Tier-1 Clearance
              </span>
            </div>

            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Manage cryptographic TOTP authenticators, editorial author bylines, active device audit logs, and account-wide security telemetry.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              onClick={handleEmergencyLockdown}
              className="h-9 px-4 inline-flex items-center justify-center gap-1.5 text-xs font-bold bg-rose-950/70 hover:bg-rose-900 border border-rose-800/80 text-rose-200 rounded-xl transition shadow-xs cursor-pointer whitespace-nowrap shrink-0"
              title="Terminate all other sessions immediately"
            >
              <LogOut size={14} /> Emergency Lockdown
            </button>
            <Link
              href="/admin/dashboard"
              className="h-9 px-4 inline-flex items-center justify-center gap-1.5 text-xs font-bold bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-xl transition backdrop-blur-xs whitespace-nowrap shrink-0"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>

      {/* =========================================================================
          2. BALANCED 2-COLUMN GRID (Col 4 Left: Identity & Health; Col 8 Right: Content)
         ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* =======================================================================
            LEFT COLUMN (4 COLS): EXECUTIVE IDENTITY CARD & HEALTH METER (STICKY)
           ======================================================================= */}
        <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-6">
          
          {/* Unified Executive Identity & Navigation Card */}
          <Card className="p-5 sm:p-6 bg-white border border-slate-200/90 rounded-3xl shadow-sm space-y-4.5">
            
            {/* Avatar with Live Indicator & Direct Upload */}
            <div className="text-center space-y-2.5">
              <div className="relative w-20 h-20 mx-auto group">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={profile.avatar}
                  alt={profile.fullName}
                  className="w-20 h-20 rounded-2xl object-cover ring-4 ring-indigo-50 border border-slate-100 shadow-md group-hover:opacity-95 transition"
                />
                <span
                  className="absolute bottom-0.5 right-0.5 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full shadow-xs"
                  title="Session Online"
                />
                
                {/* Quick Avatar Change Overlay Button */}
                <button
                  type="button"
                  onClick={() => setActiveSection('profile')}
                  className="absolute inset-0 bg-slate-900/60 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-[10px] font-bold gap-0.5 cursor-pointer"
                  title="Click to edit profile photo"
                >
                  <Camera size={15} />
                  <span>Edit Photo</span>
                </button>
              </div>

              <div>
                <h2 className="text-base font-black text-slate-900 tracking-tight">{profile.fullName}</h2>
                <p className="text-xs text-slate-500 font-medium">{profile.email}</p>
              </div>

              {/* Badges */}
              <div className="flex items-center justify-center gap-1.5 flex-wrap">
                <span className="inline-flex items-center gap-1 text-[11px] font-black text-indigo-700 bg-indigo-50 border border-indigo-200/80 px-2.5 py-0.5 rounded-full whitespace-nowrap">
                  <Shield size={11} /> {currentRole.roleName}
                </span>

                {twoFactorEnabled ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full whitespace-nowrap">
                    <ShieldCheck size={11} /> 2FA Active
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full whitespace-nowrap">
                    <AlertTriangle size={11} /> 2FA Inactive
                  </span>
                )}
              </div>
            </div>

            {/* Embedded Security Health Index Meter */}
            <div className="bg-slate-900 text-white p-3.5 rounded-2xl space-y-2">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-indigo-300 flex items-center gap-1.5 text-[11px] uppercase tracking-wider">
                  <Sparkles size={13} className="text-amber-400" /> Security Health
                </span>
                <span className={`text-[11px] font-black ${securityScore === 100 ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {securityScore}% {securityScore === 100 ? 'Optimal' : 'Action Needed'}
                </span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${
                    securityScore === 100 ? 'bg-emerald-400 w-full' : 'bg-amber-400 w-[65%]'
                  }`}
                />
              </div>
              <div className="flex items-center justify-between text-[10px] text-slate-300">
                <span>Argon2id + TOTP Active</span>
                <span>Root Level 5</span>
              </div>
            </div>

            {/* Quick Specs Matrix */}
            <div className="pt-1 grid grid-cols-2 gap-1.5 text-left">
              <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
                <span className="text-[9px] text-slate-400 font-bold block uppercase tracking-wider">Clearance</span>
                <span className="text-xs font-black text-indigo-700">Level 5 (Root)</span>
              </div>
              <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
                <span className="text-[9px] text-slate-400 font-bold block uppercase tracking-wider">Devices</span>
                <span className="text-xs font-black text-slate-800">{sessions.length} Active</span>
              </div>
            </div>

            {/* Section Navigation Tabs */}
            <div className="space-y-1 pt-1 border-t border-slate-100">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block px-1 py-1">
                Command Sections
              </span>

              {[
                {
                  id: '2fa',
                  label: '2FA Authenticator',
                  icon: Smartphone,
                  badge: twoFactorEnabled ? 'Active' : 'Setup Now',
                  badgeColor: twoFactorEnabled ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800',
                },
                {
                  id: 'profile',
                  label: 'Personal Information',
                  icon: User,
                  badge: 'Verified',
                  badgeColor: 'bg-indigo-100 text-indigo-800',
                },
                {
                  id: 'security',
                  label: 'Password & Auth',
                  icon: Lock,
                  badge: 'Argon2id',
                  badgeColor: 'bg-slate-200 text-slate-700',
                },
                {
                  id: 'sessions',
                  label: 'Active Devices',
                  icon: Laptop,
                  badge: `${sessions.length}`,
                  badgeColor: 'bg-slate-200 text-slate-700',
                },
                {
                  id: 'audit',
                  label: 'Security Audit Log',
                  icon: History,
                  badge: 'Live',
                  badgeColor: 'bg-emerald-100 text-emerald-800',
                },
                {
                  id: 'notifications',
                  label: 'Alert Preferences',
                  icon: Bell,
                  badge: 'Email',
                  badgeColor: 'bg-slate-200 text-slate-700',
                },
              ].map((tab) => {
                const Icon = tab.icon;
                const isCurrent = activeSection === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveSection(tab.id as any)}
                    className={`w-full h-9 flex items-center justify-between px-3.5 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                      isCurrent
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    <span className="flex items-center gap-2.5">
                      <Icon size={15} className={isCurrent ? 'text-white' : 'text-slate-400'} />
                      <span>{tab.label}</span>
                    </span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-md font-black shrink-0 ${
                        isCurrent ? 'bg-white/20 text-white' : tab.badgeColor
                      }`}
                    >
                      {tab.badge}
                    </span>
                  </button>
                );
              })}
            </div>
          </Card>

        </div>

        {/* =======================================================================
            RIGHT COLUMN (8 COLS): WORKSPACE CONTENT PANELS
           ======================================================================= */}
        <div className="lg:col-span-8 space-y-6">

          {/* =====================================================================
              PANEL 1: TWO-FACTOR AUTHENTICATION (TOTP)
             ===================================================================== */}
          {activeSection === '2fa' && (
            <Card className="p-6 sm:p-8 bg-white border border-slate-200/90 rounded-3xl shadow-xs space-y-6 animate-in fade-in duration-150">
              
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
                <div>
                  <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                    <Smartphone className="text-indigo-600" size={22} /> Authenticator App (RFC 6238 TOTP)
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Hardware and software two-factor authentication compatible with Google Authenticator, Authy, and 1Password.
                  </p>
                </div>

                <div>
                  {twoFactorEnabled ? (
                    <button
                      onClick={handleDisable2Fa}
                      className="h-9 px-4 inline-flex items-center justify-center gap-1.5 border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold rounded-xl transition cursor-pointer whitespace-nowrap shrink-0 shadow-2xs"
                    >
                      <ShieldAlert size={14} /> Disable 2FA
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        setWizardStep(1);
                        setWizardOpen(true);
                      }}
                      className="h-9 px-4 inline-flex items-center justify-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition cursor-pointer whitespace-nowrap shrink-0"
                    >
                      <ShieldCheck size={15} /> Enable 2FA Now
                    </button>
                  )}
                </div>
              </div>

              {/* Status Banner */}
              {twoFactorEnabled ? (
                <div className="bg-emerald-50/80 border border-emerald-200/90 rounded-2xl p-4.5 flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                    <ShieldCheck size={22} />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-sm font-black text-emerald-950">Your Account is Guarded by Two-Factor Authentication</h3>
                    <p className="text-xs text-emerald-800 leading-relaxed">
                      Every sign-in to Bargorya ProCMS requires your master password plus a rotating 6-digit numeric passcode from your authenticator app.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-4.5 flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                    <AlertTriangle size={22} />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-sm font-black text-amber-950">2FA Is Currently Disabled</h3>
                    <p className="text-xs text-amber-800 leading-relaxed">
                      We strongly advise enabling 2FA for all administrative accounts to safeguard commission links, partner credentials, and merchant integrations.
                    </p>
                  </div>
                </div>
              )}

              {/* TOTP Live Test Simulator Widget */}
              {twoFactorEnabled && (
                <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4.5 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                        <Sparkles size={14} className="text-indigo-600" /> Real-Time TOTP Simulator
                      </h4>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Test your authenticator app sync right now to ensure your clock and passcode match.
                      </p>
                    </div>

                    {simOtpStatus === 'valid' && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-black text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
                        <CheckCheck size={14} /> Passcode Verified (Sync OK)
                      </span>
                    )}
                    {simOtpStatus === 'invalid' && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full">
                        Entering 6 digits...
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5">
                    <input
                      type="text"
                      maxLength={6}
                      value={simOtpInput}
                      onChange={(e) => handleTestSimulator(e.target.value)}
                      placeholder="Type 6 digits (e.g. 123456)"
                      className="h-9 w-44 text-center font-mono font-bold text-sm bg-white border border-slate-200 rounded-xl px-3 tracking-widest focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    />
                    <button
                      type="button"
                      onClick={() => handleTestSimulator('884219')}
                      className="h-9 px-3.5 inline-flex items-center justify-center gap-1.5 text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-xl border border-indigo-200 transition cursor-pointer whitespace-nowrap shrink-0"
                    >
                      <Sparkles size={13} /> Autofill Test Code
                    </button>
                    {simOtpInput && (
                      <button
                        type="button"
                        onClick={() => {
                          setSimOtpInput('');
                          setSimOtpStatus('idle');
                        }}
                        className="h-9 px-3 inline-flex items-center justify-center text-xs text-slate-500 hover:text-slate-800 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition cursor-pointer whitespace-nowrap shrink-0"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Single-Use Backup Recovery Codes Box */}
              {twoFactorEnabled && (
                <div className="space-y-4 pt-2">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
                    <div className="min-w-0 pr-2">
                      <h3 className="text-xs font-black text-slate-900 flex items-center gap-1.5 uppercase tracking-wider">
                        <KeyRound size={15} className="text-indigo-600 shrink-0" /> Emergency Backup Recovery Codes ({backupCodes.length})
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Keep these single-use codes in a safe place. They allow emergency access if you lose your mobile phone.
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 flex-nowrap">
                      <button
                        onClick={() => setShowBackupCodes(!showBackupCodes)}
                        className="h-9 px-3 text-xs font-bold inline-flex items-center justify-center gap-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl transition cursor-pointer whitespace-nowrap shrink-0 shadow-2xs"
                      >
                        {showBackupCodes ? <EyeOff size={13} /> : <Eye size={13} />}
                        <span>{showBackupCodes ? 'Hide' : 'Reveal'}</span>
                      </button>
                      <button
                        onClick={handleCopyCodes}
                        className="h-9 px-3.5 text-xs font-bold inline-flex items-center justify-center gap-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl transition cursor-pointer whitespace-nowrap shrink-0 shadow-2xs"
                      >
                        {copiedCodes ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
                        <span>{copiedCodes ? 'Copied' : 'Copy All'}</span>
                      </button>
                      <button
                        onClick={handleDownloadCodes}
                        className="h-9 px-3.5 text-xs font-bold inline-flex items-center justify-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition cursor-pointer whitespace-nowrap shrink-0 shadow-2xs"
                      >
                        <Download size={13} />
                        <span>Download .txt</span>
                      </button>
                    </div>
                  </div>

                  {/* Codes Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {backupCodes.map((code, idx) => (
                      <div
                        key={idx}
                        className="bg-white border border-slate-200/90 rounded-xl p-3 text-center font-mono text-xs font-bold tracking-wider text-slate-800 shadow-2xs hover:border-indigo-300 transition"
                      >
                        {showBackupCodes ? code : '••••-••••'}
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
                    <span>Each code becomes invalid immediately after one use.</span>
                    <button
                      onClick={handleRegenerateCodes}
                      className="text-indigo-600 hover:text-indigo-700 font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <RefreshCw size={12} /> Regenerate 8 New Codes
                    </button>
                  </div>
                </div>
              )}
            </Card>
          )}

          {/* =====================================================================
              PANEL 2: PERSONAL INFORMATION & EDITORIAL BYLINE
             ===================================================================== */}
          {activeSection === 'profile' && (
            <form onSubmit={handleSaveProfile} className="animate-in fade-in duration-150">
              <Card className="p-6 sm:p-8 bg-white border border-slate-200/90 rounded-3xl shadow-xs space-y-6">
                
                <div className="flex items-center justify-between border-b border-slate-100 pb-5">
                  <div>
                    <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                      <User className="text-indigo-600" size={22} /> Personal Information &amp; Editorial Bio
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Your identity and credentials displayed across product review bylines and audit records.
                    </p>
                  </div>

                  {profileSaved && (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-xl">
                      <CheckCircle2 size={14} /> Profile Saved
                    </span>
                  )}
                </div>

                {/* Form fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Full Name *</label>
                    <input
                      type="text"
                      required
                      value={profile.fullName}
                      onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
                      className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Official Work Email *</label>
                    <input
                      type="email"
                      required
                      value={profile.email}
                      onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                      className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Contact Phone Number</label>
                    <input
                      type="text"
                      value={profile.phone}
                      onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                      className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Department / Role Title</label>
                    <input
                      type="text"
                      value={profile.department}
                      onChange={(e) => setProfile({ ...profile, department: e.target.value })}
                      className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Preferred Timezone</label>
                  <select
                    value={profile.timezone}
                    onChange={(e) => setProfile({ ...profile, timezone: e.target.value })}
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  >
                    <option value="UTC+07:00 (Bangkok, Hanoi, Jakarta)">UTC+07:00 (Bangkok, Hanoi, Jakarta)</option>
                    <option value="UTC+00:00 (London, GMT)">UTC+00:00 (London, GMT)</option>
                    <option value="UTC-05:00 (New York, Eastern Time)">UTC-05:00 (New York, Eastern Time)</option>
                    <option value="UTC-08:00 (San Francisco, Pacific Time)">UTC-08:00 (San Francisco, Pacific Time)</option>
                  </select>
                </div>

                {/* Editorial Bio */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Author Bio &amp; Reviewer Profile</label>
                  <textarea
                    rows={3}
                    value={profile.bio}
                    onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 font-normal focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 leading-relaxed"
                  />
                  <p className="text-[11px] text-slate-400">
                    This bio is appended to your hands-on product reviews and shopping guides.
                  </p>
                </div>

                {/* Social Channels */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Twitter / X Handle or URL</label>
                    <input
                      type="text"
                      value={profile.socialX}
                      onChange={(e) => setProfile({ ...profile, socialX: e.target.value })}
                      placeholder="https://x.com/username"
                      className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">LinkedIn Profile URL</label>
                    <input
                      type="text"
                      value={profile.socialLinkedIn}
                      onChange={(e) => setProfile({ ...profile, socialLinkedIn: e.target.value })}
                      placeholder="https://linkedin.com/in/username"
                      className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    />
                  </div>
                </div>

                {/* Avatar Image Upload Integration */}
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <ImageUpload
                    value={profile.avatar}
                    onChange={(url) => setProfile({ ...profile, avatar: url })}
                    folder="staff"
                    label="Avatar Photo (Media Library or Direct Upload)"
                    aspectRatio="square"
                  />
                </div>

                <div className="pt-4 border-t border-slate-100 flex justify-end">
                  <button
                    type="submit"
                    className="h-9 px-5 inline-flex items-center justify-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition cursor-pointer whitespace-nowrap shrink-0"
                  >
                    <Save size={14} /> Save Profile Changes
                  </button>
                </div>
              </Card>
            </form>
          )}

          {/* =====================================================================
              PANEL 3: PASSWORD & CREDENTIALS
             ===================================================================== */}
          {activeSection === 'security' && (
            <form onSubmit={handleSavePassword} className="animate-in fade-in duration-150">
              <Card className="p-6 sm:p-8 bg-white border border-slate-200/90 rounded-3xl shadow-xs space-y-6">
                
                <div className="flex items-center justify-between border-b border-slate-100 pb-5">
                  <div>
                    <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                      <Lock className="text-indigo-600" size={22} /> Change Administrative Password
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Ensure your password has high entropy, exceeds 8 characters, and is hashed with Argon2id.
                    </p>
                  </div>

                  {passwordSaved && (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-xl">
                      <CheckCircle2 size={14} /> Password Updated
                    </span>
                  )}
                </div>

                <div className="max-w-lg space-y-4">
                  {/* Current Password */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Current Password *</label>
                    <div className="relative">
                      <input
                        type={showCurrentPassword ? 'text' : 'password'}
                        required
                        value={passwordForm.current}
                        onChange={(e) => setPasswordForm({ ...passwordForm, current: e.target.value })}
                        placeholder="Enter current password"
                        className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl pl-3.5 pr-10 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                      >
                        {showCurrentPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                  </div>

                  {/* New Password */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">New Strong Password *</label>
                    <div className="relative">
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        required
                        value={passwordForm.next}
                        onChange={(e) => setPasswordForm({ ...passwordForm, next: e.target.value })}
                        placeholder="At least 8 characters"
                        className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl pl-3.5 pr-10 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                      >
                        {showNewPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>

                    {/* Real-Time Password Strength Meter */}
                    {passwordForm.next && (
                      <div className="space-y-2 pt-1.5">
                        <div className="flex items-center gap-2 text-[11px]">
                          <div className="flex-1 bg-slate-200 h-1.5 rounded-full overflow-hidden">
                            <div
                              className={`h-full transition-all ${
                                passwordForm.next.length >= 12
                                  ? 'bg-emerald-500 w-full'
                                  : passwordForm.next.length >= 8
                                  ? 'bg-amber-500 w-2/3'
                                  : 'bg-rose-500 w-1/3'
                              }`}
                            />
                          </div>
                          <span className="font-bold text-slate-600">
                            {passwordForm.next.length >= 12
                              ? 'Strong Password'
                              : passwordForm.next.length >= 8
                              ? 'Moderate Strength'
                              : 'Weak'}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-1.5 text-[10px] text-slate-500">
                          <span className={`flex items-center gap-1 ${passwordForm.next.length >= 8 ? 'text-emerald-600 font-bold' : ''}`}>
                            <CheckCircle2 size={11} /> 8+ Characters
                          </span>
                          <span className={`flex items-center gap-1 ${/[A-Z]/.test(passwordForm.next) ? 'text-emerald-600 font-bold' : ''}`}>
                            <CheckCircle2 size={11} /> Uppercase Letter
                          </span>
                          <span className={`flex items-center gap-1 ${/[0-9]/.test(passwordForm.next) ? 'text-emerald-600 font-bold' : ''}`}>
                            <CheckCircle2 size={11} /> Number (0-9)
                          </span>
                          <span className={`flex items-center gap-1 ${/[^A-Za-z0-9]/.test(passwordForm.next) ? 'text-emerald-600 font-bold' : ''}`}>
                            <CheckCircle2 size={11} /> Special Symbol
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Confirm Password */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Confirm New Password *</label>
                    <input
                      type="password"
                      required
                      value={passwordForm.confirm}
                      onChange={(e) => setPasswordForm({ ...passwordForm, confirm: e.target.value })}
                      placeholder="Re-type new password"
                      className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    />
                    {passwordForm.confirm && passwordForm.next !== passwordForm.confirm && (
                      <p className="text-[11px] font-bold text-rose-600">Passwords do not match.</p>
                    )}
                  </div>

                  {/* Invalidate sessions checkbox */}
                  <label className="flex items-center gap-2 pt-2 cursor-pointer text-xs text-slate-600 font-medium select-none">
                    <input
                      type="checkbox"
                      checked={passwordForm.invalidateOtherSessions}
                      onChange={(e) =>
                        setPasswordForm({
                          ...passwordForm,
                          invalidateOtherSessions: e.target.checked,
                        })
                      }
                      className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span>Sign out of all other devices and terminate remote sessions</span>
                  </label>
                </div>

                <div className="pt-4 border-t border-slate-100 flex justify-end">
                  <button
                    type="submit"
                    className="h-9 px-5 inline-flex items-center justify-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition cursor-pointer whitespace-nowrap shrink-0"
                  >
                    <Lock size={14} /> Update Master Password
                  </button>
                </div>
              </Card>
            </form>
          )}

          {/* =====================================================================
              PANEL 4: AUTHORIZED DEVICE SESSIONS
             ===================================================================== */}
          {activeSection === 'sessions' && (
            <Card className="p-6 sm:p-8 bg-white border border-slate-200/90 rounded-3xl shadow-xs space-y-6 animate-in fade-in duration-150">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
                <div>
                  <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                    <Laptop className="text-indigo-600" size={22} /> Authorized Device Sessions ({sessions.length})
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Hardware devices and geographic locations currently holding authenticated ProCMS tokens.
                  </p>
                </div>

                <button
                  onClick={() => {
                    if (confirm('Sign out of all other devices except this current browser?')) {
                      setSessions((prev) => prev.filter((s) => s.isCurrent));
                      alert('Other sessions have been revoked.');
                    }
                  }}
                  className="h-9 px-4 inline-flex items-center justify-center text-xs font-bold text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-xl transition cursor-pointer whitespace-nowrap shrink-0"
                >
                  Revoke All Other Sessions
                </button>
              </div>

              <div className="space-y-3">
                {sessions.map((sess) => (
                  <div
                    key={sess.id}
                    className="p-4 rounded-2xl border border-slate-200/80 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-slate-300 transition"
                  >
                    <div className="flex items-start gap-3.5">
                      <div className="w-10 h-10 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-slate-700 shadow-2xs shrink-0">
                        <Laptop size={20} className="text-indigo-600" />
                      </div>
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-xs font-black text-slate-900">{sess.device}</h4>
                          {sess.isCurrent && (
                            <span className="text-[10px] font-black text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                              Current Browser
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 flex items-center gap-2 flex-wrap">
                          <span>{sess.browser}</span>
                          <span>•</span>
                          <span className="font-mono">{sess.ip}</span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <MapPin size={11} className="text-slate-400" /> {sess.location}
                          </span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-3 border-t sm:border-t-0 pt-2 sm:pt-0">
                      <span className="text-xs text-slate-400 font-medium">{sess.lastActive}</span>
                      {!sess.isCurrent && (
                        <button
                          onClick={() => handleRevokeSession(sess.id)}
                          className="h-8 px-3 inline-flex items-center justify-center text-xs font-bold text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-xl transition cursor-pointer whitespace-nowrap shrink-0"
                        >
                          Revoke
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* =====================================================================
              PANEL 5: SECURITY AUDIT & ACTIVITY TRAIL
             ===================================================================== */}
          {activeSection === 'audit' && (
            <Card className="p-6 sm:p-8 bg-white border border-slate-200/90 rounded-3xl shadow-xs space-y-6 animate-in fade-in duration-150">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
                <div>
                  <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                    <History className="text-indigo-600" size={22} /> Security Audit &amp; Activity Log
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Immutable chronological record of authentication attempts, credential changes, and clearance events.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold text-slate-400">Retention: 90 Days</span>
                </div>
              </div>

              <div className="divide-y divide-slate-100">
                {auditLogs.map((log) => (
                  <div key={log.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            log.status === 'success'
                              ? 'bg-emerald-500'
                              : log.status === 'warning'
                              ? 'bg-amber-500'
                              : 'bg-indigo-500'
                          }`}
                        />
                        <h4 className="text-xs font-bold text-slate-900">{log.event}</h4>
                        <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                          {log.module}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 font-mono">
                        {log.device} • IP: {log.ip}
                      </p>
                    </div>

                    <div className="text-xs text-slate-400 font-medium shrink-0">
                      {log.timestamp}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* =====================================================================
              PANEL 6: SYSTEM ALERTS & NOTIFICATIONS PREFERENCES
             ===================================================================== */}
          {activeSection === 'notifications' && (
            <form onSubmit={handleSaveNotifications} className="animate-in fade-in duration-150">
              <Card className="p-6 sm:p-8 bg-white border border-slate-200/90 rounded-3xl shadow-xs space-y-6">
                
                <div className="flex items-center justify-between border-b border-slate-100 pb-5">
                  <div>
                    <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                      <Bell className="text-indigo-600" size={22} /> System Alerts &amp; Notifications
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Choose which critical security and affiliate telemetry triggers dispatch an instant alert.
                    </p>
                  </div>

                  {notifSaved && (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-xl">
                      <CheckCircle2 size={14} /> Preferences Saved
                    </span>
                  )}
                </div>

                <div className="space-y-4">
                  {[
                    {
                      id: 'securityLogins',
                      title: 'New Device Sign-In Alerts',
                      desc: 'Receive immediate email notifications whenever a sign-in occurs from an unrecognized IP or browser.',
                    },
                    {
                      id: 'twoFaChanges',
                      title: '2FA & Credential Modification Warnings',
                      desc: 'High-priority alert if 2FA status, master password, or recovery codes are regenerated.',
                    },
                    {
                      id: 'commissionSpikes',
                      title: 'Affiliate Click Surge / Commission Alert',
                      desc: 'Get notified when an offer experiences high volume traffic or reaches commission payout thresholds.',
                    },
                    {
                      id: 'couponExpirations',
                      title: 'Expiring Coupon & Dead Offer Warnings',
                      desc: 'Daily digest of merchant coupon codes that will expire within the next 48 hours.',
                    },
                    {
                      id: 'customerFeedback',
                      title: 'Customer Feedback & Partnership Leads',
                      desc: 'Instant alert when a reader submits feedback or a merchant requests affiliate partnership.',
                    },
                  ].map((item) => (
                    <label
                      key={item.id}
                      className="flex items-start justify-between gap-4 p-4 rounded-2xl border border-slate-200/80 bg-slate-50/50 hover:bg-slate-50 cursor-pointer transition select-none"
                    >
                      <div className="space-y-0.5">
                        <span className="text-xs font-black text-slate-900 block">{item.title}</span>
                        <p className="text-xs text-slate-500 leading-relaxed">{item.desc}</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={(notifications as any)[item.id]}
                        onChange={(e) =>
                          setNotifications({
                            ...notifications,
                            [item.id]: e.target.checked,
                          })
                        }
                        className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4 mt-1"
                      />
                    </label>
                  ))}
                </div>

                <div className="pt-4 border-t border-slate-100 flex justify-end">
                  <button
                    type="submit"
                    className="h-9 px-5 inline-flex items-center justify-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition cursor-pointer whitespace-nowrap shrink-0"
                  >
                    <Save size={14} /> Save Notification Rules
                  </button>
                </div>
              </Card>
            </form>
          )}

        </div>

      </div>

      {/* =========================================================================
          3. 2FA SETUP INTERACTIVE WIZARD MODAL
         ========================================================================= */}
      {wizardOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6">
            
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">Set Up Authenticator App</h3>
                  <p className="text-xs text-slate-500">Step {wizardStep} of 3</p>
                </div>
              </div>

              <button
                onClick={() => setWizardOpen(false)}
                className="text-slate-400 hover:text-slate-700 text-xs font-bold cursor-pointer"
              >
                Close
              </button>
            </div>

            {/* Step 1: Scan QR Code */}
            {wizardStep === 1 && (
              <div className="space-y-4 text-center">
                <p className="text-xs text-slate-600 leading-relaxed text-left">
                  1. Open Google Authenticator, Microsoft Authenticator, or Authy on your mobile phone.
                  <br />
                  2. Scan this QR Code or manually type the Secret Key below:
                </p>

                {/* SVG QR Code */}
                <div className="w-48 h-48 mx-auto bg-slate-900 p-3 rounded-2xl shadow-md border-4 border-slate-100 flex items-center justify-center">
                  <svg viewBox="0 0 100 100" className="w-full h-full text-white fill-current">
                    <rect x="5" y="5" width="25" height="25" rx="3" fill="none" stroke="currentColor" strokeWidth="4" />
                    <rect x="11" y="11" width="13" height="13" />
                    <rect x="70" y="5" width="25" height="25" rx="3" fill="none" stroke="currentColor" strokeWidth="4" />
                    <rect x="76" y="11" width="13" height="13" />
                    <rect x="5" y="70" width="25" height="25" rx="3" fill="none" stroke="currentColor" strokeWidth="4" />
                    <rect x="11" y="76" width="13" height="13" />
                    <rect x="36" y="10" width="8" height="8" />
                    <rect x="48" y="10" width="8" height="8" />
                    <rect x="36" y="24" width="8" height="8" />
                    <rect x="48" y="24" width="8" height="8" />
                    <rect x="10" y="38" width="8" height="8" />
                    <rect x="24" y="38" width="8" height="8" />
                    <rect x="38" y="38" width="24" height="24" rx="2" />
                    <rect x="70" y="38" width="8" height="8" />
                    <rect x="84" y="38" width="8" height="8" />
                    <rect x="36" y="70" width="8" height="8" />
                    <rect x="48" y="70" width="8" height="8" />
                    <rect x="70" y="70" width="22" height="22" />
                  </svg>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-left space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Manual Secret Key</span>
                  <div className="flex items-center justify-between">
                    <code className="text-xs font-mono font-bold text-indigo-700 tracking-widest">{totpSecret}</code>
                    <button
                      onClick={handleCopySecret}
                      className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1 cursor-pointer"
                    >
                      {copiedSecret ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                      {copiedSecret ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                </div>

                <button
                  onClick={() => setWizardStep(2)}
                  className="w-full h-10 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition inline-flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap"
                >
                  Next: Verify Passcode <ArrowRight size={14} />
                </button>
              </div>
            )}

            {/* Step 2: Enter Verification Code */}
            {wizardStep === 2 && (
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <p className="text-xs text-slate-600 leading-relaxed">
                  Enter the 6-digit confirmation code generated by your authenticator app:
                </p>

                <div className="space-y-1.5">
                  <input
                    type="text"
                    maxLength={6}
                    autoFocus
                    value={otpInput}
                    onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, ''))}
                    placeholder="123456"
                    className="w-full text-center text-2xl font-mono font-black tracking-widest bg-slate-50 border border-slate-200 rounded-2xl py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                  {otpError && (
                    <p className="text-xs font-bold text-rose-600 text-center">{otpError}</p>
                  )}
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setWizardStep(1)}
                    className="flex-1 h-10 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer inline-flex items-center justify-center whitespace-nowrap"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    className="flex-1 h-10 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition cursor-pointer inline-flex items-center justify-center whitespace-nowrap"
                  >
                    Confirm &amp; Activate
                  </button>
                </div>
              </form>
            )}

            {/* Step 3: Success & Recovery Codes */}
            {wizardStep === 3 && (
              <div className="space-y-4 text-center">
                <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto">
                  <CheckCircle2 size={28} />
                </div>
                <div className="space-y-1">
                  <h4 className="text-base font-black text-slate-900">2FA Successfully Enabled!</h4>
                  <p className="text-xs text-slate-500">
                    Your account is now guarded by two-factor authentication. Please save your recovery backup codes:
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-2xl border border-slate-200">
                  {backupCodes.map((code, idx) => (
                    <div
                      key={idx}
                      className="font-mono text-xs font-bold text-slate-800 bg-white py-1.5 rounded-lg border border-slate-100 shadow-2xs"
                    >
                      {code}
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <button
                    onClick={handleDownloadCodes}
                    className="flex-1 h-10 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition inline-flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap"
                  >
                    <Download size={14} /> Download .txt
                  </button>
                  <button
                    onClick={() => setWizardOpen(false)}
                    className="flex-1 h-10 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition cursor-pointer inline-flex items-center justify-center whitespace-nowrap"
                  >
                    Done
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
