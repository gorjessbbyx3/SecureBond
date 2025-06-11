import { Request, Response, NextFunction } from 'express';
import { performance } from 'perf_hooks';

interface PerformanceMetrics {
  requestId: string;
  method: string;
  url: string;
  statusCode: number;
  responseTime: number;
  memoryUsage: NodeJS.MemoryUsage;
  timestamp: string;
  userAgent?: string;
  ip?: string;
}

class PerformanceMonitor {
  private metrics: PerformanceMetrics[] = [];
  private maxMetrics = 1000; // Keep last 1000 requests

  addMetric(metric: PerformanceMetrics) {
    this.metrics.push(metric);
    if (this.metrics.length > this.maxMetrics) {
      this.metrics.shift();
    }
  }

  getMetrics(limit: number = 50): PerformanceMetrics[] {
    return this.metrics.slice(-limit);
  }

  getAverageResponseTime(minutes: number = 5): number {
    const cutoff = Date.now() - (minutes * 60 * 1000);
    const recentMetrics = this.metrics.filter(m => 
      new Date(m.timestamp).getTime() > cutoff
    );
    
    if (recentMetrics.length === 0) return 0;
    
    const total = recentMetrics.reduce((sum, m) => sum + m.responseTime, 0);
    return Math.round(total / recentMetrics.length);
  }

  getSlowRequests(threshold: number = 1000): PerformanceMetrics[] {
    return this.metrics.filter(m => m.responseTime > threshold);
  }

  getErrorRate(minutes: number = 5): number {
    const cutoff = Date.now() - (minutes * 60 * 1000);
    const recentMetrics = this.metrics.filter(m => 
      new Date(m.timestamp).getTime() > cutoff
    );
    
    if (recentMetrics.length === 0) return 0;
    
    const errors = recentMetrics.filter(m => m.statusCode >= 400).length;
    return Math.round((errors / recentMetrics.length) * 100);
  }

  getStats() {
    const now = Date.now();
    const last5Min = now - (5 * 60 * 1000);
    const last1Hour = now - (60 * 60 * 1000);

    const recent5Min = this.metrics.filter(m => 
      new Date(m.timestamp).getTime() > last5Min
    );
    
    const recent1Hour = this.metrics.filter(m => 
      new Date(m.timestamp).getTime() > last1Hour
    );

    return {
      totalRequests: this.metrics.length,
      requestsLast5Min: recent5Min.length,
      requestsLastHour: recent1Hour.length,
      averageResponseTime5Min: this.getAverageResponseTime(5),
      averageResponseTime1Hour: this.getAverageResponseTime(60),
      errorRate5Min: this.getErrorRate(5),
      errorRate1Hour: this.getErrorRate(60),
      slowRequests: this.getSlowRequests().length,
      memoryUsage: process.memoryUsage()
    };
  }
}

export const performanceMonitor = new PerformanceMonitor();

export const performanceMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const startTime = performance.now();
  const requestId = Math.random().toString(36).substr(2, 9);
  
  // Add request ID to request object for tracking
  (req as any).requestId = requestId;

  res.on('finish', () => {
    const endTime = performance.now();
    const responseTime = Math.round(endTime - startTime);

    const metric: PerformanceMetrics = {
      requestId,
      method: req.method,
      url: req.originalUrl || req.url,
      statusCode: res.statusCode,
      responseTime,
      memoryUsage: process.memoryUsage(),
      timestamp: new Date().toISOString(),
      userAgent: req.get('User-Agent'),
      ip: req.ip || req.connection.remoteAddress
    };

    performanceMonitor.addMetric(metric);

    // Log slow requests
    if (responseTime > 2000) {
      console.warn(`Slow request detected: ${req.method} ${req.url} took ${responseTime}ms`);
    }

    // Log errors
    if (res.statusCode >= 400) {
      console.error(`Error response: ${res.statusCode} for ${req.method} ${req.url}`);
    }
  });

  next();
};

export const performanceStatsEndpoint = (req: Request, res: Response) => {
  try {
    const stats = performanceMonitor.getStats();
    res.json({
      status: 'success',
      data: stats,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve performance stats',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const performanceMetricsEndpoint = (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 50;
    const metrics = performanceMonitor.getMetrics(limit);
    
    res.json({
      status: 'success',
      data: metrics,
      count: metrics.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve performance metrics',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};