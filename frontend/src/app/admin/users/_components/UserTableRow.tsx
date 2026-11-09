import {
  ShieldCheck,
  ShieldAlert,
  ShieldOff,
  CheckCircle2,
  XCircle,
  Edit2,
  Trash2,
  UserX,
  UserCheck,
  KeyRound,
  History,
  Clock,
} from 'lucide-react';
import Link from 'next/link';
import { ROUTES } from '@/constants/routes';
import { resolveUserWithDefaults, type UserData } from '../_lib/data';

interface UserTableRowProps {
  user: UserData;
  onToggleStatus: (id: number) => void;
  onToggle2FA: (id: number) => void;
  onResetPassword?: (id: number) => void;
  onTraceLogins?: (user: UserData) => void;
  onDelete: (id: number) => void;
}

/** Avatar circle with user photo or initial */
function UserAvatar({ fullName, avatar }: { fullName: string; avatar?: string }) {
  if (avatar) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={avatar}
        alt={fullName}
        className="w-8 h-8 rounded-full object-cover shrink-0 border border-slate-200"
      />
    );
  }
  return (
    <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-xs shrink-0">
      {fullName.charAt(0)}
    </div>
  );
}

/** 2FA status badge */
function TwoFactorBadge({ enabled }: { enabled: boolean }) {
  if (enabled) {
    return (
      <span className="inline-flex items-center gap-1 text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full text-[10px] border border-emerald-200">
        <ShieldCheck size={12} /> 2FA Active
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded-full text-[10px] border border-amber-200">
      <ShieldAlert size={12} /> Not Configured
    </span>
  );
}

/** Clickable status badge that triggers toggle */
function StatusBadge({ isActive, onClick }: { isActive: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} className="cursor-pointer" title="Click to toggle status">
      {isActive ? (
        <span className="inline-flex items-center gap-1 text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full text-[10px]">
          <CheckCircle2 size={12} /> Active
        </span>
      ) : (
        <span className="inline-flex items-center gap-1 text-slate-400 font-bold bg-slate-100 px-2 py-0.5 rounded-full text-[10px]">
          <XCircle size={12} /> Inactive
        </span>
      )}
    </button>
  );
}

/** Icon-only action button (8×8) */
function IconActionButton({
  onClick,
  disabled,
  title,
  className,
  children,
}: {
  onClick?: () => void;
  disabled?: boolean;
  title: string;
  className: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`w-8 h-8 inline-flex items-center justify-center rounded-lg border transition shrink-0 shadow-2xs ${className}`}
    >
      {children}
    </button>
  );
}

/** Toggle-2FA action button with hover swap icons */
function Toggle2FAButton({ enabled, onClick }: { enabled: boolean; onClick: () => void }) {
  return (
    <IconActionButton
      onClick={onClick}
      title={
        enabled
          ? '2FA is ENABLED. Click to disable 2FA for this account'
          : '2FA is DISABLED. Click to enable 2FA for this account'
      }
      className={`cursor-pointer group ${
        enabled
          ? 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-300'
          : 'border-slate-200 bg-white text-slate-400 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300'
      }`}
    >
      {enabled ? (
        <>
          <ShieldCheck size={14} className="group-hover:hidden" />
          <ShieldOff size={14} className="hidden group-hover:block" />
        </>
      ) : (
        <>
          <ShieldOff size={14} className="group-hover:hidden" />
          <ShieldCheck size={14} className="hidden group-hover:block" />
        </>
      )}
    </IconActionButton>
  );
}

/** Toggle-status action button (disabled for SuperAdmin) */
function ToggleStatusButton({
  isSuperAdmin,
  isActive,
  onClick,
}: {
  isSuperAdmin: boolean;
  isActive: boolean;
  onClick: () => void;
}) {
  if (isSuperAdmin) {
    return (
      <IconActionButton
        disabled
        title="Cannot deactivate Super Administrator"
        className="border-slate-100 bg-slate-50 text-slate-300 opacity-40 cursor-not-allowed"
      >
        <UserCheck size={14} />
      </IconActionButton>
    );
  }
  return (
    <IconActionButton
      onClick={onClick}
      title={
        isActive
          ? 'Active. Click to DEACTIVATE this account'
          : 'Deactivated. Click to REACTIVATE this account'
      }
      className={`cursor-pointer ${
        isActive
          ? 'border-slate-200 bg-white text-slate-500 hover:bg-amber-50 hover:text-amber-700 hover:border-amber-300'
          : 'border-amber-200 bg-amber-50 text-amber-700 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300'
      }`}
    >
      {isActive ? <UserX size={14} /> : <UserCheck size={14} />}
    </IconActionButton>
  );
}

