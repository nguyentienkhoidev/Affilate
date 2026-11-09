import { History, Copy, Check, X, Laptop, Globe } from 'lucide-react';
import type { AuditLogItem, ActionType } from '../_lib/data';

interface AuditDetailModalProps {
  log: AuditLogItem | null;
  onClose: () => void;
  onCopyJSON: (log: AuditLogItem) => void;
  copiedId: boolean;
  getActionBadge: (action: ActionType) => React.ReactNode;
}

/**
 * Inspector modal for deep diving into an audit trail event.
 */
export default function AuditDetailModal({
  log,
  onClose,
  onCopyJSON,
  copiedId,
  getActionBadge,
}: AuditDetailModalProps) {
  if (!log) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl border border-zinc-200">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-zinc-200 flex items-center justify-between bg-zinc-50/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center shadow-xs">
              <History size={16} />
            </div>
            <div>
              <h3 className="font-bold text-zinc-900 text-sm">
                Trace Event Deep Dive
              </h3>
              <p className="text-[11px] text-zinc-500 font-mono">
                Event ID: {log.id} • {new Date(log.timestamp).toLocaleString('en-US')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onCopyJSON(log)}
              className="h-8 px-2.5 inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-700 bg-white hover:bg-zinc-100 border border-zinc-200 rounded-lg transition cursor-pointer"
              title="Copy full event JSON"
            >
              {copiedId ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
              <span>{copiedId ? 'Copied' : 'Copy JSON'}</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 rounded-lg transition cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Event Summary Card */}
          <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                Recorded Action
              </span>
              {getActionBadge(log.action)}
            </div>
            <h4 className="text-sm font-bold text-zinc-900">{log.actionTitle}</h4>
            {log.details?.summary && (
              <p className="text-xs text-zinc-600 leading-relaxed">
                {log.details.summary}
              </p>
            )}
          </div>

          {/* 2-Column User & Environment Metadata */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {/* User column */}
            <div className="p-3.5 rounded-xl border border-zinc-200/80 bg-white space-y-2">
              <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                Operator
              </div>
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                  {log.userName.slice(0, 1)}
                </div>
                <div>
                  <p className="font-bold text-zinc-900">{log.userName}</p>
                  <p className="text-zinc-500 font-mono text-[11px]">{log.userEmail}</p>
                </div>
              </div>
              <div className="pt-2 border-t border-zinc-100 flex items-center justify-between text-[11px]">
                <span className="text-zinc-500">Assigned Role:</span>
                <span className="font-bold text-indigo-700">{log.userRole}</span>
              </div>
            </div>

            {/* Device & Network column */}
            <div className="p-3.5 rounded-xl border border-zinc-200/80 bg-white space-y-2">
              <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                Environment &amp; Device
              </div>
              <div className="space-y-1 font-mono text-[11px] text-zinc-700">
                <div className="flex justify-between">
                  <span className="text-zinc-400">IP Address:</span>
                  <span className="font-bold">{log.ipAddress}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Location:</span>
                  <span>{log.location}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Platform / OS:</span>
                  <span>{log.deviceType}</span>
                </div>
              </div>
              <div className="text-[10px] text-zinc-400 pt-1 border-t border-zinc-100 truncate">
                UA: {log.userAgent}
              </div>
            </div>
          </div>

          {/* Before & After Diff Comparison Table */}
          {log.details?.changes && log.details.changes.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h5 className="text-xs font-bold text-zinc-800">
                  Data Change Details (Before &amp; After Diff)
                </h5>
                <span className="text-[10px] text-zinc-400 font-mono">
                  {log.details.changes.length} fields modified
                </span>
              </div>

              <div className="border border-zinc-200 rounded-xl overflow-hidden text-xs">
                <table className="w-full text-left">
                  <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-500 font-bold text-[10px] uppercase tracking-wider">
                    <tr>
                      <th className="py-2.5 px-3.5 w-1/3">Field</th>
                      <th className="py-2.5 px-3.5 w-1/3 text-rose-700 bg-rose-50/50">
                        Previous Value (Before)
                      </th>
                      <th className="py-2.5 px-3.5 w-1/3 text-emerald-700 bg-emerald-50/50">
                        New Value (After)
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100">
                    {log.details.changes.map((ch, idx) => (
                      <tr key={idx} className="hover:bg-zinc-50/50">
                        <td className="py-2.5 px-3.5 font-semibold text-zinc-900">
                          {ch.label}
                          <code className="block text-[10px] font-mono text-zinc-400 mt-0.5">
                            {ch.field}
                          </code>
                        </td>
                        <td className="py-2.5 px-3.5 text-rose-700 font-mono text-[11px] bg-rose-50/20 break-all">
                          {ch.before === null || ch.before === undefined ? (
                            <span className="text-zinc-400 italic">None</span>
                          ) : (
                            String(ch.before)
                          )}
                        </td>
                        <td className="py-2.5 px-3.5 text-emerald-700 font-mono text-[11px] bg-emerald-50/20 font-bold break-all">
                          {ch.after === null || ch.after === undefined ? (
                            <span className="text-zinc-400 italic">None</span>
                          ) : (
                            String(ch.after)
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Raw JSON Snapshot */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
              Raw JSON Audit Payload
            </span>
            <pre className="p-3 rounded-xl bg-zinc-950 text-emerald-400 font-mono text-[11px] max-h-48 overflow-y-auto leading-relaxed">
              {JSON.stringify(log, null, 2)}
            </pre>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-zinc-200 bg-zinc-50 flex items-center justify-between">
          <span className="text-[11px] text-zinc-500">
            Immutably stored for security compliance and operational auditing.
          </span>
          <button
            type="button"
            onClick={onClose}
            className="h-8 px-4 text-xs font-bold text-zinc-700 bg-white hover:bg-zinc-100 border border-zinc-200 rounded-lg transition cursor-pointer shadow-2xs"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
