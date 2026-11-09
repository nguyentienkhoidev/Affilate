'use client';

import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import {
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Info,
  X,
  ShieldAlert,
  Trash2,
} from 'lucide-react';
import { useAdminI18n } from '@/context/AdminI18nContext';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastItem {
  id: string;
  type: ToastType;
  message: string;
  description?: string;
  duration?: number;
}

export interface ConfirmOptions {
  title: string;
  message: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info' | 'success';
}

export interface AlertOptions {
  title: string;
  message: React.ReactNode;
  okText?: string;
  variant?: 'danger' | 'warning' | 'info';
}

interface ToastContextValue {
  toast: {
    success: (message: string, description?: string, duration?: number) => void;
    error: (message: string, description?: string, duration?: number) => void;
    warning: (message: string, description?: string, duration?: number) => void;
    info: (message: string, description?: string, duration?: number) => void;
  };
  confirm: (options: ConfirmOptions) => Promise<boolean>;
  alertModal: (options: AlertOptions) => Promise<void>;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const i18n = useAdminI18n();
  const tr = (text: string) => (i18n?.t ? i18n.t(text) : text);
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  // Confirm modal state
  const [confirmState, setConfirmState] = useState<{
    isOpen: boolean;
    options: ConfirmOptions;
    resolve?: (value: boolean) => void;
  }>({
    isOpen: false,
    options: { title: '', message: '' },
  });

  // Alert modal state
  const [alertState, setAlertState] = useState<{
    isOpen: boolean;
    options: AlertOptions;
    resolve?: () => void;
  }>({
    isOpen: false,
    options: { title: '', message: '' },
  });

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    (type: ToastType, message: string, description?: string, duration = 3500) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      const newItem: ToastItem = { id, type, message, description, duration };

