import { Request, Response, NextFunction } from 'express';
import { storage } from '../storage';

interface SecurityEvent {
  id: string;
  timestamp: string;
  eventType: 'login_attempt' | 'auth_failure' | 'suspicious_activity' | 'data_access' | 'admin_action' | 'system_change';
  severity: 'low' | 'medium' | 'high' | 'critical';
  userId?: string;
  ip: string;
  userAgent: string;
  resource?: string;
  action?: string;
  details: Record<string, any>;
  resolved: boolean;
}

interface SecurityMetrics {
  failedLogins: number;
  suspiciousActivities: number;
  dataAccessAttempts: number;
  adminActions: number;
  uniqueIPs: number;
  riskScore: number;
}

class SecurityAuditService {
  private events: SecurityEvent[] = [];
  private maxEvents = 10000; // Keep last 10k events
  private suspiciousIPs = new Set<string>();
  private failedAttempts = new Map<string, number>();

  logSecurityEvent(event: Omit<SecurityEvent, 'id' | 'timestamp' | 'resolved'>): void {
    const securityEvent: SecurityEvent = {
      id: this.generateEventId(),
      timestamp: new Date().toISOString(),
      resolved: false,
      ...event
    };

    this.events.push(securityEvent);
    
    // Keep only the most recent events
    if (this.events.length > this.maxEvents) {
      this.events.shift();
    }

    // Track failed attempts
    if (event.eventType === 'auth_failure') {
      const attempts = this.failedAttempts.get(event.ip) || 0;
      this.failedAttempts.set(event.ip, attempts + 1);
      
      // Mark IP as suspicious after 5 failed attempts
      if (attempts >= 5) {
        this.suspiciousIPs.add(event.ip);
        this.logSecurityEvent({
          eventType: 'suspicious_activity',
          severity: 'high',
          ip: event.ip,
          userAgent: event.userAgent,
          details: {
            reason: 'Multiple failed login attempts',
            attempts: attempts + 1
          }
        });
      }
    }

    // Auto-escalate critical events
    if (event.severity === 'critical') {
      console.error('CRITICAL SECURITY EVENT:', securityEvent);
    }

    // Log high severity events
    if (event.severity === 'high' || event.severity === 'critical') {
      console.warn('HIGH SECURITY EVENT:', securityEvent);
    }
  }

  getSecurityMetrics(hours: number = 24): SecurityMetrics {
    const cutoff = Date.now() - (hours * 60 * 60 * 1000);
    const recentEvents = this.events.filter(e => 
      new Date(e.timestamp).getTime() > cutoff
    );

    const metrics: SecurityMetrics = {
      failedLogins: recentEvents.filter(e => e.eventType === 'auth_failure').length,
      suspiciousActivities: recentEvents.filter(e => e.eventType === 'suspicious_activity').length,
      dataAccessAttempts: recentEvents.filter(e => e.eventType === 'data_access').length,
      adminActions: recentEvents.filter(e => e.eventType === 'admin_action').length,
      uniqueIPs: new Set(recentEvents.map(e => e.ip)).size,
      riskScore: this.calculateRiskScore(recentEvents)
    };

    return metrics;
  }

