import { promises as fs } from 'fs';
import path from 'path';

export interface AuditLogEntry {
  id: string;
  timestamp: Date;
  eventType: string;
  category: 'AUTHENTICATION' | 'BIOMETRIC' | 'LOCATION' | 'DATA_ACCESS' | 'SYSTEM' | 'COURT_DATE' | 'PAYMENT' | 'ADMIN_ACTION';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  userId?: string;
  clientId?: number;
  ipAddress?: string;
  userAgent?: string;
  sessionId?: string;
  action: string;
  details: Record<string, any>;
  complianceRelevant: boolean;
  retentionPeriod: number; // days
  legalHold?: boolean;
}

export interface SecurityMetrics {
  failedLogins: number;
  successfulLogins: number;
  biometricVerifications: number;
  locationVerifications: number;
  dataAccessAttempts: number;
  suspiciousActivity: number;
  lastUpdated: Date;
}

class AuditLogger {
  private auditDir: string;
  private metricsFile: string;
  private retentionPolicies = {
    AUTHENTICATION: 2555, // 7 years
    BIOMETRIC: 2555, // 7 years - critical for court evidence
    LOCATION: 2555, // 7 years - GPS evidence
    DATA_ACCESS: 1825, // 5 years
    SYSTEM: 365, // 1 year
    COURT_DATE: 3650, // 10 years - legal requirement
    PAYMENT: 2555, // 7 years - financial records
    ADMIN_ACTION: 2555, // 7 years
  };

  constructor() {
    this.auditDir = path.join(process.cwd(), 'audit-logs');
    this.metricsFile = path.join(this.auditDir, 'security-metrics.json');
    this.initializeAuditSystem();
  }

  private async initializeAuditSystem() {
    try {
      await fs.mkdir(this.auditDir, { recursive: true });
      
      // Create daily log directories
      const today = new Date().toISOString().split('T')[0];
      await fs.mkdir(path.join(this.auditDir, today), { recursive: true });
      
      // Initialize metrics if not exists
      try {
        await fs.access(this.metricsFile);
      } catch {
        const initialMetrics: SecurityMetrics = {
          failedLogins: 0,
          successfulLogins: 0,
          biometricVerifications: 0,
          locationVerifications: 0,
          dataAccessAttempts: 0,
          suspiciousActivity: 0,
          lastUpdated: new Date(),
        };
        await fs.writeFile(this.metricsFile, JSON.stringify(initialMetrics, null, 2));
      }
    } catch (error) {
      console.error('Failed to initialize audit system:', error);
    }
  }

  async log(entry: Omit<AuditLogEntry, 'id' | 'timestamp' | 'retentionPeriod'>): Promise<void> {
    try {
      const fullEntry: AuditLogEntry = {
        id: this.generateAuditId(),
        timestamp: new Date(),
        retentionPeriod: this.retentionPolicies[entry.category],
        ...entry,
      };

      // Write to daily log file
      const dateStr = fullEntry.timestamp.toISOString().split('T')[0];
      const logDir = path.join(this.auditDir, dateStr);
      await fs.mkdir(logDir, { recursive: true });
      
      const logFile = path.join(logDir, `${entry.category.toLowerCase()}.jsonl`);
      const logLine = JSON.stringify(fullEntry) + '\n';
      await fs.appendFile(logFile, logLine);

      // Update security metrics
      await this.updateMetrics(entry);

      // Console logging for immediate visibility
      console.log(`AUDIT [${entry.severity}] ${entry.category}: ${entry.action}`);
      
      if (entry.severity === 'CRITICAL') {
        console.error(`CRITICAL SECURITY EVENT: ${entry.action}`, entry.details);
      }

      // Check for suspicious patterns
      await this.analyzeSuspiciousActivity(fullEntry);

    } catch (error) {
      console.error('Failed to write audit log:', error);
      // Fallback to console logging
      console.log('AUDIT FALLBACK:', JSON.stringify(entry));
    }
  }

