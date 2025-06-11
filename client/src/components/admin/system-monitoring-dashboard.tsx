import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { RefreshCw, Activity, Database, Mail, Server, AlertTriangle, CheckCircle, Clock, TrendingUp, TrendingDown } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts";

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

interface PerformanceStats {
  totalRequests: number;
  requestsLast5Min: number;
  requestsLastHour: number;
  averageResponseTime5Min: number;
  averageResponseTime1Hour: number;
  errorRate5Min: number;
  errorRate1Hour: number;
  slowRequests: number;
  memoryUsage: NodeJS.MemoryUsage;
}

export function SystemMonitoringDashboard() {
  const [autoRefresh, setAutoRefresh] = useState(true);

  const { data: healthData, refetch: refetchHealth } = useQuery({
    queryKey: ["/api/system/health"],
    refetchInterval: autoRefresh ? 30000 : false, // Refresh every 30 seconds
  });

  const { data: performanceData, refetch: refetchPerformance } = useQuery({
    queryKey: ["/api/system/performance/stats"],
    refetchInterval: autoRefresh ? 10000 : false, // Refresh every 10 seconds
  });

  const { data: metricsData } = useQuery({
    queryKey: ["/api/system/performance/metrics"],
    refetchInterval: autoRefresh ? 60000 : false, // Refresh every minute
  });

  const health = healthData as HealthStatus;
  const performance = performanceData?.data as PerformanceStats;
  const metrics = metricsData?.data as any[];

  const formatUptime = (uptime: number) => {
    const seconds = Math.floor(uptime / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ${hours % 24}h ${minutes % 60}m`;
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
  };

  const formatMemory = (bytes: number) => {
    const mb = bytes / 1024 / 1024;
    return `${mb.toFixed(1)} MB`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'up':
        return 'bg-green-500';
      case 'degraded':
        return 'bg-yellow-500';
      case 'unhealthy':
      case 'down':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'up':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'degraded':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'unhealthy':
      case 'down':
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default:
        return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

  // Prepare chart data from metrics
  const responseTimeData = metrics?.slice(-20).map((metric, index) => ({
    time: new Date(metric.timestamp).toLocaleTimeString(),
    responseTime: metric.responseTime,
    index
  })) || [];

  const memoryUsageData = metrics?.slice(-20).map((metric, index) => ({
    time: new Date(metric.timestamp).toLocaleTimeString(),
    heapUsed: metric.memoryUsage.heapUsed / 1024 / 1024,
    heapTotal: metric.memoryUsage.heapTotal / 1024 / 1024,
    index
  })) || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">System Monitoring</h2>
          <p className="text-gray-600 dark:text-gray-400">Real-time system health and performance metrics</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              refetchHealth();
              refetchPerformance();
            }}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button
            variant={autoRefresh ? "default" : "outline"}
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            <Activity className="h-4 w-4 mr-2" />
            Auto Refresh
          </Button>
        </div>
      </div>

      {/* System Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Status</CardTitle>
            {health && getStatusIcon(health.status)}
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${getStatusColor(health?.status || 'unknown')}`} />
              <span className="text-2xl font-bold capitalize">{health?.status || 'Unknown'}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Version {health?.version || 'Unknown'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Uptime</CardTitle>
            <Server className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {health?.metrics?.uptime ? formatUptime(health.metrics.uptime) : 'Unknown'}
            </div>
            <p className="text-xs text-muted-foreground">
              Active connections: {health?.metrics?.activeConnections || 0}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Response Time</CardTitle>
            {performance?.averageResponseTime5Min <= 500 ? 
              <TrendingUp className="h-4 w-4 text-green-600" /> : 
              <TrendingDown className="h-4 w-4 text-red-600" />
            }
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {performance?.averageResponseTime5Min || 0}ms
            </div>
            <p className="text-xs text-muted-foreground">
              5 min average
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Error Rate</CardTitle>
            <AlertTriangle className={`h-4 w-4 ${(performance?.errorRate5Min || 0) > 5 ? 'text-red-600' : 'text-green-600'}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {performance?.errorRate5Min || 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              Last 5 minutes
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Service Health */}
      <Card>
        <CardHeader>
          <CardTitle>Service Health</CardTitle>
          <CardDescription>Status of critical system services</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {health?.services && Object.entries(health.services).map(([serviceName, service]) => (
              <div key={serviceName} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-3">
                  {serviceName === 'database' && <Database className="h-5 w-5" />}
                  {serviceName === 'email' && <Mail className="h-5 w-5" />}
                  {serviceName === 'storage' && <Server className="h-5 w-5" />}
                  <div>
                    <h4 className="font-medium capitalize">{serviceName}</h4>
                    <p className="text-sm text-muted-foreground">
                      {service.responseTime ? `${service.responseTime}ms` : 'N/A'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge 
                    variant={service.status === 'up' ? 'default' : service.status === 'degraded' ? 'secondary' : 'destructive'}
                    className="capitalize"
                  >
                    {service.status}
                  </Badge>
                  {getStatusIcon(service.status)}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Performance Charts */}
      <Tabs defaultValue="response-time" className="space-y-4">
        <TabsList>
          <TabsTrigger value="response-time">Response Time</TabsTrigger>
          <TabsTrigger value="memory">Memory Usage</TabsTrigger>
          <TabsTrigger value="requests">Request Volume</TabsTrigger>
        </TabsList>

        <TabsContent value="response-time">
          <Card>
            <CardHeader>
              <CardTitle>Response Time Trend</CardTitle>
              <CardDescription>Average response time over the last 20 requests</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={responseTimeData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="responseTime" 
                    stroke="#3b82f6" 
                    strokeWidth={2}
                    dot={{ fill: '#3b82f6' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="memory">
          <Card>
            <CardHeader>
              <CardTitle>Memory Usage</CardTitle>
              <CardDescription>Heap memory usage over time</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={memoryUsageData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Area 
                    type="monotone" 
                    dataKey="heapUsed" 
                    stackId="1"
                    stroke="#10b981" 
                    fill="#10b981" 
                    fillOpacity={0.6}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="heapTotal" 
                    stackId="2"
                    stroke="#f59e0b" 
                    fill="#f59e0b" 
                    fillOpacity={0.3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="requests">
          <Card>
            <CardHeader>
              <CardTitle>Request Statistics</CardTitle>
              <CardDescription>Request volume and performance metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {performance?.totalRequests || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">Total Requests</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {performance?.requestsLast5Min || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">Last 5 Min</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    {performance?.requestsLastHour || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">Last Hour</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">
                    {performance?.slowRequests || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">Slow Requests</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Memory Usage Details */}
      {health?.metrics?.memoryUsage && (
        <Card>
          <CardHeader>
            <CardTitle>Memory Usage Details</CardTitle>
            <CardDescription>Current memory allocation breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <div className="text-sm font-medium">Heap Used</div>
                <div className="text-lg font-bold text-blue-600">
                  {formatMemory(health.metrics.memoryUsage.heapUsed)}
                </div>
                <Progress 
                  value={(health.metrics.memoryUsage.heapUsed / health.metrics.memoryUsage.heapTotal) * 100}
                  className="mt-2"
                />
              </div>
              <div>
                <div className="text-sm font-medium">Heap Total</div>
                <div className="text-lg font-bold text-green-600">
                  {formatMemory(health.metrics.memoryUsage.heapTotal)}
                </div>
              </div>
              <div>
                <div className="text-sm font-medium">RSS</div>
                <div className="text-lg font-bold text-orange-600">
                  {formatMemory(health.metrics.memoryUsage.rss)}
                </div>
              </div>
              <div>
                <div className="text-sm font-medium">External</div>
                <div className="text-lg font-bold text-purple-600">
                  {formatMemory(health.metrics.memoryUsage.external)}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}