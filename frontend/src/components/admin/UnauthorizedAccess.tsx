'use client';

import Link from 'next/link';
import { ShieldAlert, ArrowLeft, RefreshCw } from 'lucide-react';
import { usePermission, type RoleType } from '@/lib/admin/usePermission';

interface UnauthorizedAccessProps {
  requiredPermission?: string;
  moduleName?: string;
}

export default function UnauthorizedAccess({
  requiredPermission = 'admin.access',
  moduleName = 'this restricted administrative section',
}: UnauthorizedAccessProps) {
  const { currentRole, switchRole, availableRoles } = usePermission();

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white border border-slate-200 rounded-3xl p-8 shadow-sm text-center space-y-6">
        <div className="w-16 h-16 rounded-3xl bg-rose-50 border border-rose-100 text-rose-600 flex items-center justify-center mx-auto shadow-2xs">
          <ShieldAlert size={32} />
        </div>

        <div className="space-y-2">
          <span className="text-[10px] font-black tracking-widest text-rose-600 uppercase bg-rose-50 border border-rose-200 px-2.5 py-0.5 rounded-full">
            HTTP 403 Forbidden
          </span>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">Access Restricted</h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            Your current role <strong className="text-slate-800">({currentRole.roleName})</strong> does not have permission <code className="text-indigo-600 font-mono text-[11px] bg-slate-100 px-1.5 py-0.5 rounded">[{requiredPermission}]</code> required to access {moduleName}.
          </p>
        </div>

        {/* Demo Role Switcher helper */}
        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2 text-left">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
            <RefreshCw size={11} /> Switch Role For Testing
          </span>
          <select
            value={currentRole.roleSlug}
            onChange={(e) => switchRole(e.target.value as RoleType)}
            className="w-full text-xs font-bold text-slate-800 bg-white border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          >
            {availableRoles.map((r) => (
              <option key={r.roleSlug} value={r.roleSlug}>
                {r.roleName}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center justify-center gap-3 pt-2">
          <Link
            href="/admin/dashboard"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition shadow-xs"
          >
            <ArrowLeft size={14} /> Return to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
