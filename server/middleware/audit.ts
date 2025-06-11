import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';
import { AuthenticatedRequest } from './auth';

export const auditMiddleware = (action: string, resource: string) => {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const originalSend = res.send;
    const startTime = Date.now();
    
    // Capture request details
    const requestDetails = {
      method: req.method,
      url: req.url,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      body: req.method !== 'GET' ? req.body : undefined,
      params: req.params,
      query: req.query
    };

    // Override res.send to capture response
    res.send = function(body: any) {
      const duration = Date.now() - startTime;
      const responseDetails = {
        statusCode: res.statusCode,
        duration,
        responseSize: body ? JSON.stringify(body).length : 0
      };

      // Log the audit event
      logger.logAuditEvent(
        req.user?.id || 'anonymous',
        `${action} (${req.method})`,
        resource,
        requestDetails,
        responseDetails
      );

      return originalSend.call(this, body);
    };

    next();
  };
};

export const sensitiveDataAccess = (dataType: string) => {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (req.user) {
      await logger.logDataAccess(
        req.user.id,
        dataType,
        `${req.method} ${req.url}`,
        {
          ip: req.ip,
          userAgent: req.get('User-Agent'),
          params: req.params,
          query: req.query
        }
      );
    }
    next();
  };
};