/** Delete action button (disabled for SuperAdmin) */
function DeleteButton({
  isSuperAdmin,
  onClick,
}: {
  isSuperAdmin: boolean;
  onClick: () => void;
}) {
  if (isSuperAdmin) {
    return (
      <IconActionButton
        disabled
        title="Cannot delete Super Administrator account"
        className="border-slate-100 bg-slate-50 text-slate-300 opacity-40 cursor-not-allowed"
      >
        <Trash2 size={13} />
      </IconActionButton>
    );
  }
  return (
    <IconActionButton
      onClick={onClick}
      title="Permanently delete account"
      className="cursor-pointer border-slate-200 bg-white hover:bg-rose-50/80 text-slate-400 hover:text-rose-600 hover:border-rose-300"
    >
      <Trash2 size={13} />
    </IconActionButton>
  );
}

/** A single row in the users table */
export default function UserTableRow({
  user,
  onToggleStatus,
  onToggle2FA,
  onResetPassword,
  onTraceLogins,
  onDelete,
}: UserTableRowProps) {
  const resolved = resolveUserWithDefaults(user);
  const avatar = resolved.avatar;
  const department = resolved.department;
  const loginCount = resolved.loginCount ?? (resolved.loginHistory?.length || 0);

  return (
    <tr className="hover:bg-slate-50/60 transition-colors">
      {/* User info */}
      <td className="py-3.5 px-4">
        <div className="flex items-center gap-3">
          <UserAvatar fullName={user.fullName} avatar={avatar} />
          <div>
            <span className="font-bold text-slate-900 text-sm block">{user.fullName}</span>
            <span className="text-[11px] font-mono text-slate-400 block">{user.email}</span>
            {department && (
              <span className="text-[10px] text-slate-500 block mt-0.5">{department}</span>
            )}
          </div>
        </div>
      </td>

      {/* Role */}
      <td className="py-3.5 px-4">
        <span className="bg-slate-100 text-slate-700 font-bold px-2 py-0.5 rounded text-[10px]">
          {user.role}
        </span>
      </td>

      {/* 2FA */}
      <td className="py-3.5 px-4">
        <TwoFactorBadge enabled={user.twoFactorEnabled} />
      </td>

      {/* Status */}
      <td className="py-3.5 px-4">
        <StatusBadge isActive={user.isActive} onClick={() => onToggleStatus(user.id)} />
      </td>

      {/* Last Login & Session Trace */}
      <td className="py-3.5 px-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 text-slate-800 font-mono text-[11px] font-semibold">
            <Clock size={12} className="text-emerald-600 shrink-0" />
            <span>{resolved.lastLoginAt || 'Never signed in'}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono text-slate-400 truncate max-w-[165px]">
              {resolved.lastLoginIp || '—'}
            </span>
            {onTraceLogins && (
              <button
                type="button"
                onClick={() => onTraceLogins(resolved)}
                className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200/80 text-[10px] font-bold transition cursor-pointer shrink-0"
                title="View full login timestamp history for this user"
              >
                <History size={10} />
                <span>Trace ({loginCount})</span>
              </button>
            )}
          </div>
        </div>
      </td>

      {/* Actions */}
      <td className="py-3.5 px-4 text-right whitespace-nowrap w-56 min-w-[220px]">
        <div className="flex items-center justify-end gap-1.5">
          {onTraceLogins && (
            <IconActionButton
              onClick={() => onTraceLogins(resolved)}
              title="View full login timestamp history for this user"
              className="cursor-pointer border-slate-200 bg-white hover:bg-indigo-50 text-slate-500 hover:text-indigo-600 hover:border-indigo-300"
            >
              <History size={13} />
            </IconActionButton>
          )}
          {onResetPassword && (
            <IconActionButton
              onClick={() => onResetPassword(user.id)}
              title="Reset password to default (HeyGoodly@2026)"
              className="cursor-pointer border-slate-200 bg-white hover:bg-indigo-50 text-slate-500 hover:text-indigo-600 hover:border-indigo-300"
            >
              <KeyRound size={13} />
            </IconActionButton>
          )}
          <Toggle2FAButton enabled={user.twoFactorEnabled} onClick={() => onToggle2FA(user.id)} />
          <ToggleStatusButton
            isSuperAdmin={user.isSuperAdmin}
            isActive={user.isActive}
            onClick={() => onToggleStatus(user.id)}
          />
          <Link
            href={ROUTES.ADMIN.USER_EDIT(user.id)}
            className="w-8 h-8 inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white hover:bg-blue-50 text-slate-600 hover:text-blue-600 hover:border-blue-300 transition shrink-0 shadow-2xs cursor-pointer"
            title="Edit profile, account details & custom password"
          >
            <Edit2 size={13} />
          </Link>
          <DeleteButton isSuperAdmin={user.isSuperAdmin} onClick={() => onDelete(user.id)} />
        </div>
      </td>
    </tr>
  );
}