  private generateAuditId(): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2);
    return `audit_${timestamp}_${random}`;
  }

  private async updateMetrics(entry: Omit<AuditLogEntry, 'id' | 'timestamp' | 'retentionPeriod'>): Promise<void> {
    try {
      const metricsData = await fs.readFile(this.metricsFile, 'utf-8');
      const metrics: SecurityMetrics = JSON.parse(metricsData);

      switch (entry.eventType) {
        case 'LOGIN_SUCCESS':
          metrics.successfulLogins++;
          break;
        case 'LOGIN_FAILED':
          metrics.failedLogins++;
          break;
        case 'BIOMETRIC_VERIFICATION':
          metrics.biometricVerifications++;
          break;
        case 'GPS_VERIFICATION':
          metrics.locationVerifications++;
          break;
        case 'DATA_ACCESS':
          metrics.dataAccessAttempts++;
          break;
        case 'SUSPICIOUS_ACTIVITY':
          metrics.suspiciousActivity++;
          break;
      }

      metrics.lastUpdated = new Date();
      await fs.writeFile(this.metricsFile, JSON.stringify(metrics, null, 2));
    } catch (error) {
      console.error('Failed to update security metrics:', error);
    }
  }

  private async analyzeSuspiciousActivity(entry: AuditLogEntry): Promise<void> {
    // Check for multiple failed logins
    if (entry.eventType === 'LOGIN_FAILED' && entry.ipAddress) {
      const recentFailures = await this.getRecentFailedLogins(entry.ipAddress, 15); // 15 minutes
      if (recentFailures >= 5) {
        await this.log({
          eventType: 'SUSPICIOUS_ACTIVITY',
          category: 'AUTHENTICATION',
          severity: 'CRITICAL',
          ipAddress: entry.ipAddress,
          action: 'Multiple failed login attempts detected',
          details: {
            failedAttempts: recentFailures,
            timeWindow: '15 minutes',
            sourceIP: entry.ipAddress,
          },
          complianceRelevant: true,
        });
      }
    }

    // Check for unusual access patterns
    if (entry.category === 'DATA_ACCESS' && entry.severity === 'HIGH') {
      await this.log({
        eventType: 'SUSPICIOUS_ACTIVITY',
        category: 'DATA_ACCESS',
        severity: 'HIGH',
        userId: entry.userId,
        action: 'High-privilege data access detected',
        details: {
          originalAction: entry.action,
          accessTime: entry.timestamp,
        },
        complianceRelevant: true,
      });
    }
  }

  private async getRecentFailedLogins(ipAddress: string, minutesBack: number): Promise<number> {
    try {
      const cutoffTime = new Date(Date.now() - minutesBack * 60 * 1000);
      const today = new Date().toISOString().split('T')[0];
      const logFile = path.join(this.auditDir, today, 'authentication.jsonl');
      
      try {
        const logData = await fs.readFile(logFile, 'utf-8');
        const lines = logData.trim().split('\n').filter(line => line);
        
        return lines
          .map(line => JSON.parse(line) as AuditLogEntry)
          .filter(entry => 
            entry.eventType === 'LOGIN_FAILED' &&
            entry.ipAddress === ipAddress &&
            new Date(entry.timestamp) > cutoffTime
          ).length;
      } catch {
        return 0;
      }
    } catch (error) {
      console.error('Error analyzing failed logins:', error);
      return 0;
    }
  }

  async getSecurityMetrics(): Promise<SecurityMetrics> {
    try {
      const metricsData = await fs.readFile(this.metricsFile, 'utf-8');
      return JSON.parse(metricsData);
    } catch (error) {
      console.error('Failed to read security metrics:', error);
      return {
        failedLogins: 0,
        successfulLogins: 0,
        biometricVerifications: 0,
        locationVerifications: 0,
        dataAccessAttempts: 0,
        suspiciousActivity: 0,
        lastUpdated: new Date(),
      };
    }
  }

  async generateComplianceReport(startDate: Date, endDate: Date): Promise<any> {
    const report = {
      reportId: this.generateAuditId(),
      generatedAt: new Date(),
      period: { startDate, endDate },
      summary: {
        totalEvents: 0,
        criticalEvents: 0,
        complianceRelevantEvents: 0,
        categories: {} as Record<string, number>,
      },
      events: [] as AuditLogEntry[],
    };

    try {
      const currentDate = new Date(startDate);
      while (currentDate <= endDate) {
        const dateStr = currentDate.toISOString().split('T')[0];
        const logDir = path.join(this.auditDir, dateStr);
        
        try {
          const files = await fs.readdir(logDir);
          for (const file of files) {
            if (file.endsWith('.jsonl')) {
              const logData = await fs.readFile(path.join(logDir, file), 'utf-8');
              const lines = logData.trim().split('\n').filter(line => line);
              
              for (const line of lines) {
                const entry: AuditLogEntry = JSON.parse(line);
                const entryDate = new Date(entry.timestamp);
                
                if (entryDate >= startDate && entryDate <= endDate) {
                  report.events.push(entry);
                  report.summary.totalEvents++;
                  
                  if (entry.severity === 'CRITICAL') {
                    report.summary.criticalEvents++;
                  }
                  
                  if (entry.complianceRelevant) {
                    report.summary.complianceRelevantEvents++;
                  }
                  
                  report.summary.categories[entry.category] = 
                    (report.summary.categories[entry.category] || 0) + 1;
                }
              }
            }
          }
        } catch (error) {
          // Directory might not exist for this date
        }
        
        currentDate.setDate(currentDate.getDate() + 1);
      }
    } catch (error) {
      console.error('Failed to generate compliance report:', error);
    }

    return report;
  }

  async searchAuditLogs(filters: {
    startDate?: Date;
    endDate?: Date;
    category?: string;
    eventType?: string;
    userId?: string;
    clientId?: number;
    severity?: string;
    complianceRelevant?: boolean;
  }): Promise<AuditLogEntry[]> {
    const results: AuditLogEntry[] = [];
    
    try {
      const startDate = filters.startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // 30 days ago
      const endDate = filters.endDate || new Date();
      
      const currentDate = new Date(startDate);
      while (currentDate <= endDate) {
        const dateStr = currentDate.toISOString().split('T')[0];
        const logDir = path.join(this.auditDir, dateStr);
        
        try {
          const files = await fs.readdir(logDir);
          for (const file of files) {
            if (file.endsWith('.jsonl')) {
              const logData = await fs.readFile(path.join(logDir, file), 'utf-8');
              const lines = logData.trim().split('\n').filter(line => line);
              
              for (const line of lines) {
                const entry: AuditLogEntry = JSON.parse(line);
                
                if (this.matchesFilters(entry, filters)) {
                  results.push(entry);
                }
              }
            }
          }
        } catch (error) {
          // Directory might not exist for this date
        }
        
        currentDate.setDate(currentDate.getDate() + 1);
      }
    } catch (error) {
      console.error('Failed to search audit logs:', error);
    }

    return results.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  private matchesFilters(entry: AuditLogEntry, filters: any): boolean {
    if (filters.category && entry.category !== filters.category) return false;
    if (filters.eventType && entry.eventType !== filters.eventType) return false;
    if (filters.userId && entry.userId !== filters.userId) return false;
    if (filters.clientId && entry.clientId !== filters.clientId) return false;
    if (filters.severity && entry.severity !== filters.severity) return false;
    if (filters.complianceRelevant !== undefined && entry.complianceRelevant !== filters.complianceRelevant) return false;
    
    return true;
  }

  // Legal hold functionality
  async applyLegalHold(entryId: string, reason: string): Promise<void> {
    await this.log({
      eventType: 'LEGAL_HOLD_APPLIED',
      category: 'SYSTEM',
      severity: 'HIGH',
      action: 'Legal hold applied to audit entry',
      details: {
        entryId,
        reason,
        appliedBy: 'system',
      },
      complianceRelevant: true,
    });
  }

  // Data retention cleanup
  async performRetentionCleanup(): Promise<void> {
    const cleanupReport = {
      startTime: new Date(),
      entriesReviewed: 0,
      entriesRetained: 0,
      entriesArchived: 0,
      errors: [] as string[],
    };

    try {
      const auditDirs = await fs.readdir(this.auditDir);
      
      for (const dirName of auditDirs) {
        if (dirName.match(/^\d{4}-\d{2}-\d{2}$/)) {
          const dirDate = new Date(dirName);
          const daysSinceLog = Math.floor((Date.now() - dirDate.getTime()) / (1000 * 60 * 60 * 24));
          
          const logDir = path.join(this.auditDir, dirName);
          const files = await fs.readdir(logDir);
          
          for (const file of files) {
            if (file.endsWith('.jsonl')) {
              const category = file.replace('.jsonl', '').toUpperCase() as keyof typeof this.retentionPolicies;
              const retentionDays = this.retentionPolicies[category] || 365;
              
              if (daysSinceLog > retentionDays) {
                // Archive old logs instead of deleting (for legal compliance)
                const archiveDir = path.join(this.auditDir, 'archived', dirName);
                await fs.mkdir(archiveDir, { recursive: true });
                await fs.rename(path.join(logDir, file), path.join(archiveDir, file));
                cleanupReport.entriesArchived++;
              } else {
                cleanupReport.entriesRetained++;
              }
            }
          }
        }
      }

      await this.log({
        eventType: 'RETENTION_CLEANUP',
        category: 'SYSTEM',
        severity: 'MEDIUM',
        action: 'Automated retention cleanup completed',
        details: cleanupReport,
        complianceRelevant: true,
      });

    } catch (error) {
      console.error('Retention cleanup failed:', error);
      cleanupReport.errors.push(error instanceof Error ? error.message : 'Unknown error');
    }
  }
}

export const auditLogger = new AuditLogger();