      setToasts((prev) => [newItem, ...prev.slice(0, 4)]); // Keep maximum 5 toasts

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }
    },
    [removeToast]
  );

  const toastMethods = useRef({
    success: (message: string, description?: string, duration?: number) =>
      addToast('success', message, description, duration),
    error: (message: string, description?: string, duration?: number) =>
      addToast('error', message, description, duration),
    warning: (message: string, description?: string, duration?: number) =>
      addToast('warning', message, description, duration),
    info: (message: string, description?: string, duration?: number) =>
      addToast('info', message, description, duration),
  });

  const confirm = useCallback((options: ConfirmOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      setConfirmState({
        isOpen: true,
        options,
        resolve,
      });
    });
  }, []);

  const handleConfirmClose = (result: boolean) => {
    if (confirmState.resolve) {
      confirmState.resolve(result);
    }
    setConfirmState((prev) => ({ ...prev, isOpen: false }));
  };

  const alertModal = useCallback((options: AlertOptions): Promise<void> => {
    return new Promise((resolve) => {
      setAlertState({
        isOpen: true,
        options,
        resolve,
      });
    });
  }, []);

  const handleAlertClose = () => {
    if (alertState.resolve) {
      alertState.resolve();
    }
    setAlertState((prev) => ({ ...prev, isOpen: false }));
  };

  return (
    <ToastContext.Provider
      value={{
        toast: toastMethods.current,
        confirm,
        alertModal,
      }}
    >
      {children}

      {/* 1. Floating Toasts Stack */}
      <div className="fixed top-5 right-5 z-[9999] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-4 sm:px-0">
        {toasts.map((t) => {
          const config = {
            success: {
              border: 'border-emerald-200/90',
              bg: 'bg-white/95',
              shadow: 'shadow-emerald-500/10',
              iconBg: 'bg-emerald-50 text-emerald-600',
              Icon: CheckCircle2,
              titleColor: 'text-emerald-950',
            },
            error: {
              border: 'border-rose-200/90',
              bg: 'bg-white/95',
              shadow: 'shadow-rose-500/10',
              iconBg: 'bg-rose-50 text-rose-600',
              Icon: AlertCircle,
              titleColor: 'text-rose-950',
            },
            warning: {
              border: 'border-amber-200/90',
              bg: 'bg-white/95',
              shadow: 'shadow-amber-500/10',
              iconBg: 'bg-amber-50 text-amber-600',
              Icon: AlertTriangle,
              titleColor: 'text-amber-950',
            },
            info: {
              border: 'border-indigo-200/90',
              bg: 'bg-white/95',
              shadow: 'shadow-indigo-500/10',
              iconBg: 'bg-indigo-50 text-indigo-600',
              Icon: Info,
              titleColor: 'text-indigo-950',
            },
          }[t.type];

          const IconComponent = config.Icon;

          return (
            <div
              key={t.id}
              className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-2xl border ${config.border} ${config.bg} shadow-lg ${config.shadow} backdrop-blur-md transition-all duration-200 animate-in slide-in-from-top-3 fade-in`}
              role="alert"
            >
              <div
                className={`w-7 h-7 rounded-xl ${config.iconBg} flex items-center justify-center shrink-0 mt-0.5`}
              >
                <IconComponent size={16} />
              </div>

              <div className="flex-1 min-w-0 pr-1">
                <p className={`text-xs font-bold ${config.titleColor} leading-tight`}>
                  {tr(t.message)}
                </p>
                {t.description && (
                  <p className="text-[11px] text-slate-500 mt-1 leading-snug break-words">
                    {tr(t.description)}
                  </p>
                )}
              </div>

              <button
                type="button"
                onClick={() => removeToast(t.id)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg transition-colors cursor-pointer shrink-0 -mr-1 -mt-1"
                aria-label="Close notification"
              >
                <X size={14} />
              </button>
            </div>
          );
        })}
      </div>

      {/* 2. Interactive Confirmation Dialog */}
      {confirmState.isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs transition-opacity animate-in fade-in duration-150"
            onClick={() => handleConfirmClose(false)}
          />

          <div
            className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200/90 p-5 sm:p-6 space-y-4 animate-in zoom-in-95 duration-150"
            role="dialog"
            aria-modal="true"
          >
            <div className="flex items-start gap-3.5">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                  confirmState.options.variant === 'danger'
                    ? 'bg-rose-50 text-rose-600 border border-rose-200/70'
                    : confirmState.options.variant === 'warning'
                    ? 'bg-amber-50 text-amber-600 border border-amber-200/70'
                    : 'bg-indigo-50 text-indigo-600 border border-indigo-200/70'
                }`}
              >
                {confirmState.options.variant === 'danger' ? (
                  <Trash2 size={20} />
                ) : confirmState.options.variant === 'warning' ? (
                  <AlertTriangle size={20} />
                ) : (
                  <ShieldAlert size={20} />
                )}
              </div>

              <div className="flex-1 min-w-0 pt-0.5">
                <h3 className="text-sm font-bold text-slate-900 leading-snug">
                  {tr(confirmState.options.title)}
                </h3>
                <div className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                  {typeof confirmState.options.message === 'string'
                    ? tr(confirmState.options.message)
                    : confirmState.options.message}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => handleConfirmClose(false)}
                className="h-9 px-4 text-xs font-bold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl transition cursor-pointer shadow-2xs"
              >
                {tr(confirmState.options.cancelText || 'Cancel')}
              </button>

              <button
                type="button"
                onClick={() => handleConfirmClose(true)}
                className={`h-9 px-4 text-xs font-bold text-white rounded-xl transition cursor-pointer shadow-xs ${
                  confirmState.options.variant === 'danger'
                    ? 'bg-rose-600 hover:bg-rose-700'
                    : confirmState.options.variant === 'warning'
                    ? 'bg-amber-600 hover:bg-amber-700'
                    : 'bg-indigo-600 hover:bg-indigo-700'
                }`}
              >
                {tr(confirmState.options.confirmText || 'Confirm')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Informational Alert Dialog (Replaces native window.alert) */}
      {alertState.isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs transition-opacity animate-in fade-in duration-150"
            onClick={handleAlertClose}
          />

          <div
            className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl border border-slate-200/90 p-5 space-y-4 animate-in zoom-in-95 duration-150"
            role="alertdialog"
            aria-modal="true"
          >
            <div className="flex items-start gap-3.5">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                  alertState.options.variant === 'danger'
                    ? 'bg-rose-50 text-rose-600 border border-rose-200/70'
                    : 'bg-amber-50 text-amber-600 border border-amber-200/70'
                }`}
              >
                <AlertTriangle size={20} />
              </div>

              <div className="flex-1 min-w-0 pt-0.5">
                <h3 className="text-sm font-bold text-slate-900 leading-snug">
                  {tr(alertState.options.title)}
                </h3>
                <div className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                  {typeof alertState.options.message === 'string'
                    ? tr(alertState.options.message)
                    : alertState.options.message}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={handleAlertClose}
                className="h-9 px-4 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition cursor-pointer shadow-xs"
              >
                {tr(alertState.options.okText || 'Got it')}
              </button>
            </div>
          </div>
        </div>
      )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

export function useOptionalToast() {
  return useContext(ToastContext);
}
