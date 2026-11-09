import { apiClient } from '@/lib/api/axios-client';
import { API_ENDPOINTS } from '@/constants/api-endpoints';
import { AuditLogItem } from '@/app/admin/tracing/_lib/data';

export interface AuditQueryCriteria {
  page?: number;
  size?: number;
  sortBy?: string;
  direction?: string;
  search?: string;
  action?: string;
  module?: string;
  user?: string;
  startDate?: string;
  endDate?: string;
}

export interface AuditStats {
  totalEvents: number;
  sensitiveActions: number;
  activeOperators: number;
  last24Hours: number;
  availableActions: string[];
  availableModules: string[];
  availableOperators: string[];
}

class AuditService {
  /**
   * Fetch immutable audit logs with pagination and filters.
   */
  async getAuditLogs(params?: AuditQueryCriteria) {
    try {
      const res = await apiClient.get(API_ENDPOINTS.ADMIN.AUDIT, { params });
      return res.data?.data || null;
    } catch (err) {
      console.warn('Backend audit API error:', err);
      return null;
    }
  }

  /**
   * Fetch audit stats & available filter options from database.
   */
  async getAuditStats(): Promise<AuditStats | null> {
    try {
      const res = await apiClient.get(`${API_ENDPOINTS.ADMIN.AUDIT}/stats`);
      return res.data?.data || null;
    } catch (err) {
      console.warn('Backend audit stats API error:', err);
      return null;
    }
  }

  /**
   * Fetch single audit detail by ID.
   */
  async getAuditLogById(id: string | number): Promise<AuditLogItem | null> {
    try {
      const res = await apiClient.get(`${API_ENDPOINTS.ADMIN.AUDIT}/${id}`);
      return res.data?.data || null;
    } catch (err) {
      console.warn('Backend get audit by id API error:', err);
      return null;
    }
  }

  /**
   * Fetch all logs matching filter criteria for complete CSV export.
   */
  async getAllLogsForExport(params?: AuditQueryCriteria): Promise<AuditLogItem[]> {
    try {
      const res = await apiClient.get(API_ENDPOINTS.ADMIN.AUDIT, {
        params: { ...params, page: 0, size: 1000 },
      });
      const content = res.data?.data?.content || [];
      return content.map((l: any) => ({
        id: String(l.id),
        timestamp: l.timestamp || l.createdAt || new Date().toISOString(),
        userId: String(l.userId || '1'),
        userName: l.userName || 'Super Administrator',
        userEmail: l.userEmail || 'admin@heygoodly.com',
        userRole: l.userRole || 'Administrator',
        userAvatar: l.userAvatar,
        action: l.action || 'UPDATE',
        actionTitle: l.actionTitle || l.action || 'Audit Record',
        module: l.module || 'system',
        targetId: l.targetId || String(l.resourceId || ''),
        targetName: l.targetName || l.resourceName || 'System Resource',
        targetHref: l.targetHref || '/admin/dashboard',
        ipAddress: l.ipAddress || '127.0.0.1',
        userAgent: l.userAgent || 'Web Application',
        deviceType: l.deviceType || 'Web Application',
        location: l.location || 'Local Development',
        severity: l.severity || 'info',
        details: l.details || { note: 'Captured via Spring Boot Audit Trail' },
      }));
    } catch (err) {
      console.warn('Backend export audit logs error:', err);
      return [];
    }
  }

  /**
   * Record new audit trail action.
   */
  async recordLog(payload: Partial<AuditLogItem>): Promise<boolean> {
    try {
      await apiClient.post(API_ENDPOINTS.ADMIN.AUDIT, payload);
      return true;
    } catch (err) {
      console.warn('Backend record audit log error:', err);
      return false;
    }
  }
}

export const auditService = new AuditService();
export default auditService;
