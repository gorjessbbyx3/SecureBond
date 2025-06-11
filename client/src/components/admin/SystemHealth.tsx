import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { 
  Server, 
  Database, 
  Shield, 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  HardDrive,
  Cpu,
  Network
} from 'lucide-react';
import { api } from '@/lib/api';

interface SystemMetrics {
  database: {
    status: 'healthy' | 'warning' | 'error';
    responseTime: number;
    connections: number;
    maxConnections: number;
  };
  server: {
    uptime: number;
    memoryUsage: number;
    cpuUsage: number;
    diskUsage: number;
  };
  security: {
    failedLogins: number;
    activeThreats: number;
    lastSecurityScan: string;
  };
  performance: {
    avgResponseTime: number;
    requestsPerMinute: number;
    errorRate: number;
  };
}

export function SystemHealth() {
  const { data: metrics, isLoading, error } = useQuery<SystemMetrics>({
    queryKey: ['/api/system/health'],
    queryFn: () => api.get('/api/system/health'),
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            System Health
          </CardTitle>
        </CardHeader>
        <CardContent>
          <LoadingSpinner className="mx-auto" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>System Health Check Failed</AlertTitle>
        <AlertDescription>
          Unable to retrieve system health metrics. Please check system status.
        </AlertDescription>
      </Alert>
    );
  }

  if (!metrics) {
    return (
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>No Health Data</AlertTitle>
        <AlertDescription>
          System health metrics are not available at this time.
        </AlertDescription>
      </Alert>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600';
      case 'warning': return 'text-yellow-600';
      case 'error': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'error': return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default: return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / (24 * 3600));
    const hours = Math.floor((seconds % (24 * 3600)) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${days}d ${hours}h ${minutes}m`;
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Database Health */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Database</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              {getStatusIcon(metrics.database.status)}
              <span className={`text-sm font-medium ${getStatusColor(metrics.database.status)}`}>
                {metrics.database.status.charAt(0).toUpperCase() + metrics.database.status.slice(1)}
              </span>
            </div>
            <div className="mt-2 space-y-1">
              <div className="flex justify-between text-xs">
                <span>Response Time</span>
                <span>{metrics.database.responseTime}ms</span>
              </div>
              <div className="flex justify-between text-xs">
                <span>Connections</span>
                <span>{metrics.database.connections}/{metrics.database.maxConnections}</span>
              </div>
              <Progress 
                value={(metrics.database.connections / metrics.database.maxConnections) * 100} 
                className="h-1"
              />
            </div>
          </CardContent>
        </Card>

        {/* Server Performance */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Server</CardTitle>
            <Server className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1">
                  <Cpu className="h-3 w-3" />
                  CPU
                </span>
                <span>{metrics.server.cpuUsage}%</span>
              </div>
              <Progress value={metrics.server.cpuUsage} className="h-1" />
              
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1">
                  <HardDrive className="h-3 w-3" />
                  Memory
                </span>
                <span>{metrics.server.memoryUsage}%</span>
              </div>
              <Progress value={metrics.server.memoryUsage} className="h-1" />
              
              <div className="text-xs text-muted-foreground">
                Uptime: {formatUptime(metrics.server.uptime)}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Security Status */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Security</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span>Failed Logins</span>
                <Badge variant={metrics.security.failedLogins > 10 ? "destructive" : "secondary"}>
                  {metrics.security.failedLogins}
                </Badge>
              </div>
              <div className="flex justify-between text-xs">
                <span>Active Threats</span>
                <Badge variant={metrics.security.activeThreats > 0 ? "destructive" : "secondary"}>
                  {metrics.security.activeThreats}
                </Badge>
              </div>
              <div className="text-xs text-muted-foreground">
                Last scan: {new Date(metrics.security.lastSecurityScan).toLocaleDateString()}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Performance Metrics */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Performance</CardTitle>
            <Network className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span>Avg Response</span>
                <span>{metrics.performance.avgResponseTime}ms</span>
              </div>
              <div className="flex justify-between text-xs">
                <span>Requests/min</span>
                <span>{metrics.performance.requestsPerMinute}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span>Error Rate</span>
                <Badge variant={metrics.performance.errorRate > 5 ? "destructive" : "secondary"}>
                  {metrics.performance.errorRate}%
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Alerts */}
      {(metrics.database.status !== 'healthy' || 
        metrics.server.cpuUsage > 80 || 
        metrics.server.memoryUsage > 80 || 
        metrics.security.activeThreats > 0 ||
        metrics.performance.errorRate > 5) && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>System Alerts</AlertTitle>
          <AlertDescription className="space-y-1">
            {metrics.database.status !== 'healthy' && (
              <div>• Database is not healthy</div>
            )}
            {metrics.server.cpuUsage > 80 && (
              <div>• High CPU usage detected ({metrics.server.cpuUsage}%)</div>
            )}
            {metrics.server.memoryUsage > 80 && (
              <div>• High memory usage detected ({metrics.server.memoryUsage}%)</div>
            )}
            {metrics.security.activeThreats > 0 && (
              <div>• Active security threats detected</div>
            )}
            {metrics.performance.errorRate > 5 && (
              <div>• High error rate detected ({metrics.performance.errorRate}%)</div>
            )}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}