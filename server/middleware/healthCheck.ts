import { Request, Response, NextFunction } from 'express';
import { storage } from '../storage';
import { sendGridService } from '../services/sendgrid';

interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  version: string;
  services: {
    database: ServiceHealth;
    email: ServiceHealth;
    storage: ServiceHealth;
  };
  metrics: {
    uptime: number;
    memoryUsage: NodeJS.MemoryUsage;
    activeConnections: number;
  };
}

interface ServiceHealth {
  status: 'up' | 'down' | 'degraded';
  responseTime?: number;
  lastCheck: string;
  error?: string;
}

class HealthCheckService {
  private startTime = Date.now();
  private activeConnections = 0;

  incrementConnections() {
    this.activeConnections++;
  }

  decrementConnections() {
    this.activeConnections--;
  }

  async checkDatabaseHealth(): Promise<ServiceHealth> {
    const startTime = Date.now();
    try {
      // Test database connectivity by attempting to fetch clients
      await storage.getAllClients();
      return {
        status: 'up',
        responseTime: Date.now() - startTime,
        lastCheck: new Date().toISOString()
      };
    } catch (error) {
      return {
        status: 'down',
        responseTime: Date.now() - startTime,
        lastCheck: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async checkEmailHealth(): Promise<ServiceHealth> {
    const startTime = Date.now();
    try {
      if (!sendGridService.isReady()) {
        return {
          status: 'degraded',
          responseTime: Date.now() - startTime,
          lastCheck: new Date().toISOString(),
          error: 'SendGrid not configured'
        };
      }
      
      return {
        status: 'up',
        responseTime: Date.now() - startTime,
        lastCheck: new Date().toISOString()
      };
    } catch (error) {
      return {
        status: 'down',
        responseTime: Date.now() - startTime,
        lastCheck: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async checkStorageHealth(): Promise<ServiceHealth> {
    const startTime = Date.now();
    try {
      // Test storage by attempting to read index file
      await storage.getAllClients();
      return {
        status: 'up',
        responseTime: Date.now() - startTime,
        lastCheck: new Date().toISOString()
      };
    } catch (error) {
      return {
        status: 'down',
        responseTime: Date.now() - startTime,
        lastCheck: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async getHealthStatus(): Promise<HealthStatus> {
    const [database, email, storageHealth] = await Promise.all([
      this.checkDatabaseHealth(),
      this.checkEmailHealth(),
      this.checkStorageHealth()
    ]);

    const services = { database, email, storage: storageHealth };
    
    // Determine overall status
    let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
    
    if (database.status === 'down' || storageHealth.status === 'down') {
      status = 'unhealthy';
    } else if (database.status === 'degraded' || email.status === 'degraded' || storageHealth.status === 'degraded') {
      status = 'degraded';
    }

    return {
      status,
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0',
      services,
      metrics: {
        uptime: Date.now() - this.startTime,
        memoryUsage: process.memoryUsage(),
        activeConnections: this.activeConnections
      }
    };
  }
}

export const healthCheckService = new HealthCheckService();

export const healthCheckMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  healthCheckService.incrementConnections();
  
  res.on('finish', () => {
    healthCheckService.decrementConnections();
  });
  
  next();
};

export const healthEndpoint = async (req: Request, res: Response) => {
  try {
    const health = await healthCheckService.getHealthStatus();
    const statusCode = health.status === 'healthy' ? 200 : health.status === 'degraded' ? 200 : 503;
    
    res.status(statusCode).json(health);
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Health check failed'
    });
  }
};