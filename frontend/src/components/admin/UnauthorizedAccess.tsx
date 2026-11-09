'use client';

import Link from 'next/link';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { usePermission } from '@/lib/admin/usePermission';

interface UnauthorizedAccessProps {
  requiredPermission?: string;
  moduleName?: string;
}

export default function UnauthorizedAccess({
  requiredPermission = 'admin.access',
  moduleName = 'this restricted administrative section',
}: UnauthorizedAccessProps) {
  const { currentRole } = usePermission();

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