  getSecurityEvents(limit: number = 100, severity?: string): SecurityEvent[] {
    let filteredEvents = this.events;
    
    if (severity) {
      filteredEvents = this.events.filter(e => e.severity === severity);
    }
    
    return filteredEvents
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);
  }

  getSuspiciousIPs(): string[] {
    return Array.from(this.suspiciousIPs);
  }

  isIPSuspicious(ip: string): boolean {
    return this.suspiciousIPs.has(ip);
  }

  resolveSecurityEvent(eventId: string, resolvedBy: string): boolean {
    const event = this.events.find(e => e.id === eventId);
    if (event) {
      event.resolved = true;
      event.details.resolvedBy = resolvedBy;
      event.details.resolvedAt = new Date().toISOString();
      return true;
    }
    return false;
  }

  clearSuspiciousIP(ip: string): void {
    this.suspiciousIPs.delete(ip);
    this.failedAttempts.delete(ip);
  }

  private calculateRiskScore(events: SecurityEvent[]): number {
    let score = 0;
    
    events.forEach(event => {
      switch (event.severity) {
        case 'low':
          score += 1;
          break;
        case 'medium':
          score += 3;
          break;
        case 'high':
          score += 7;
          break;
        case 'critical':
          score += 15;
          break;
      }
    });

    // Additional risk factors
    const suspiciousCount = events.filter(e => e.eventType === 'suspicious_activity').length;
    const failedLoginCount = events.filter(e => e.eventType === 'auth_failure').length;
    
    score += suspiciousCount * 5;
    score += Math.min(failedLoginCount * 2, 50); // Cap failed login contribution

    return Math.min(score, 100); // Cap at 100
  }

  private generateEventId(): string {
    return `sec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Security analysis methods
  detectAnomalies(): SecurityEvent[] {
    const now = Date.now();
    const last24h = now - (24 * 60 * 60 * 1000);
    const recentEvents = this.events.filter(e => 
      new Date(e.timestamp).getTime() > last24h
    );

    const anomalies: SecurityEvent[] = [];

    // Detect rapid successive login failures
    const loginFailures = recentEvents.filter(e => e.eventType === 'auth_failure');
    const ipGroups = this.groupBy(loginFailures, 'ip');
    
    Object.entries(ipGroups).forEach(([ip, events]) => {
      if (events.length > 10) {
        anomalies.push({
          id: this.generateEventId(),
          timestamp: new Date().toISOString(),
          eventType: 'suspicious_activity',
          severity: 'high',
          ip,
          userAgent: events[0].userAgent,
          details: {
            anomalyType: 'rapid_login_failures',
            count: events.length,
            timespan: '24h'
          },
          resolved: false
        });
      }
    });

    // Detect unusual access patterns
    const dataAccess = recentEvents.filter(e => e.eventType === 'data_access');
    const userGroups = this.groupBy(dataAccess, 'userId');
    
    Object.entries(userGroups).forEach(([userId, events]) => {
      if (events.length > 1000) { // Unusually high data access
        anomalies.push({
          id: this.generateEventId(),
          timestamp: new Date().toISOString(),
          eventType: 'suspicious_activity',
          severity: 'medium',
          userId,
          ip: events[0].ip,
          userAgent: events[0].userAgent,
          details: {
            anomalyType: 'excessive_data_access',
            count: events.length,
            timespan: '24h'
          },
          resolved: false
        });
      }
    });

    return anomalies;
  }

  private groupBy<T>(array: T[], key: keyof T): Record<string, T[]> {
    return array.reduce((groups, item) => {
      const group = String(item[key]);
      groups[group] = groups[group] || [];
      groups[group].push(item);
      return groups;
    }, {} as Record<string, T[]>);
  }

  getSecurityReport(): {
    summary: SecurityMetrics;
    recentEvents: SecurityEvent[];
    suspiciousIPs: string[];
    anomalies: SecurityEvent[];
    recommendations: string[];
  } {
    const metrics = this.getSecurityMetrics();
    const recentEvents = this.getSecurityEvents(50);
    const suspiciousIPs = this.getSuspiciousIPs();
    const anomalies = this.detectAnomalies();
    
    const recommendations: string[] = [];
    
    if (metrics.failedLogins > 50) {
      recommendations.push('High number of failed login attempts detected. Consider implementing stronger rate limiting.');
    }
    
    if (metrics.riskScore > 70) {
      recommendations.push('Risk score is elevated. Review recent security events and consider additional security measures.');
    }
    
    if (suspiciousIPs.length > 5) {
      recommendations.push('Multiple suspicious IP addresses detected. Consider implementing IP blocking or enhanced monitoring.');
    }
    
    if (anomalies.length > 0) {
      recommendations.push('Security anomalies detected. Immediate investigation recommended.');
    }

    return {
      summary: metrics,
      recentEvents,
      suspiciousIPs,
      anomalies,
      recommendations
    };
  }
}

export const securityAuditService = new SecurityAuditService();

// Middleware for logging security events
export const securityAuditMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const originalSend = res.send;
  
  res.send = function(data) {
    // Log potential security events
    if (res.statusCode === 401) {
      securityAuditService.logSecurityEvent({
        eventType: 'auth_failure',
        severity: 'medium',
        ip: req.ip || req.connection.remoteAddress || 'unknown',
        userAgent: req.get('User-Agent') || 'unknown',
        resource: req.originalUrl,
        action: req.method,
        details: {
          statusCode: res.statusCode,
          path: req.path,
          method: req.method
        }
      });
    }

    // Log admin actions
    if (req.originalUrl.startsWith('/api/admin') && res.statusCode < 400) {
      securityAuditService.logSecurityEvent({
        eventType: 'admin_action',
        severity: 'low',
        userId: (req as any).session?.adminRole || 'unknown',
        ip: req.ip || req.connection.remoteAddress || 'unknown',
        userAgent: req.get('User-Agent') || 'unknown',
        resource: req.originalUrl,
        action: req.method,
        details: {
          statusCode: res.statusCode,
          path: req.path,
          method: req.method
        }
      });
    }

    // Log data access
    if (req.originalUrl.startsWith('/api/') && req.method === 'GET' && res.statusCode === 200) {
      securityAuditService.logSecurityEvent({
        eventType: 'data_access',
        severity: 'low',
        userId: (req as any).session?.clientId || (req as any).session?.adminRole || 'anonymous',
        ip: req.ip || req.connection.remoteAddress || 'unknown',
        userAgent: req.get('User-Agent') || 'unknown',
        resource: req.originalUrl,
        action: req.method,
        details: {
          statusCode: res.statusCode,
          path: req.path,
          method: req.method
        }
      });
    }

    return originalSend.call(this, data);
  };

  next();
};

// Security endpoints
export const securityReportEndpoint = (req: Request, res: Response) => {
  try {
    const report = securityAuditService.getSecurityReport();
    res.json({
      status: 'success',
      data: report,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to generate security report',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const securityEventsEndpoint = (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 100;
    const severity = req.query.severity as string;
    
    const events = securityAuditService.getSecurityEvents(limit, severity);
    
    res.json({
      status: 'success',
      data: events,
      count: events.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve security events',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};