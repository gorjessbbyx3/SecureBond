import fs from 'fs/promises';
import path from 'path';

export enum LogLevel {
  ERROR = 'ERROR',
  WARN = 'WARN',
  INFO = 'INFO',
  DEBUG = 'DEBUG'
}

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  metadata?: any;
  userId?: string;
  clientId?: string;
  action?: string;
}

class Logger {
  private logDir: string;

  constructor() {
    this.logDir = path.join(process.cwd(), 'logs');
    this.ensureLogDirectory();
  }

  private async ensureLogDirectory() {
    try {
      await fs.mkdir(this.logDir, { recursive: true });
    } catch (error) {
      // Failed to create log directory - using fallback logging
    }
  }

  private async writeLog(entry: LogEntry) {
    const logFile = path.join(this.logDir, `${new Date().toISOString().split('T')[0]}.log`);
    const logLine = JSON.stringify(entry) + '\n';

    try {
      await fs.appendFile(logFile, logLine);
    } catch (error) {
      console.error('Failed to write log:', error);
    }
  }

  private createLogEntry(level: LogLevel, message: string, metadata?: any, context?: { userId?: string; clientId?: string; action?: string }): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      message,
      metadata,
      userId: context?.userId,
      clientId: context?.clientId,
      action: context?.action
    };
  }

  async error(message: string, metadata?: any, context?: { userId?: string; clientId?: string; action?: string }) {
    const entry = this.createLogEntry(LogLevel.ERROR, message, metadata, context);
    console.error(`[${entry.timestamp}] ERROR: ${message}`, metadata);
    await this.writeLog(entry);
  }

  async warn(message: string, metadata?: any, context?: { userId?: string; clientId?: string; action?: string }) {
    const entry = this.createLogEntry(LogLevel.WARN, message, metadata, context);
    console.warn(`[${entry.timestamp}] WARN: ${message}`, metadata);
    await this.writeLog(entry);
  }

  async info(message: string, metadata?: any, context?: { userId?: string; clientId?: string; action?: string }) {
    const entry = this.createLogEntry(LogLevel.INFO, message, metadata, context);
    console.log(`[${entry.timestamp}] INFO: ${message}`, metadata);
    await this.writeLog(entry);
  }

  async debug(message: string, metadata?: any, context?: { userId?: string; clientId?: string; action?: string }) {
    if (process.env.NODE_ENV === 'development') {
      const entry = this.createLogEntry(LogLevel.DEBUG, message, metadata, context);
      console.log(`[${entry.timestamp}] DEBUG: ${message}`, metadata);
      await this.writeLog(entry);
    }
  }

  // Security-specific logging methods
  async logLoginAttempt(success: boolean, userId: string, ip: string, userAgent: string) {
    await this.info(`Login ${success ? 'successful' : 'failed'}`, {
      success,
      ip,
      userAgent
    }, { userId, action: 'login' });
  }

  async logDataAccess(userId: string, resource: string, action: string, metadata?: any) {
    await this.info(`Data access: ${action} on ${resource}`, metadata, { userId, action });
  }

  async logSecurityEvent(event: string, severity: 'low' | 'medium' | 'high', metadata?: any) {
    await this.warn(`Security event: ${event} (${severity})`, metadata, { action: 'security' });
  }

  async logClientAction(clientId: string, action: string, metadata?: any) {
    await this.info(`Client action: ${action}`, metadata, { clientId, action });
  }

  // Audit trail methods
  async logAuditEvent(userId: string, action: string, resource: string, before?: any, after?: any) {
    await this.info(`Audit: ${action} on ${resource}`, {
      before,
      after,
      timestamp: new Date().toISOString()
    }, { userId, action: 'audit' });
  }
}

export const logger = new Logger();