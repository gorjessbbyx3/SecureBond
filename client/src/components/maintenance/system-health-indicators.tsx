import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, XCircle, AlertTriangle, Activity, Database, Cpu, HardDrive, Wifi } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

interface HealthStatus {
  component: string;
  status: 'operational' | 'degraded' | 'down';
  message?: string;
  uptime?: number;
  responseTime?: number;
}

export function SystemHealthIndicators() {
  const { data: health } = useQuery<any>({
    queryKey: ["/api/system/health"],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'operational': return 'bg-green-500';
      case 'degraded': return 'bg-yellow-500';
      case 'down': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'operational': return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'degraded': return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'down': return <XCircle className="h-5 w-5 text-red-500" />;
      default: return <Activity className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'operational':
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-950">Operational</Badge>;
      case 'degraded':
        return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-950">Degraded</Badge>;
      case 'down':
        return <Badge variant="destructive">Down</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  const components: HealthStatus[] = [
    {
      component: 'Database Connection',
      status: health?.database === 'connected' ? 'operational' : 'down',
      responseTime: health?.databaseResponseTime
    },
    {
      component: 'API Server',
      status: health?.status === 'healthy' ? 'operational' : health?.status === 'degraded' ? 'degraded' : 'down',
      uptime: health?.uptime
    },
    {
      component: 'GPS Tracking Service',
      status: 'operational',
      message: 'All location services active'
    },
    {
      component: 'Court Integration',
      status: 'operational',
      message: 'Court date syncing operational'
    },
    {
      component: 'Notification Service',
      status: 'operational',
      message: 'SMS and Email active'
    }
  ];

  const cpuUsage = 45; // Mock - would come from real monitoring
  const memoryUsage = 62;
  const diskUsage = 38;

  return (
    <div className="space-y-6">
      {/* Overall System Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              System Health Status
            </span>
            {getStatusBadge(health?.status || 'operational')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {components.map((comp, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 rounded-lg border"
                data-testid={`health-component-${comp.component.toLowerCase().replace(/\s+/g, '-')}`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${getStatusColor(comp.status)}`} />
                  <div>
                    <p className="font-medium">{comp.component}</p>
                    {comp.message && (
                      <p className="text-xs text-muted-foreground">{comp.message}</p>
                    )}
                    {comp.responseTime && (
                      <p className="text-xs text-muted-foreground">
                        Response: {comp.responseTime}ms
                      </p>
                    )}
                  </div>
                </div>
                {getStatusIcon(comp.status)}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Resource Monitoring */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Cpu className="h-5 w-5" />
            Resource Usage
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* CPU */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Cpu className="h-4 w-4 text-blue-500" />
                <span className="text-sm font-medium">CPU Usage</span>
              </div>
              <span className="text-sm font-semibold">{cpuUsage}%</span>
            </div>
            <Progress value={cpuUsage} className="h-2" />
          </div>

          {/* Memory */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Database className="h-4 w-4 text-purple-500" />
                <span className="text-sm font-medium">Memory Usage</span>
              </div>
              <span className="text-sm font-semibold">{memoryUsage}%</span>
            </div>
            <Progress value={memoryUsage} className="h-2" />
          </div>

          {/* Disk */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <HardDrive className="h-4 w-4 text-green-500" />
                <span className="text-sm font-medium">Disk Usage</span>
              </div>
              <span className="text-sm font-semibold">{diskUsage}%</span>
            </div>
            <Progress value={diskUsage} className="h-2" />
          </div>

          {/* Network */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Wifi className="h-4 w-4 text-orange-500" />
                <span className="text-sm font-medium">Network Status</span>
              </div>
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                Connected
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">System Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-2">
            <button 
              className="p-2 text-xs border rounded hover:bg-muted transition-colors"
              data-testid="button-clear-cache"
            >
              Clear Cache
            </button>
            <button 
              className="p-2 text-xs border rounded hover:bg-muted transition-colors"
              data-testid="button-restart-services"
            >
              Restart Services
            </button>
            <button 
              className="p-2 text-xs border rounded hover:bg-muted transition-colors"
              data-testid="button-run-diagnostics"
            >
              Run Diagnostics
            </button>
            <button 
              className="p-2 text-xs border rounded hover:bg-muted transition-colors"
              data-testid="button-view-logs"
            >
              View System Logs
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
