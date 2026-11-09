export type ActionType =
  | 'CREATE'
  | 'UPDATE'
  | 'DELETE'
  | 'PUBLISH'
  | 'VERIFY'
  | 'CLONE'
  | 'RBAC_CHANGE'
  | 'SECURITY'
  | 'SECURITY_2FA_SETUP'
  | 'LOGIN'
  | 'UPLOAD_MEDIA'
  | 'DELETE_MEDIA'
  | 'UPDATE_MEDIA_TAGS'
  | 'UPDATE_PROFILE'
  | 'SETTINGS_CHANGE'
  | string;

export type ActionSeverity = 'info' | 'success' | 'warning' | 'danger';

export interface AuditFieldDiff {
  field: string;
  label: string;
  before: any;
  after: any;
}

export interface AuditLogItem {
  id: string;
  timestamp: string; // ISO 8601 string
  userId: number | string;
  userName: string;
  userEmail: string;
  userRole: string;
  userAvatar?: string;
  action: ActionType;
  actionTitle: string;
  module: string;
  targetId?: string | number;
  targetName?: string;
  targetHref?: string;
  ipAddress: string;
  userAgent: string;
  deviceType: string;
  location: string;
  severity: ActionSeverity;
  details?: {
    summary?: string;
    changes?: AuditFieldDiff[];
    metadata?: Record<string, any>;
    [key: string]: any;
  };
}

/**
 * Export audit logs to CSV format
 */
export function exportLogsToCSV(logs: AuditLogItem[]): string {
  const headers = [
    'ID',
    'Timestamp',
    'Operator',
    'Email',
    'Role',
    'Action',
    'Action Title',
    'Module',
    'Target',
    'IP Address',
    'Device / OS',
    'Severity',
    'Summary',
  ];

  const escapeCSV = (str: string | number | undefined | null) => {
    if (str === undefined || str === null) return '""';
    const s = String(str).replace(/"/g, '""');
    return `"${s}"`;
  };

  const rows = logs.map((log) => [
    escapeCSV(log.id),
    escapeCSV(new Date(log.timestamp).toLocaleString('en-US')),
    escapeCSV(log.userName),
    escapeCSV(log.userEmail),
    escapeCSV(log.userRole),
    escapeCSV(log.action),
    escapeCSV(log.actionTitle),
    escapeCSV(log.module),
    escapeCSV(log.targetName || log.targetId || '-'),
    escapeCSV(log.ipAddress),
    escapeCSV(log.deviceType),
    escapeCSV(log.severity),
    escapeCSV(log.details?.summary || ''),
  ]);

  return [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
}
